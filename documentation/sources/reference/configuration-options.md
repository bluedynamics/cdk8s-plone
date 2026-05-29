# Configuration Options

Complete reference for all configuration options in cdk8s-plone.

## Key Constructs

### `Plone`

Main construct for deploying Plone CMS. Supports two variants:
- **VOLTO**: Modern React frontend with REST API backend (default)
- **CLASSICUI**: Traditional server-side rendered Plone

**Properties:**
- `backendServiceName` - Name of the backend Kubernetes service
- `frontendServiceName` - Name of the frontend service (VOLTO only)
- `variant` - Deployment variant (VOLTO or CLASSICUI)
- `siteId` - Plone site ID in ZODB (default: 'Plone')

**Example:**
```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

new Plone(chart, 'my-plone', {
  variant: PloneVariant.VOLTO,
  siteId: 'MySite',
  backend: {
    image: 'plone/plone-backend:6.1.3',
    replicas: 3,
  },
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
    replicas: 2,
  },
});
```

---

### `PloneHttpcache`

Varnish HTTP caching layer using the [kube-httpcache](https://github.com/mittwald/kube-httpcache) Helm chart. Provides cluster-wide cache invalidation.

**Properties:**
- `httpcacheServiceName` - Name of the Varnish service

**Example:**
```typescript
import { PloneHttpcache } from '@bluedynamics/cdk8s-plone';

new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  existingSecret: 'varnish-secret',
  replicas: 2,
});
```

---

## Configuration Interfaces

### `PloneOptions`

Main configuration interface for the Plone construct.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `version` | `string` | No | - | Version of your project |
| `siteId` | `string` | No | `'Plone'` | Plone site ID in ZODB |
| `variant` | `PloneVariant` | No | `VOLTO` | Deployment variant (VOLTO or CLASSICUI) |
| `backend` | `PloneBaseOptions` | Yes | - | Backend configuration |
| `frontend` | `PloneBaseOptions` | Conditional | - | Frontend configuration (required for VOLTO) |
| `imagePullSecrets` | `string[]` | No | - | Image pull secrets for private registries |

**Example:**
```typescript
const options: PloneOptions = {
  version: '1.0.0',
  siteId: 'MySite',
  variant: PloneVariant.VOLTO,
  backend: { /* ... */ },
  frontend: { /* ... */ },
  imagePullSecrets: ['my-registry-secret'],
};
```

---

### `PloneBaseOptions`

Configuration for backend or frontend components.

#### Container configuration

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `image` | `string` | No | `plone/plone-backend:latest` (backend) / `plone/plone-frontend:latest` (frontend) | Container image |
| `imagePullPolicy` | `string` | No | `IfNotPresent` | Image pull policy |
| `replicas` | `number` | No | `2` | Number of pod replicas |
| `environment` | `Env` | No | - | Environment variables (cdk8s-plus-30 `Env`) |

**Example:**
```typescript
import { Env } from 'cdk8s-plus-30';

backend: {
  image: 'plone/plone-backend:6.1.3',
  replicas: 3,
  imagePullPolicy: 'Always',
  environment: {
    variables: {
      SITE: Env.value('MySite'),
      DEBUG_MODE: Env.value('off'),
    },
  },
}
```

#### Resource configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `requestCpu` | `string` | `200m` | CPU request |
| `limitCpu` | `string` | `500m` | CPU limit |
| `requestMemory` | `string` | `256Mi` | Memory request |
| `limitMemory` | `string` | `512Mi` (backend) / `1Gi` (frontend) | Memory limit |

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  requestCpu: '500m',
  limitCpu: '2',
  requestMemory: '512Mi',
  limitMemory: '2Gi',
}
```

#### High availability

| Property | Type | Description |
|----------|------|-------------|
| `minAvailable` | `number \| string` | Minimum pods available during updates (for PodDisruptionBudget). Accepts an absolute number or a percentage string such as `"50%"`. |
| `maxUnavailable` | `number \| string` | Maximum unavailable pods during updates. Accepts an absolute number or a percentage string such as `"50%"`. |

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  replicas: 5,
  minAvailable: 3,  // At least 3 pods must be available during updates
}
```

