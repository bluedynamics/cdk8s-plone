---
myst:
  html_meta:
    "description": "Overview of cdk8s-plone features: deployment variants, high availability, caching, resource management, monitoring, and multi-language support."
    "property=og:description": "Overview of cdk8s-plone features: deployment variants, high availability, caching, resource management, monitoring, and multi-language support."
    "property=og:title": "Features"
    "keywords": "Plone, cdk8s, Kubernetes, features, Volto, Varnish, Prometheus"
---

# Features

Complete overview of cdk8s-plone features and capabilities.

## Core features

(deployment-variants)=

### Deployment variants

cdk8s-plone supports two deployment modes to match your requirements:

**Volto (Modern React Frontend)**
- Modern React-based user interface
- Headless CMS architecture
- Separate frontend and backend services
- Best for: New projects, modern UX requirements, API-first architectures

**Classic UI (Traditional Plone)**
- Server-side rendered interface
- Integrated single-service deployment
- Traditional Plone experience
- Best for: Legacy migrations, existing add-ons, simpler deployments

See {doc}`architecture` for a deeper architectural comparison of the two variants.

### High availability

**Configurable Replicas**
- Set any number of replicas for backend and frontend
- Default: 2 replicas per component
- Supports horizontal scaling for increased capacity

**Pod Disruption Budgets**
- Ensures minimum availability during voluntary disruptions
- Prevents too many pods being unavailable simultaneously
- Configurable `minAvailable` or `maxUnavailable` thresholds

**Example:**
```typescript
backend: {
  replicas: 5,
  minAvailable: 3,  // Keep at least 3 pods running
}
```

### HTTP caching with Varnish

cdk8s-plone supports two caching backends: the self-contained mittwald kube-httpcache Helm chart (`PloneHttpcache`) and the operator-managed cloud-vinyl VinylCache (`PloneVinylCache`).

**kube-httpcache Integration (PloneHttpcache)**
- Production-grade Varnish deployment, no operator required
- Cluster-wide cache invalidation
- Automatic invalidation on content changes
- HTTP/2 support

**cloud-vinyl VinylCache Integration (PloneVinylCache)**
- Operator-managed Varnish via VinylCache custom resource
- Structured VCL generation with snippet injection hooks
- Built-in cache invalidation proxy (PURGE, BAN, xkey)
- Requires the cloud-vinyl operator in the cluster

**Benefits:**
- Dramatically reduced backend load
- Faster response times
- Better scalability
- Lower resource requirements

**Monitoring:**
- Built-in Prometheus exporter
- Cache hit/miss metrics
- Performance monitoring

### Resource management

**Fine-Grained Control**
- CPU requests and limits
- Memory requests and limits
- Per-component configuration
- Kubernetes-native resource management

**Example:**
```typescript
backend: {
  requestCpu: '500m',
  limitCpu: '2',
  requestMemory: '512Mi',
  limitMemory: '2Gi',
}
```

### Health monitoring

**Readiness Probes**
- Ensures pods are ready before receiving traffic
- Configurable delays and thresholds
- Enabled by default for backend
- Prevents downtime during startup

**Liveness Probes**
- Automatic restart of unhealthy pods
- Configurable for backend and frontend
- Recommended for frontend to detect SSR hangs
- Prevents stuck processes

**Example:**
```typescript
frontend: {
  livenessEnabled: true,
  livenessInitialDelaySeconds: 30,
  livenessFailureThreshold: 3,
  readinessEnabled: true,
  readinessInitialDelaySeconds: 10,
}
```

### Environment configuration

**Flexible Environment Variables**
- Use cdk8s-plus-30 Env API
- Support for values, ConfigMaps, and Secrets
- Per-component environment configuration

**Example:**
```typescript
import { Env } from 'cdk8s-plus-30';

backend: {
  environment: {
    variables: {
      SITE: Env.value('MySite'),
      DB_USER: Env.fromSecret('db-credentials', 'username'),
      CORS_ALLOW: Env.fromConfigMap('app-config', 'cors-origins'),
    },
  },
}
```

### Kubernetes annotations

**Three Levels of Annotations**
- **Deployment annotations**: Metadata for the deployment resource
- **Pod annotations**: Applied to pod templates (Prometheus, service mesh)
- **Service annotations**: Applied to services (external-dns, load balancers)

**Example:**
```typescript
backend: {
  podAnnotations: {
    'prometheus.io/scrape': 'true',
    'prometheus.io/port': '8080',
  },
  serviceAnnotations: {
    'external-dns.alpha.kubernetes.io/hostname': 'backend.example.com',
  },
}
```

