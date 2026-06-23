---
myst:
  html_meta:
    "description": "Task-oriented configuration guide for cdk8s-plone with copy-pasteable examples, linking to the generated API reference."
    "property=og:description": "Task-oriented configuration guide for cdk8s-plone with copy-pasteable examples, linking to the generated API reference."
    "property=og:title": "Configuration guide"
    "keywords": "Plone, cdk8s, Kubernetes, configuration, Volto, Blicca, Varnish"
---

# Configuration guide

This guide shows the most common ways to configure cdk8s-plone, grouped by task, with copy-pasteable examples.

```{important}
For the complete and authoritative list of every construct, option, type, default value, and whether it is required, see the {doc}`API reference <api/index>`.
That reference is generated from the TypeScript source, so it never drifts.
This guide is hand-written orientation and deliberately does **not** repeat the full option tables.
```

## Constructs at a glance

`Plone`
:   Deploys the Plone backend and, for the Volto variant, the React frontend, plus their services and (optionally) a `PodDisruptionBudget` and `ServiceMonitor`. This is the entry point.

`PloneHttpcache`
:   Adds a Varnish caching layer through the mittwald [kube-httpcache](https://github.com/mittwald/kube-httpcache) Helm chart. Self-contained: it needs no operator in the cluster.

`PloneVinylCache`
:   Adds a Varnish caching layer through the [cloud-vinyl](https://github.com/bluedynamics/cloud-vinyl) operator. Requires the operator to be installed in the cluster.

To choose between the two cache constructs, read {doc}`/explanation/architecture`.

## Choose a frontend variant

The `Plone` construct deploys one of two frontends, selected with `variant`:

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

// Volto: React single-page frontend talking to the REST API backend (default).
new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  backend: {},
  frontend: {},
});

// Blicca: the backend renders the UI server-side, so there is no separate frontend.
new Plone(chart, 'plone', {
  variant: PloneVariant.BLICCA,
  backend: {},
});
```

```{note}
`PloneVariant.CLASSICUI` is a deprecated alias for `PloneVariant.BLICCA`, kept for backward compatibility.
It keeps its legacy value (`'classicui'`), so existing configuration keeps working unchanged.
The alias will be removed in a future major release.
```

For the conceptual difference between the variants, see {ref}`deployment-variants`.

## Configure the backend and frontend

Both `backend` and `frontend` take the same options (`PloneBaseOptions`).
The examples below cover the common groups.
See the {doc}`API reference <api/index>` for every field, its type, and its default.

### Images and replicas

```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  replicas: 3,
  imagePullPolicy: 'Always',
}
```

### Resource requests and limits

```typescript
backend: {
  requestCpu: '500m',
  limitCpu: '2',
  requestMemory: '512Mi',
  limitMemory: '2Gi',
}
```

### High availability

A `PodDisruptionBudget` is created automatically when `replicas` is `2` or more, or when you set `minAvailable` or `maxUnavailable` explicitly.
Both accept an absolute number or a percentage string such as `"50%"`.

```typescript
backend: {
  replicas: 5,
  minAvailable: 3, // keep at least 3 pods available during voluntary disruptions
}
```

### Probes

Readiness probes are enabled by default; liveness probes are **disabled** by default.

```typescript
frontend: {
  readinessEnabled: true,
  readinessInitialDelaySeconds: 10,
  livenessEnabled: true, // opt in; useful for the frontend
  livenessInitialDelaySeconds: 30,
}
```

### Service

Configure the generated Kubernetes `Service` through the grouped `service` option.
Curated fields cover the common cases; `service.overrides` is an escape hatch for any other `ServiceSpec` field and has the highest precedence.

```typescript
backend: {
  service: {
    type: 'LoadBalancer',
    trafficDistribution: 'PreferClose',
    loadBalancerSourceRanges: ['10.0.0.0/8'],
    annotations: {
      'external-dns.alpha.kubernetes.io/hostname': 'backend.example.com',
    },
    overrides: {
      ipFamilyPolicy: 'PreferDualStack',
    },
  },
}
```

```{note}
The top-level `serviceAnnotations` option is deprecated. Use `service.annotations` instead.
```

### Environment variables

Pass environment variables with the cdk8s-plus `Env` API, including values sourced from a `Secret`.

```typescript
import { Env } from 'cdk8s-plus-30';

backend: {
  environment: {
    variables: {
      RELSTORAGE_DSN: Env.fromSecret(dbSecret, 'dsn'),
    },
  },
}
```

### Annotations, scheduling, security, and monitoring

These groups each have a dedicated how-to guide:

- {doc}`/how-to/schedule-pods` — `nodeSelector` and `tolerations`
- {doc}`/how-to/configure-security-context` — `securityContext` hardening
- {doc}`/how-to/enable-prometheus-monitoring` — `servicemonitor`, `metricsPort`, `metricsPath`

## Add a cache

```typescript
import { PloneHttpcache } from '@bluedynamics/cdk8s-plone';

// Self-contained Varnish via the kube-httpcache Helm chart.
new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  existingSecret: 'varnish-secret',
  replicas: 2,
});
```

```typescript
import { PloneVinylCache } from '@bluedynamics/cdk8s-plone';

// Operator-managed Varnish via the cloud-vinyl operator.
const cache = new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  storage: [{ name: 's0', type: 'malloc', size: '1500M' }],
  monitoring: true,
});
```

```{important}
`PloneVinylCache` without an explicit `storage` entry runs varnishd with its stock default (~100 MB malloc) regardless of the container memory limit.
Size malloc storage below the pod's memory limit to leave headroom for varnishd overhead.
```

For the full walk-through, including custom VCL snippets and shard-director tuning, see {doc}`/how-to/deploy-with-vinyl-cache`.

## Complete example

```typescript
import { App, Chart } from 'cdk8s';
import { Plone, PloneVariant, PloneHttpcache } from '@bluedynamics/cdk8s-plone';
import { Env } from 'cdk8s-plus-30';

const app = new App();
const chart = new Chart(app, 'PloneDeployment');

const plone = new Plone(chart, 'my-plone', {
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
    environment: {
      variables: {
        SITE: Env.value('MySite'),
      },
    },
  },
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
    replicas: 2,
    livenessEnabled: true,
  },
});

new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-secret',
  replicas: 2,
  servicemonitor: true,
});

app.synth();
```

## See also

- {doc}`API reference <api/index>` — every option, type, and default (generated)
- {doc}`/tutorials/01-quick-start` — first deployment, step by step
- {doc}`/how-to/deploy-production-volto` — production-ready Volto deployment
- {doc}`/how-to/deploy-blicca` — Blicca deployment
- {doc}`/explanation/architecture` — how the pieces fit together
