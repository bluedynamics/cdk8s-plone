---
myst:
  html_meta:
    "description": "Scale the Plone backend and frontend with cdk8s-plone, configure a PodDisruptionBudget, and add a HorizontalPodAutoscaler."
    "property=og:description": "Scale the Plone backend and frontend with cdk8s-plone, configure a PodDisruptionBudget, and add a HorizontalPodAutoscaler."
    "property=og:title": "Scale and run highly available"
    "keywords": "Plone, cdk8s, Kubernetes, scaling, replicas, PodDisruptionBudget, HPA, high availability"
---

# Scale and run highly available

This guide shows you how to run more than one replica of the Plone backend and frontend, protect them with a PodDisruptionBudget, and add a HorizontalPodAutoscaler.

## Prerequisites

- A working Plone deployment created with `cdk8s-plone`.
- A PostgreSQL backend reachable by every backend replica.

The backend uses RelStorage on PostgreSQL, so several backend replicas share one database and scale horizontally.
The Volto frontend is stateless and scales horizontally as well.

## Set the replica count

Set `replicas` on `backend` and `frontend` independently.

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
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

Both default to `2` replicas when you omit the option.

## Protect availability with a PodDisruptionBudget

A PodDisruptionBudget keeps a minimum number of pods running during voluntary disruptions such as node drains.

Set `minAvailable` or `maxUnavailable` on the component.
Each accepts an absolute number or a percentage string such as `"50%"`.

```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  replicas: 5,
  minAvailable: 3,
}
```

`cdk8s-plone` creates the PodDisruptionBudget automatically when `replicas` is `2` or more, or when you set `minAvailable` or `maxUnavailable` explicitly.
A single replica with no explicit setting gets no PodDisruptionBudget.
The generated PodDisruptionBudget always sets `unhealthyPodEvictionPolicy: AlwaysAllow`, so unhealthy pods never block a node drain.

## Add a HorizontalPodAutoscaler

`cdk8s-plone` emits plain Deployments and does not configure autoscaling.
To scale on load, add your own HorizontalPodAutoscaler that targets the generated backend Deployment.

Find the Deployment name from the synthesized manifests:

```shell
cdk8s synth
grep -A2 'kind: Deployment' dist/*.yaml | grep 'name:'
```

Add the autoscaler as a Kubernetes manifest and apply it alongside your deployment:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: plone-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: <backend-deployment-name>
  minReplicas: 2
  maxReplicas: 8
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

The HorizontalPodAutoscaler needs [metrics-server](https://github.com/kubernetes-sigs/metrics-server) in the cluster.
Keep `minReplicas` at `2` or more so the PodDisruptionBudget stays effective.

## Verify

Confirm the PodDisruptionBudget is present in the synthesized manifests:

```shell
cdk8s synth
grep -l 'kind: PodDisruptionBudget' dist/*.yaml
```

Inspect the running objects on the cluster:

```shell
kubectl get deploy -n <namespace>
kubectl get pdb -n <namespace>
kubectl get hpa -n <namespace>
```

## See also

- {doc}`/reference/api/index` — authoritative `replicas`, `minAvailable`, and `maxUnavailable` reference.
- {doc}`/how-to/schedule-pods` — place the extra replicas on specific nodes.
- {doc}`/explanation/architecture` — how the backend, frontend, and database fit together.
