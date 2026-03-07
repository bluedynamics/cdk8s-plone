# Production Volto Example

This example demonstrates a **production-ready Plone deployment** using the [@bluedynamics/cdk8s-plone](https://www.npmjs.com/package/@bluedynamics/cdk8s-plone) TypeScript package.

## Features

This example includes:

- **Plone 6.1 with Volto** (React frontend + REST API backend)
- **PostgreSQL with RelStorage** - Choose between:
  - [CloudNativePG](https://cloudnative-pg.io/) (CNCF project, production-ready with HA)
  - [Bitnami PostgreSQL](https://github.com/bitnami/charts/tree/main/bitnami/postgresql) Helm chart (simple, for dev/testing)
- **HTTP Caching with Varnish** - Using [kube-httpcache](https://github.com/mittwald/kube-httpcache)
- **Ingress** - Supports both Traefik and Kong with TLS/cert-manager
- **Three access domains**:
  - Cached (public, via Varnish)
  - Uncached (testing, direct to frontend)
  - Maintenance (backend API access)

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

1. **PostgreSQL Operator** (choose one):
   - **CloudNativePG** (recommended for production):
     ```bash
     kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.24/releases/cnpg-1.24.0.yaml
     ```
   - **Bitnami** (no operator needed, uses Helm):
     - Requires namespace `plone` to exist: `kubectl create namespace plone`

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

# Plone images (defaults to official images if not set)
PLONE_BACKEND_IMAGE=plone/plone-backend:6.1.3
PLONE_FRONTEND_IMAGE=plone/plone-frontend:latest

# Database backend: 'bitnami' (default) or 'cloudnativepg'
DATABASE=cloudnativepg
```

### 3. Generate Kubernetes Manifests

```bash
npm run synth
```

This generates `dist/plone-example.k8s.yaml` with all Kubernetes resources.

### 4. Deploy to Kubernetes

```bash
kubectl apply -f dist/plone-example.k8s.yaml
```

Or deploy to a specific namespace:
```bash
kubectl apply -f dist/plone-example.k8s.yaml -n plone
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

**Secrets:** CloudNativePG automatically creates a secret `plone-postgresql-app` with:
- `username` - Database user
- `password` - Database password

### Bitnami PostgreSQL (Development/Testing)

**Pros:**
- No operator required
- Simple setup
- Good for development and testing
- Helm-based deployment

**Cons:**
- Requires namespace `plone` to be pre-created
- No built-in HA features
- Less suitable for production

**Configuration:**
```bash
DATABASE=bitnami
```

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
    │  HTTP Cache       │              │  Plone Frontend   │
    │  (Varnish)        │              │  (Volto/React)    │
    └─────────┬─────────┘              └─────────┬─────────┘
              │                                    │
              └──────────────┬─────────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │  Plone Backend    │
                   │  (Python/Zope)    │
                   └─────────┬─────────┘
                             │
                   ┌─────────▼─────────┐
                   │   PostgreSQL      │
                   │  (RelStorage)     │
                   └───────────────────┘
```

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
- Request routing logic
- Authentication handling
- PURGE/BAN configurations

### Ingress Configuration

Edit [ingress.ts](ingress.ts) to:
- Add/modify domain routes
- Change TLS settings
- Customize path rewrites
- Add middleware

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -l app.kubernetes.io/part-of=plone
```

### View Logs

```bash
# Backend logs
kubectl logs -l app.kubernetes.io/name=plone-backend -f

# Frontend logs
kubectl logs -l app.kubernetes.io/name=plone-frontend -f

# Varnish cache logs
kubectl logs -l app.kubernetes.io/name=plone-httpcache -f
```

### Database Connection Issues

**CloudNativePG:**
```bash
# Check cluster status
kubectl get cluster plone-postgresql

# Check secret
kubectl get secret plone-postgresql-app -o yaml
```

**Bitnami:**
```bash
# Check service
kubectl get svc -l app.kubernetes.io/part-of=plone

# Check secret
kubectl get secret <service-name> -o yaml
```

### Access Logs

```bash
# Get all Plone-related resources
kubectl get all -l app.kubernetes.io/part-of=plone
```

## References

- [cdk8s-plone Documentation](https://bluedynamics.github.io/cdk8s-plone/)
- [Plone 6 Documentation](https://6.docs.plone.org/)
- [CloudNativePG Documentation](https://cloudnative-pg.io/documentation/)
- [CDK8S Documentation](https://cdk8s.io/)
- [Varnish Documentation](https://varnish-cache.org/docs/)

## License

Apache-2.0