### Private registry support

**Image Pull Secrets**
- Support for private container registries
- Multiple secrets supported
- Applied to all deployments

**Example:**
```typescript
new Plone(chart, 'my-plone', {
  imagePullSecrets: ['docker-registry', 'gcr-registry'],
  backend: { image: 'private-registry.io/plone-backend:6.1.3' },
})
```

## Multi-language support

### TypeScript and JavaScript

**Native CDK8S experience**
- Full TypeScript type definitions
- IDE autocomplete and validation
- Familiar syntax for web developers

**Installation:**
```shell
npm install @bluedynamics/cdk8s-plone
```

**Example:**
```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

new Plone(chart, 'my-plone', {
  variant: PloneVariant.VOLTO,
  backend: { image: 'plone/plone-backend:6.1.3' },
});
```

### Python

**JSII-generated bindings**
- Pythonic API
- Type hints support
- Familiar syntax for Python developers

**Installation:**
```shell
pip install cdk8s-plone
```

**Example:**
```python
from cdk8s_plone import Plone, PloneVariant

Plone(chart, "my-plone",
    variant=PloneVariant.VOLTO,
    backend={"image": "plone/plone-backend:6.1.3"}
)
```

## Infrastructure as code benefits

### Type safety

**Compile-time validation**
- Catch configuration errors before deployment
- IDE validation and autocomplete
- Refactoring support

**Example:**
```typescript
// TypeScript catches this error at compile time
backend: {
  image: 'plone/plone-backend:6.1.3',
  replicas: 'three',  // ❌ Type error: Expected number
}
```

### Reusability

**Construct composition**
- Create custom constructs
- Encapsulate best practices
- Share across projects

**Example:**
```typescript
class ProductionPlone extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const plone = new Plone(this, 'plone', {
      variant: PloneVariant.VOLTO,
      backend: {
        replicas: 3,
        minAvailable: 2,
        requestCpu: '500m',
        limitCpu: '2',
      },
    });

    new PloneHttpcache(this, 'cache', {
      plone: plone,
      replicas: 2,
    });
  }
}
```

### Testing

**Unit testing**
- Test infrastructure definitions
- Validate resource creation
- Catch regressions early

**Example:**
```typescript
test('creates backend deployment', () => {
  const chart = Testing.chart();
  new Plone(chart, 'test-plone', {
    backend: { image: 'plone/plone-backend:6.1.3' },
  });

  const results = Testing.synth(chart);
  expect(results).toMatchSnapshot();
});
```

### Programmatic control

**Dynamic configuration**
- Use loops and conditionals
- Environment-based configuration
- Dynamic resource generation

**Example:**
```typescript
const environments = ['dev', 'staging', 'prod'];

environments.forEach(env => {
  new Plone(chart, `plone-${env}`, {
    backend: {
      replicas: env === 'prod' ? 5 : 2,
      requestMemory: env === 'prod' ? '1Gi' : '512Mi',
    },
  });
});
```

## Production-ready features

### Manifest generation

**Standard Kubernetes YAML**
- Generates standard Kubernetes manifests
- No proprietary formats
- Apply with `kubectl apply -f`

**Output:**
```shell
cdk8s synth
# Creates dist/ directory with YAML files
kubectl apply -f dist/
```

### Helm chart integration

**PloneHttpcache uses Helm**
- Leverages battle-tested kube-httpcache chart
- Automatic updates available
- Community-maintained

### Monitoring integration

**Prometheus ready**
- ServiceMonitor support for Varnish
- Pod annotations for scraping
- Standard metrics endpoints

**Example:**
```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  servicemonitor: true,  // Creates ServiceMonitor
  exporterEnabled: true,  // Enables Prometheus exporter sidecar
});
```

## Upcoming features

Features planned for future releases:

- **Backup Integration**: Automated backup configurations
- **Monitoring Dashboards**: Pre-built Grafana dashboards

**Note:** Ingress and TLS management are intentionally out of scope - these should be handled by your cluster's ingress controller and cert-manager. RelStorage with PostgreSQL is already supported through external database configuration (separation of concerns).

## See also

- {doc}`architecture` — System architecture and design.
- {doc}`/reference/configuration-options` — Complete configuration reference.
- {doc}`/tutorials/01-quick-start` — Getting started tutorial.
- [Example project](https://github.com/bluedynamics/cdk8s-plone-example) — Complete working example.
