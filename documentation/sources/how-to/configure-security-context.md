```{image} ../_static/kup6s-icon-howto.svg
:align: center
:class: section-icon-large
```

# Configure security context

<div class="page-metadata">
  <div class="metadata-content">
    <p><strong>Type</strong>: How-To (Task-oriented)</p>
    <p><strong>Difficulty</strong>: Intermediate</p>
    <p><strong>Time</strong>: 10 minutes</p>
  </div>
</div>

This guide shows you how to harden backend and frontend pods by setting a Kubernetes container security context through `cdk8s-plone`.
Use it when your cluster enforces Pod Security Standards, when an admission webhook rejects permissive pods, or when you want to apply least-privilege defaults.

## Prerequisites

- A working Plone deployment using `cdk8s-plone`.
- A Plone image that runs as a non-root user (the official `plone/plone-backend` and `plone/plone-frontend` images do).
- Cluster knowledge of any namespace-level Pod Security Standards in effect.

## Apply a baseline hardened context

Set `securityContext` on `backend` or `frontend` (or both).

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  backend: {
    image: 'plone/plone-backend:6.1.3',
    securityContext: {
      runAsNonRoot: true,
      allowPrivilegeEscalation: false,
      capabilities: {
        drop: ['ALL'],
      },
    },
  },
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
    securityContext: {
      runAsNonRoot: true,
      allowPrivilegeEscalation: false,
      capabilities: {
        drop: ['ALL'],
      },
    },
  },
});
```

These four settings satisfy the Kubernetes **restricted** Pod Security Standard for containers that do not need extra capabilities.

## Pin the UID and GID

If your cluster requires explicit user and group IDs (for example, when you mount shared volumes), set them:

```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  securityContext: {
    runAsUser: 500,
    runAsGroup: 500,
    runAsNonRoot: true,
  },
}
```

The official Plone backend image already uses UID `500`.
Match that UID to keep file permissions consistent with the image.

## Mount the root filesystem read-only

```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  securityContext: {
    runAsNonRoot: true,
    readOnlyRootFilesystem: true,
    allowPrivilegeEscalation: false,
    capabilities: {
      drop: ['ALL'],
    },
  },
}
```

```{warning}
A read-only root filesystem breaks any container that writes outside mounted volumes.
Plone's Zope writes temporary files; verify the pod stays `Ready` after rollout.
Mount writable `emptyDir` volumes for `/tmp` and the Zope `var/` directory through `podAnnotations` or the underlying `Deployment` patches if you hit `EROFS` errors.
```

## Add a specific capability

When you must add a Linux capability, drop everything else first.

```typescript
backend: {
  image: 'plone/plone-backend:6.1.3',
  securityContext: {
    runAsNonRoot: true,
    allowPrivilegeEscalation: false,
    capabilities: {
      add: ['SYS_PTRACE'],
      drop: ['ALL'],
    },
  },
}
```

## Verify the rollout

```bash
# Generate manifests
cdk8s synth

# Confirm the securityContext appears on the pod template
grep -A 10 securityContext dist/*.yaml

# Apply and check pod status
kubectl apply -f dist/
kubectl rollout status deployment/<plone-backend-deployment> -n <namespace>

# Inspect the running container
kubectl exec -n <namespace> deployment/<plone-backend-deployment> -- id
```

A pod that fails to start with `CreateContainerConfigError` or `permission denied` usually points to a UID, capability, or read-only conflict.

## See also

- {doc}`/reference/configuration-options` — Full `PloneSecurityContext` reference.
- [Kubernetes Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) — Cluster-level policy reference.
