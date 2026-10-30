---
myst:
  html_meta:
    "description": "Add the cloud-vinyl VinylCache operator to your Plone deployment for operator-managed Varnish caching."
    "property=og:description": "Add the cloud-vinyl VinylCache operator to your Plone deployment for operator-managed Varnish caching."
    "property=og:title": "Deploy with cloud-vinyl cache"
    "keywords": "Plone, cdk8s, Kubernetes, Varnish, cloud-vinyl, VinylCache, operator, caching"
---

# Deploy with cloud-vinyl cache

<div class="page-metadata">
  <div class="metadata-content">
    <p><strong>Type</strong>: How-To (Task-oriented)</p>
    <p><strong>Difficulty</strong>: Intermediate</p>
    <p><strong>Time</strong>: 15 minutes</p>
  </div>
</div>

## Prerequisites

- The **cloud-vinyl operator 1.0.0-rc.2 or later** must be installed in your cluster.
  `PloneVinylCache` renders `vinyl.bluedynamics.eu/v1`, which earlier releases do not serve.
  Apply the CRD server-side, as described in the cloud-vinyl release notes.
- A working Plone deployment using `cdk8s-plone`
- `@bluedynamics/cdk8s-plone` version with VinylCache support

## Steps

### 1. Add PloneVinylCache to your deployment

```typescript
import { Plone, PloneVinylCache } from '@bluedynamics/cdk8s-plone';

const plone = new Plone(chart, 'plone', {
  backend: { image: 'plone/plone-backend:6.1.3' },
  frontend: { image: 'plone/plone-frontend:16.0.0' },
});

const cache = new PloneVinylCache(chart, 'cache', {
  plone: plone,
  replicas: 2,
});
```

### 2. Use the cache service in your IngressRoute

The cache exposes a service that should be used as the upstream in your IngressRoute:

```typescript
// Use cache.vinylCacheServiceName as the service target
// instead of plone.frontendServiceName
```

### 3. Build and deploy

```shell
npm run build
# Review generated manifests
# Deploy via ArgoCD or kubectl apply
```

### 4. Verify

```shell
# Check VinylCache status
kubectl get vinylcache -n <namespace>

# Check Varnish pods
kubectl get pods -n <namespace> -l app.kubernetes.io/managed-by=cloud-vinyl
```

## Customization

### Sizing the cache storage

Without an explicit `storage` entry, the operator ships varnishd with its stock default (~100 MB malloc), which is almost always too small.
Set a malloc size well below the pod's memory limit.
Name the storage anything but `s0`, and pin it in `vcl_backend_response`:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  requestMemory: '2Gi',
  limitMemory: '3Gi',
  storage: [
    { name: 'cache', type: 'malloc', size: '1G' },
  ],
  vclBackendResponseSnippet: `
  set beresp.storage = storage.cache;
  `,
});
```

The stock varnish image's entrypoint always adds its own unnamed `-s malloc,...`, which varnishd names `s0`.
An entry named `s0` collides with it, and varnishd fails to start.
With any other name, varnishd spreads cacheable objects round-robin over your storage and `s0`, unless the VCL sets `beresp.storage`.

varnishd needs memory beyond the storage: its malloc heap fragments under eviction churn and can grow to more than twice the storage size.
Keep large bodies out of a small cache, and set the memory request close to what the pod actually uses, so the scheduler sees it:

```vcl
if (std.integer(beresp.http.Content-Length, 0) > 8388608) {
  set beresp.uncacheable = true;
  set beresp.ttl = 120s;
  return (deliver);
}
```

### Clustering and varnishd parameters

With two or more replicas behind a load balancer, every pod caches every object unless the pods are clustered.
Set `cluster: true`, so that a pod passes requests for URLs it does not own to the pod that does:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  replicas: 2,
  cluster: true,
  varnishParameters: { nuke_limit: '1000' },
});
```

`varnishParameters` become `-p` flags for varnishd.
varnishd's default `nuke_limit` of 50 makes a large fetch fail with `Could not get storage` when 50 evictions do not free enough space, and the client gets a 503.

### Custom VCL

