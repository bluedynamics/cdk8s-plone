---
myst:
  html_meta:
    "description": "Deploy the production-ready Volto example: React frontend, Plone REST API backend, PostgreSQL, Varnish caching, and ingress with TLS."
    "property=og:description": "Deploy the production-ready Volto example: React frontend, Plone REST API backend, PostgreSQL, Varnish caching, and ingress with TLS."
    "property=og:title": "Deploy production Volto example"
    "keywords": "Plone, cdk8s, Kubernetes, Volto, production, PostgreSQL, Varnish, ingress, TLS"
---

# Deploy production Volto example

This guide shows you how to deploy the production-ready Volto example to your Kubernetes cluster.

## What you'll deploy

The [Production Volto example](https://github.com/bluedynamics/cdk8s-plone/tree/main/examples/production-volto) includes:

- **Plone 6.1 with Volto** (React frontend + REST API backend)
- **PostgreSQL** with RelStorage (plain PostgreSQL or CloudNativePG)
- **Varnish HTTP caching** with kube-httpcache
- **Ingress** with TLS (Traefik or Kong)
- **Three access domains** (cached, uncached, maintenance)

(production-volto-prerequisites)=

## Prerequisites

### Required

Ensure you have these installed on your cluster:

1. **Ingress Controller** - Either:
   - [Traefik v3](https://doc.traefik.io/traefik/getting-started/install-traefik/) with CRDs
   - [Kong Gateway](https://docs.konghq.com/gateway/latest/install/kubernetes/)

2. **cert-manager** - For TLS certificates:
   ```shell
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
   ```

3. **kube-httpcache Operator** - For Varnish caching:
   ```shell
   kubectl apply -f https://github.com/mittwald/kube-httpcache/releases/latest/download/kube-httpcache.yaml
   ```

4. **PostgreSQL** - The example provisions the database itself; choose the backend with the `DATABASE` variable in Step 4. Prepare the cluster for your choice:

   **Option A: plain** (default; no operator needed) - the example deploys a single-instance PostgreSQL StatefulSet using the official `postgres` image, so there is nothing to install.

   **Option B: CloudNativePG** (recommended for production HA) - install the operator:
   ```shell
   kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.24/releases/cnpg-1.24.0.yaml
   ```

### Local tools

- **Node.js 18+** and npm
- **kubectl** configured for your cluster
- **git** to clone the repository

## Step 1: Get the example

Clone the repository and navigate to the example:

```shell
git clone https://github.com/bluedynamics/cdk8s-plone.git
cd cdk8s-plone/examples/production-volto
```

## Step 2: Install dependencies

```shell
npm install
```

## Step 3: Import CRDs

Generate TypeScript bindings for Kubernetes CRDs:

```shell
npm run import
```

This imports:
- Kubernetes core API
- CloudNativePG Cluster CRDs
- Traefik Middleware CRDs

## Step 4: Configure environment

Create a `.env` file from the example:

```shell
cp .env.example .env
```

Edit `.env` with your settings:

```shell
# Your domains
DOMAIN_CACHED=plone.example.com
DOMAIN_UNCACHED=plone-test.example.com
DOMAIN_MAINTENANCE=plone-admin.example.com

# Your cert-manager ClusterIssuer
CLUSTER_ISSUER=letsencrypt-prod

# Optional: Custom images
#PLONE_BACKEND_IMAGE=plone/plone-backend:6.1.3
#PLONE_FRONTEND_IMAGE=plone/plone-frontend:16.0.0

# Database: 'plain' or 'cloudnativepg'
DATABASE=plain
```

:::{tip}
For production high availability, use `cloudnativepg`. For development and small setups, `plain` is simpler and needs no operator.
:::

## Step 5: Generate manifests

Synthesize Kubernetes YAML:

```shell
npm run synth
```

This creates `dist/plone-example.k8s.yaml` with all resources.

## Step 6: Review generated manifests

Inspect what will be deployed:

```shell
# Count resources
grep "^kind:" dist/plone-example.k8s.yaml | sort | uniq -c

# View specific resources
kubectl apply --dry-run=client -f dist/plone-example.k8s.yaml
```

## Step 7: Deploy to Kubernetes

Deploy to your cluster:

```shell
kubectl apply -f dist/plone-example.k8s.yaml
```

Or deploy to a specific namespace:

```shell
kubectl apply -f dist/plone-example.k8s.yaml -n plone
```

## Step 8: Monitor deployment

Watch pods starting:

```shell
# Watch all pods
kubectl get pods -l app.kubernetes.io/part-of=plone -w

# Check specific components
kubectl get pods -l app.kubernetes.io/name=plone-backend
kubectl get pods -l app.kubernetes.io/name=plone-frontend
kubectl get pods -l app.kubernetes.io/name=plone-httpcache
```

Wait for all pods to be `Running`:

```shell
kubectl wait --for=condition=ready pod -l app.kubernetes.io/part-of=plone --timeout=300s
```

## Step 9: Verify services

Check that services are created:

```shell
kubectl get svc -l app.kubernetes.io/part-of=plone
```

You should see:
- `plone-backend` (backend service)
- `plone-frontend` (frontend service)
- `plone-httpcache` (Varnish cache)
- Database service (plain PostgreSQL or CloudNativePG)

## Step 10: Check ingress

Verify ingress routes:

```shell
kubectl get ingress
```

Check TLS certificates:

```shell
kubectl get certificate
```

## Step 11: Access your site

Once DNS is configured and TLS certificates are issued:

- **Public site (cached)**: https://plone.example.com
- **Testing (uncached)**: https://plone-test.example.com
- **Maintenance**: https://plone-admin.example.com

### Create Plone site

On first access to the maintenance domain:

1. Go to: https://plone-admin.example.com
2. Click "Create a new Plone site"
3. Fill in:
   - **Site ID**: `Plone`
   - **Title**: Your site title
   - **Language**: Choose language
4. Click "Create Plone Site"

## Troubleshooting

### Pods not starting

Check pod logs:

```shell
# Backend logs
kubectl logs -l app.kubernetes.io/name=plone-backend -f

# Frontend logs
kubectl logs -l app.kubernetes.io/name=plone-frontend -f

# Database logs (CloudNativePG)
kubectl logs -l postgresql=plone-postgresql -f
```

### Database connection issues

**CloudNativePG:**

```shell
# Check cluster status
kubectl get cluster

# Check secret
kubectl get secret -l cnpg.io/cluster
```

**Plain PostgreSQL:**

```shell
# Check the StatefulSet and pod
kubectl get statefulset -l app.kubernetes.io/name=plone-postgresql
kubectl get pods -l app.kubernetes.io/name=plone-postgresql
```

### TLS certificate issues

```shell
# Check certificate status
kubectl describe certificate

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

### Varnish cache not working

```shell
# Check httpcache logs
kubectl logs -l app.kubernetes.io/name=plone-httpcache

# Check if kube-httpcache operator is running
kubectl get pods -n kube-httpcache-system
```

## Updating your deployment

After making changes to the example:

1. Edit configuration files
2. Regenerate manifests: `npm run synth`
3. Apply changes: `kubectl apply -f dist/plone-example.k8s.yaml`

## Scaling

Scale replicas by editing `main.ts`:

```typescript
const plone = new Plone(this, 'plone', {
  backend: {
    replicas: 3,  // Scale backend
  },
  frontend: {
    replicas: 3,  // Scale frontend
  },
})
```

Then regenerate and reapply.

## Cleanup

Remove all resources:

```shell
kubectl delete -f dist/plone-example.k8s.yaml
```

## Next steps

- Configure monitoring and metrics through {doc}`enable-prometheus-monitoring`.
- Customize [Varnish caching rules](https://github.com/bluedynamics/cdk8s-plone/blob/main/examples/production-volto/config/varnish.tpl.vcl).
- Harden pods with {doc}`configure-security-context`.

## See also

- {doc}`deploy-blicca` — For the server-side rendered Plone UI.
- {doc}`setup-prerequisites` — Detailed cluster setup.
- {doc}`/reference/configuration-options` — API reference.