#### Readiness probe

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `readinessEnabled` | `boolean` | `true` | Enable readiness probe |
| `readinessInitialDelaySeconds` | `number` | `10` | Seconds before first probe |
| `readinessTimeoutSeconds` | `number` | `15` | Probe timeout |
| `readinessPeriodSeconds` | `number` | `10` | Probe frequency |
| `readinessSuccessThreshold` | `number` | `1` | Consecutive successes required |
| `readinessFailureThreshold` | `number` | `3` | Consecutive failures before marking unready |

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  readinessEnabled: true,
  readinessInitialDelaySeconds: 10,
  readinessTimeoutSeconds: 5,
  readinessPeriodSeconds: 10,
  readinessFailureThreshold: 3,
}
```

#### Liveness probe

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `livenessEnabled` | `boolean` | `false` | Enable liveness probe (recommended `true` for frontend) |
| `livenessInitialDelaySeconds` | `number` | `30` | Seconds before first probe |
| `livenessTimeoutSeconds` | `number` | `5` | Probe timeout |
| `livenessPeriodSeconds` | `number` | `10` | Probe frequency |
| `livenessSuccessThreshold` | `number` | `1` | Consecutive successes required |
| `livenessFailureThreshold` | `number` | `3` | Consecutive failures before restart |

**Example:**
```typescript
frontend: {
  image: 'plone/plone-frontend:16.0.0',
  livenessEnabled: true,  // Recommended for frontend
  livenessInitialDelaySeconds: 30,
  livenessTimeoutSeconds: 5,
  livenessPeriodSeconds: 30,
  livenessFailureThreshold: 3,
}
```

#### Annotations

| Property | Type | Description |
|----------|------|-------------|
| `annotations` | `Record<string, string>` | Deployment metadata annotations |
| `podAnnotations` | `Record<string, string>` | Pod template annotations (e.g., for Prometheus) |
| `serviceAnnotations` | `Record<string, string>` | Service annotations (e.g., for external-dns) |

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  podAnnotations: {
    'prometheus.io/scrape': 'true',
    'prometheus.io/port': '8080',
  },
  serviceAnnotations: {
    'external-dns.alpha.kubernetes.io/hostname': 'backend.example.com',
  },
}
```

#### Prometheus monitoring

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `servicemonitor` | `boolean` | `false` | Create a Prometheus `ServiceMonitor` for this component. Requires the Prometheus Operator. |
| `metricsPort` | `string \| number` | main service port | Service port name or number that exposes metrics. |
| `metricsPath` | `string` | `/metrics` | HTTP path the Prometheus scraper requests. |

You must instrument the backend or frontend container to expose metrics at the configured endpoint.
For step-by-step setup, see {doc}`/how-to/enable-prometheus-monitoring`.

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  servicemonitor: true,
  metricsPath: '/metrics',
},
frontend: {
  image: 'plone/plone-frontend:16.0.0',
  servicemonitor: true,
  metricsPort: 9090,
}
```

#### Scheduling

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `nodeSelector` | `Record<string, string>` | - | Constrain pods to nodes whose labels match all entries. |

For tainted nodes and taint-based scheduling, see {doc}`/how-to/schedule-pods`.

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  nodeSelector: {
    'topology.kubernetes.io/region': 'fsn1',
  },
}
```

#### Security context

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `securityContext` | `PloneSecurityContext` | - | Container security settings (capabilities, UID/GID, read-only root, privilege escalation). |

**`PloneSecurityContext` fields:**

| Property | Type | Description |
|----------|------|-------------|
| `capabilities` | `PloneCapabilities` | Linux capabilities to add or drop. |
| `runAsUser` | `number` | Run the container as this UID. |
| `runAsGroup` | `number` | Run the container as this GID. |
| `runAsNonRoot` | `boolean` | Require the container to run as non-root. |
| `readOnlyRootFilesystem` | `boolean` | Mount the root filesystem read-only. |
| `allowPrivilegeEscalation` | `boolean` | Allow the process to gain more privileges than its parent. |
| `privileged` | `boolean` | Run the container in privileged mode. |

**`PloneCapabilities` fields:**

| Property | Type | Description |
|----------|------|-------------|
| `add` | `string[]` | Capabilities to add (e.g., `'SYS_PTRACE'`). |
| `drop` | `string[]` | Capabilities to drop (e.g., `'ALL'`). |

