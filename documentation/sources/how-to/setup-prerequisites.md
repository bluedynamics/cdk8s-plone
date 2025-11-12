# Setup Prerequisites

Prepare your environment for deploying Plone with cdk8s-plone.

## Required Tools

### kubectl

Command-line tool for deploying and managing Kubernetes resources.

**Installation:**
- [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

**Verify installation:**
```bash
kubectl version --client
```

**Configure cluster access:**
```bash
# Verify you can connect to your cluster
kubectl cluster-info
kubectl get nodes
```

### Node.js (for TypeScript/JavaScript)

Required for TypeScript/JavaScript development.

**Minimum version:** 16+
**Recommended:** LTS version

**Installation:**
- [Install Node.js](https://nodejs.org/)
- Or use [nvm](https://github.com/nvm-sh/nvm):
  ```bash
  nvm install --lts
  nvm use --lts
  ```

**Verify installation:**
```bash
node --version
npm --version
```

### Python (for Python Development)

Required for Python development.

**Minimum version:** Python 3.8+
**Recommended:** Python 3.11+

**Installation:**
- [Install Python](https://www.python.org/downloads/)

**Verify installation:**
```bash
python --version
pip --version
```

### CDK8S CLI

The CDK8S command-line tool for project initialization and synthesis.

**Installation:**
```bash
npm install -g cdk8s-cli
```

**Verify installation:**
```bash
cdk8s --version
```

## Optional Tools

### Helm

Required only if you want to generate Helm charts instead of raw Kubernetes manifests.

**Installation:**
- [Install Helm](https://helm.sh/docs/intro/install/)

**Verify installation:**
```bash
helm version
```

### k9s

Terminal-based UI for managing Kubernetes clusters (recommended for development).

**Installation:**
- [Install k9s](https://k9scli.io/topics/install/)

**Usage:**
```bash
k9s
```

### kubectx and kubens

Tools for switching between Kubernetes contexts and namespaces.

**Installation:**
- [Install kubectx](https://github.com/ahmetb/kubectx#installation)

**Usage:**
```bash
kubectx                  # List contexts
kubectx my-cluster       # Switch context
kubens my-namespace      # Switch namespace
```

## Kubernetes Cluster

You need access to a Kubernetes cluster for deployment.

### Local Development Clusters

**Minikube**
```bash
# Install
# https://minikube.sigs.k8s.io/docs/start/

# Start cluster
minikube start

# Verify
kubectl cluster-info
```

**kind (Kubernetes in Docker)**
```bash
# Install
# https://kind.sigs.k8s.io/docs/user/quick-start/

# Create cluster
kind create cluster --name plone-dev

# Verify
kubectl cluster-info
```

**Docker Desktop**
- Enable Kubernetes in Docker Desktop settings
- Verify with `kubectl cluster-info`

**k3d (Lightweight Kubernetes)**
```bash
# Install
# https://k3d.io/

# Create cluster
k3d cluster create plone-dev

# Verify
kubectl cluster-info
```

### Cloud Kubernetes Services

**Google Kubernetes Engine (GKE)**
```bash
# Create cluster
gcloud container clusters create plone-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2

# Get credentials
gcloud container clusters get-credentials plone-cluster
```

**Amazon EKS**
```bash
# Create cluster using eksctl
eksctl create cluster \
  --name plone-cluster \
  --nodes 3 \
  --node-type t3.medium

# Verify
kubectl get nodes
```

**Azure Kubernetes Service (AKS)**
```bash
# Create cluster
az aks create \
  --resource-group myResourceGroup \
  --name plone-cluster \
  --node-count 3 \
  --node-vm-size Standard_D2_v2

# Get credentials
az aks get-credentials \
  --resource-group myResourceGroup \
  --name plone-cluster
```

## Cluster Requirements

### Minimum Resources

**For development/testing:**
- **Nodes:** 1-2 nodes
- **CPU:** 2+ cores per node
- **Memory:** 4GB+ per node
- **Storage:** 20GB+ per node

**For production:**
- **Nodes:** 3+ nodes (for high availability)
- **CPU:** 4+ cores per node
- **Memory:** 8GB+ per node
- **Storage:** 50GB+ per node

### Required Kubernetes Features

- **Version:** Kubernetes 1.20+
- **Networking:** CNI plugin installed
- **Storage:** StorageClass with dynamic provisioning
- **DNS:** CoreDNS or equivalent

**Verify storage classes:**
```bash
kubectl get storageclasses
```

If no storage class exists, you need to configure one for your cluster.

## Namespace Setup

Create a namespace for your Plone deployment:

```bash
# Create namespace
kubectl create namespace plone

# Set as default (optional)
kubectl config set-context --current --namespace=plone

# Verify
kubectl config view --minify | grep namespace:
```

## Image Registry Access

### Public Registries

No configuration needed for public Plone images:
- `plone/plone-backend:6.1.3`
- `plone/plone-frontend:16.0.0`

### Private Registries

Create a pull secret for private registries:

**Docker Hub:**
```bash
kubectl create secret docker-registry docker-hub \
  --docker-server=docker.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_PASSWORD \
  --docker-email=YOUR_EMAIL
```

**Google Container Registry:**
```bash
kubectl create secret docker-registry gcr-secret \
  --docker-server=gcr.io \
  --docker-username=_json_key \
  --docker-password="$(cat keyfile.json)" \
  --docker-email=user@example.com
```

**Azure Container Registry:**
```bash
kubectl create secret docker-registry acr-secret \
  --docker-server=myregistry.azurecr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_PASSWORD
```

Use the secret in your deployment:
```typescript
new Plone(chart, 'my-plone', {
  imagePullSecrets: ['docker-hub', 'gcr-secret'],
  backend: { image: 'private-registry.io/plone-backend:6.1.3' },
});
```

## Verification Checklist

Before proceeding, verify:

- [ ] kubectl installed and configured
- [ ] Access to Kubernetes cluster verified
- [ ] Node.js or Python installed (depending on your language choice)
- [ ] CDK8S CLI installed
- [ ] Namespace created (optional but recommended)
- [ ] Storage class available in cluster
- [ ] Image pull secrets created (if using private registries)

**Verify everything:**
```bash
# Check tools
kubectl version --client
cdk8s --version
node --version  # or python --version

# Check cluster access
kubectl cluster-info
kubectl get nodes
kubectl get storageclasses

# Check namespace
kubectl get namespace plone
```

## Next Steps

Now that your environment is ready:

1. **Start the tutorial**: Follow the [Quick Start](../tutorials/01-quick-start.md) guide
2. **Explore examples**: Check the [example project](https://github.com/bluedynamics/cdk8s-plone-example)
3. **Read about variants**: Learn about [Plone variants](../explanation/features.md#deployment-variants)

## Troubleshooting

### kubectl: command not found
- Ensure kubectl is in your PATH
- Reinstall following the [official guide](https://kubernetes.io/docs/tasks/tools/#kubectl)

### Cannot connect to cluster
- Verify kubeconfig: `kubectl config view`
- Check cluster status: `kubectl cluster-info`
- Ensure VPN is connected (if required)

### No storage classes available
- Check cluster documentation for storage setup
- For local clusters, storage is usually pre-configured
- For cloud providers, ensure CSI drivers are installed

### Permission denied errors
- Verify RBAC permissions: `kubectl auth can-i create deployments`
- Contact your cluster administrator for proper permissions

## See Also

- [Quick Start Tutorial](../tutorials/01-quick-start.md) - Get started with deployment
- [Architecture Overview](../explanation/architecture.md) - Understanding the system
- [Configuration Options](../reference/configuration-options.md) - Complete configuration reference
