import { ApiObject, Names } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { Construct } from 'constructs';
import { PloneDeployment, PloneDeploymentOptions, PloneRollingUpdate } from './deployment';
import { IntOrString } from './imports/k8s';
import * as k8s from './imports/k8s';
import { ServiceMonitor, ServiceMonitorSpecEndpointsTargetPort } from './imports/monitoring.coreos.com';
import { PloneService, PloneServiceSpec } from './service';

/**
 * Linux capabilities to add or drop on a container.
 */
export interface PloneCapabilities {
  /**
   * Capabilities to add (e.g. 'SYS_PTRACE', 'NET_ADMIN').
   * @default - no capabilities added
   */
  readonly add?: string[];

  /**
   * Capabilities to drop (e.g. 'ALL', 'NET_RAW').
   * @default - no capabilities dropped
   */
  readonly drop?: string[];
}

/**
 * Security context for a Plone container.
 * Controls privilege and access settings.
 */
export interface PloneSecurityContext {
  /**
   * Linux capabilities to add or drop.
   * @example { add: ['SYS_PTRACE'] }
   * @default - no capability changes
   */
  readonly capabilities?: PloneCapabilities;

  /**
   * Run the container as a specific user ID.
   * @default - container default
   */
  readonly runAsUser?: number;

  /**
   * Run the container as a specific group ID.
   * @default - container default
   */
  readonly runAsGroup?: number;

  /**
   * Require the container to run as non-root.
   * @default - undefined
   */
  readonly runAsNonRoot?: boolean;

  /**
   * Mount the root filesystem as read-only.
   * @default - undefined
   */
  readonly readOnlyRootFilesystem?: boolean;

  /**
   * Allow privilege escalation for the container process.
   * @default - undefined
   */
  readonly allowPrivilegeEscalation?: boolean;

  /**
   * Run the container in privileged mode.
   * @default - undefined
   */
  readonly privileged?: boolean;
}

/**
 * Base options for Plone backend or frontend configuration.
 * These options control container image, replica count, resource limits,
 * environment variables, and health probes.
 */
export interface PloneBaseOptions {
  /**
   * Container image to use for the deployment.
   * @example 'plone/plone-backend:6.0.10' or 'plone/plone-frontend:16.0.0'
   * @default - 'plone/plone-backend:latest' for backend, 'plone/plone-frontend:latest' for frontend
   */
  readonly image?: string;

  /**
   * Image pull policy for the container.
   * @default 'IfNotPresent'
   */
  readonly imagePullPolicy?: string;

  /**
   * Number of pod replicas to run.
   * @default 2
   */
  readonly replicas?: number;

  /**
   * Maximum number of pods that can be unavailable during updates.
   * Can be an absolute number (e.g., 1) or a percentage (e.g., '50%').
   * Used in PodDisruptionBudget if specified.
   * @default - undefined (not set)
   */
  readonly maxUnavailable?: number | string;

  /**
   * Minimum number of pods that must be available during updates.
   * Can be an absolute number (e.g., 1) or a percentage (e.g., '50%').
   * Used in PodDisruptionBudget if specified.
   * @default - undefined (not set)
   */
  readonly minAvailable?: number | string;

  /**
   * CPU limit for the container.
   * @example '500m' or '1' or '2000m'
   * @default '500m' for both backend and frontend
   */
  readonly limitCpu?: string;

  /**
   * Memory limit for the container.
   * @example '512Mi' or '1Gi'
   * @default '512Mi' for backend, '1Gi' for frontend
   */
  readonly limitMemory?: string;

  /**
   * CPU request for the container.
   * @example '200m' or '0.5'
   * @default '200m'
   */
  readonly requestCpu?: string;

  /**
   * Memory request for the container.
   * @example '256Mi' or '512Mi'
   * @default '256Mi'
   */
  readonly requestMemory?: string;

  /**
   * Environment variables to set in the container.
   * Use cdk8s-plus-30 Env class to define variables and sources.
   * @default - undefined (no additional environment variables)
   */
  readonly environment?: kplus.Env;

  /**
   * Enable readiness probe for the container.
   * Readiness probes determine when a container is ready to accept traffic.
   * @default true
   */
  readonly readinessEnabled?: boolean;

  /**
   * Number of seconds after container start before readiness probe is initiated.
   * @default 10
   */
  readonly readinessInitialDelaySeconds?: number;

