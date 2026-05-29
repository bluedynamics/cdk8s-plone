---
myst:
  html_meta:
    "description": "Deploy the Classic UI example: server-side rendered Plone with PostgreSQL, Varnish caching, and ingress with TLS."
    "property=og:description": "Deploy the Classic UI example: server-side rendered Plone with PostgreSQL, Varnish caching, and ingress with TLS."
    "property=og:title": "Deploy Classic UI example"
    "keywords": "Plone, cdk8s, Kubernetes, Classic UI, PostgreSQL, Varnish, ingress"
---

# Deploy Classic UI example

This guide shows you how to deploy the Classic UI example to your Kubernetes cluster.

## What you'll deploy

The [Classic UI example](https://github.com/bluedynamics/cdk8s-plone/tree/main/examples/classic-ui) provides traditional Plone with server-side rendering:

- **Plone 6.1 Classic UI** (traditional interface, no separate frontend)
- **PostgreSQL** with RelStorage (CloudNativePG or Bitnami)
- **Varnish HTTP caching** with kube-httpcache
- **Ingress** with TLS (Traefik or Kong)
- **Simpler architecture** (single backend service)

## Classic UI vs Volto

| Feature | Classic UI | Volto |
|---------|-----------|-------|
| **Architecture** | Single backend | Frontend + Backend |
| **Rendering** | Server-side | Client-side (React) |
| **Deployment** | Simpler | More complex |
| **Best for** | Migrations, intranets | Modern projects |

:::{tip}
Choose Classic UI if you're migrating from older Plone versions or need specific Classic UI add-ons. For new projects, consider [Volto](deploy-production-volto.md).
:::

## Prerequisites

Same as the {ref}`production-volto-prerequisites` in the Production Volto guide, you need:

- Ingress controller (Traefik or Kong)
- cert-manager
- kube-httpcache operator
- PostgreSQL operator (CloudNativePG or Bitnami)

See [Setup Prerequisites](setup-prerequisites.md) for detailed instructions.

## Step 1: Get the example

```shell
git clone https://github.com/bluedynamics/cdk8s-plone.git
cd cdk8s-plone/examples/classic-ui
```

## Step 2: Install dependencies

```shell
npm install
```

## Step 3: Import CRDs

```shell
npm run import
```

## Step 4: Configure environment

Create `.env` from the example:

```shell
cp .env.example .env
```

Edit `.env`:

```shell
# Your domains
DOMAIN_CACHED=plone.example.com
DOMAIN_UNCACHED=plone-test.example.com
DOMAIN_MAINTENANCE=plone-admin.example.com

# Your cert-manager ClusterIssuer
CLUSTER_ISSUER=letsencrypt-prod

# Optional: Custom backend image
#PLONE_BACKEND_IMAGE=plone/plone-backend:6.1.3

# Database: 'bitnami' or 'cloudnativepg'
DATABASE=cloudnativepg
```

:::{note}
Classic UI only needs one image (backend). There's no frontend image configuration.
:::

## Step 5: Generate manifests

```shell
npm run synth
```

Creates `dist/plone-classic.k8s.yaml` (~27 KB, smaller than Volto's 32 KB).

## Step 6: Review manifests

```shell
# Count resources
grep "^kind:" dist/plone-classic.k8s.yaml | sort | uniq -c

# Dry run
kubectl apply --dry-run=client -f dist/plone-classic.k8s.yaml
```

## Step 7: Deploy

```shell
kubectl apply -f dist/plone-classic.k8s.yaml
```

Or to a specific namespace:

```shell
kubectl apply -f dist/plone-classic.k8s.yaml -n plone
```

## Step 8: Monitor deployment

```shell
# Watch pods
kubectl get pods -l app.kubernetes.io/part-of=plone -w

# Wait for ready
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/part-of=plone \
  --timeout=300s
```

:::{note}
Classic UI deploys fewer pods than Volto (no frontend pods).
:::

## Step 9: Verify services

```shell
kubectl get svc -l app.kubernetes.io/part-of=plone
```

You should see:
- `plone-backend` (Classic UI service)
- `plone-httpcache` (Varnish cache)
- Database service

## Step 10: Check ingress

```shell
kubectl get ingress
kubectl get certificate
```

## Step 11: Access your site

Once DNS and TLS are ready:

- **Public (cached)**: https://plone.example.com
- **Testing (uncached)**: https://plone-test.example.com
- **Maintenance**: https://plone-admin.example.com

### Create Plone site

1. Access maintenance domain: https://plone-admin.example.com
2. Click "Create a new Plone site"
3. Configure:
   - **Site ID**: `Plone`
   - **Title**: Your site name
   - **Language**: Select language
   - **Add-ons**: Choose Classic UI add-ons
4. Click "Create Plone Site"

## Key differences from Volto

### Architecture

Classic UI routing is simpler - all traffic goes to the backend:

```
Traffic → Ingress → Varnish → Plone Backend (Classic UI)
```

Compared to Volto:

```
Traffic → Ingress → {Varnish → Frontend, Backend}
```

### Ingress routes

Classic UI uses virtual host rewriting for direct backend access:

- **Cached**: Routes through Varnish to backend
- **Uncached**: Direct to backend with VirtualHostBase rewrite
- **Maintenance**: Direct backend access with VirtualHostRoot

### No frontend service

The manifest doesn't include:
- Frontend deployment
- Frontend service
- Frontend-to-backend internal routing

This makes the deployment ~15% smaller and simpler to manage.

## Troubleshooting

### Backend not starting

Check backend logs:

```shell
kubectl logs -l app.kubernetes.io/name=plone-backend -f
```

Common issues:
- Database connection failures
- Memory limits too low
- Image pull errors

### Classic UI interface not loading

1. Check if backend pods are running:
   ```shell
   kubectl get pods -l app.kubernetes.io/name=plone-backend
   ```

2. Verify virtual host rewriting in ingress:
   ```shell
   kubectl describe ingress
   ```

3. Check Varnish routing:
   ```shell
   kubectl logs -l app.kubernetes.io/name=plone-httpcache
   ```

### Add-on compatibility

Some add-ons are Volto-specific. For Classic UI:
- Use Classic UI themes (not Volto themes)
- Check add-on compatibility with Plone 6 Classic UI
- Avoid Volto-specific frontend add-ons

## Migrating to Volto

If you want to migrate from Classic UI to Volto later:

1. Keep your backend deployment (same configuration)
2. Add Volto frontend from the [Volto example](deploy-production-volto.md)
3. Update ingress to route to frontend
4. Both UIs can run simultaneously during migration

See the [Production Volto deployment guide](deploy-production-volto.md) for details.

## Customization

### Backend configuration

Edit `main.ts` to customize:

```typescript
const plone = new Plone(this, 'plone', {
  variant: PloneVariant.CLASSICUI,
  backend: {
    image: 'plone/plone-backend:6.1.3',
    replicas: 2,
    limitMemory: '1Gi',
    limitCpu: '1000m',
    environment: env,
  },
})
```

### Varnish caching

Edit `config/varnish.tpl.vcl` for caching rules specific to Classic UI.

Classic UI VCL is simpler than Volto's - all traffic routes to one backend.

## Scaling

Scale backend replicas:

```typescript
backend: {
  replicas: 3,  // Increase for higher traffic
}
```

Then:
```shell
npm run synth
kubectl apply -f dist/plone-classic.k8s.yaml
```

## Performance

Classic UI performance characteristics:

- **Server-side rendering** can be slower than Volto's client-side
- **Varnish caching** is critical for performance
- **Database** is the main bottleneck (use CloudNativePG for HA)
- **Fewer HTTP requests** than Volto (no separate frontend API calls)

## Cleanup

```shell
kubectl delete -f dist/plone-classic.k8s.yaml
```

## Next steps

- Follow {doc}`enable-prometheus-monitoring` to add Prometheus monitoring.
- Configure [CloudNativePG backups](https://cloudnative-pg.io/documentation/).
- Customize the Classic UI theme through [Plone 6 Classic UI documentation](https://6.docs.plone.org/classic-ui/).

## See also

- {doc}`deploy-production-volto` — For the modern React UI.
- {doc}`setup-prerequisites` — Cluster requirements.
- {doc}`/reference/configuration-options` — API reference.
- [Plone 6 Classic UI documentation](https://6.docs.plone.org/classic-ui/)
