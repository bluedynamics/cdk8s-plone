---
myst:
  html_meta:
    "description": "Upgrade the Plone image and the cdk8s-plone library, roll out changes safely, and roll back a failed update."
    "property=og:description": "Upgrade the Plone image and the cdk8s-plone library, roll out changes safely, and roll back a failed update."
    "property=og:title": "Upgrade and roll out"
    "keywords": "Plone, cdk8s, Kubernetes, upgrade, rollout, rolling update, rollback, migration"
---

# Upgrade and roll out

This guide shows you how to upgrade the Plone images and the `cdk8s-plone` library, roll the change out safely, and roll it back if it fails.

## Prerequisites

- A working Plone deployment created with `cdk8s-plone`.
- Two or more replicas if you need a zero-downtime rollout. See {doc}`/how-to/scale-and-high-availability`.

## Upgrade the Plone image

Change the `image` tag on `backend` and `frontend` to the new version.

```typescript
backend: {
  image: 'plone/plone-backend:6.1.4',
},
frontend: {
  image: 'plone/plone-frontend:16.1.0',
}
```

Pin a specific tag rather than `latest`, so the rollout is reproducible and you can roll back to a known version.

Regenerate the manifests and apply them:

```shell
cdk8s synth
kubectl apply -f dist/
```

Kubernetes replaces the pods with the RollingUpdate strategy.
By default it removes up to a quarter of the old pods before new ones are ready.
Plone takes a while to become ready, so the site runs with less capacity during the rollout.
To keep full capacity, start new pods first and remove old ones only when replacements are ready:

```typescript
backend: {
  rollingUpdate: { maxUnavailable: 0, maxSurge: '50%' },
}
```

The cluster needs room for the extra pods while the rollout runs.

```{important}
Upgrading to a new Plone major or minor version may require a Plone site upgrade step that `cdk8s-plone` does not perform.
After the new backend pods are ready, run the upgrade from the Plone control panel (`@@plone-upgrade`) on the maintenance or uncached route.
```

## Avoid errors from stopping pods

Each old pod keeps serving for 15 seconds after Kubernetes marks it for deletion.
This gives kube-proxy, ingress controllers, and caches that address pods directly, such as Varnish via `PloneVinylCache`, time to stop sending it requests.

If your cache or ingress controller still logs `503` errors or refused connections while old pods stop, increase the delay:

```typescript
backend: {
  preStopDelaySeconds: 30,
},
frontend: {
  preStopDelaySeconds: 30,
}
```

The termination grace period grows with the delay.
If your pods need more than 30 seconds to shut down after the delay, set `terminationGracePeriodSeconds` as well.
See {ref}`graceful-shutdown` for the defaults and constraints.

## Watch the rollout

Follow the rollout and confirm it completes.

```shell
kubectl rollout status deployment/<backend-deployment> -n <namespace>
kubectl get pods -n <namespace> -w
```

## Roll back a failed upgrade

If the new version misbehaves, undo the rollout to the previous ReplicaSet:

```shell
kubectl rollout undo deployment/<backend-deployment> -n <namespace>
```

To return to a known-good definition instead, restore the previous image tag in your code, then `cdk8s synth` and `kubectl apply -f dist/` again.

```{warning}
A rollback reverts the container image, not your data.
If the upgrade ran an irreversible Plone site migration, restore the database from a backup. See {doc}`/how-to/backup-and-restore`.
```

## Upgrade the cdk8s-plone library

Bump the dependency, regenerate, and review the manifest diff before applying.

```shell
npm install @bluedynamics/cdk8s-plone@latest
cdk8s synth
git diff dist/
```

Read the [changelog](https://github.com/bluedynamics/cdk8s-plone/releases) for renamed or deprecated options, then apply the reviewed manifests.

## See also

- {doc}`/how-to/scale-and-high-availability` — replicas and PodDisruptionBudget for zero-downtime rollouts.
- {doc}`/how-to/backup-and-restore` — back up before a risky upgrade.
- {doc}`/reference/api/index` — authoritative option reference for each release.
