import { Names } from 'cdk8s';
import * as kplus from 'cdk8s-plus-24';
import { Construct } from 'constructs';
import { PloneDeployment } from './deployment';
import { Probe, IntOrString } from './imports/k8s';
import * as k8s from './imports/k8s';
import { PloneService } from './service';

export interface PloneBaseOptions {
  // image
  readonly image?: string;
  readonly imagePullPolicy?: string;
  // replicas
  readonly replicas?: number;
  readonly maxUnavailable?: number | string;
  readonly minAvailable?: number | string;
  // resources
  readonly limitCpu?: string;
  readonly limitMemory?: string;
  readonly requestCpu?: string;
  readonly requestMemory?: string;
  readonly environment?: kplus.Env;
  // readiness Probe
  readonly readinessInitialDelaySeconds?: number;
  readonly readinessIimeoutSeconds?: number;
  readonly readinessPeriodSeconds?: number;
  readonly readinessSuccessThreshold?: number;
  readonly readinessFailureThreshold?: number;
  // liveness Probe
  readonly livenessInitialDelaySeconds?: number;
  readonly livenessIimeoutSeconds?: number;
  readonly livenessPeriodSeconds?: number;
  readonly livenessSuccessThreshold?: number;
  readonly livenessFailureThreshold?: number;
}
export enum PloneVariant {
  VOLTO = 'volto',
  CLASSICUI = 'classicui',
}
export interface PloneOptions {
  readonly version?: string;
  readonly siteId?: string;
  readonly variant?: PloneVariant;
  readonly backend?: PloneBaseOptions;
  readonly frontend?: PloneBaseOptions;
  readonly imagePullSecrets?: string[];

}

export class Plone extends Construct {
  /* Create all elements for a Plone deployment in Kubernetes
    * there are two variants of Plone deployment:
      - "volto": frontend and backend and frontend, default (reactjs rendered HTML)
      - "classicui: backend only (SSR HTML)

    * @param scope - Construct scope
    * @param id - Construct id
    * @param options - PloneOptions
    */
  public readonly backendServiceName: string;
  public readonly frontendServiceName: string | undefined;
  public readonly variant: PloneVariant;
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

    // Probing
    const backendActionHttpGet: k8s.HttpGetAction = {
      path: '/',
      port: IntOrString.fromNumber(backendPort),
    };

    const backendLivenessProbe: Probe = {
      httpGet: backendActionHttpGet,
      initialDelaySeconds: backend.livenessInitialDelaySeconds ?? 30,
      timeoutSeconds: backend.livenessIimeoutSeconds ?? 5,
      periodSeconds: backend.livenessPeriodSeconds ?? 10,
      successThreshold: backend.livenessSuccessThreshold ?? 1,
      failureThreshold: backend.livenessFailureThreshold ?? 3,
    };
    const backendReadinessProbe: Probe = {
      httpGet: backendActionHttpGet,
      initialDelaySeconds: backend.readinessInitialDelaySeconds ?? 10,
      timeoutSeconds: backend.readinessIimeoutSeconds ?? 15,
      periodSeconds: backend.readinessPeriodSeconds ?? 10,
      successThreshold: backend.readinessSuccessThreshold ?? 1,
      failureThreshold: backend.readinessFailureThreshold ?? 3,
    };

    // Deployment
    const backendDeployment = new PloneDeployment(this, 'backend', {
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
      livenessProbe: backendLivenessProbe,
      readinessProbe: backendReadinessProbe,
    });

    // Service
    const backendService = new PloneService(backendDeployment, 'service', {
      labels: {
        'app.kubernetes.io/name': 'plone-backend-service',
        'app.kubernetes.io/component': 'service',
      },
      targetPort: backendPort,
      selectorLabel: { app: Names.toLabelValue(backendDeployment) },
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

      // Probing
      const frontendActionHttpGet: k8s.HttpGetAction = {
        path: '/',
        port: IntOrString.fromNumber(frontendPort),
      };
      const frontendLivenessProbe: Probe = {
        httpGet: frontendActionHttpGet,
        initialDelaySeconds: frontend.livenessInitialDelaySeconds ?? 30,
        timeoutSeconds: frontend.livenessIimeoutSeconds ?? 5,
        periodSeconds: frontend.livenessPeriodSeconds ?? 10,
        successThreshold: frontend.livenessSuccessThreshold ?? 1,
        failureThreshold: frontend.livenessFailureThreshold ?? 3,
      };
      const frontendReadinessProbe: Probe = {
        httpGet: frontendActionHttpGet,
        initialDelaySeconds: frontend.readinessInitialDelaySeconds ?? 10,
        timeoutSeconds: frontend.readinessIimeoutSeconds ?? 15,
        periodSeconds: frontend.readinessPeriodSeconds ?? 10,
        successThreshold: frontend.readinessSuccessThreshold ?? 1,
        failureThreshold: frontend.readinessFailureThreshold ?? 3,
      };

      // Environment for RAZZLE
      var frontendEnvironment = frontend.environment ?? new kplus.Env([], {});
      if (frontendEnvironment.variables.RAZZLE_INTERNAL_API_PATH === undefined) {
        // connect with backend service
        frontendEnvironment?.addVariable('RAZZLE_INTERNAL_API_PATH', kplus.EnvValue.fromValue(`http://${backendService.name}:${backendPort}/${this.siteId}`));
      }

      // Deployment
      const frontendDeployment = new PloneDeployment(this, 'frontend', {
        labels: frontendLabels,
        image: {
          image: frontend.image ?? 'plone/plone-frontend:latest',
          imagePullSecrets: options.imagePullSecrets ?? [],
          imagePullPolicy: frontend.imagePullPolicy ?? 'IfNotPresent',
        },
        replicas: frontend.replicas,
        limitCpu: frontend.limitCpu ?? '500m',
        limitMemory: frontend.limitMemory ?? '1Gi',
        requestCpu: backend.requestCpu ?? '200m',
        requestMemory: backend.requestMemory ?? '256Mi',

        pdb: {
          maxUnavailable: frontend.maxUnavailable ?? undefined,
          minAvailable: frontend.minAvailable ?? undefined,
        },
        port: frontendPort,
        environment: frontendEnvironment,
        livenessProbe: frontendLivenessProbe,
        readinessProbe: frontendReadinessProbe,
      });

      // Service
      const frontendService = new PloneService(frontendDeployment, 'service', {
        labels: {
          'app.kubernetes.io/name': 'plone-frontend-service',
          'app.kubernetes.io/component': 'service',
        },
        targetPort: frontendPort,
        selectorLabel: { app: Names.toLabelValue(frontendDeployment) },
      });
      this.frontendServiceName = frontendService.name;
    }
  }
}