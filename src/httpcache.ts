import * as fs from 'fs';
import * as path from 'path';
import { Helm } from 'cdk8s';
import { Construct } from 'constructs';
import { Plone } from './plone';

/**
 * Configuration options for PloneHttpcache (Varnish caching layer).
 */
export interface PloneHttpcacheOptions {
  /**
   * The Plone construct to attach the HTTP cache to.
   * The cache will automatically connect to the backend and frontend services.
   */
  readonly plone: Plone;

  /**
   * Varnish VCL configuration as a string.
   * If provided, this takes precedence over varnishVclFile.
   * @default - loaded from varnishVclFile or default config file
   */
  readonly varnishVcl?: string;

  /**
   * Path to a Varnish VCL configuration file.
   * If not provided, uses the default VCL file included in the library.
   * @default - uses default config/varnish.tpl.vcl
   */
  readonly varnishVclFile?: string | undefined;

  /**
   * Name of an existing Kubernetes secret containing Varnish admin credentials.
   * The secret should be created separately in the same namespace.
   * @default - undefined (no existing secret)
   */
  readonly existingSecret?: string;

  /**
   * CPU limit for Varnish pods.
   * @default '500m'
   */
  readonly limitCpu?: string;

  /**
   * Memory limit for Varnish pods.
   * @default '500Mi'
   */
  readonly limitMemory?: string;

  /**
   * CPU request for Varnish pods.
   * @default '100m'
   */
  readonly requestCpu?: string;

  /**
   * Memory request for Varnish pods.
   * @default '100Mi'
   */
  readonly requestMemory?: string;

  /**
   * Enable Prometheus ServiceMonitor for metrics collection.
   * Requires Prometheus Operator to be installed in the cluster.
   * @default false
   */
  readonly servicemonitor?: boolean;
}

/**
 * PloneHttpcache construct for deploying Varnish HTTP caching layer.
 *
 * Uses the mittwald/kube-httpcache Helm chart to deploy Varnish as a
 * caching proxy in front of Plone backend and/or frontend services.
 *
 * The cache automatically connects to the Plone services and provides
 * HTTP cache invalidation capabilities.
 *
 * @example
 * ```typescript
 * const plone = new Plone(chart, 'plone');
 * const cache = new PloneHttpcache(chart, 'cache', {
 *   plone: plone,
 *   existingSecret: 'varnish-secret',
 * });
 * ```
 */
export class PloneHttpcache extends Construct {
  /**
   * Name of the Varnish service created by the Helm chart.
   * Use this to reference the cache service from ingress or other constructs.
   */
  public readonly httpcacheServiceName: string;

  constructor(scope: Construct, id: string, options: PloneHttpcacheOptions) {
    super(scope, id);
    let varnishVcl: string;
    if (!options.varnishVcl) {
      let vclPath: string;
      if (!options.varnishVclFile) {
        vclPath = path.join(__dirname, 'config', 'varnish.tpl.vcl');
      } else {
        vclPath = options.varnishVclFile;
      }
      varnishVcl = fs.readFileSync(vclPath, 'utf8');
    } else {
      varnishVcl = options.varnishVcl;
    }
    const httpcache = new Helm(this, 'httpcache', {
      // see https://github.com/mittwald/kube-httpcache/chart
      repo: 'https://helm.mittwald.de',
      chart: 'kube-httpcache',
      values: {
        replicaCount: 2,
        cache: {
          // need to looks at the frontendWatch, do we need it?
          frontendWatch: false,
          backendWatch: false,
          existingSecret: options.existingSecret ?? undefined,
        },
        vclTemplate: varnishVcl,
        extraEnvVars: [
          { name: 'BACKEND_SERVICE_NAME', value: options.plone.backendServiceName },
          { name: 'BACKEND_SERVICE_PORT', value: '8080' },
          { name: 'BACKEND_SITE_ID', value: options.plone.siteId },
          { name: 'FRONTEND_SERVICE_NAME', value: options.plone.frontendServiceName },
          { name: 'FRONTEND_SERVICE_PORT', value: '3000' },
        ],
        // see https://github.com/mittwald/kube-httpcache/issues/253
        nodeSelector: {
          'kubernetes.io/arch': 'amd64',
        },
        resources: {
          limits: {
            cpu: options.limitCpu || '500m',
            memory: options.limitMemory || '500Mi',
          },
          requests: {
            cpu: options.requestCpu || '100m',
            memory: options.requestMemory || '100Mi',
          },
        },
        rbac: {
          enabled: false,
        },
        exporter: {
          enabled: true,
          resources: {
            limits: {
              cpu: '100m',
              memory: '100Mi',
            },
            requests: {
              cpu: '10m',
              memory: '50Mi',
            },
          },
        },
        serviceMonitor: {
          enabled: options.servicemonitor || false,
          scrapeSignaller: options.servicemonitor || false,
        },
      },
    });
    const httpcacheService = httpcache.apiObjects.find((construct) => {
      if ((construct.kind === 'Service') && (construct.metadata.name?.endsWith('kube-httpcache'))) {
        return construct.name;
      }
      return undefined;
    });
    if (httpcacheService === undefined) {
      throw new Error('Could not find httpcache service');
    }
    this.httpcacheServiceName = httpcacheService.name;
  }
}