---
myst:
  html_meta:
    "description": "Diagnose and fix common cdk8s-plone problems: pods not scheduling, crashes, failing probes, database connection errors, and synth failures."
    "property=og:description": "Diagnose and fix common cdk8s-plone problems: pods not scheduling, crashes, failing probes, database connection errors, and synth failures."
    "property=og:title": "Troubleshoot a deployment"
    "keywords": "Plone, cdk8s, Kubernetes, troubleshooting, CrashLoopBackOff, probes, scheduling, synth"
---

# Troubleshoot a deployment

This guide shows you how to diagnose and fix the problems you are most likely to hit when you deploy Plone with `cdk8s-plone`.

Start by looking at the overall state, then drill into the failing object.

```shell
kubectl get pods -n <namespace>
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace>
```

## `cdk8s synth` fails

If `synth` fails while rendering `PloneHttpcache`, confirm the `helm` CLI is installed and on your `PATH`.
`PloneHttpcache` renders the kube-httpcache Helm chart at synth time and shells out to `helm`.

If `synth` fails on a missing custom resource type, run the example's import step (`npm run import`) to regenerate the CRD bindings.

## Pods stay `Pending`

Describe the pod and read the `Events` section for the scheduler's reason.

```shell
kubectl describe pod <pod> -n <namespace>
```

Common causes:

- Insufficient CPU or memory on the nodes. Lower `requestCpu` or `requestMemory`, or add capacity.
- A `nodeSelector` or `tolerations` setting that no node satisfies. See {doc}`/how-to/schedule-pods`.
- `PloneHttpcache` pods only schedule on amd64 nodes, because the construct hard-codes `kubernetes.io/arch=amd64`. Provide an amd64 node or use {doc}`/how-to/deploy-with-vinyl-cache` instead.

## A pod is in `CrashLoopBackOff`

Read the logs of the current and previous container starts.

```shell
kubectl logs <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --previous
```

A backend that exits immediately almost always cannot reach its database.
See {ref}`backend-db-connection`.

(backend-db-connection)=

## The backend cannot reach the database

The backend uses RelStorage on PostgreSQL, so it needs a correct connection string and credentials.

- Confirm the database is running and reachable from the backend namespace.
- Confirm the environment variable that carries the DSN resolves from its Secret. See {doc}`/how-to/configure-env-and-secrets`.

```shell
kubectl get secret -n <namespace>
kubectl exec -n <namespace> deployment/<backend-deployment> -- env | grep -i storage
```

## Pods never become ready

A pod that stays `Running` but never `Ready` is failing its readiness probe.

- Increase `readinessInitialDelaySeconds` if the backend needs longer to start.
- Increase `readinessTimeoutSeconds` or `readinessFailureThreshold` for a slow first request.

```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  readinessInitialDelaySeconds: 30,
  readinessTimeoutSeconds: 15,
}
```

Liveness probes are disabled by default (`livenessEnabled` defaults to `false`).
If pods restart in a loop after you enable liveness, raise `livenessInitialDelaySeconds` so the probe does not fire during startup.

## The cache does not cache

Check the cache pod logs, then confirm requests reach the cache service rather than the backend or frontend directly.

```shell
kubectl logs -n <namespace> -l app.kubernetes.io/part-of=plone
kubectl run -it --rm curl --image=curlimages/curl --restart=Never -- \
  curl -sI http://<cache-service>.<namespace>:80/
```

A missing `X-Varnish` header means traffic bypasses the cache; point your ingress at the cache service. See {doc}`/how-to/configure-ingress-tls`.
For VCL behavior, see {doc}`/how-to/deploy-with-httpcache` and {doc}`/how-to/deploy-with-vinyl-cache`.

## Prometheus does not scrape the metrics

If a `ServiceMonitor` exists but no target appears in Prometheus, the selectors do not match.

- Confirm the `ServiceMonitor` namespace matches the `Prometheus` resource's `serviceMonitorNamespaceSelector`.
- Confirm its labels match the `Prometheus` resource's `serviceMonitorSelector`.

See {doc}`/how-to/enable-prometheus-monitoring` for the full setup.

## See also

- {doc}`/how-to/deploy-production-volto` — a complete deployment to compare against.
- {doc}`/reference/api/index` — authoritative option and default reference.
- {doc}`/explanation/architecture` — how the components depend on each other.