  /**
   * Number of seconds after which the readiness probe times out.
   * @default 15
   */
  readonly readinessTimeoutSeconds?: number;

  /**
   * How often (in seconds) to perform the readiness probe.
   * @default 10
   */
  readonly readinessPeriodSeconds?: number;

  /**
   * Minimum consecutive successes for the readiness probe to be considered successful.
   * @default 1
   */
  readonly readinessSuccessThreshold?: number;

  /**
   * Minimum consecutive failures for the readiness probe to be considered failed.
   * @default 3
   */
  readonly readinessFailureThreshold?: number;

  /**
   * Enable liveness probe for the container.
   * Liveness probes determine when to restart a container.
   * Recommended: true for frontend, false for backend (Zope has its own recovery).
   * @default false
   */
  readonly livenessEnabled?: boolean;

  /**
   * Number of seconds after container start before liveness probe is initiated.
   * @default 30
   */
  readonly livenessInitialDelaySeconds?: number;

  /**
   * Number of seconds after which the liveness probe times out.
   * @default 5
   */
  readonly livenessTimeoutSeconds?: number;

  /**
   * How often (in seconds) to perform the liveness probe.
   * @default 10
   */
  readonly livenessPeriodSeconds?: number;

  /**
   * Minimum consecutive successes for the liveness probe to be considered successful.
   * @default 1
   */
  readonly livenessSuccessThreshold?: number;

  /**
   * Minimum consecutive failures for the liveness probe to be considered failed.
   * @default 3
   */
  readonly livenessFailureThreshold?: number;

  /**
   * Annotations to add to the Deployment metadata.
   * @example { 'deployment.kubernetes.io/revision': '1' }
   * @default - no additional annotations
   */
  readonly annotations?: { [name: string]: string };

  /**
   * Annotations to add to the Pod template metadata.
   * Common for Prometheus, Istio, backup policies, etc.
   * @example { 'prometheus.io/scrape': 'true', 'prometheus.io/port': '8080' }
   * @default - no additional annotations
   */
  readonly podAnnotations?: { [name: string]: string };

  /**
   * Annotations to add to the Service metadata.
   * Common for external-dns, load balancers, service mesh, etc.
   * @example { 'external-dns.alpha.kubernetes.io/hostname': 'plone.example.com' }
   * @deprecated use `service.annotations` instead
   * @default - no additional annotations
   */
  readonly serviceAnnotations?: { [name: string]: string };

  /**
   * Service configuration: type, trafficDistribution, sessionAffinity,
   * annotations/labels, and a raw `overrides` escape hatch for any other
   * ServiceSpec field. Applies to this component's Service.
   * @example { type: 'LoadBalancer', trafficDistribution: 'PreferClose' }
   * @default - construct-managed defaults only
   */
  readonly service?: PloneServiceSpec;

  /**
   * Enable Prometheus ServiceMonitor for metrics collection.
   * Requires Prometheus Operator to be installed in the cluster.
   * When enabled, a ServiceMonitor resource will be created to scrape metrics.
   * @default false
   */
  readonly servicemonitor?: boolean;

  /**
   * Port name or number to scrape metrics from.
   * Only used when servicemonitor is enabled.
   * @default - uses the main service port
   */
  readonly metricsPort?: string | number;

  /**
   * Path to scrape metrics from.
   * Only used when servicemonitor is enabled.
   * @default '/metrics'
   */
  readonly metricsPath?: string;

  /**
   * Node selector labels for pod scheduling.
   * Use to constrain pods to nodes with matching labels, e.g. for region affinity.
   * @example { 'topology.kubernetes.io/region': 'fsn1' }
   * @default - no node selector
   */
  readonly nodeSelector?: { [key: string]: string };

  /**
   * Security context for the container.
   * Use to set capabilities, run as non-root, read-only filesystem, etc.
   * @example { capabilities: { add: ['SYS_PTRACE'] } }
   * @default - no security context
   */
  readonly securityContext?: PloneSecurityContext;

