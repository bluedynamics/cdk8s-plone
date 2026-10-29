// import { log } from 'console';
import { ApiObject, JsonPatch, Names } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { Construct } from 'constructs';
import * as k8s from './imports/k8s';
import { PlonePDB, PlonePDBOptions } from './pdb';

/**
 * Container image configuration options.
 */
export interface PloneImageOptions {
  /**
   * Container image name and tag.
   * @example 'plone/plone-backend:6.0.10'
   * @default 'plone/plone-backend:latest'
   */
  readonly image?: string;

  /**
   * Names of Kubernetes secrets for pulling private images.
   * @default []
   */
  readonly imagePullSecrets?: string[];

  /**
   * Image pull policy (Always, IfNotPresent, Never).
   * @default 'IfNotPresent'
   */
  readonly imagePullPolicy?: string;
}

/**
 * Configuration options for PloneDeployment.
 */
export interface PloneDeploymentOptions {
  /**
   * Container image configuration.
   * @default 'plone/plone-backend:latest'
   */
  readonly image?: PloneImageOptions;

  /**
   * Environment variables for the container.
   * Use cdk8s-plus-30 Env to define variables and sources.
   * @default - no additional environment variables
   */
  readonly environment?: kplus.Env;

  /**
   * Number of pod replicas to run.
   * @default 2
   */
  readonly replicas?: number;

  /**
   * CPU limit for the container.
   * @default '1000m'
   */
  readonly limitCpu?: string;

  /**
   * Memory limit for the container.
   * @default '1Gi'
   */
  readonly limitMemory?: string;

  /**
   * CPU request for the container.
   * @default '200m'
   */
  readonly requestCpu?: string;

  /**
   * Memory request for the container.
   * @default '300Mi'
   */
  readonly requestMemory?: string;

  /**
   * Container port number to expose.
   */
  readonly port: number;

  /**
   * Additional Kubernetes labels for the deployment.
   * @default - standard Plone labels only
   */
  readonly labels?: { [name: string]: string };

  /**
   * Annotations to add to the Deployment metadata.
   * Common annotations include: deployment timestamps, change tracking, etc.
   * @example { 'deployment.kubernetes.io/revision': '1' }
   * @default - no additional annotations
   */
  readonly annotations?: { [name: string]: string };

  /**
   * Annotations to add to the Pod template metadata.
   * Common annotations include: Prometheus scraping config, Istio config,
   * backup policies, logging configurations, etc.
   * @example { 'prometheus.io/scrape': 'true', 'prometheus.io/port': '8080' }
   * @default - no additional annotations
   */
  readonly podAnnotations?: { [name: string]: string };

  /**
   * Raw overrides for the Plone container, see `PloneBaseOptions.containerOverrides`.
   * @default - none
   */
  readonly containerOverrides?: { [key: string]: any };

  /**
   * Sidecar containers to run alongside the main container.
   * @example [{ name: 'log-forwarder', image: 'fluentd:latest' }]
   * @default []
   */
  readonly sidecars?: k8s.Container[];

  /**
   * PodDisruptionBudget configuration for high availability.
   * If provided, creates a PDB with the specified constraints.
   * @default - no PDB created
   */
  readonly pdb?: PlonePDBOptions;

  /**
   * Node selector labels for pod scheduling.
   * @default - no node selector
   */
  readonly nodeSelector?: { [key: string]: string };

  /**
   * Security context for the container.
   * Use to set capabilities, run as non-root, read-only filesystem, etc.
   * @example { capabilities: { add: ['SYS_PTRACE'] } }
   * @default - no security context
   */
  readonly securityContext?: k8s.SecurityContext;

  /**
   * Liveness probe configuration for the container.
   * @default - undefined (no liveness probe)
   */
  livenessProbe?: k8s.Probe;

  /**
   * Readiness probe configuration for the container.
   * @default - undefined (no readiness probe)
   */
  readinessProbe?: k8s.Probe;

  /**
   * Seconds to wait in a preStop hook before the container receives SIGTERM.
   *
   * Kubernetes removes a terminating pod from the Service endpoints while it
   * starts the shutdown. kube-proxy, ingress controllers and caches that target
   * pod IPs need a few seconds to notice. The delay keeps the container serving
   * until they have. Rendered as the native `sleep` action, so the image needs
   * no `sleep` binary. Requires Kubernetes 1.30 or later.
   * Set to 0 to disable the hook.
   * @default 15
   */
  readonly preStopDelaySeconds?: number;

  /**
   * Seconds Kubernetes waits for the pod to stop before it kills it.
   * The preStop delay counts against this budget, so it must be greater
   * than `preStopDelaySeconds`.
   * @default - `preStopDelaySeconds` + 30, which keeps the Kubernetes default of 30 seconds for the shutdown itself
   */
  readonly terminationGracePeriodSeconds?: number;
}

/**
 * Default delay of the preStop hook, see `preStopDelaySeconds`.
 */
const DEFAULT_PRE_STOP_DELAY_SECONDS = 15;

/**
 * Shutdown time granted after the preStop delay, the Kubernetes default
 * of `terminationGracePeriodSeconds`.
 */
const DEFAULT_SHUTDOWN_SECONDS = 30;

function validateSeconds(name: string, value: number | undefined): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
    throw new Error(`${name} must be a non-negative integer, got ${value}`);
  }
}

