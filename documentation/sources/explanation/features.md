# Features

Complete overview of cdk8s-plone features and capabilities.

## Core Features

### Deployment Variants

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

See [Plone Variants](plone-variants.md) for detailed comparison.

### High Availability

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

### HTTP Caching with Varnish

**kube-httpcache Integration**
- Production-grade Varnish deployment
- Cluster-wide cache invalidation
- Automatic invalidation on content changes
- HTTP/2 support

**Benefits:**
- Dramatically reduced backend load
- Faster response times
- Better scalability
- Lower resource requirements

**Monitoring:**
- Built-in Prometheus exporter
- Cache hit/miss metrics
- Performance monitoring

### Resource Management

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

### Health Monitoring

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

### Environment Configuration

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

### Kubernetes Annotations

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

### Private Registry Support

**Image Pull Secrets**
- Support for private container registries
- Multiple secrets supported
- Applied to all deployments

**Example:**
```typescript
new Plone(chart, 'my-plone', {
  imagePullSecrets: ['docker-registry', 'gcr-registry'],
  backend: { image: 'private-registry.io/plone-backend:6.0.10' },
})
```

## Multi-Language Support

### TypeScript/JavaScript

**Native CDK8S Experience**
- Full TypeScript type definitions
- IDE autocomplete and validation
- Familiar syntax for web developers

**Installation:**
```bash
npm install @bluedynamics/cdk8s-plone
```

**Example:**
```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

new Plone(chart, 'my-plone', {
  variant: PloneVariant.VOLTO,
  backend: { image: 'plone/plone-backend:6.0.10' },
});
```

### Python

**JSII-Generated Bindings**
- Pythonic API
- Type hints support
- Familiar syntax for Python developers

**Installation:**
```bash
pip install cdk8s-plone
```

**Example:**
```python
from cdk8s_plone import Plone, PloneVariant

Plone(chart, "my-plone",
    variant=PloneVariant.VOLTO,
    backend={"image": "plone/plone-backend:6.0.10"}
)
```

## Infrastructure as Code Benefits

### Type Safety

**Compile-Time Validation**
- Catch configuration errors before deployment
- IDE validation and autocomplete
- Refactoring support

**Example:**
```typescript
// TypeScript catches this error at compile time
backend: {
  image: 'plone/plone-backend:6.0.10',
  replicas: 'three',  // ❌ Type error: Expected number
}
```

### Reusability

**Construct Composition**
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

**Unit Testing**
- Test infrastructure definitions
- Validate resource creation
- Catch regressions early

**Example:**
```typescript
test('creates backend deployment', () => {
  const chart = Testing.chart();
  new Plone(chart, 'test-plone', {
    backend: { image: 'plone/plone-backend:6.0.10' },
  });

  const results = Testing.synth(chart);
  expect(results).toMatchSnapshot();
});
```

### Programmatic Control

**Dynamic Configuration**
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

## Production-Ready Features

### Manifest Generation

**Standard Kubernetes YAML**
- Generates standard Kubernetes manifests
- No proprietary formats
- Apply with `kubectl apply -f`

**Output:**
```bash
cdk8s synth
# Creates dist/ directory with YAML files
kubectl apply -f dist/
```

### Helm Chart Integration

**PloneHttpcache Uses Helm**
- Leverages battle-tested kube-httpcache chart
- Automatic updates available
- Community-maintained

### Monitoring Integration

**Prometheus Ready**
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

## Upcoming Features

Features planned for future releases:

- **Ingress Support**: Built-in ingress configuration
- **TLS Management**: Automatic certificate handling
- **Backup Integration**: Automated backup configurations
- **Monitoring Dashboards**: Pre-built Grafana dashboards
- **Multi-Site Support**: Multiple Plone sites in one deployment
- **External Database**: RelStorage with PostgreSQL support

## See Also

- [Architecture Overview](architecture.md) - System architecture and design
- [Configuration Options](../reference/configuration-options.md) - Complete configuration reference
- [Quick Start](../tutorials/01-quick-start.md) - Getting started tutorial
- [Example Project](https://github.com/bluedynamics/cdk8s-plone-example) - Complete working example
