# Quick Start

This tutorial will guide you through deploying your first Plone instance using cdk8s-plone.

## Prerequisites

Before you start, ensure you have:

- **Node.js 16+** and npm installed
- **kubectl** configured to access your Kubernetes cluster
- Basic familiarity with Kubernetes and TypeScript
- A Kubernetes cluster (local or remote)

For detailed prerequisites, see [Setup Prerequisites](../how-to/setup-prerequisites.md).

## Step 1: Create a CDK8S Project

Create a new CDK8S TypeScript project:

```bash
# Create project directory
mkdir my-plone-deployment
cd my-plone-deployment

# Initialize CDK8S project
cdk8s init typescript-app
```

This creates a basic CDK8S project structure.

## Step 2: Install cdk8s-plone

Install the cdk8s-plone library:

```bash
npm install @bluedynamics/cdk8s-plone
```

The library is also available for Python via PyPI:

```bash
pip install cdk8s-plone
```

## Step 3: Create a Basic Plone Deployment

Edit `main.ts` with the following code:

```typescript
import { App, Chart } from 'cdk8s';
import { Plone, PloneVariant } from '@bluedynamics/cdk8s-plone';

const app = new App();
const chart = new Chart(app, 'PloneDeployment');

new Plone(chart, 'my-plone', {
  variant: PloneVariant.VOLTO,
  backend: {
    image: 'plone/plone-backend:6.1.3',
    replicas: 3,
  },
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
    replicas: 2,
  },
});

app.synth();
```

This creates:
- A Plone backend with 3 replicas
- A Volto frontend with 2 replicas
- All necessary Kubernetes services and deployments

## Step 4: Generate Kubernetes Manifests

Generate the Kubernetes manifests:

```bash
cdk8s synth
```

This creates YAML files in the `dist/` directory containing all Kubernetes resources.

## Step 5: Deploy to Kubernetes

Apply the generated manifests to your cluster:

```bash
kubectl apply -f dist/
```

Check the deployment status:

```bash
kubectl get pods
kubectl get services
```

## Step 6: Access Your Plone Site

Once all pods are running, access your Plone site:

```bash
# Port-forward to the frontend service
kubectl port-forward service/my-plone-frontend 3000:3000

# Open in browser
open http://localhost:3000
```

## Adding HTTP Caching (Optional)

For production deployments, add Varnish HTTP caching:

```typescript
import { PloneHttpcache } from '@bluedynamics/cdk8s-plone';

const plone = new Plone(chart, 'my-plone', {
  variant: PloneVariant.VOLTO,
  backend: { image: 'plone/plone-backend:6.1.3' },
  frontend: { image: 'plone/plone-frontend:16.0.0' },
});

new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-secret',
  replicas: 2,
});
```

This adds a Varnish caching layer with cluster-wide cache invalidation using [kube-httpcache](https://github.com/mittwald/kube-httpcache).

## Next Steps

Now that you have a basic Plone deployment:

- **Configure resources**: See [Scale Resources](../how-to/scale-resources.md) to adjust CPU and memory
- **Add monitoring**: Configure [Prometheus metrics](../how-to/configure-monitoring.md)
- **Set up ingress**: Expose your site with [Ingress configuration](../how-to/configure-ingress.md)
- **Explore variants**: Learn about [Classic UI vs Volto](../explanation/plone-variants.md)

## Troubleshooting

**Pods not starting?**
- Check pod logs: `kubectl logs <pod-name>`
- Verify images are accessible: `kubectl describe pod <pod-name>`

**Can't access the site?**
- Ensure port-forward is running
- Check service endpoints: `kubectl get endpoints`

For more help, see the [Troubleshooting guide](../how-to/troubleshooting.md).

---

**Complete example**: See the [cdk8s-plone-example](https://github.com/bluedynamics/cdk8s-plone-example) repository for a full working example.