/**
 * PloneDeployment creates a Kubernetes Deployment for Plone containers.
 *
 * This is an internal construct used by the Plone class.
 * It creates a Deployment with configurable replicas, resources, probes,
 * and an optional PodDisruptionBudget.
 */
export class PloneDeployment extends Construct {

  constructor(scope: Construct, id: string, options: PloneDeploymentOptions) {
    super(scope, id);
    const image = options.image ?? {};
    const replicas = options.replicas ?? 2;
    validateSeconds('preStopDelaySeconds', options.preStopDelaySeconds);
    validateSeconds('terminationGracePeriodSeconds', options.terminationGracePeriodSeconds);
    const preStopDelaySeconds = options.preStopDelaySeconds ?? DEFAULT_PRE_STOP_DELAY_SECONDS;
    if (
      preStopDelaySeconds > 0
      && options.terminationGracePeriodSeconds !== undefined
      && options.terminationGracePeriodSeconds <= preStopDelaySeconds
    ) {
      // The kubelet kills the container once the grace period is used up,
      // even while the preStop hook is still sleeping: no graceful shutdown.
      throw new Error(
        `terminationGracePeriodSeconds (${options.terminationGracePeriodSeconds}) must be greater than `
        + `preStopDelaySeconds (${preStopDelaySeconds})`,
      );
    }
    // Without a hook, leave the grace period unset (Kubernetes default 30s).
    const terminationGracePeriodSeconds = options.terminationGracePeriodSeconds
      ?? (preStopDelaySeconds > 0 ? preStopDelaySeconds + DEFAULT_SHUTDOWN_SECONDS : undefined);
    const label = { app: Names.toLabelValue(this) };
    const optionLabels = options.labels ?? {};
    const deploymentLabels = {
      'app.kubernetes.io/name': optionLabels['app.kubernetes.io/name'] + '-deployment',
      'app.kubernetes.io/component': optionLabels['app.kubernetes.io/component'] ?? '' + '-deployment',
    };
    const template_labels = {
      ...optionLabels,
      ...label,
      'app.kubernetes.io/part-of': 'plone',
      'app.kubernetes.io/managed-by': 'cdk8s-plone',
    };
    const kpEnv: kplus.Env = options?.environment ?? new kplus.Env([], {});
    var env: k8s.EnvVar[] = [];
    for (const name in kpEnv.variables) {
      env.push({ name: name, value: kpEnv.variables[name].value, valueFrom: kpEnv.variables[name].valueFrom });
    }
    var envFrom: k8s.EnvFromSource[] = [];
    for (const idx in kpEnv.sources) {
      const source = kpEnv.sources[idx];
      envFrom.push(source._toKube());
    }
    var ploneContainerSpec: k8s.Container = {
      name: id + '-container', // here the namespaced name shold be used, but how?
      image: image.image,
      imagePullPolicy: image.imagePullPolicy,
      env: env,
      envFrom: envFrom,
      resources: {
        limits: {
          cpu: k8s.Quantity.fromString(options.limitCpu ?? '1000m'),
          memory: k8s.Quantity.fromString(options.limitMemory ?? '1Gi'),
        },
        requests: {
          cpu: k8s.Quantity.fromString(options.requestCpu ?? '200m'),
          memory: k8s.Quantity.fromString(options.requestMemory ?? '300Mi'),
        },
      },
      livenessProbe: options.livenessProbe ?? undefined,
      readinessProbe: options.readinessProbe ?? undefined,
      securityContext: options.securityContext,
      lifecycle: preStopDelaySeconds > 0
        ? { preStop: { sleep: { seconds: preStopDelaySeconds } } }
        : undefined,
    };
    const deploymentOptions: k8s.KubeDeploymentProps = {
      metadata: {
        labels: deploymentLabels,
        annotations: options.annotations,
      },
      spec: {
        replicas,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: {
            labels: template_labels,
            annotations: options.podAnnotations,
          },
          spec: {
            imagePullSecrets: (image.imagePullSecrets ?? []).map((name) => ({ name: name })),
            nodeSelector: options.nodeSelector,
            terminationGracePeriodSeconds,
            containers: [
              ploneContainerSpec,
              ...options.sidecars ?? [],
            ],
          },
        },
      },
    };

    // A plain ApiObject built from the converted manifest, not a KubeDeployment:
    // KubeDeployment applies JSON patches before its toJson conversion, which
    // drops plain values for IntOrString and Quantity fields (`port: 8080`,
    // `cpu: '2'`). The same happens when overrides are spread into
    // ploneContainerSpec. Patches on this object land on the final manifest.
    const deployment = new ApiObject(this, 'deployment', k8s.KubeDeployment.manifest(deploymentOptions));

    for (const [key, value] of Object.entries(options.containerOverrides ?? {})) {
      if (value === undefined) {
        continue;
      }
      const pointer = key.replace(/~/g, '~0').replace(/\//g, '~1');
      deployment.addJsonPatch(JsonPatch.add(`/spec/template/spec/containers/0/${pointer}`, value));
    }

    if (options.pdb ?? false) {
      const pdbOptions = options.pdb ?? {};
      const pdbExplicit = pdbOptions.minAvailable !== undefined || pdbOptions.maxUnavailable !== undefined;
      // A PDB on a single-replica deployment is always undrainable and guarantees
      // no availability. Only emit one for >=2 replicas, or when explicitly configured.
      if (replicas >= 2 || pdbExplicit) {
        new PlonePDB(this, 'pdb', label, pdbOptions);
      }
    }
  }
}
