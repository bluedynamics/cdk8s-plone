---
myst:
  html_meta:
    "description": "Configure environment variables and secrets on Plone backend and frontend pods with cdk8s-plone using the cdk8s-plus Env API."
    "property=og:description": "Configure environment variables and secrets on Plone backend and frontend pods with cdk8s-plone using the cdk8s-plus Env API."
    "property=og:title": "Configure environment variables and secrets"
    "keywords": "Plone, cdk8s, Kubernetes, environment variables, secrets, ConfigMap, imagePullSecrets, Env"
---

# Configure environment variables and secrets

This guide shows you how to set environment variables on Plone backend and frontend pods and how to source sensitive values from Kubernetes Secrets and ConfigMaps.
Use it to inject a RelStorage DSN, an admin password, or any runtime configuration without baking values into the image.

## Prerequisites

- A working Plone deployment using `cdk8s-plone`.
- Familiarity with the cdk8s-plus `Env` API and the `EnvValue` helpers it provides.
- `kubectl` access to the target namespace for creating Secrets and ConfigMaps.

## Set a plain environment variable on the backend

Pass an `environment` object to `backend`.
Build each value with `Env.value` for a literal string.

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';
import { Env } from 'cdk8s-plus-30';

new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  backend: {
    image: 'plone/plone-backend:6.1.3',
    environment: {
      variables: {
        PLONE_TIMEZONE: Env.value('Europe/Vienna'),
        ZSERVER_THREADS: Env.value('4'),
      },
    },
  },
});
```

The `environment` option is typed as the cdk8s-plus `Env` construct.
Its `variables` map takes an `EnvValue` for every entry, so always wrap raw strings in `Env.value`.

## Reference a value from a Secret

Store sensitive values such as a RelStorage DSN or an admin password in a Kubernetes Secret, then reference them with `Env.fromSecret`.

First create the Secret in the cluster.

```shell
kubectl create secret generic plone-backend-secrets \
  --namespace <namespace> \
  --from-literal=relstorage-dsn='dbname=plone host=db user=plone password=s3cret' \
  --from-literal=admin-password='change-me'
```

Reference the existing Secret by name, then read individual keys from it.

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';
import { Env, Secret } from 'cdk8s-plus-30';

const backendSecret = Secret.fromSecretName(
  chart,
  'backend-secret',
  'plone-backend-secrets',
);

new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  backend: {
    image: 'plone/plone-backend:6.1.3',
    environment: {
      variables: {
        RELSTORAGE_DSN: Env.fromSecret(backendSecret, 'relstorage-dsn'),
        ADMIN_PASSWORD: Env.fromSecret(backendSecret, 'admin-password'),
      },
    },
  },
});
```

`Env.fromSecret` renders a `secretKeyRef` in the pod template, so the value never appears in plain text in the synthesized manifest.

## Reference a value from a ConfigMap

For non-sensitive configuration that you manage separately from the chart, read keys from a ConfigMap with `Env.fromConfigMap`.

```typescript
import { Env, ConfigMap } from 'cdk8s-plus-30';

const settings = ConfigMap.fromConfigMapName(
  chart,
  'settings',
  'plone-settings',
);

// inside backend.environment.variables:
//   LOG_LEVEL: Env.fromConfigMap(settings, 'log-level'),
```

## Set variables on the frontend

The frontend accepts the same `environment` option as the backend.

```typescript
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';
import { Env } from 'cdk8s-plus-30';

new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
    environment: {
      variables: {
        RAZZLE_API_PATH: Env.value('https://plone.example.com/++api++'),
      },
    },
  },
});
```

The Volto frontend automatically injects `RAZZLE_INTERNAL_API_PATH` when you do not set it.
Override it through `environment` only when your service topology requires a non-default internal address.

```typescript
frontend: {
  image: 'plone/plone-frontend:16.0.0',
  environment: {
    variables: {
      RAZZLE_INTERNAL_API_PATH: Env.value('http://plone-backend:8080/Plone'),
    },
  },
}
```

## Pull from a private registry

Image registry credentials are not environment variables.
List the names of existing pull secrets in the top-level `imagePullSecrets` option.

```typescript
new Plone(chart, 'plone', {
  variant: PloneVariant.VOLTO,
  imagePullSecrets: ['my-registry-credentials'],
  backend: {
    image: 'registry.example.com/plone-backend:6.1.3',
  },
  frontend: {
    image: 'registry.example.com/plone-frontend:16.0.0',
  },
});
```

Create the pull secret beforehand with `kubectl create secret docker-registry <name>`.

## Verify

Synthesize the manifests and inspect the rendered Deployment for the expected entries.

```shell
cdk8s synth

# Confirm literal values and secret references appear on the backend container
grep -A 3 'RELSTORAGE_DSN' dist/*.yaml
grep -B 1 -A 4 'secretKeyRef' dist/*.yaml
```

A `secretKeyRef` block in the output confirms the value resolves at runtime from the Secret rather than being stored in the manifest.
After applying, check that the variables reach the container.

```shell
kubectl apply -f dist/
kubectl exec -n <namespace> deployment/<plone-backend-deployment> -- env | grep RELSTORAGE_DSN
```

## See also

- {doc}`/reference/api/index` — full construct and option reference.
- {doc}`/reference/configuration-options` — guide to `environment` and `imagePullSecrets`.
- {doc}`/how-to/configure-security-context` — harden the pods that run with these variables.
