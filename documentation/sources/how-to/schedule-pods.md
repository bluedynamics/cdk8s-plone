---
myst:
  html_meta:
    "description": "Constrain Plone backend, frontend, and Varnish pods to specific Kubernetes nodes using nodeSelector and tolerations."
    "property=og:description": "Constrain Plone backend, frontend, and Varnish pods to specific Kubernetes nodes using nodeSelector and tolerations."
    "property=og:title": "Schedule pods to specific nodes"
    "keywords": "Plone, cdk8s, Kubernetes, nodeSelector, tolerations, scheduling, taints"
---

```{image} ../_static/kup6s-icon-howto.svg
:align: center
:class: section-icon-large
```

# Schedule pods to specific nodes

<div class="page-metadata">
  <div class="metadata-content">
    <p><strong>Type</strong>: How-To (Task-oriented)</p>
    <p><strong>Difficulty</strong>: Intermediate</p>
    <p><strong>Time</strong>: 10 minutes</p>
  </div>
</div>

This guide shows you how to control where Plone backend, frontend, and Varnish pods run.
Use `nodeSelector` to require specific node labels and tolerations to schedule onto tainted nodes.

## Prerequisites

- A working Plone deployment using `cdk8s-plone`.
- Cluster labels and taints already configured on the target nodes.

  ```shell
  kubectl get nodes --show-labels
  kubectl describe node <node> | grep Taints
  ```

## Constrain pods to labeled nodes

Add `nodeSelector` to `backend`, `frontend`, or both.
Every label in the selector must match for a node to be considered.

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  backend: {
    image: 'plone/plone-backend:6.1.3',
    nodeSelector: {
      'topology.kubernetes.io/region': 'fsn1',
      'workload': 'plone',
    },
  },
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
    nodeSelector: {
      'workload': 'plone',
    },
  },
});
```

## Schedule the cache onto the same nodes

`PloneVinylCache` exposes the same `nodeSelector` option.

```typescript
import { PloneVinylCache } from '@bluedynamics/cdk8s-plone';

new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  nodeSelector: {
    'workload': 'plone',
  },
});
```

`PloneHttpcache` schedules through the underlying mittwald Helm chart and does not expose a `nodeSelector` option directly.
Use cluster-level affinity rules or taints when you need to constrain those pods.

## Tolerate tainted nodes

When nodes carry a taint, pods must declare a matching toleration before the scheduler places them there.
Both cache constructs accept a `tolerations` list.

```typescript
new PloneHttpcache(chart, 'cache', {
  plone: ploneInstance,
  tolerations: [
    {
      key: 'workload',
      operator: 'Equal',
      value: 'plone',
      effect: 'NoSchedule',
    },
  ],
});
```

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  tolerations: [
    {
      key: 'workload',
      operator: 'Equal',
      value: 'plone',
      effect: 'NoSchedule',
    },
  ],
});
```

`operator: 'Exists'` matches any value for that key.
Omit `effect` to tolerate every effect for the matching taint.

## Combine selector and toleration

Selectors and tolerations work together: the selector narrows the candidate nodes, and the toleration unblocks the scheduler when those nodes are tainted.

```typescript
new PloneVinylCache(chart, 'cache', {
  plone: ploneInstance,
  nodeSelector: {
    'workload': 'plone',
  },
  tolerations: [
    { key: 'workload', operator: 'Equal', value: 'plone', effect: 'NoSchedule' },
  ],
});
```

## Verify the rollout

```shell
cdk8s synth
kubectl apply -f dist/

# Confirm pods landed on the expected nodes
kubectl get pods -n <namespace> -o wide
```

A pod stuck in `Pending` with `0/N nodes are available: ... node(s) had untolerated taint` means a taint is not tolerated.
`0/N nodes are available: ... node(s) didn't match Pod's node affinity/selector` means the `nodeSelector` does not match any node.

## See also

- {doc}`/reference/configuration-options` — `nodeSelector`, `HttpcacheToleration`, `VinylCacheToleration` reference.
- [Kubernetes: Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) — Selectors, affinity, and taints.
