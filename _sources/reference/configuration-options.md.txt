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

#### Container Configuration

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `image` | `string` | Yes | - | Container image (e.g., 'plone/plone-backend:6.1.3') |
| `imagePullPolicy` | `string` | No | `'IfNotPresent'` | Image pull policy |
| `replicas` | `number` | No | `2` | Number of pod replicas |
| `environment` | `Env` | No | - | Environment variables (cdk8s-plus-30.Env) |

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

#### Resource Configuration

| Property | Type | Description |
|----------|------|-------------|
| `requestCpu` | `string` | CPU request (e.g., '500m', '1') |
| `limitCpu` | `string` | CPU limit |
| `requestMemory` | `string` | Memory request (e.g., '512Mi', '1Gi') |
| `limitMemory` | `string` | Memory limit |

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

#### High Availability

| Property | Type | Description |
|----------|------|-------------|
| `minAvailable` | `number` | Minimum pods available during updates (for PodDisruptionBudget) |
| `maxUnavailable` | `number` | Maximum unavailable pods during updates |

**Example:**
```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  replicas: 5,
  minAvailable: 3,  // At least 3 pods must be available during updates
}
```

#### Readiness Probe

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `readinessEnabled` | `boolean` | `true` | Enable readiness probe |
| `readinessInitialDelaySeconds` | `number` | - | Seconds before first probe |
| `readinessTimeoutSeconds` | `number` | - | Probe timeout |
| `readinessPeriodSeconds` | `number` | - | Probe frequency |
| `readinessSuccessThreshold` | `number` | - | Consecutive successes required |
| `readinessFailureThreshold` | `number` | - | Consecutive failures before marking unready |

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

#### Liveness Probe

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `livenessEnabled` | `boolean` | `false` | Enable liveness probe (recommended `true` for frontend) |
| `livenessInitialDelaySeconds` | `number` | - | Seconds before first probe |
| `livenessTimeoutSeconds` | `number` | - | Probe timeout |
| `livenessPeriodSeconds` | `number` | - | Probe frequency |
| `livenessSuccessThreshold` | `number` | - | Consecutive successes required |
| `livenessFailureThreshold` | `number` | - | Consecutive failures before restart |

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

---

### `PloneHttpcacheOptions`

Configuration for the Varnish HTTP cache layer.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `plone` | `Plone` | Yes | - | Plone construct to attach cache to |
| `varnishVcl` | `string` | No | - | VCL configuration as string |
| `varnishVclFile` | `string` | No | - | Path to VCL configuration file |
| `existingSecret` | `string` | No | - | Kubernetes secret for Varnish admin credentials |
| `replicas` | `number` | No | `2` | Number of Varnish replicas |
| `requestCpu` | `string` | No | - | CPU request |
| `limitCpu` | `string` | No | - | CPU limit |
| `requestMemory` | `string` | No | - | Memory request |
| `limitMemory` | `string` | No | - | Memory limit |
| `servicemonitor` | `boolean` | No | `false` | Enable Prometheus ServiceMonitor |
| `exporterEnabled` | `boolean` | No | `true` | Enable Prometheus exporter sidecar |
| `chartVersion` | `string` | No | latest | kube-httpcache Helm chart version |

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

## See Also

- [API Documentation](api/) - Complete API reference
- [Quick Start Tutorial](../tutorials/01-quick-start.md) - Get started guide
- [Scale Resources](../how-to/scale-resources.md) - How to adjust resources
- [Configure Monitoring](../how-to/configure-monitoring.md) - Prometheus setup