For a hardening walk-through, see {doc}`/how-to/configure-security-context`.

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  securityContext: {
    runAsNonRoot: true,
    runAsUser: 500,
    readOnlyRootFilesystem: true,
    allowPrivilegeEscalation: false,
    capabilities: {
      drop: ['ALL'],
    },
  },
}
```

---

### `PloneHttpcacheOptions`

Configuration for the Varnish HTTP cache layer.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `plone` | `Plone` | Yes | - | Plone construct to attach cache to |
| `varnishVcl` | `string` | No | - | VCL configuration as string. Takes precedence over `varnishVclFile`. |
| `varnishVclFile` | `string` | No | built-in `config/varnish.tpl.vcl` | Path to a VCL template file |
| `existingSecret` | `string` | No | - | Kubernetes secret for Varnish admin credentials |
| `replicas` | `number` | No | `2` | Number of Varnish replicas |
| `requestCpu` | `string` | No | `100m` | CPU request |
| `limitCpu` | `string` | No | `500m` | CPU limit |
| `requestMemory` | `string` | No | `100Mi` | Memory request |
| `limitMemory` | `string` | No | `500Mi` | Memory limit |
| `servicemonitor` | `boolean` | No | `false` | Enable Prometheus `ServiceMonitor` |
| `exporterEnabled` | `boolean` | No | `true` | Enable Prometheus exporter sidecar |
| `chartVersion` | `string` | No | chart latest | kube-httpcache Helm chart version |
| `appVersion` | `string` | No | matches `chartVersion` | kube-httpcache container image tag |
| `extraEnvVars` | `HttpcacheEnvVar[]` | No | - | Additional env vars for the kube-httpcache container |
| `tolerations` | `HttpcacheToleration[]` | No | - | Pod tolerations for tainted nodes |

**`HttpcacheEnvVar` fields:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Environment variable name |
| `value` | `string` | Environment variable value |

**`HttpcacheToleration` fields:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | `string` | - | Taint key to tolerate |
| `operator` | `string` | `Equal` | `Equal` or `Exists` |
| `value` | `string` | - | Taint value (required for `Equal`) |
| `effect` | `string` | - | `NoSchedule`, `PreferNoSchedule`, or `NoExecute`. Omit to tolerate all effects. |

**Example:**
```typescript
new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  existingSecret: 'varnish-secret',
  replicas: 3,
  requestCpu: '250m',
  limitCpu: '1',
  requestMemory: '256Mi',
  limitMemory: '1Gi',
  servicemonitor: true,
  exporterEnabled: true,
});
```

**VCL Configuration:**
```typescript
// Inline VCL
new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  varnishVcl: `
    vcl 4.1;
    backend default {
      .host = "backend-service";
      .port = "8080";
    }
  `,
});

// VCL from file
new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  varnishVclFile: './varnish/default.vcl',
});
```

**Extra Environment Variables:**

Pass additional environment variables to the kube-httpcache container.
These are appended to the built-in env vars (`BACKEND_SERVICE_NAME`, `BACKEND_SERVICE_PORT`, `BACKEND_SITE_ID`, `FRONTEND_SERVICE_NAME`, `FRONTEND_SERVICE_PORT`) and can be referenced in VCL templates using Go template syntax `{{ .Env.VAR_NAME }}`.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  varnishVclFile: './config/custom-varnish.tpl.vcl',
  extraEnvVars: [
    { name: 'THUMBOR_SERVICE_NAME', value: 'my-thumbor-service' },
  ],
});
```

---

### `PloneVinylCacheOptions`