  /**
   * Seconds to wait in a preStop hook before the container receives SIGTERM.
   *
   * Kubernetes removes a terminating pod from the Service endpoints while it
   * starts the shutdown. kube-proxy, ingress controllers and caches that target
   * pod IPs (such as Varnish via `PloneVinylCache`) need a few seconds to
   * notice. The delay keeps the container serving until they have, so rolling
   * updates do not cause `503` errors in front of it. Rendered as the native
   * `sleep` action, so the image needs no `sleep` binary.
   * Requires Kubernetes 1.30 or later. Set to 0 to disable the hook.
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

  /**
   * Rolling update settings for the Deployment (`spec.strategy.rollingUpdate`).
   * For rollouts without a capacity dip use `{ maxUnavailable: 0, maxSurge: '50%' }`:
   * Plone needs time to become ready, and the default lets a quarter of the
   * pods go away first. Not to be confused with the top-level `maxUnavailable`
   * and `minAvailable`, which configure the PodDisruptionBudget.
   * @default - Kubernetes default ('25%' surge, '25%' unavailable)
   */
  readonly rollingUpdate?: PloneRollingUpdate;

  /**
   * Additional Deployments whose pods run with different settings and join
   * this role's Service and PodDisruptionBudget, see `PloneGroup`.
   * Their replicas add to `replicas`.
   * @default - no groups
   */
  readonly groups?: PloneGroup[];
}
/**
 * A group of pods that runs with different settings behind the same Service
 * as the main Deployment of its role, e.g. an allocator experiment or a canary.
 * Everything not set here is inherited from the role's options.
 */
export interface PloneGroup {
  /**
   * Name of the group, a lowercase DNS label. Pods carry it in the label
   * `cdk8s-plone.bluedynamics.eu/group`. `default` is reserved for the main
   * Deployment. Renaming a group creates a new Deployment; cdk8s does not
   * delete the old one.
   */
  readonly name: string;

  /**
   * Number of pods in the group, in addition to the role's `replicas`.
   * @default 1
   */
  readonly replicas?: number;

  /**
   * Environment for the group's pods, merged over the role's environment:
   * variables with the same name are replaced, sources are appended.
   * @default - the role's environment
   */
  readonly environment?: kplus.Env;

  /**
   * Container image for the group's pods.
   * @default - the role's image
   */
  readonly image?: string;
}

/**
 * Pod label naming the group a Plone pod belongs to. Pods of the main
 * Deployment of a role are in the group `default`.
 */
const GROUP_LABEL = 'cdk8s-plone.bluedynamics.eu/group';

/**
 * Plone deployment variants.
 */
export enum PloneVariant {
  /**
   * Volto variant: ReactJS single-page frontend (Volto) talking to the Plone REST API.
   * Deploys both frontend and backend services.
   */
  VOLTO = 'volto',

  /**
   * Blicca variant: the Plone backend renders the UI server-side and serves the HTML directly.
   * Deploys only the backend service.
   */
  BLICCA = 'blicca',

  /**
   * Deprecated alias for the Blicca variant (formerly "Classic UI").
   *
   * @deprecated Renamed to {@link BLICCA}. Kept for backward compatibility and selects the
   * same backend-only deployment. Existing configuration using `CLASSICUI` (or the literal
   * value `'classicui'`) keeps working unchanged. Will be removed in a future major release.
   */
  CLASSICUI = 'classicui',
}

/**
 * Main configuration options for Plone deployment.
 */
export interface PloneOptions {
  /**
   * Version string for labeling the deployment.
   * This is used in Kubernetes labels and doesn't affect the actual image versions.
   * @default 'undefined'
   */
  readonly version?: string;

  /**
   * Plone site ID in the ZODB.
   * This is used to construct the internal API path for Volto frontend.
   * @default 'Plone'
   */
  readonly siteId?: string;

  /**
   * Plone deployment variant to use.
   * @default PloneVariant.VOLTO
   */
  readonly variant?: PloneVariant;

  /**
   * Backend (Plone API) configuration.
   * @default {} (uses default values from PloneBaseOptions)
   */
  readonly backend?: PloneBaseOptions;

  /**
   * Frontend (Volto) configuration.
   * Only used when variant is PloneVariant.VOLTO.
   * @default {} (uses default values from PloneBaseOptions)
   */
  readonly frontend?: PloneBaseOptions;

  /**
   * Names of Kubernetes secrets to use for pulling private container images.
   * These secrets must exist in the same namespace as the deployment.
   * @example ['my-registry-secret']
   * @default [] (no image pull secrets)
   */
  readonly imagePullSecrets?: string[];
}

