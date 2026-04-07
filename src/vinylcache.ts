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
 * Health probe configuration for a VinylCache backend.
 */
export interface VinylCacheBackendProbe {
  /**
   * URL to probe.
   * @default '/'
   */
  readonly url?: string;

  /**
   * How often to probe the backend.
   * @default '5s'
   */
  readonly interval?: string;

  /**
   * Maximum time to wait for a probe response.
   * @default '2s'
   */
  readonly timeout?: string;

  /**
   * Number of most recent probes to consider.
   * @default 10
   */
  readonly window?: number;

  /**
   * Minimum successful probes within window for healthy status.
   * @default 8
   */
  readonly threshold?: number;

  /**
   * Expected HTTP response status code.
   * @default 200
   */
  readonly expectedResponse?: number;
}

/**
 * An additional backend for the VinylCache.
 */
export interface VinylCacheBackend {
  /**
   * VCL identifier for this backend. Must match ^[a-zA-Z][a-zA-Z0-9_]*$.
   */
  readonly name: string;

  /**
   * Kubernetes Service name to use as backend.
   */
  readonly serviceName: string;

  /**
   * Port to use for this backend.
   */
  readonly port: number;

  /**
   * Health probe configuration.
   * @default - no probe
   */
  readonly probe?: VinylCacheBackendProbe;

  /**
   * Relative weight for the director. 0 means standby.
   * @default - operator default
   */
  readonly weight?: number;
}

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
   * Additional backends to add after the auto-generated Plone backends.
   * Uses the same backend type structure as the VinylCache CRD.
   * @default - no extra backends
   */
  readonly extraBackends?: VinylCacheBackend[];

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

  /**
   * Node selector labels for the Varnish pods.
   * Constrains pods to nodes matching all specified labels.
   * @default - no node selector
   */
  readonly nodeSelector?: { [key: string]: string };

  /**
   * Custom VCL snippet for vcl_deliver subroutine.
   * @default - no snippet
   */
  readonly vclDeliverSnippet?: string;

  /**
   * Custom VCL snippet for vcl_hit subroutine.
   * @default - no snippet
   */
  readonly vclHitSnippet?: string;

  /**
   * Custom VCL snippet for vcl_miss subroutine.
   * @default - no snippet
   */
  readonly vclMissSnippet?: string;

  /**
   * Custom VCL snippet for vcl_pass subroutine.
   * @default - no snippet
   */
  readonly vclPassSnippet?: string;

  /**
   * Custom VCL snippet for vcl_pipe subroutine.
   * @default - no snippet
   */
  readonly vclPipeSnippet?: string;

  /**
   * Custom VCL snippet for vcl_synth subroutine.
   * @default - no snippet
   */
  readonly vclSynthSnippet?: string;

  /**
   * Custom VCL snippet for vcl_purge subroutine.
   * @default - no snippet
   */
  readonly vclPurgeSnippet?: string;

  /**
   * Custom VCL snippet for vcl_hash subroutine.
   * @default - no snippet
   */
  readonly vclHashSnippet?: string;

  /**
   * Custom VCL snippet for vcl_init subroutine.
   * @default - no snippet
   */
  readonly vclInitSnippet?: string;

  /**
   * Custom VCL snippet for vcl_fini subroutine.
   * @default - no snippet
   */
  readonly vclFiniSnippet?: string;

  /**
   * Custom VCL snippet for vcl_backend_fetch subroutine.
   * @default - no snippet
   */
  readonly vclBackendFetchSnippet?: string;

  /**
   * Custom VCL snippet for vcl_backend_error subroutine.
   * @default - no snippet
   */
  readonly vclBackendErrorSnippet?: string;
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
    const backends: Array<{
      name: string;
      serviceRef: { name: string };
      port: number;
      probe?: {
        url: string;
        interval: string;
        timeout: string;
        window: number;
        threshold: number;
      };
      weight?: number;
    }> = [
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

    if (options.extraBackends) {
      for (const eb of options.extraBackends) {
        backends.push({
          name: eb.name,
          serviceRef: { name: eb.serviceName },
          port: eb.port,
          probe: eb.probe ? {
            url: eb.probe.url ?? '/',
            interval: eb.probe.interval ?? '5s',
            timeout: eb.probe.timeout ?? '2s',
            window: eb.probe.window ?? 10,
            threshold: eb.probe.threshold ?? 8,
          } : undefined,
        });
      }
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
            vclDeliver: options.vclDeliverSnippet,
            vclHit: options.vclHitSnippet,
            vclMiss: options.vclMissSnippet,
            vclPass: options.vclPassSnippet,
            vclPipe: options.vclPipeSnippet,
            vclSynth: options.vclSynthSnippet,
            vclPurge: options.vclPurgeSnippet,
            vclHash: options.vclHashSnippet,
            vclInit: options.vclInitSnippet,
            vclFini: options.vclFiniSnippet,
            vclBackendFetch: options.vclBackendFetchSnippet,
            vclBackendError: options.vclBackendErrorSnippet,
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
        pod: (options.tolerations?.length || options.nodeSelector) ? {
          tolerations: options.tolerations?.map(t => ({
            key: t.key,
            operator: t.operator,
            value: t.value,
            effect: t.effect,
          })),
          nodeSelector: options.nodeSelector,
        } : undefined,
      },
    });

    // The operator creates a service with the same name as the VinylCache resource
    this.vinylCacheServiceName = Names.toLabelValue(vinylCache);
  }
}
