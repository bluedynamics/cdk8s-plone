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

Kubernetes replaces the pods with the default RollingUpdate strategy.
With two or more replicas and a PodDisruptionBudget, the old pods drain only as new pods become ready.

```{important}
Upgrading to a new Plone major or minor version may require a Plone site upgrade step that `cdk8s-plone` does not perform.
After the new backend pods are ready, run the upgrade from the Plone control panel (`@@plone-upgrade`) on the maintenance or uncached route.
```

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