/**
 * Plone construct for deploying Plone CMS to Kubernetes.
 *
 * This construct creates all necessary Kubernetes resources for running Plone:
 * - Deployment(s) for backend (and optionally frontend)
 * - Service(s) for network access
 * - Optional PodDisruptionBudget for high availability
 *
 * Supports two deployment variants:
 * - VOLTO: React single-page frontend talking to the REST API backend (default)
 * - BLICCA: the Plone backend renders the UI server-side and serves HTML directly
 *
 * @example
 * new Plone(chart, 'my-plone', {
 *   variant: PloneVariant.VOLTO,
 *   backend: {
 *     image: 'plone/plone-backend:6.0.10',
 *     replicas: 3,
 *   },
 *   frontend: {
 *     image: 'plone/plone-frontend:16.0.0',
 *   },
 * });
 */
export class Plone extends Construct {
  /**
   * Name of the backend Kubernetes service.
   * Use this to reference the backend service from other constructs.
   */
  public readonly backendServiceName: string;

  /**
   * Name of the frontend Kubernetes service.
   * Only set when variant is VOLTO, otherwise undefined.
   */
  public readonly frontendServiceName: string | undefined;

  /**
   * The backend Deployment, as an escape hatch for fields without a dedicated
   * option. JSON patches apply to the final manifest, so plain values are kept:
   * `plone.backendDeployment.addJsonPatch(JsonPatch.add('/spec/template/spec/containers/0/args', ['--debug']))`.
   * The Plone container is always `containers/0`.
   */
  public readonly backendDeployment: ApiObject;

  /**
   * The backend Service, as an escape hatch, see `backendDeployment`.
   */
  public readonly backendService: ApiObject;

  /**
   * The frontend Deployment, as an escape hatch, see `backendDeployment`.
   * Only set when variant is VOLTO, otherwise undefined.
   */
  public readonly frontendDeployment: ApiObject | undefined;

  /**
   * The frontend Service, as an escape hatch, see `backendDeployment`.
   * Only set when variant is VOLTO, otherwise undefined.
   */
  public readonly frontendService: ApiObject | undefined;

  /**
   * The backend group Deployments by group name, as an escape hatch, see
   * `backendDeployment`. Empty without backend groups.
   */
  public readonly backendGroupDeployments: { [name: string]: ApiObject };

  /**
   * The frontend group Deployments by group name, as an escape hatch, see
   * `backendDeployment`. Empty without frontend groups or for the Blicca variant.
   */
  public readonly frontendGroupDeployments: { [name: string]: ApiObject };

  /**
   * The deployment variant being used (VOLTO or BLICCA).
   */
  public readonly variant: PloneVariant;

  /**
   * The Plone site ID in ZODB.
   */
  public readonly siteId: string;

  constructor(scope: Construct, id: string, options: PloneOptions = {}) {
    super(scope, id);
    this.frontendServiceName = undefined;
    this.frontendDeployment = undefined;
    this.frontendService = undefined;
    this.siteId = options.siteId ?? 'Plone';
    this.variant = options.variant ?? PloneVariant.VOLTO;

    this.frontendGroupDeployments = {};
    const instance = Names.toLabelValue(this);

    // ------------------------------------------------------------------------
    // Backend
    const backend = options.backend ?? {};
    const backendPort = 8080;
    const backendRole = this.addRole({
      role: 'backend',
      options: backend,
      instance,
      version: options.version,
      imagePullSecrets: options.imagePullSecrets,
      port: backendPort,
      image: backend.image ?? 'plone/plone-backend:latest',
      limitMemory: '512Mi',
      environment: backend.environment,
    });
    this.backendServiceName = backendRole.service.name;
    this.backendDeployment = backendRole.deployment.deployment;
    this.backendService = backendRole.service.service;
    this.backendGroupDeployments = backendRole.groups;

    // ------------------------------------------------------------------------
    // Frontend
    if (this.variant == PloneVariant.VOLTO) {
      const frontend = options.frontend ?? {};

      // Environment for RAZZLE
      var frontendEnvironment = frontend.environment ?? new kplus.Env([], {});
      if (frontendEnvironment.variables.RAZZLE_INTERNAL_API_PATH === undefined) {
        // connect with backend service
        frontendEnvironment?.addVariable('RAZZLE_INTERNAL_API_PATH', kplus.EnvValue.fromValue(`http://${backendRole.service.name}:${backendPort}/${this.siteId}`));
      }

      const frontendRole = this.addRole({
        role: 'frontend',
        options: frontend,
        instance,
        version: options.version,
        imagePullSecrets: options.imagePullSecrets,
        port: 3000,
        image: frontend.image ?? 'plone/plone-frontend:latest',
        limitMemory: '1Gi',
        environment: frontendEnvironment,
      });
      this.frontendServiceName = frontendRole.service.name;
      this.frontendDeployment = frontendRole.deployment.deployment;
      this.frontendService = frontendRole.service.service;
      this.frontendGroupDeployments = frontendRole.groups;
    }
  }

