---
myst:
  html_meta:
    "description": "Deploy your first Plone instance to Kubernetes using cdk8s-plone, from project setup to a running Volto site."
    "property=og:description": "Deploy your first Plone instance to Kubernetes using cdk8s-plone, from project setup to a running Volto site."
    "property=og:title": "Quick start"
    "keywords": "Plone, cdk8s, Kubernetes, tutorial, Volto, getting started"
---

# Quick start

This tutorial will guide you through deploying your first Plone instance using cdk8s-plone.

## Prerequisites

Before you start, ensure you have:

- **Node.js 18+** and npm installed
- **kubectl** configured to access your Kubernetes cluster
- Basic familiarity with Kubernetes and TypeScript
- A Kubernetes cluster (local or remote)

For detailed prerequisites, see [Setup Prerequisites](../how-to/setup-prerequisites.md).

## Step 1: Create a CDK8S project

Create a new CDK8S TypeScript project:

```shell
# Create project directory
mkdir my-plone-deployment
cd my-plone-deployment

# Initialize CDK8S project
cdk8s init typescript-app
```

This creates a basic CDK8S project structure.

## Step 2: Install cdk8s-plone

Install the cdk8s-plone library:

```shell
npm install @bluedynamics/cdk8s-plone
```

The library is also available for Python via PyPI:

```shell
pip install cdk8s-plone
```

## Step 3: Create a basic Plone deployment

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

## Step 4: Generate Kubernetes manifests

Generate the Kubernetes manifests:

```shell
cdk8s synth
```

This creates YAML files in the `dist/` directory containing all Kubernetes resources.

## Step 5: Deploy to Kubernetes

Apply the generated manifests to your cluster:

```shell
kubectl apply -f dist/
```

Check the deployment status:

```shell
kubectl get pods
kubectl get services
```

## Step 6: Access your Plone site

Once all pods are running, access your Plone site:

```shell
# Port-forward to the frontend service
kubectl port-forward service/my-plone-frontend 3000:3000

# Open in browser
open http://localhost:3000
```

## Adding HTTP caching (optional)

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

## Next steps

Now that you have a basic Plone deployment:

- **Configure resources**: See {doc}`/reference/configuration-options` for CPU and memory options.
- **Add monitoring**: Follow {doc}`/how-to/enable-prometheus-monitoring`.
- **Explore variants**: Read about Volto and Blicca in {doc}`/explanation/features`.
- **Harden pods**: Apply {doc}`/how-to/configure-security-context`.

## Troubleshooting

**Pods not starting?**
- Check pod logs: `kubectl logs <pod-name>`
- Verify images are accessible: `kubectl describe pod <pod-name>`

**Can't access the site?**
- Ensure port-forward is running
- Check service endpoints: `kubectl get endpoints`

---

**Complete example**: See the [cdk8s-plone-example](https://github.com/bluedynamics/cdk8s-plone-example) repository for a full working example.
