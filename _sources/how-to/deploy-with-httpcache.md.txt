---
myst:
  html_meta:
    "description": "Deploy the PloneHttpcache Varnish cache via the mittwald kube-httpcache Helm chart and attach it to a Plone deployment."
    "property=og:description": "Deploy the PloneHttpcache Varnish cache via the mittwald kube-httpcache Helm chart and attach it to a Plone deployment."
    "property=og:title": "Deploy with PloneHttpcache"
    "keywords": "Plone, cdk8s, Kubernetes, Varnish, kube-httpcache, mittwald, PloneHttpcache, caching, VCL"
---

# Deploy with PloneHttpcache

This guide shows you how to deploy the `PloneHttpcache` Varnish cache and attach it to an existing Plone instance.

`PloneHttpcache` deploys Varnish through the [mittwald kube-httpcache](https://github.com/mittwald/kube-httpcache) Helm chart.
The construct renders that chart at synth time, so the cache is part of your own manifests.
For an operator-managed alternative, see {doc}`/how-to/deploy-with-vinyl-cache`.

## Prerequisites

- A running Plone deployment created with `cdk8s-plone` (see {doc}`/tutorials/01-quick-start`).
- The `helm` CLI available wherever you run `cdk8s synth`.
- A Kubernetes `Secret` holding the Varnish admin credentials, referenced through `existingSecret`.
- amd64 worker nodes.

The construct renders the kube-httpcache Helm chart locally, so you do not pre-install a controller in the cluster.
The pod `nodeSelector` is hard-coded to `kubernetes.io/arch=amd64` (a kube-httpcache workaround), so `PloneHttpcache` pods only schedule on amd64 nodes.
There is no `nodeSelector` option on this construct.

Create the admin credentials Secret before you deploy:

```shell
kubectl create secret generic varnish-admin \
  --namespace <namespace> \
  --from-literal=secret="$(head -c32 /dev/urandom | base64)"
```

## Attach a basic PloneHttpcache

Construct `PloneHttpcache` with a `plone` reference, the `existingSecret`, and a `replicas` count.

```typescript
import { Plone, PloneHttpcache } from '@bluedynamics/cdk8s-plone';

const plone = new Plone(chart, 'plone', {
  backend: { image: 'plone/plone-backend:6.1.3' },
  frontend: { image: 'plone/plone-frontend:16.0.0' },
});

new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  replicas: 2,
});
```

RBAC for the rendered controller is always enabled; there is nothing to configure.

## Set resources

Tune the CPU and memory requests and limits to match your workload.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  requestCpu: '200m',
  limitCpu: '1',
  requestMemory: '256Mi',
  limitMemory: '1Gi',
});
```

The defaults are `requestCpu: '100m'`, `limitCpu: '500m'`, `requestMemory: '100Mi'`, and `limitMemory: '500Mi'`.

## Customize the VCL

Provide an inline VCL through `varnishVcl`, which takes precedence over `varnishVclFile`.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  varnishVcl: `
vcl 4.1;
backend default {
  .host = "{{ .Env.BACKEND_SERVICE_NAME }}";
  .port = "{{ .Env.BACKEND_SERVICE_PORT }}";
}
`,
});
```

Alternatively, point `varnishVclFile` at a VCL template file on disk; the construct reads it at synth time.
When you set neither option, the construct uses the built-in `config/varnish.tpl.vcl`.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  varnishVclFile: './config/varnish.tpl.vcl',
});
```

VCL templates use Go template syntax.
The construct supplies these environment variables: `BACKEND_SERVICE_NAME`, `BACKEND_SERVICE_PORT`, `BACKEND_SITE_ID`, `FRONTEND_SERVICE_NAME`, and `FRONTEND_SERVICE_PORT`.
Reference them as `{{ .Env.NAME }}`.

Add your own variables through `extraEnvVars`, which are appended to the built-in set.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  extraEnvVars: [
    { name: 'THUMBOR_SERVICE_NAME', value: 'my-thumbor' },
  ],
});
```

Reference an extra variable in your VCL template as `{{ .Env.THUMBOR_SERVICE_NAME }}`.

## Schedule the cache pods

Add `tolerations` so the cache pods can run on tainted nodes.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  tolerations: [
    { key: 'dedicated', operator: 'Equal', value: 'cache', effect: 'NoSchedule' },
  ],
});
```

Omit `effect` to tolerate every taint for the given key.
`operator` defaults to `'Equal'`.

## Enable monitoring

Set `servicemonitor` to emit a Prometheus `ServiceMonitor`, and keep `exporterEnabled` so the Varnish exporter sidecar is present for it to scrape.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  servicemonitor: true,
  exporterEnabled: true,
});
```

`exporterEnabled` defaults to `true`, and `servicemonitor` defaults to `false`.
Use `servicemonitor` here; there is no `monitoring` option on this construct.
For the full monitoring setup, see {doc}`/how-to/enable-prometheus-monitoring`.

## Pin the chart and image versions

Set `chartVersion` to pin the kube-httpcache Helm chart, and `appVersion` to pin the image tag.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
  chartVersion: '0.13.1',
  appVersion: '0.13.1',
});
```

`chartVersion` defaults to the latest chart, and `appVersion` defaults to `chartVersion`.

## Point your ingress at the cache

Route external traffic through the cache by using the read-only `httpcacheServiceName` output as your Ingress or IngressRoute upstream instead of the Plone frontend service.

```typescript
const cache = new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-admin',
});

const upstream = cache.httpcacheServiceName;
```

For the routing and TLS details, see {doc}`/how-to/configure-ingress-tls`.

## Verify the cache

Generate the manifests and confirm the cache resources are present.

```shell
cdk8s synth
grep -l 'kube-httpcache' dist/*.yaml
```

Apply the manifests and inspect the rollout on the cluster.

```shell
kubectl apply -f dist/
kubectl get pods -n <namespace>
kubectl get service -n <namespace>
```

Send a request through the cache service and check the Varnish response headers.

```shell
kubectl run -it --rm curl --image=curlimages/curl --restart=Never -- \
  curl -sI http://<httpcacheServiceName>.<namespace>:80/
```

A cached response carries an `X-Varnish` header, and an `Age` header greater than zero confirms a cache hit.

## PloneHttpcache compared with PloneVinylCache

`PloneHttpcache` runs Varnish from the mittwald kube-httpcache chart with a Secret and a VCL template that you supply.
`PloneVinylCache` runs Varnish through the cloud-vinyl operator, which generates VCL from structured configuration and manages credentials for you.
For the trade-offs between the two, see {doc}`/explanation/architecture` and {doc}`/how-to/deploy-with-vinyl-cache`.

## See also

- {doc}`/reference/api/index` — authoritative `PloneHttpcache` and `PloneHttpcacheOptions` reference.
- {doc}`/reference/configuration-options` — guide to `varnishVcl`, `existingSecret`, `extraEnvVars`, and `servicemonitor`.
- {doc}`/how-to/enable-prometheus-monitoring` — scrape the Varnish cache with Prometheus.
- {doc}`/how-to/deploy-with-vinyl-cache` — operator-managed Varnish caching alternative.
- [mittwald kube-httpcache](https://github.com/mittwald/kube-httpcache) — upstream controller and Helm chart.
