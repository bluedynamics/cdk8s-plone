# CMS Plone Chart for CDK8S

This chart provides a library to bootstrap a Plone deployment on a Kubernetes cluster using the [CDK8S](https://cdk8s.io) framework.

It provides
- Backend (for API with `plone.volto` or as Classic-UI)
- Frontend (Plone-Volto, a ReactJS based user interface)
- Varnish using kube-httpcache. It includes a way to invalidate varnish cluster (optional)


### Typescript

To use this library, create a new CDK8S project (or use an existing one)

```bash
cdk8s init typescript-app
```

Then add the following dependency to `package.json`:

```json
{
  "dependencies": {
    "@bluedynamics/cdk8s-plone": "*"
  }
}
```

Run `npm install` to install the new dependency.

### Python

Todo: Document in details how to install.

```bash
cdk8s init python-app
```

Python package name is [cdk8s-plone](https://pypi.org/project/cdk8s-plone/).




## Usage

With `cdk8s-cli` installed, create a new project:

```bash
cdk8s sythn
```

Add the following code to your `main.ts`:

```typescript
...
import { Plone } from '@bluedynamics/cdk8s-plone';
...
    super(scope, id, props);

    // define resources here
    new Plone(this, 'Plone', {});
...
```

Run `npm run build ` to generate the Kubernetes manifests.
The manifests are stored in the `dist` directory.

For more have a look at the [example project](https://github.com/bluedynamics/cdk8s-plone-example).


## Development

Clone the repository and install the dependencies:

```bash
```
nvm use lts/*
corepack enable
projen
```

Then run the following command to run the test:

```bash
npx projen test
```

### Feature Wishlist:

Each step need to be implemented with tests!

- [x] Support Variants for ClassicUI or Volto
- [ ] Start Backend
    - [x] deployment
    - [x] service
    - [x] pdb
    - [ ] init container running `plone-site-create`
    - [x] lifecycle checks (readiness, liveness)
    - [x] generic way to inject sidecars
    - [ ] metrics sidecar
- [ ] Start Frontend
    - [x] deployment
    - [x] service
    - [x] pdb
    - [x] lifecycle checks (readiness, liveness)
    - [x] generic way to inject sidecars
    - [ ] metrics sidecar
- [x] Start Varnish (using `kube-httpcache`) optional in separate chart
    - [x] provide a default VCL for Volto with routing to backend and frontend
    - [ ] provide a default VCL for ClassicUI
- [ ] Configure Ingress, optional in separate chart
    - [ ] Traefik
    - [ ] Konq

- [ ] Release packages for other Languages
    - [x] Python
    - [ ] Golang
    - [ ] Java