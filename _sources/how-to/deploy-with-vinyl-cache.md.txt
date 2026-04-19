```{image} ../_static/kup6s-icon-howto.svg
:align: center
:class: section-icon-large
```

# Deploy with Cloud-Vinyl Cache

<div class="page-metadata">
  <div class="metadata-content">
    <p><strong>Type</strong>: How-To (Task-oriented)</p>
    <p><strong>Difficulty</strong>: Intermediate</p>
    <p><strong>Time</strong>: 15 minutes</p>
  </div>
</div>

## Prerequisites

- The **cloud-vinyl operator** must be installed in your cluster
- A working Plone deployment using `cdk8s-plone`
- `@bluedynamics/cdk8s-plone` version with VinylCache support

## Steps

### 1. Add PloneVinylCache to Your Deployment

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

### 2. Use the Cache Service in Your IngressRoute

The cache exposes a service that should be used as the upstream in your IngressRoute:

```typescript
// Use cache.vinylCacheServiceName as the service target
// instead of plone.frontendServiceName
```

### 3. Build and Deploy

```bash
npm run build
# Review generated manifests
# Deploy via ArgoCD or kubectl apply
```

### 4. Verify

```bash
# Check VinylCache status
kubectl get vinylcache -n <namespace>

# Check Varnish pods
kubectl get pods -n <namespace> -l app.kubernetes.io/managed-by=cloud-vinyl
```

## Customization

### Sizing the Cache Storage

Without an explicit `storage` entry, the operator ships varnishd with its
stock default (~100 MB malloc) — almost always too small. Set a malloc size
below the pod's memory limit, leaving headroom for varnishd overhead:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  requestMemory: '512Mi',
  limitMemory: '2Gi',
  storage: [
    { name: 's0', type: 'malloc', size: '1500M' },
  ],
});
```

For larger working sets you can combine an in-memory tier with a file-backed
tier (requires a writable volume mount at the given path):

```typescript
storage: [
  { name: 'mem', type: 'malloc', size: '500M' },
  { name: 'disk', type: 'file', path: '/var/lib/varnish/disk.bin', size: '10Gi' },
]
```

### Custom VCL

Override the default Plone VCL snippets for custom caching logic:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  vclRecvSnippet: fs.readFileSync('./config/custom-recv.vcl', 'utf8'),
  vclBackendResponseSnippet: fs.readFileSync('./config/custom-beresp.vcl', 'utf8'),
});
```

### Cache Invalidation

Invalidation is enabled by default (PURGE, BAN, xkey). Configure `plone.cachepurging` to point to the VinylCache invalidation proxy endpoint.

:::{note}
BAN-based invalidation requires **cloud-vinyl operator ≥ 0.4.2**. Earlier versions accept the spec but do not emit the BAN ACL / handler.
Starting with 0.4.2 the operator's own pod IP is automatically added to the PURGE ACL, so purges from the operator itself work without additional configuration.
:::

To disable invalidation:

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  invalidation: false,
});
```

### Shard Director Tuning

For shard-based load distribution (the default), you can fine-tune the consistent-hash behavior. These options require **cloud-vinyl ≥ 0.4.2** to be honored by the generated VCL.

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: plone,
  director: 'shard',
  shardBy: 'URL',        // hash the request URL instead of Varnish's hash
  shardHealthy: 'ALL',   // require all backends healthy (vs. only "CHOSEN")
  shardRampup: '45s',    // warm-up window for newly added backends
  shardReplicas: 128,    // Ketama replicas per backend
});
```

Shard options are ignored for non-shard directors (`round_robin`, `random`, `hash`).

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
