# Deploy Production Volto Example

This guide shows you how to deploy the production-ready Volto example to your Kubernetes cluster.

## What You'll Deploy

The [Production Volto example](https://github.com/bluedynamics/cdk8s-plone/tree/main/examples/production-volto) includes:

- **Plone 6.1 with Volto** (React frontend + REST API backend)
- **PostgreSQL** with RelStorage (CloudNativePG or Bitnami)
- **Varnish HTTP caching** with kube-httpcache
- **Ingress** with TLS (Traefik or Kong)
- **Three access domains** (cached, uncached, maintenance)

## Prerequisites

### Required

Ensure you have these installed on your cluster:

1. **Ingress Controller** - Either:
   - [Traefik v3](https://doc.traefik.io/traefik/getting-started/install-traefik/) with CRDs
   - [Kong Gateway](https://docs.konghq.com/gateway/latest/install/kubernetes/)

2. **cert-manager** - For TLS certificates:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
   ```

3. **kube-httpcache Operator** - For Varnish caching:
   ```bash
   kubectl apply -f https://github.com/mittwald/kube-httpcache/releases/latest/download/kube-httpcache.yaml
   ```

4. **PostgreSQL Operator** - Choose one:

   **Option A: CloudNativePG** (recommended for production):
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.24/releases/cnpg-1.24.0.yaml
   ```

   **Option B: Bitnami** (simpler for testing):
   ```bash
   kubectl create namespace plone
   ```

### Local Tools

- **Node.js 18+** and npm
- **kubectl** configured for your cluster
- **git** to clone the repository

## Step 1: Get the Example

Clone the repository and navigate to the example:

```bash
git clone https://github.com/bluedynamics/cdk8s-plone.git
cd cdk8s-plone/examples/production-volto
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Import CRDs

Generate TypeScript bindings for Kubernetes CRDs:

```bash
npm run import
```

This imports:
- Kubernetes core API
- CloudNativePG Cluster CRDs
- Traefik Middleware CRDs

## Step 4: Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Your domains
DOMAIN_CACHED=plone.example.com
DOMAIN_UNCACHED=plone-test.example.com
DOMAIN_MAINTENANCE=plone-admin.example.com

# Your cert-manager ClusterIssuer
CLUSTER_ISSUER=letsencrypt-prod

# Optional: Custom images
#PLONE_BACKEND_IMAGE=plone/plone-backend:6.1.3
#PLONE_FRONTEND_IMAGE=plone/plone-frontend:latest

# Database: 'bitnami' or 'cloudnativepg'
DATABASE=cloudnativepg
```

:::{tip}
For production, use `cloudnativepg` for high availability. For testing, `bitnami` is simpler.
:::

## Step 5: Generate Manifests

Synthesize Kubernetes YAML:

```bash
npm run synth
```

This creates `dist/plone-example.k8s.yaml` with all resources.

## Step 6: Review Generated Manifests

Inspect what will be deployed:

```bash
# Count resources
grep "^kind:" dist/plone-example.k8s.yaml | sort | uniq -c

# View specific resources
kubectl apply --dry-run=client -f dist/plone-example.k8s.yaml
```

## Step 7: Deploy to Kubernetes

Deploy to your cluster:

```bash
kubectl apply -f dist/plone-example.k8s.yaml
```

Or deploy to a specific namespace:

```bash
kubectl apply -f dist/plone-example.k8s.yaml -n plone
```

## Step 8: Monitor Deployment

Watch pods starting:

```bash
# Watch all pods
kubectl get pods -l app.kubernetes.io/part-of=plone -w

# Check specific components
kubectl get pods -l app.kubernetes.io/name=plone-backend
kubectl get pods -l app.kubernetes.io/name=plone-frontend
kubectl get pods -l app.kubernetes.io/name=plone-httpcache
```

Wait for all pods to be `Running`:

```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/part-of=plone --timeout=300s
```

## Step 9: Verify Services

Check that services are created:

```bash
kubectl get svc -l app.kubernetes.io/part-of=plone
```

You should see:
- `plone-backend` (backend service)
- `plone-frontend` (frontend service)
- `plone-httpcache` (Varnish cache)
- Database service (Bitnami or CloudNativePG)

## Step 10: Check Ingress

Verify ingress routes:

```bash
kubectl get ingress
```

Check TLS certificates:

```bash
kubectl get certificate
```

## Step 11: Access Your Site

Once DNS is configured and TLS certificates are issued:

- **Public site (cached)**: https://plone.example.com
- **Testing (uncached)**: https://plone-test.example.com
- **Maintenance**: https://plone-admin.example.com

### Create Plone Site

On first access to the maintenance domain:

1. Go to: https://plone-admin.example.com
2. Click "Create a new Plone site"
3. Fill in:
   - **Site ID**: `Plone`
   - **Title**: Your site title
   - **Language**: Choose language
4. Click "Create Plone Site"

## Troubleshooting

### Pods Not Starting

Check pod logs:

```bash
# Backend logs
kubectl logs -l app.kubernetes.io/name=plone-backend -f

# Frontend logs
kubectl logs -l app.kubernetes.io/name=plone-frontend -f

# Database logs (CloudNativePG)
kubectl logs -l postgresql=plone-postgresql -f
```

### Database Connection Issues

**CloudNativePG:**

```bash
# Check cluster status
kubectl get cluster

# Check secret
kubectl get secret -l cnpg.io/cluster
```

**Bitnami:**

```bash
# Check service
kubectl get svc -l app.kubernetes.io/name=postgresql

# Check secret
kubectl describe secret <postgresql-secret-name>
```

### TLS Certificate Issues

```bash
# Check certificate status
kubectl describe certificate

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

### Varnish Cache Not Working

```bash
# Check httpcache logs
kubectl logs -l app.kubernetes.io/name=plone-httpcache

# Check if kube-httpcache operator is running
kubectl get pods -n kube-httpcache-system
```

## Updating Your Deployment

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

```bash
kubectl delete -f dist/plone-example.k8s.yaml
```

## Next Steps

- Configure [monitoring and metrics](../reference/configuration-options.md#monitoring)
- Set up [backups](../explanation/features.md#database-integration) for CloudNativePG
- Customize [Varnish caching rules](https://github.com/bluedynamics/cdk8s-plone/blob/main/examples/production-volto/config/varnish.tpl.vcl)
- Review [security best practices](../explanation/architecture.md#security)

## See Also

- [Deploy Classic UI Example](deploy-classic-ui.md) - For traditional Plone interface
- [Setup Prerequisites](setup-prerequisites.md) - Detailed cluster setup
- [Configuration Options](../reference/configuration-options.md) - API reference