Configuration for the Varnish HTTP cache layer via the cloud-vinyl operator.
Requires the [cloud-vinyl operator](https://github.com/bluedynamics/cloud-vinyl) to be installed in the cluster.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `plone` | `Plone` | Yes | - | Plone construct to attach cache to |
| `image` | `string` | No | `varnish:7.6` | Container image for the Varnish pods |
| `replicas` | `number` | No | `2` | Number of Varnish replicas |
| `requestCpu` | `string` | No | `100m` | CPU request |
| `limitCpu` | `string` | No | `500m` | CPU limit |
| `requestMemory` | `string` | No | `256Mi` | Memory request |
| `limitMemory` | `string` | No | `512Mi` | Memory limit |
| `storage` | `VinylCacheStorage[]` | No | - | Varnish storage backends. If omitted, the operator falls back to the varnishd default (~100 MB malloc), which is almost always too small. |
| `extraBackends` | `VinylCacheBackend[]` | No | - | Additional backends appended after the auto-generated Plone backends. |
| `director` | `string` | No | `shard` | Director type: `shard`, `round_robin`, `random`, `hash` |
| `shardBy` | `string` | No | operator default (`HASH`) | Shard director: value to hash (`HASH` or `URL`). Requires cloud-vinyl ≥ 0.4.2. |
| `shardHealthy` | `string` | No | operator default (`CHOSEN`) | Shard director: backend health requirement (`CHOSEN` or `ALL`). Requires cloud-vinyl ≥ 0.4.2. |
| `shardRampup` | `string` | No | operator default (`30s`) | Shard director: ramp-up window for newly added backends. |
| `shardReplicas` | `number` | No | operator default (`67`) | Shard director: Ketama replicas per backend. |
| `vclRecvSnippet` | `string` | No | built-in `plone-vinyl-recv.vcl` | Custom VCL snippet for `vcl_recv` |
| `vclBackendResponseSnippet` | `string` | No | built-in `plone-vinyl-backend-response.vcl` | Custom VCL snippet for `vcl_backend_response` |
| `vclDeliverSnippet` | `string` | No | - | Custom VCL snippet for `vcl_deliver` |
| `vclHitSnippet` | `string` | No | - | Custom VCL snippet for `vcl_hit` |
| `vclMissSnippet` | `string` | No | - | Custom VCL snippet for `vcl_miss` |
| `vclPassSnippet` | `string` | No | - | Custom VCL snippet for `vcl_pass` |
| `vclPipeSnippet` | `string` | No | - | Custom VCL snippet for `vcl_pipe` |
| `vclSynthSnippet` | `string` | No | - | Custom VCL snippet for `vcl_synth` |
| `vclPurgeSnippet` | `string` | No | - | Custom VCL snippet for `vcl_purge` |
| `vclHashSnippet` | `string` | No | - | Custom VCL snippet for `vcl_hash` |
| `vclInitSnippet` | `string` | No | - | Custom VCL snippet for `vcl_init` |
| `vclFiniSnippet` | `string` | No | - | Custom VCL snippet for `vcl_fini` |
| `vclBackendFetchSnippet` | `string` | No | - | Custom VCL snippet for `vcl_backend_fetch` |
| `vclBackendErrorSnippet` | `string` | No | - | Custom VCL snippet for `vcl_backend_error` |
| `invalidation` | `boolean` | No | `true` | Enable PURGE/BAN/xkey cache invalidation |
| `monitoring` | `boolean` | No | `false` | Enable Prometheus metrics and `ServiceMonitor` |
| `tolerations` | `VinylCacheToleration[]` | No | - | Pod tolerations for tainted nodes |
| `nodeSelector` | `Record<string, string>` | No | - | Constrain Varnish pods to nodes matching all labels. |

**`VinylCacheStorage` fields:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Internal storage identifier (must match `^[a-zA-Z][a-zA-Z0-9_]*$`) |
| `type` | `'malloc' \| 'file'` | Yes | Storage backend type |
| `size` | `string` | Yes | Kubernetes resource quantity (e.g. `"1Gi"`, `"500M"`) |
| `path` | `string` | for `file` | Filesystem path for file-type storage |

**`VinylCacheBackend` fields:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | VCL identifier (must match `^[a-zA-Z][a-zA-Z0-9_]*$`) |
| `serviceName` | `string` | Yes | - | Kubernetes Service name to use as backend |
| `port` | `number` | Yes | - | Service port |
| `probe` | `VinylCacheBackendProbe` | No | - | Health probe configuration |
| `weight` | `number` | No | operator default | Relative weight in the director. `0` marks the backend as standby. |

**`VinylCacheBackendProbe` fields:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | `string` | `/` | URL to probe |
| `interval` | `string` | `5s` | Probe interval |
| `timeout` | `string` | `2s` | Probe timeout |
| `window` | `number` | `10` | Number of recent probes evaluated |
| `threshold` | `number` | `8` | Healthy threshold within the window |
| `expectedResponse` | `number` | `200` | Expected HTTP status code |

**`VinylCacheToleration` fields:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | `string` | - | Taint key to tolerate |
| `operator` | `string` | `Equal` | `Equal` or `Exists` |
| `value` | `string` | - | Taint value (required for `Equal`) |
| `effect` | `string` | - | `NoSchedule`, `PreferNoSchedule`, or `NoExecute`. Omit to tolerate all effects. |

**Example:**
```typescript
const cache = new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  replicas: 2,
  requestCpu: '200m',
  limitCpu: '1',
  requestMemory: '256Mi',
  limitMemory: '1Gi',
  monitoring: true,
});

// Use the service name for IngressRoute
console.log(cache.vinylCacheServiceName);
```

**Custom VCL Snippets:**
```typescript
new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  vclRecvSnippet: `
    // Custom routing logic
    if (req.url ~ "^/api/") {
      set req.backend_hint = plone_backend.backend();
    }
  `,
});
```

**Storage sizing:**
```typescript
new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  limitMemory: '2Gi',
  storage: [
    { name: 's0', type: 'malloc', size: '1500M' },
  ],
});
```

Without an explicit `storage` entry, varnishd runs with its stock default (~100 MB malloc) regardless of the container's memory limit. Size malloc storage below the pod's memory limit to leave headroom for varnishd overhead and transient allocations.

**vs PloneHttpcache:**
- `PloneHttpcache` deploys Varnish via mittwald Helm chart (self-contained, no operator needed)
- `PloneVinylCache` creates a VinylCache CR managed by the cloud-vinyl operator (requires operator in cluster)
- VinylCache provides structured VCL generation, agent-based config delivery, and built-in invalidation proxy

---

## PloneVariant Enum

Defines the deployment variant:

| Value | Description |
|-------|-------------|
| `PloneVariant.VOLTO` | Modern React frontend with REST API backend (default) |
| `PloneVariant.CLASSICUI` | Traditional server-side rendered Plone |

**Example:**
```typescript
import { PloneVariant } from '@bluedynamics/cdk8s-plone';

// Volto (modern)
variant: PloneVariant.VOLTO

// Classic UI
variant: PloneVariant.CLASSICUI
```

---

## Complete Example

```typescript
import { App, Chart } from 'cdk8s';
import { Plone, PloneVariant, PloneHttpcache } from '@bluedynamics/cdk8s-plone';
import { Env } from 'cdk8s-plus-30';

const app = new App();
const chart = new Chart(app, 'PloneDeployment');

const plone = new Plone(chart, 'my-plone', {
  version: '1.0.0',
  siteId: 'MySite',
  variant: PloneVariant.VOLTO,
  imagePullSecrets: ['registry-secret'],

  backend: {
    image: 'plone/plone-backend:6.1.3',
    replicas: 3,
    requestCpu: '500m',
    limitCpu: '2',
    requestMemory: '512Mi',
    limitMemory: '2Gi',
    minAvailable: 2,
    readinessEnabled: true,
    readinessInitialDelaySeconds: 10,
    environment: {
      variables: {
        SITE: Env.value('MySite'),
      },
    },
    podAnnotations: {
      'prometheus.io/scrape': 'true',
    },
  },

  frontend: {
    image: 'plone/plone-frontend:16.0.0',
    replicas: 2,
    requestCpu: '250m',
    limitCpu: '1',
    requestMemory: '256Mi',
    limitMemory: '1Gi',
    livenessEnabled: true,
    livenessInitialDelaySeconds: 30,
  },
});

new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-secret',
  replicas: 2,
  requestCpu: '250m',
  requestMemory: '256Mi',
  servicemonitor: true,
});

app.synth();
```

---

## See also

- {doc}`/tutorials/01-quick-start` — Get started guide
- {doc}`/how-to/deploy-production-volto` — Production-ready Volto deployment
- {doc}`/how-to/deploy-classic-ui` — Classic UI deployment
- {doc}`/how-to/deploy-with-vinyl-cache` — `PloneVinylCache` walk-through
- {doc}`/how-to/enable-prometheus-monitoring` — Wire up `ServiceMonitor`
- {doc}`/how-to/configure-security-context` — Harden backend and frontend pods
- {doc}`/how-to/schedule-pods` — `nodeSelector` and `tolerations`
