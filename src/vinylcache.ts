import * as fs from 'fs';
import * as path from 'path';
import { Construct } from 'constructs';
import {
  VinylCache,
  VinylCacheSpecBackends,
  VinylCacheSpecBackendsProbe,
  VinylCacheSpecDirectorShardBy,
  VinylCacheSpecDirectorShardHealthy,
  VinylCacheSpecDirectorType,
  VinylCacheSpecResourcesLimits,
  VinylCacheSpecResourcesRequests,
  VinylCacheSpecStorage,
  VinylCacheSpecStorageSize,
  VinylCacheSpecStorageType,
  VinylCacheSpecTracingOtlpProtocol,
  VinylCacheSpecTracingResourcesLimits,
  VinylCacheSpecTracingResourcesRequests,
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
 * Tracer sidecar configuration (`spec.tracing`), see `PloneVinylCacheOptions.tracing`.
 */
export interface VinylCacheTracing {
  /**
   * OTLP collector address as `host:port`, without scheme,
   * e.g. `'otel-collector.monitoring:4317'`.
   */
  readonly otlpEndpoint: string;

  /**
   * OTLP transport: `'grpc'` or `'http/protobuf'`.
   * @default - operator default ('grpc')
   */
  readonly protocol?: string;

  /**
   * Disable TLS for the OTLP connection.
   * @default false
   */
  readonly insecure?: boolean;

  /**
   * OpenTelemetry `service.name` of the exported spans.
   * @default - operator default (the VinylCache name)
   */
  readonly serviceName?: string;

  /**
   * CPU request for the tracer sidecar.
   * @default - operator default
   */
  readonly requestCpu?: string;

  /**
   * Memory request for the tracer sidecar.
   * @default - operator default
   */
  readonly requestMemory?: string;

  /**
   * CPU limit for the tracer sidecar.
   * @default - operator default
   */
  readonly limitCpu?: string;

  /**
   * Memory limit for the tracer sidecar.
   * @default - operator default
   */
  readonly limitMemory?: string;
}

/**
 * A Varnish storage backend configuration.
 *
 * Maps to `spec.storage[]` on the VinylCache CRD. The operator emits one
 * `-s <name>=<type>,<options>` argument per entry to varnishd.
 *
 * Without any storage entry the operator falls back to the varnishd default
 * (~100 MB malloc), which is almost always too small for real workloads.
 */
export interface VinylCacheStorage {
  /**
   * Internal storage identifier used in the varnishd `-s` argument.
   * Must be unique within the VinylCache and match `^[a-zA-Z][a-zA-Z0-9_]*$`.
   */
  readonly name: string;

  /**
   * Storage backend type. Only "malloc" and "file" are permitted by the
   * admission webhook.
   */
  readonly type: 'malloc' | 'file';

  /**
   * Storage allocation as a Kubernetes resource quantity (e.g. "1Gi", "500M").
   * Required for malloc; required for file.
   * @default - required for both malloc and file
   */
  readonly size?: string;

  /**
   * Filesystem path for file-type storage. Ignored for malloc.
   * @default - required for type "file"
   */
  readonly path?: string;
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
 * Requires cloud-vinyl 1.0.0-rc.2 or later in the cluster
 * (`vinyl.bluedynamics.eu/v1`).
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
   * Probe settings for the auto-generated Plone backend, merged field by field
   * over the defaults, e.g. `{ timeout: '5s' }` for slow warm-up queries.
   * `threshold` must not exceed `window`, and `window` must be 64 or less.
   * @default - { url: '/ok', interval: '5s', timeout: '2s', window: 10, threshold: 8 }
   */
  readonly ploneBackendProbe?: VinylCacheBackendProbe;

  /**
   * Probe settings for the auto-generated Plone frontend (Volto variant only),
   * merged field by field over the defaults, see `ploneBackendProbe`.
   * @default - { url: '/', interval: '5s', timeout: '2s', window: 10, threshold: 8 }
   */
  readonly ploneFrontendProbe?: VinylCacheBackendProbe;

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
   * Varnish storage backends (`spec.storage`).
   *
   * Each entry becomes a `-s <name>=<type>,<options>` argument to varnishd.
   * If omitted, the operator ships varnishd with its stock default (~100 MB
   * malloc) — almost always too small. Set an explicit malloc size at least
   * matching the pod's memory request to use the allocated memory for caching.
   *
   * Do not name an entry `s0`: the stock varnish image's entrypoint always adds
   * its own unnamed `-s malloc,...`, which varnishd names `s0`, and the names
   * collide. varnishd also spreads objects round-robin over all storages,
   * including that implicit `s0`; pin your storage in `vcl_backend_response`
   * with `set beresp.storage = storage.<name>;` (bluedynamics/cloud-vinyl#113).
   *
   * @default - no storage configured; operator uses varnishd default (~100MB malloc)
   * @example
   * storage: [{ name: 'cache', type: 'malloc', size: '1Gi' }]
   */
  readonly storage?: VinylCacheStorage[];

  /**
   * Enable clustering between the Varnish pods (`spec.cluster.enabled`).
   *
   * With clustering, a pod that does not own a URL passes the request to the
   * pod that does, so every object is cached once across all replicas and the
   * effective cache size grows with the replica count. Without it, every pod
   * caches every object, and a load balancer spreading requests evenly makes
   * each pod fetch and store the same objects.
   *
   * @default - not set; the operator does not cluster the pods
   */
  readonly cluster?: boolean;

  /**
   * Runtime parameters passed to varnishd as `-p name=value`
   * (`spec.varnishParameters`), for example `{ nuke_limit: '1000' }`.
   *
   * @default - not set; varnishd defaults apply
   */
  readonly varnishParameters?: { [name: string]: string };

  /**
   * Export OpenTelemetry trace spans built from the Varnish log through the
   * vinyl-tracer sidecar (`spec.tracing`). Setting it enables the tracer.
   * Tracing needs a varnish 9 image, such as the default.
   *
   * @default - no tracing
   */
  readonly tracing?: VinylCacheTracing;

  /**
   * Process Edge Side Includes (`spec.esi.enabled`) in backend responses that
   * carry `Surrogate-Control: content="ESI/1.0"`. Do not use
   * `varnishParameters: { feature: '+esi' }` instead: that is not a varnishd
   * feature bit and makes varnishd fail to start.
   *
   * @default - not set; no ESI processing
   */
  readonly esi?: boolean;

  /**
   * Director type for load distribution.
   * @default 'shard'
   */
  readonly director?: string;

  /**
   * Shard director: what value is hashed for shard selection.
   * Only "URL" (the request URL) is supported. cloud-vinyl 1.0 removed "HASH":
   * the cluster routing runs in vcl_recv, before Varnish computes the hash.
   * Only applied when director is "shard".
   * @default - operator default ("URL")
   */
  readonly shardBy?: string;

  /**
   * Shard director: which backends the director considers when selecting a shard.
   * "CHOSEN" (default) only considers the chosen backend healthy; "ALL" requires all
   * backends to be healthy.
   * Only applied when director is "shard".
   * @default - operator default ("CHOSEN")
   */
  readonly shardHealthy?: string;

  /**
   * Shard director: time after adding a backend before it receives its full share of
   * traffic, preventing thundering-herd.
   * Only applied when director is "shard".
   * @default - operator default ("30s")
   */
  readonly shardRampup?: string;

  /**
   * Shard director: number of Ketama replicas per backend in the hash ring.
   * Only applied when director is "shard".
   * @default - operator default (67)
   */
  readonly shardReplicas?: number;

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
   * Public site hostnames a PURGE through the invalidation proxy applies to,
   * e.g. `['example.org', 'www.example.org']` (`spec.invalidation.purge.hosts`).
   *
   * Varnish keys cached pages by URL and site host, while clients reach the
   * proxy through `invalidationUrl`. For a purge without an
   * `X-Vinyl-Purge-Host` header, the proxy sends one purge per listed host.
   * Clients that cannot set headers, such as `plone.cachepurging`, need this,
   * or their purges match nothing. At most 16 lowercase hostnames.
   * @default - none, purges apply only to the host the client sends
   */
  readonly purgeHosts?: string[];

  /**
   * Enable Prometheus monitoring. When true this turns on operator metrics,
   * a ServiceMonitor, and the prometheus_varnish_exporter sidecar (required
   * for cache hit-ratio and backend-health metrics).
   * @default false
   */
  readonly monitoring?: boolean;

  /**
   * Container image for the Varnish pods.
   * cloud-vinyl 1.0 is tested with the docker-library `varnish` 9.1 image.
   * @default 'varnish:9.1.0'
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
 * Merges a probe override field by field over the construct defaults and
 * checks the limits varnishd enforces when it compiles the VCL. cloud-vinyl
 * does not check them, so a bad probe would leave the cache unsynced.
 */
function toProbe(name: string, defaults: VinylCacheBackendProbe, override: VinylCacheBackendProbe | undefined): VinylCacheSpecBackendsProbe {
  const probe = {
    url: override?.url ?? defaults.url ?? '/',
    interval: override?.interval ?? '5s',
    timeout: override?.timeout ?? '2s',
    window: override?.window ?? 10,
    threshold: override?.threshold ?? 8,
    expectedResponse: override?.expectedResponse,
  };
  for (const field of ['window', 'threshold'] as const) {
    if (!Number.isInteger(probe[field]) || probe[field] < 1) {
      throw new Error(`${name}.${field} must be a positive integer, got ${probe[field]}`);
    }
  }
  if (probe.window > 64) {
    throw new Error(`${name}.window must be 64 or less (varnishd limit), got ${probe.window}`);
  }
  if (probe.threshold > probe.window) {
    throw new Error(`${name}.threshold (${probe.threshold}) cannot be greater than window (${probe.window}), varnishd would reject the VCL`);
  }
  return probe;
}

/**
 * Builds a cpu/memory map from the values that are set, or undefined if none is.
 */
function quantities<T>(cpu: string | undefined, memory: string | undefined, from: (value: string) => T): { [key: string]: T } | undefined {
  const result: { [key: string]: T } = {};
  if (cpu !== undefined) result.cpu = from(cpu);
  if (memory !== undefined) result.memory = from(memory);
  return Object.keys(result).length > 0 ? result : undefined;
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
 * // Use cache.vinylCacheServiceName for IngressRoute,
 * // cache.invalidationUrl for plone.cachepurging
 */
export class PloneVinylCache extends Construct {
  /**
   * Name of the VinylCache service created by the operator.
   * Use this to reference the cache service from ingress or other constructs.
   */
  public readonly vinylCacheServiceName: string;

  private readonly namespace?: string;
  private readonly invalidationEnabled: boolean;

  constructor(scope: Construct, id: string, options: PloneVinylCacheOptions) {
    super(scope, id);

    const replicas = options.replicas ?? 2;
    const invalidation = options.invalidation ?? true;
    const monitoring = options.monitoring ?? false;
    const purgeHosts = options.purgeHosts;
    if (purgeHosts !== undefined) {
      if (!invalidation) {
        throw new Error('purgeHosts needs invalidation enabled');
      }
      // Same constraints as the CRD, so mistakes fail at synth time.
      if (purgeHosts.length > 16) {
        throw new Error(`purgeHosts accepts at most 16 hosts, got ${purgeHosts.length}`);
      }
      const hostPattern = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/;
      for (const host of purgeHosts) {
        if (!hostPattern.test(host) || host.length > 253) {
          throw new Error(`purgeHosts entry "${host}" is not a lowercase hostname`);
        }
      }
      if (new Set(purgeHosts).size !== purgeHosts.length) {
        throw new Error('purgeHosts must not contain duplicates');
      }
    }

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

    // Shard director tuning: only honored by the operator when director type is "shard".
    // Emit the shard block only for shard directors so manifests stay minimal.
    let shardSpec: {
      by?: VinylCacheSpecDirectorShardBy;
      healthy?: VinylCacheSpecDirectorShardHealthy;
      rampup?: string;
      replicas?: number;
    } | undefined;
    if (directorType === VinylCacheSpecDirectorType.SHARD &&
        (options.shardBy || options.shardHealthy || options.shardRampup || options.shardReplicas !== undefined)) {
      let shardBy: VinylCacheSpecDirectorShardBy | undefined;
      if (options.shardBy === 'URL') {shardBy = VinylCacheSpecDirectorShardBy.URL;} else if (options.shardBy !== undefined) {
        throw new Error(
          `shardBy must be "URL", got "${options.shardBy}". `
          + 'cloud-vinyl 1.0 removed "HASH": the cluster routing runs before Varnish computes the hash.',
        );
      }

      let shardHealthy: VinylCacheSpecDirectorShardHealthy | undefined;
      if (options.shardHealthy === 'ALL') shardHealthy = VinylCacheSpecDirectorShardHealthy.ALL;
      else if (options.shardHealthy === 'CHOSEN') shardHealthy = VinylCacheSpecDirectorShardHealthy.CHOSEN;

      shardSpec = {
        by: shardBy,
        healthy: shardHealthy,
        rampup: options.shardRampup,
        replicas: options.shardReplicas,
      };
    }

    // Load default VCL snippets
    const vclRecv = options.vclRecvSnippet ??
      fs.readFileSync(path.join(__dirname, 'config', 'plone-vinyl-recv.vcl'), 'utf8');
    const vclBackendResponse = options.vclBackendResponseSnippet ??
      fs.readFileSync(path.join(__dirname, 'config', 'plone-vinyl-backend-response.vcl'), 'utf8');

    // Build backends from Plone services
    const backends: VinylCacheSpecBackends[] = [
      {
        name: 'plone_backend',
        serviceRef: { name: options.plone.backendServiceName },
        port: 8080,
        probe: toProbe('ploneBackendProbe', { url: '/ok' }, options.ploneBackendProbe),
      },
    ];

    if (options.plone.frontendServiceName) {
      backends.push({
        name: 'plone_frontend',
        serviceRef: { name: options.plone.frontendServiceName },
        port: 3000,
        probe: toProbe('ploneFrontendProbe', { url: '/' }, options.ploneFrontendProbe),
      });
    }

    if (options.extraBackends) {
      for (const eb of options.extraBackends) {
        backends.push({
          name: eb.name,
          serviceRef: { name: eb.serviceName },
          port: eb.port,
          probe: eb.probe ? toProbe(`extraBackends[${eb.name}].probe`, { url: '/' }, eb.probe) : undefined,
          weight: eb.weight,
        });
      }
    }

    const storage: VinylCacheSpecStorage[] | undefined = options.storage?.map(s => ({
      name: s.name,
      type: s.type === 'file' ? VinylCacheSpecStorageType.FILE : VinylCacheSpecStorageType.MALLOC,
      size: s.size !== undefined ? VinylCacheSpecStorageSize.fromString(s.size) : undefined,
      path: s.path,
    }));

    const tracing = options.tracing;
    let tracingProtocol: VinylCacheSpecTracingOtlpProtocol | undefined;
    if (tracing !== undefined) {
      // cloud-vinyl's webhook rejects an enabled tracer without host:port.
      if (!/^(\[[0-9a-fA-F:.]+\]|[^\s/:[\]]+):\d{1,5}$/.test(tracing.otlpEndpoint)) {
        throw new Error(`tracing.otlpEndpoint must be host:port without scheme, got "${tracing.otlpEndpoint}"`);
      }
      if (tracing.protocol === 'grpc') {tracingProtocol = VinylCacheSpecTracingOtlpProtocol.GRPC;} else if (tracing.protocol === 'http/protobuf') {tracingProtocol = VinylCacheSpecTracingOtlpProtocol.HTTP_FORWARD_SLASH_PROTOBUF;} else if (tracing.protocol !== undefined) {
        throw new Error(`tracing.protocol must be "grpc" or "http/protobuf", got "${tracing.protocol}"`);
      }
    }
    const tracingRequests = quantities(tracing?.requestCpu, tracing?.requestMemory, VinylCacheSpecTracingResourcesRequests.fromString);
    const tracingLimits = quantities(tracing?.limitCpu, tracing?.limitMemory, VinylCacheSpecTracingResourcesLimits.fromString);
    const tracingResources = tracingRequests || tracingLimits
      ? { requests: tracingRequests, limits: tracingLimits }
      : undefined;

    const vinylCache = new VinylCache(this, 'vinylcache', {
      spec: {
        replicas,
        image: options.image ?? 'varnish:9.1.0',
        backends,
        director: { type: directorType, shard: shardSpec },
        storage,
        cluster: options.cluster !== undefined ? { enabled: options.cluster } : undefined,
        varnishParameters: options.varnishParameters,
        tracing: tracing !== undefined ? {
          enabled: true,
          otlp: { endpoint: tracing.otlpEndpoint, protocol: tracingProtocol, insecure: tracing.insecure },
          serviceName: tracing.serviceName,
          resources: tracingResources,
        } : undefined,
        esi: options.esi !== undefined ? { enabled: options.esi } : undefined,
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
          purge: { enabled: true, hosts: purgeHosts },
          ban: { enabled: true },
          xkey: { enabled: true },
        } : undefined,
        monitoring: monitoring ? {
          enabled: true,
          serviceMonitor: { enabled: true },
          exporter: { enabled: true },
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
    this.vinylCacheServiceName = vinylCache.name;
    this.namespace = vinylCache.metadata.namespace;
    this.invalidationEnabled = invalidation;
  }

  /**
   * URL of the cloud-vinyl invalidation proxy for this cache, e.g. for the
   * purge proxy setting of `plone.cachepurging`.
   *
   * Has the form `http://<cache>-invalidation.<namespace>:8090`, the same
   * address the operator reports in `status.invalidationURL`. The proxy serves
   * all namespaces and routes by `Host`, so the bare Service name is rejected.
   *
   * Purges from clients that cannot set an `X-Vinyl-Purge-Host` header, such
   * as `plone.cachepurging`, only match cached pages if `purgeHosts` is set.
   *
   * Throws if the chart has no namespace, because the URL cannot be built
   * without one, or if `invalidation` is disabled.
   */
  public get invalidationUrl(): string {
    if (!this.invalidationEnabled) {
      throw new Error(`${this.node.path}: invalidationUrl is not available, invalidation is disabled`);
    }
    if (!this.namespace) {
      throw new Error(
        `${this.node.path}: invalidationUrl needs a namespace. `
        + 'The invalidation proxy routes by "<cache>-invalidation.<namespace>"; '
        + 'set `namespace` on the Chart.',
      );
    }
    return `http://${this.vinylCacheServiceName}-invalidation.${this.namespace}:8090`;
  }
}