  /**
   * Creates the Deployment, Service, optional ServiceMonitor and group
   * Deployments of one role (backend or frontend).
   *
   * Every pod of the role carries `app.kubernetes.io/name` and
   * `app.kubernetes.io/instance`; the Service and PodDisruptionBudget select on
   * them, so group pods join both. Each Deployment keeps its own `app`
   * selector, so no Deployment selector overlaps another.
   */
  private addRole(config: RoleConfig): { deployment: PloneDeployment; service: PloneService; groups: { [name: string]: ApiObject } } {
    const { role, options: o, port } = config;
    const groups = o.groups ?? [];
    validateGroups(role, groups);

    const roleLabels = {
      'app.kubernetes.io/name': `plone-${role}`,
      'app.kubernetes.io/instance': config.instance,
    };
    const deploymentOptions: PloneDeploymentOptions = {
      labels: {
        'app.kubernetes.io/name': `plone-${role}`,
        'app.kubernetes.io/instance': config.instance,
        'app.kubernetes.io/component': role,
        'app.kubernetes.io/version': config.version ?? 'undefined',
        [GROUP_LABEL]: 'default',
      },
      image: {
        image: config.image,
        imagePullSecrets: config.imagePullSecrets ?? [],
        imagePullPolicy: o.imagePullPolicy ?? 'IfNotPresent',
      },
      replicas: o.replicas,
      limitCpu: o.limitCpu ?? '500m',
      limitMemory: o.limitMemory ?? config.limitMemory,
      requestCpu: o.requestCpu ?? '200m',
      requestMemory: o.requestMemory ?? '256Mi',
      pdb: {
        maxUnavailable: o.maxUnavailable ?? undefined,
        minAvailable: o.minAvailable ?? undefined,
      },
      pdbSelector: roleLabels,
      pdbReplicas: (o.replicas ?? DEFAULT_REPLICAS) + groups.reduce((sum, g) => sum + (g.replicas ?? 1), 0),
      port,
      environment: config.environment,
      annotations: o.annotations,
      podAnnotations: o.podAnnotations,
      nodeSelector: o.nodeSelector,
      securityContext: o.securityContext as k8s.SecurityContext,
      preStopDelaySeconds: o.preStopDelaySeconds,
      terminationGracePeriodSeconds: o.terminationGracePeriodSeconds,
      rollingUpdate: o.rollingUpdate,
      ...probes(o, port),
    };

    const deployment = new PloneDeployment(this, role, deploymentOptions);
    const service = new PloneService(deployment, 'service', {
      labels: {
        'app.kubernetes.io/name': `plone-${role}-service`,
        'app.kubernetes.io/component': 'service',
      },
      targetPort: port,
      selectorLabel: roleLabels,
      portName: `${role}-http`,
      spec: {
        ...o.service,
        annotations: { ...o.serviceAnnotations, ...o.service?.annotations },
      },
    });

    if (o.servicemonitor) {
      this.createServiceMonitor(service, role, {
        port: o.metricsPort ?? `${role}-http`,
        path: o.metricsPath ?? '/metrics',
      });
    }

    const groupDeployments: { [name: string]: ApiObject } = {};
    for (const group of groups) {
      const groupDeployment = new PloneDeployment(this, `${role}-group-${group.name}`, {
        ...deploymentOptions,
        labels: { ...deploymentOptions.labels, [GROUP_LABEL]: group.name },
        replicas: group.replicas ?? 1,
        image: { ...deploymentOptions.image, image: group.image ?? config.image },
        environment: mergeEnv(config.environment, group.environment),
        // the role's PDB covers the group pods
        pdb: undefined,
        pdbSelector: undefined,
        pdbReplicas: undefined,
      });
      groupDeployments[group.name] = groupDeployment.deployment;
    }

    return { deployment, service, groups: groupDeployments };
  }

