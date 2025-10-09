// import { log } from 'console';
import { Names } from 'cdk8s';
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
   * Additional container specification overrides.
   * Advanced use only - merges with generated container spec.
   * @default - undefined
   */
  readonly ploneContainer?: k8s.Container;

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
   * Liveness probe configuration for the container.
   * @default - undefined (no liveness probe)
   */
  livenessProbe?: k8s.Probe;

  /**
   * Readiness probe configuration for the container.
   * @default - undefined (no readiness probe)
   */
  readinessProbe?: k8s.Probe;
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
    };
    const deploymentOptions: k8s.KubeDeploymentProps = {
      metadata: {
        labels: deploymentLabels,
      },
      spec: {
        replicas,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: template_labels },
          spec: {
            imagePullSecrets: (image.imagePullSecrets ?? []).map((name) => ({ name: name })),
            containers: [
              ploneContainerSpec,
              ...options.sidecars ?? [],
            ],
          },
        },
      },
    };

    new k8s.KubeDeployment(this, 'deployment', deploymentOptions);

    if (options.pdb ?? false) {
      const pdbOptions = options.pdb ?? {};
      new PlonePDB(this, 'pdb', label, pdbOptions);
    }
  }
}
