import { Names } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { Construct } from 'constructs';
import { PloneDeployment, PloneDeploymentOptions } from './deployment';
import { IntOrString } from './imports/k8s';
import * as k8s from './imports/k8s';
import { PloneService } from './service';

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
   * @default - no additional annotations
   */
  readonly serviceAnnotations?: { [name: string]: string };
}
/**
 * Plone deployment variants.
 */
export enum PloneVariant {
  /**
   * Volto variant: ReactJS frontend (Volto) with REST API backend.
   * Deploys both frontend and backend services.
   */
  VOLTO = 'volto',

  /**
   * Classic UI variant: Traditional Plone with server-side rendering.
   * Deploys only the backend service.
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
 * - VOLTO: Modern React frontend with REST API backend (default)
 * - CLASSICUI: Traditional server-side rendered Plone
 *
 * @example
 * ```typescript
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
 * ```
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
   * The deployment variant being used (VOLTO or CLASSICUI).
   */
  public readonly variant: PloneVariant;

  /**
   * The Plone site ID in ZODB.
   */
  public readonly siteId: string;

  constructor(scope: Construct, id: string, options: PloneOptions = {}) {
    super(scope, id);
    this.frontendServiceName = undefined;
    this.siteId = options.siteId ?? 'Plone';
    this.variant = options.variant ?? PloneVariant.VOLTO;

    // ------------------------------------------------------------------------
    // Backend
    const backend = options.backend ?? {};
    const backendLabels = {
      'app.kubernetes.io/name': 'plone-backend',
      'app.kubernetes.io/component': 'backend',
      'app.kubernetes.io/version': options.version ?? 'undefined',
    };
    const backendPort = 8080;

    // Options
    var backendOptions: PloneDeploymentOptions = {
      labels: backendLabels,
      image: {
        image: backend.image ?? 'plone/plone-backend:latest',
        imagePullSecrets: options.imagePullSecrets ?? [],
        imagePullPolicy: backend.imagePullPolicy ?? 'IfNotPresent',
      },
      replicas: backend.replicas,
      limitCpu: backend.limitCpu ?? '500m',
      limitMemory: backend.limitMemory ?? '512Mi',
      requestCpu: backend.requestCpu ?? '200m',
      requestMemory: backend.requestMemory ?? '256Mi',
      pdb: {
        maxUnavailable: backend.maxUnavailable ?? undefined,
        minAvailable: backend.minAvailable ?? undefined,
      },
      port: backendPort,
      environment: backend.environment,
      annotations: backend.annotations,
      podAnnotations: backend.podAnnotations,
    };

    // Probing
    const backendActionHttpGet: k8s.HttpGetAction = {
      path: '/',
      port: IntOrString.fromNumber(backendPort),
    };
    if (backend.livenessEnabled ?? false) {
      backendOptions.livenessProbe = {
        httpGet: backendActionHttpGet,
        initialDelaySeconds: backend.livenessInitialDelaySeconds ?? 30,
        timeoutSeconds: backend.livenessTimeoutSeconds ?? 5,
        periodSeconds: backend.livenessPeriodSeconds ?? 10,
        successThreshold: backend.livenessSuccessThreshold ?? 1,
        failureThreshold: backend.livenessFailureThreshold ?? 3,
      };
    }
    if (backend.readinessEnabled ?? true) {
      backendOptions.readinessProbe = {
        httpGet: backendActionHttpGet,
        initialDelaySeconds: backend.readinessInitialDelaySeconds ?? 10,
        timeoutSeconds: backend.readinessTimeoutSeconds ?? 15,
        periodSeconds: backend.readinessPeriodSeconds ?? 10,
        successThreshold: backend.readinessSuccessThreshold ?? 1,
        failureThreshold: backend.readinessFailureThreshold ?? 3,
      };
    }
    // Deployment
    var backendDeployment = new PloneDeployment(this, 'backend', backendOptions);

    // Service
    const backendService = new PloneService(backendDeployment, 'service', {
      labels: {
        'app.kubernetes.io/name': 'plone-backend-service',
        'app.kubernetes.io/component': 'service',
      },
      targetPort: backendPort,
      selectorLabel: { app: Names.toLabelValue(backendDeployment) },
      portName: 'backend-http',
      annotations: backend.serviceAnnotations,
    });
    this.backendServiceName = backendService.name;

    // ------------------------------------------------------------------------
    // Frontend
    if (this.variant == PloneVariant.VOLTO) {
      const frontend = options.frontend ?? {};
      const frontendPort = 3000;
      const frontendLabels = {
        'app.kubernetes.io/name': 'plone-frontend',
        'app.kubernetes.io/component': 'frontend',
        'app.kubernetes.io/version': options.version ?? 'undefined',
      };

      // Environment for RAZZLE
      var frontendEnvironment = frontend.environment ?? new kplus.Env([], {});
      if (frontendEnvironment.variables.RAZZLE_INTERNAL_API_PATH === undefined) {
        // connect with backend service
        frontendEnvironment?.addVariable('RAZZLE_INTERNAL_API_PATH', kplus.EnvValue.fromValue(`http://${backendService.name}:${backendPort}/${this.siteId}`));
      }

      // Options
      var frontendOptions: PloneDeploymentOptions = {
        labels: frontendLabels,
        image: {
          image: frontend.image ?? 'plone/plone-frontend:latest',
          imagePullSecrets: options.imagePullSecrets ?? [],
          imagePullPolicy: frontend.imagePullPolicy ?? 'IfNotPresent',
        },
        replicas: frontend.replicas,
        limitCpu: frontend.limitCpu ?? '500m',
        limitMemory: frontend.limitMemory ?? '1Gi',
        requestCpu: frontend.requestCpu ?? '200m',
        requestMemory: frontend.requestMemory ?? '256Mi',

        pdb: {
          maxUnavailable: frontend.maxUnavailable ?? undefined,
          minAvailable: frontend.minAvailable ?? undefined,
        },
        port: frontendPort,
        environment: frontendEnvironment,
        annotations: frontend.annotations,
        podAnnotations: frontend.podAnnotations,
      };

      // Probing
      const frontendActionHttpGet: k8s.HttpGetAction = {
        path: '/',
        port: IntOrString.fromNumber(frontendPort),
      };
      if (frontend.livenessEnabled ?? false) {
        frontendOptions.livenessProbe = {
          httpGet: frontendActionHttpGet,
          initialDelaySeconds: frontend.livenessInitialDelaySeconds ?? 30,
          timeoutSeconds: frontend.livenessTimeoutSeconds ?? 5,
          periodSeconds: frontend.livenessPeriodSeconds ?? 10,
          successThreshold: frontend.livenessSuccessThreshold ?? 1,
          failureThreshold: frontend.livenessFailureThreshold ?? 3,
        };
      }
      if (frontend.readinessEnabled ?? true) {
        frontendOptions.readinessProbe = {
          httpGet: frontendActionHttpGet,
          initialDelaySeconds: frontend.readinessInitialDelaySeconds ?? 10,
          timeoutSeconds: frontend.readinessTimeoutSeconds ?? 15,
          periodSeconds: frontend.readinessPeriodSeconds ?? 10,
          successThreshold: frontend.readinessSuccessThreshold ?? 1,
          failureThreshold: frontend.readinessFailureThreshold ?? 3,
        };
      }

      // Deployment
      const frontendDeployment = new PloneDeployment(this, 'frontend', frontendOptions);

      // Service
      const frontendService = new PloneService(frontendDeployment, 'service', {
        labels: {
          'app.kubernetes.io/name': 'plone-frontend-service',
          'app.kubernetes.io/component': 'service',
        },
        targetPort: frontendPort,
        selectorLabel: { app: Names.toLabelValue(frontendDeployment) },
        portName: 'frontend-http',
        annotations: frontend.serviceAnnotations,
      });
      this.frontendServiceName = frontendService.name;
    }
  }
}