  /**
   * Creates a Prometheus ServiceMonitor resource for the given service.
   * @param service The PloneService to monitor
   * @param id Unique identifier for the ServiceMonitor
   * @param config Configuration for the ServiceMonitor
   */
  private createServiceMonitor(
    service: PloneService,
    id: string,
    config: { port: string | number; path: string },
  ): void {
    const portName = typeof config.port === 'string' ? config.port : undefined;
    const portNumber = typeof config.port === 'number'
      ? ServiceMonitorSpecEndpointsTargetPort.fromNumber(config.port)
      : undefined;

    new ServiceMonitor(this, `servicemonitor-${id}`, {
      metadata: {
        name: `${service.name}-monitor`,
        labels: {
          'app.kubernetes.io/name': service.name,
          'app.kubernetes.io/component': 'servicemonitor',
        },
      },
      spec: {
        selector: {
          matchLabels: {
            'app.kubernetes.io/name': service.labels['app.kubernetes.io/name'],
          },
        },
        podTargetLabels: [GROUP_LABEL],
        endpoints: [
          {
            ...(portName && { port: portName }),
            ...(portNumber && { targetPort: portNumber }),
            path: config.path,
            interval: '30s',
          },
        ],
      },
    });
  }
}

/**
 * Replicas of a Deployment without `replicas`, see `PloneDeployment`.
 */
const DEFAULT_REPLICAS = 2;

/**
 * Per-role settings for `Plone.addRole`.
 */
interface RoleConfig {
  readonly role: 'backend' | 'frontend';
  readonly options: PloneBaseOptions;
  readonly instance: string;
  readonly version?: string;
  readonly imagePullSecrets?: string[];
  readonly port: number;
  readonly image: string;
  readonly limitMemory: string;
  readonly environment?: kplus.Env;
}

function probes(o: PloneBaseOptions, port: number): { livenessProbe?: k8s.Probe; readinessProbe?: k8s.Probe } {
  const httpGet: k8s.HttpGetAction = { path: '/', port: IntOrString.fromNumber(port) };
  return {
    livenessProbe: (o.livenessEnabled ?? false) ? {
      httpGet,
      initialDelaySeconds: o.livenessInitialDelaySeconds ?? 30,
      timeoutSeconds: o.livenessTimeoutSeconds ?? 5,
      periodSeconds: o.livenessPeriodSeconds ?? 10,
      successThreshold: o.livenessSuccessThreshold ?? 1,
      failureThreshold: o.livenessFailureThreshold ?? 3,
    } : undefined,
    readinessProbe: (o.readinessEnabled ?? true) ? {
      httpGet,
      initialDelaySeconds: o.readinessInitialDelaySeconds ?? 10,
      timeoutSeconds: o.readinessTimeoutSeconds ?? 15,
      periodSeconds: o.readinessPeriodSeconds ?? 10,
      successThreshold: o.readinessSuccessThreshold ?? 1,
      failureThreshold: o.readinessFailureThreshold ?? 3,
    } : undefined,
  };
}

function validateGroups(role: string, groups: PloneGroup[]): void {
  const seen = new Set<string>();
  for (const group of groups) {
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(group.name) || group.name.length > 63) {
      throw new Error(`${role}.groups: "${group.name}" is not a lowercase DNS label`);
    }
    if (group.name === 'default') {
      throw new Error(`${role}.groups: "default" is reserved for the main Deployment`);
    }
    if (seen.has(group.name)) {
      throw new Error(`${role}.groups: "${group.name}" is used more than once`);
    }
    seen.add(group.name);
    if (group.replicas !== undefined && (!Number.isInteger(group.replicas) || group.replicas < 0)) {
      throw new Error(`${role}.groups["${group.name}"].replicas must be a non-negative integer, got ${group.replicas}`);
    }
  }
}

/**
 * Merges a group's environment over the role's: variables by name, the
 * group wins; sources are appended.
 */
function mergeEnv(base: kplus.Env | undefined, override: kplus.Env | undefined): kplus.Env | undefined {
  if (override === undefined) {
    return base;
  }
  if (base === undefined) {
    return override;
  }
  return new kplus.Env([...base.sources, ...override.sources], { ...base.variables, ...override.variables });
}
