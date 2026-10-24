---
myst:
  html_meta:
    "description": "Create a Prometheus ServiceMonitor for the Plone backend, frontend, or Varnish cache to expose metrics."
    "property=og:description": "Create a Prometheus ServiceMonitor for the Plone backend, frontend, or Varnish cache to expose metrics."
    "property=og:title": "Enable Prometheus monitoring"
    "keywords": "Plone, cdk8s, Kubernetes, Prometheus, ServiceMonitor, monitoring, metrics"
---

# Enable Prometheus monitoring

<div class="page-metadata">
  <div class="metadata-content">
    <p><strong>Type</strong>: How-To (Task-oriented)</p>
    <p><strong>Difficulty</strong>: Intermediate</p>
    <p><strong>Time</strong>: 15 minutes</p>
  </div>
</div>

This guide shows you how to expose Plone metrics to Prometheus by creating a `ServiceMonitor` for the backend, the frontend, or the Varnish cache.

## Prerequisites

- The [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator) installed in the cluster (it provides the `ServiceMonitor` CRD).
- A `Prometheus` resource that selects the `ServiceMonitor` resources you create (check `serviceMonitorSelector` and `serviceMonitorNamespaceSelector`).
- A Plone container instrumented to expose metrics over HTTP. Plone itself does not ship a Prometheus endpoint; you need an add-on (such as a WSGI middleware) or a sidecar exporter.

## Enable the ServiceMonitor on the backend

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  backend: {
    image: 'plone/plone-backend:6.1.3',
    servicemonitor: true,
    metricsPath: '/metrics',
  },
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
  },
});
```

`servicemonitor: true` instructs `cdk8s-plone` to emit a `ServiceMonitor` that scrapes the backend Service on its main port at `/metrics`.

## Scrape the frontend on a dedicated port

Volto can expose metrics on a separate port through middleware such as [`express-prometheus-middleware`](https://www.npmjs.com/package/express-prometheus-middleware).
Point `cdk8s-plone` at that port:

```typescript
frontend: {
  image: 'plone/plone-frontend:16.0.0',
  servicemonitor: true,
  metricsPort: 9090,
  metricsPath: '/metrics',
}
```

`metricsPort` accepts a port number or a Service port name.

## Scrape the Varnish cache

`PloneHttpcache` and `PloneVinylCache` each accept their own monitoring switch.

```typescript
import { PloneHttpcache } from '@bluedynamics/cdk8s-plone';

new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  servicemonitor: true,
  exporterEnabled: true,
});
```

`exporterEnabled` (default `true`) deploys the Varnish exporter sidecar that the `ServiceMonitor` scrapes.

For the cloud-vinyl operator:

```typescript
import { PloneVinylCache } from '@bluedynamics/cdk8s-plone';

new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  monitoring: true,
});
```

```{note}
The option name differs by construct: backend, frontend, and `PloneHttpcache` use `servicemonitor`, while `PloneVinylCache` uses `monitoring`. Both create a Prometheus `ServiceMonitor`.
```

## Verify the rollout

```shell
# Generate manifests and confirm the ServiceMonitor exists
cdk8s synth
grep -l 'kind: ServiceMonitor' dist/*.yaml

# Apply and inspect on the cluster
kubectl apply -f dist/
kubectl get servicemonitor -n <namespace>
kubectl describe servicemonitor <name> -n <namespace>
```

If Prometheus is not picking up the new target, confirm:

- The `ServiceMonitor` namespace matches the `Prometheus` resource's `serviceMonitorNamespaceSelector`.
- The `ServiceMonitor` labels match the `Prometheus` resource's `serviceMonitorSelector`.
- The metrics endpoint returns HTTP 200 from a pod in the cluster:

  ```shell
  kubectl run -it --rm curl --image=curlimages/curl --restart=Never -- \
    curl -sf http://<service>.<namespace>:<port>/metrics | head
  ```

## See also

- {doc}`/reference/configuration-options` — Reference for `servicemonitor`, `metricsPort`, `metricsPath`.
- [Prometheus Operator documentation](https://prometheus-operator.dev/) — `ServiceMonitor` selectors and lifecycle.
