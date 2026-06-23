# Blicca Example

This example demonstrates a **production-ready Plone Blicca deployment** using the [@bluedynamics/cdk8s-plone](https://www.npmjs.com/package/@bluedynamics/cdk8s-plone) TypeScript package.

> **Note:** Blicca is the new name for what was formerly called Plone "Classic UI".

## What is Plone Blicca?

Blicca is the server-side rendered UI of Plone CMS: the Plone backend renders the HTML and serves it directly. Unlike Volto (a separate React single-page frontend talking to the REST API), Blicca needs no separate frontend service:

- **Server-side rendering** - All pages rendered by Plone/Zope
- **Simpler architecture** - Single backend service (no separate frontend)
- **Full Plone features** - Complete access to all Plone functionality

**When to use Blicca:**
- You want a single backend service without a separate frontend deployment
- Migration from older Plone versions (keeping the familiar server-rendered UX)
- Projects requiring Blicca-specific add-ons

**When to use Volto instead:** See the [production-volto](../production-volto/) example for the React single-page frontend approach.

## Features

This example includes:

- **Plone 6.1 with Blicca** (server-side rendering)
- **PostgreSQL with RelStorage** - Choose between:
  - Plain single-instance PostgreSQL using the official `postgres` image (default, operator-free, for dev and small setups)
  - [CloudNativePG](https://cloudnative-pg.io/) (CNCF project, production-ready with HA)
- **HTTP Caching with Varnish** - Using [kube-httpcache](https://github.com/mittwald/kube-httpcache)
- **Ingress** - Supports both Traefik and Kong with TLS/cert-manager
- **Three access domains**:
  - Cached (public, via Varnish)
  - Uncached (testing, direct to backend)
  - Maintenance (backend access with virtual hosting)

## Prerequisites

### Node.js Setup

Configure Node.js:
```bash
nvm use lts/*
```

Install dependencies:
```bash
npm install
```

### Kubernetes Cluster Requirements

Your cluster needs:

1. **PostgreSQL** (choose one):
   - **Plain** (default, no operator needed): the example deploys a single-instance PostgreSQL StatefulSet using the official `postgres` image, so there is nothing to install.
   - **CloudNativePG** (recommended for production HA): install the operator
     ```bash
     kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.24/releases/cnpg-1.24.0.yaml
     ```

2. **Ingress Controller** (choose one):
   - Traefik v3 with CRDs installed
   - Kong Gateway

3. **cert-manager** (for TLS certificates):
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
   ```

4. **kube-httpcache Operator** (for Varnish caching):
   ```bash
   kubectl apply -f https://github.com/mittwald/kube-httpcache/releases/latest/download/kube-httpcache.yaml
   ```

## Usage

### 1. Import CRDs

Import the required Custom Resource Definitions:

```bash
npm run import
```

This will generate TypeScript bindings in `./imports/` for:
- Kubernetes core API
- Traefik IngressRoute CRDs
- CloudNativePG Cluster CRDs

### 2. Configure Environment

Create a `.env` file (copy from `.env.example`):

```bash
# Domain names
DOMAIN_CACHED=plone.example.com
DOMAIN_UNCACHED=plone-test.example.com
DOMAIN_MAINTENANCE=plone-admin.example.com

# TLS certificate issuer (cert-manager ClusterIssuer)
CLUSTER_ISSUER=letsencrypt-prod

# Plone backend image (defaults to official image if not set)
PLONE_BACKEND_IMAGE=plone/plone-backend:6.1.3

# Database backend: 'plain' (default) or 'cloudnativepg'
DATABASE=plain
```

### 3. Generate Kubernetes Manifests

```bash
npm run synth
```

This generates `dist/plone-blicca.k8s.yaml` with all Kubernetes resources.

### 4. Deploy to Kubernetes

```bash
kubectl apply -f dist/plone-blicca.k8s.yaml
```

Or deploy to a specific namespace:
```bash
kubectl apply -f dist/plone-blicca.k8s.yaml -n plone
```

## Blicca vs Volto

| Feature | Blicca | Volto |
|---------|-----------|-------|
| **Architecture** | Single backend service | Separate frontend + backend |
| **Rendering** | Server-side (Zope) | Client-side (React) |
| **Performance** | Good with caching | Excellent (SPA) |
| **Deployment** | Simpler | More complex |
| **Add-ons** | Full Blicca support | Volto-specific needed |
| **Best for** | Single-service setups, migrations | API-first projects, SPA frontends |

## Architecture

```
                    ┌─────────────────┐
                    │   cert-manager  │
                    │  (TLS Certs)    │
                    └────────┬────────┘
                             │
┌──────────────────┐    ┌────▼────────────┐
│   External       │───▶│    Ingress      │
│   Traffic        │    │ (Traefik/Kong)  │
└──────────────────┘    └────┬─────┬──────┘
                             │     │
              ┌──────────────┘     └──────────────┐
              │                                    │
    ┌─────────▼─────────┐              ┌─────────▼─────────┐
    │  HTTP Cache       │              │  Plone Backend    │
    │  (Varnish)        │              │  (Blicca)         │
    └─────────┬─────────┘              │                   │
              │                        └─────────┬─────────┘
              │                                  │
              └──────────────┬───────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │   PostgreSQL      │
                   │  (RelStorage)     │
                   └───────────────────┘
```

## Database Options

### CloudNativePG (Production)

**Pros:**
- CNCF Sandbox project (Cloud Native Computing Foundation)
- Built-in high availability (2 instances)
- Automated backups and point-in-time recovery
- Monitoring and observability
- Connection pooling support
- Modern, actively maintained

**Configuration:**
```bash
DATABASE=cloudnativepg
```

### Plain PostgreSQL (default, operator-free)

**Pros:**
- No operator and no third-party Helm chart required
- Uses the official `postgres` image, which is actively maintained
- Single-instance StatefulSet with a PersistentVolumeClaim
- Good for development and small production setups

**Cons:**
- No built-in high availability, failover, or automated backups

**Configuration:**
```bash
DATABASE=plain
```

**Secrets:** the example creates a Secret with `username`, `password`, and `database` keys.

## Development

### Build and Test

```bash
# Compile TypeScript
npm run compile

# Run tests
npm test

# Update test snapshots
npm run test-update

# Full build (compile + test + synth)
npm run build
```

### Watch Mode

```bash
npm run watch
```

## Customization

### Changing Plone Configuration

Edit [main.ts](main.ts) to customize:
- RelStorage settings (cache sizes, blob mode)
- Resource limits
- Environment variables
- Number of replicas

### Modifying Varnish Caching

Edit [config/varnish.tpl.vcl](config/varnish.tpl.vcl) to customize:
- Cache rules
- Authentication handling
- PURGE/BAN configurations

### Ingress Configuration

Edit [ingress.ts](ingress.ts) to:
- Add/modify domain routes
- Change TLS settings
- Customize path rewrites
- Add middleware

## Accessing Your Plone Site

After deployment, you can access your Plone Blicca site at:

- **Cached (public)**: https://plone.example.com (via Varnish)
- **Uncached (testing)**: https://plone-test.example.com (direct to backend)
- **Maintenance**: https://plone-admin.example.com (backend access)

### Creating a Plone Site

On first access, you'll need to create a Plone site:

1. Access the maintenance domain: https://plone-admin.example.com
2. Click "Create a new Plone site"
3. Fill in the form:
   - **Site ID**: Plone (default)
   - **Title**: Your Site Title
   - **Language**: Choose your language
   - **Add-ons**: Select any add-ons you need
4. Click "Create Plone Site"

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -l app.kubernetes.io/part-of=plone
```

### View Logs

```bash
# Backend logs
kubectl logs -l app.kubernetes.io/name=plone-backend -f

# Varnish cache logs
kubectl logs -l app.kubernetes.io/name=plone-httpcache -f
```

### Database Connection Issues

**CloudNativePG:**
```bash
# Check cluster status
kubectl get cluster

# Check secret
kubectl get secret -l cnpg.io/cluster
```

**Plain PostgreSQL:**
```bash
# Check the StatefulSet and pod
kubectl get statefulset -l app.kubernetes.io/name=plone-postgresql
kubectl get pods -l app.kubernetes.io/name=plone-postgresql
```

### Access Logs

```bash
# Get all Plone-related resources
kubectl get all -l app.kubernetes.io/part-of=plone
```

## Migrating from Blicca to Volto

If you later want to migrate to Volto:

1. See the [production-volto](../production-volto/) example
2. Keep the same backend configuration (database, caching)
3. Add Volto frontend deployment
4. Update ingress to route to frontend
5. Both UIs can run simultaneously during migration

## References

- [cdk8s-plone Documentation](https://bluedynamics.github.io/cdk8s-plone/)
- [Plone 6 Documentation](https://6.docs.plone.org/)
- [Plone Classic UI Guide](https://6.docs.plone.org/classic-ui/) (upstream docs; Blicca is the new name for Classic UI)
- [CloudNativePG Documentation](https://cloudnative-pg.io/documentation/)
- [CDK8S Documentation](https://cdk8s.io/)
- [Varnish Documentation](https://varnish-cache.org/docs/)

## License

Apache-2.0
