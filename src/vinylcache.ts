import * as fs from 'fs';
import * as path from 'path';
import { Names } from 'cdk8s';
import { Construct } from 'constructs';
import {
  VinylCache,
  VinylCacheSpecDirectorType,
  VinylCacheSpecResourcesLimits,
  VinylCacheSpecResourcesRequests,
} from './imports/vinyl.bluedynamics.eu';
import { Plone } from './plone';

/**
 * A Kubernetes toleration for the Varnish pods.
 */
export interface VinylCacheToleration {
  /**
   * The taint key to tolerate.
   */
  readonly key: string;

  /**
   * The operator (Equal or Exists).
   * @default 'Equal'
   */
  readonly operator?: string;

  /**
   * The taint value to match (when operator is Equal).
   * @default - no value
   */
  readonly value?: string;

  /**
   * The taint effect to tolerate (NoSchedule, PreferNoSchedule, NoExecute).
   * @default - tolerate all effects
   */
  readonly effect?: string;
}

/**
 * Configuration options for PloneVinylCache (cloud-vinyl operator).
 *
 * Creates a VinylCache custom resource that the cloud-vinyl operator
 * reconciles into a Varnish Cache cluster with agent-based VCL delivery.
 *
 * Requires the cloud-vinyl operator to be installed in the cluster.
 */
export interface PloneVinylCacheOptions {
  /**
   * The Plone construct to attach the cache to.
   * Backends are auto-configured from the Plone services.
   */
  readonly plone: Plone;

  /**
   * Number of Varnish pod replicas.
   * @default 2
   */
  readonly replicas?: number;

  /**
   * CPU request for Varnish pods.
   * @default '100m'
   */
  readonly requestCpu?: string;

  /**
   * Memory request for Varnish pods.
   * @default '256Mi'
   */
  readonly requestMemory?: string;

  /**
   * CPU limit for Varnish pods.
   * @default '500m'
   */
  readonly limitCpu?: string;

  /**
   * Memory limit for Varnish pods.
   * @default '512Mi'
   */
  readonly limitMemory?: string;

  /**
   * Director type for load distribution.
   * @default 'shard'
   */
  readonly director?: string;

  /**
   * Custom VCL snippet for vcl_recv subroutine.
   * Replaces the default Plone recv snippet.
   * @default - uses built-in plone-vinyl-recv.vcl
   */
  readonly vclRecvSnippet?: string;

  /**
   * Custom VCL snippet for vcl_backend_response subroutine.
   * Replaces the default Plone backend_response snippet.
   * @default - uses built-in plone-vinyl-backend-response.vcl
   */
  readonly vclBackendResponseSnippet?: string;

  /**
   * Enable cache invalidation (PURGE, BAN, xkey).
   * @default true
   */
  readonly invalidation?: boolean;

  /**
   * Enable Prometheus monitoring (metrics + ServiceMonitor).
   * @default false
   */
  readonly monitoring?: boolean;

  /**
   * Container image for the Varnish pods.
   * @default 'varnish:7.6'
   */
  readonly image?: string;

  /**
   * Tolerations for the Varnish pods.
   * @default - no tolerations
   */
  readonly tolerations?: VinylCacheToleration[];
}

/**
 * PloneVinylCache construct for deploying Varnish Cache via cloud-vinyl operator.
 *
 * Creates a VinylCache custom resource with Plone backend/frontend services
 * auto-configured as backends. The cloud-vinyl operator manages the full
 * Varnish lifecycle including VCL generation, agent delivery, and monitoring.
 *
 * Requires the cloud-vinyl operator to be installed in the cluster.
 *
 * @example
 * const plone = new Plone(chart, 'plone');
 * const cache = new PloneVinylCache(chart, 'cache', {
 *   plone: plone,
 *   replicas: 2,
 * });
 * // Use cache.vinylCacheServiceName for IngressRoute
 */
export class PloneVinylCache extends Construct {
  /**
   * Name of the VinylCache service created by the operator.
   * Use this to reference the cache service from ingress or other constructs.
   */
  public readonly vinylCacheServiceName: string;

  constructor(scope: Construct, id: string, options: PloneVinylCacheOptions) {
    super(scope, id);

    const replicas = options.replicas ?? 2;
    const invalidation = options.invalidation ?? true;
    const monitoring = options.monitoring ?? false;

    // Resolve director type enum
    const directorStr = options.director ?? 'shard';
    let directorType: VinylCacheSpecDirectorType;
    switch (directorStr) {
      case 'round_robin':
        directorType = VinylCacheSpecDirectorType.ROUND_UNDERSCORE_ROBIN;
        break;
      case 'random':
        directorType = VinylCacheSpecDirectorType.RANDOM;
        break;
      case 'hash':
        directorType = VinylCacheSpecDirectorType.HASH;
        break;
      default:
        directorType = VinylCacheSpecDirectorType.SHARD;
    }

    // Load default VCL snippets
    const vclRecv = options.vclRecvSnippet ??
      fs.readFileSync(path.join(__dirname, 'config', 'plone-vinyl-recv.vcl'), 'utf8');
    const vclBackendResponse = options.vclBackendResponseSnippet ??
      fs.readFileSync(path.join(__dirname, 'config', 'plone-vinyl-backend-response.vcl'), 'utf8');

    // Build backends from Plone services
    const backends = [
      {
        name: 'plone_backend',
        serviceRef: { name: options.plone.backendServiceName },
        port: 8080,
        probe: {
          url: '/ok',
          interval: '5s',
          timeout: '2s',
          window: 10,
          threshold: 8,
        },
      },
    ];

    if (options.plone.frontendServiceName) {
      backends.push({
        name: 'plone_frontend',
        serviceRef: { name: options.plone.frontendServiceName },
        port: 3000,
        probe: {
          url: '/',
          interval: '5s',
          timeout: '2s',
          window: 10,
          threshold: 8,
        },
      });
    }

    const vinylCache = new VinylCache(this, 'vinylcache', {
      spec: {
        replicas,
        image: options.image ?? 'varnish:7.6',
        backends,
        director: { type: directorType },
        vcl: {
          snippets: {
            vclRecv: vclRecv,
            vclBackendResponse: vclBackendResponse,
          },
        },
        resources: {
          requests: {
            cpu: VinylCacheSpecResourcesRequests.fromString(options.requestCpu ?? '100m'),
            memory: VinylCacheSpecResourcesRequests.fromString(options.requestMemory ?? '256Mi'),
          },
          limits: {
            cpu: VinylCacheSpecResourcesLimits.fromString(options.limitCpu ?? '500m'),
            memory: VinylCacheSpecResourcesLimits.fromString(options.limitMemory ?? '512Mi'),
          },
        },
        invalidation: invalidation ? {
          purge: { enabled: true },
          ban: { enabled: true },
          xkey: { enabled: true },
        } : undefined,
        monitoring: monitoring ? {
          enabled: true,
          serviceMonitor: { enabled: true },
        } : undefined,
        pod: (options.tolerations && options.tolerations.length > 0) ? {
          tolerations: options.tolerations.map(t => ({
            key: t.key,
            operator: t.operator,
            value: t.value,
            effect: t.effect,
          })),
        } : undefined,
      },
    });

    // The operator creates a service with the same name as the VinylCache resource
    this.vinylCacheServiceName = Names.toLabelValue(vinylCache);
  }
}