Override the default Plone VCL snippets for custom caching logic:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  vclRecvSnippet: fs.readFileSync('./config/custom-recv.vcl', 'utf8'),
  vclBackendResponseSnippet: fs.readFileSync('./config/custom-beresp.vcl', 'utf8'),
});
```

(vinyl-cache-invalidation)=

### Cache invalidation

Invalidation is enabled by default (PURGE, BAN, xkey). Configure `plone.cachepurging` to point to the VinylCache invalidation proxy endpoint.

The proxy serves the caches of all namespaces and routes by `Host`, so the address must include the namespace.
Give the chart a namespace, list the public hostnames of the site in `purgeHosts`, and read the address from `invalidationUrl`:

```typescript
const chart = new Chart(app, 'site', { namespace: 'plone' });
const cache = new PloneVinylCache(chart, 'cache', {
  plone,
  purgeHosts: ['example.org', 'www.example.org'],
});
// http://<cache>-invalidation.plone:8090
console.log(cache.invalidationUrl);
```

Varnish keys a cached page by its URL and its site host.
`plone.cachepurging` cannot tell the proxy the site host, so the proxy sends one purge per entry in `purgeHosts`.
Without `purgeHosts`, its purges succeed but remove nothing, and pages only change after their TTL.
To check that purges work, watch `vinyl_objects_purged_total`.

Enter this value as a caching proxy in the `plone.cachepurging` settings.
Do not build the address from `vinylCacheServiceName` yourself: the proxy rejects the bare `<cache>-invalidation` name with `404 unknown cache`, and `plone.cachepurging` does not log failed purges.
`invalidationUrl` throws if the chart has no namespace or if `invalidation` is disabled.

cloud-vinyl handles PURGE, BAN, and xkey requests in its own VCL with its own access lists.
A custom `vclRecvSnippet` only runs for `GET` and `HEAD` requests and must not handle them.

To disable invalidation:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  invalidation: false,
});
```

### Tracing

To export OpenTelemetry trace spans built from the Varnish log, point the vinyl-tracer sidecar at your collector:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  tracing: {
    otlpEndpoint: 'otel-collector.monitoring:4317', // host:port, no scheme
    insecure: true,                                // plain gRPC inside the cluster
  },
});
```

`protocol` selects `'grpc'` (default) or `'http/protobuf'`, and `serviceName` sets the OpenTelemetry `service.name`, which defaults to the VinylCache name.
The tracer needs a varnish 9 image, such as the default.

### Edge Side Includes

Set `esi: true` to process Edge Side Includes in backend responses that carry `Surrogate-Control: content="ESI/1.0"`.
Do not enable ESI with `varnishParameters: { feature: '+esi' }`: that is not a varnishd feature bit, and varnishd fails to start.
If response bodies do not start with `<`, also set `varnishParameters: { feature: '+esi_disable_xml_check' }`.

### Shard director tuning

For shard-based load distribution (the default), you can fine-tune the consistent-hash behavior.

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  director: 'shard',
  shardBy: 'URL',        // the only supported value; cloud-vinyl 1.0 removed 'HASH'
  shardHealthy: 'ALL',   // require all backends healthy (vs. only "CHOSEN")
  shardRampup: '45s',    // warm-up window for newly added backends
  shardReplicas: 128,    // Ketama replicas per backend
});
```

Shard options are ignored for non-shard directors (`round_robin`, `random`, `hash`).

## Upgrading from cloud-vinyl 0.x

This `cdk8s-plone` release targets cloud-vinyl 1.0.

1. Upgrade the operator and its CRD to 1.0.0-rc.2 or later first, following the cloud-vinyl release notes.
   The new manifests use `vinyl.bluedynamics.eu/v1`, which older operators reject.
2. Set `purgeHosts` if you use `plone.cachepurging`, see {ref}`vinyl-cache-invalidation`.
3. Review the manifest diff:
   - `apiVersion` changes from `v1alpha1` to `v1`.
   - The default image changes from `varnish:7.6` to `varnish:9.1.0`, the image cloud-vinyl 1.0 is tested with.
     Set `image` to keep another one.
   - The default `vclRecv` snippet no longer contains PURGE and BAN handling.
     Since cloud-vinyl 0.7.0 it did not compile, so caches with the default snippet never became ready.
4. Replace `shardBy: 'HASH'` with `'URL'` or drop it.
   cloud-vinyl 1.0 removed `HASH`, and `PloneVinylCache` rejects it.

## Migrating from PloneHttpcache

Replace `PloneHttpcache` with `PloneVinylCache`:

```typescript
// Before (mittwald)
// import { PloneHttpcache } from '@bluedynamics/cdk8s-plone';
// const cache = new PloneHttpcache(chart, 'cache', {
//   plone, varnishVcl: '...', existingSecret: 'secret',
// });
// const serviceName = cache.httpcacheServiceName;

// After (cloud-vinyl)
import { PloneVinylCache } from '@bluedynamics/cdk8s-plone';
const cache = new PloneVinylCache(chart, 'cache', { plone });
const serviceName = cache.vinylCacheServiceName;
```

Key differences:
- No VCL template needed (operator generates VCL from structured config)
- No `existingSecret` needed (operator manages agent authentication)
- Service name property is `vinylCacheServiceName` (not `httpcacheServiceName`)
