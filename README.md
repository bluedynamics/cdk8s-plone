# CMS Plone Chart for CDK8S

This chart provides a library to bootstrap a Plone deployment on a Kubernetes cluster using the [CDK8S](https://cdk8s.io) framework.

It provides
- Backend (as API with `plone.volto` or as Classic-UI)
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

### References

#### PloneBaseOptions
Interface
```typescript
export interface PloneBaseOptions {
  // image
  readonly image?: string;
  readonly imagePullPolicy?: string;
  // replicas
  readonly replicas?: number;
  readonly maxUnavailable?: number | string;
  readonly minAvailable?: number | string;
  // resources
  readonly limitCpu?: string;
  readonly limitMemory?: string;
  readonly requestCpu?: string;
  readonly requestMemory?: string;
  readonly environment?: kplus.Env;
  // readiness Probe
  readonly readinessEnabled?: boolean;
  readonly readinessInitialDelaySeconds?: number;
  readonly readinessIimeoutSeconds?: number;
  readonly readinessPeriodSeconds?: number;
  readonly readinessSuccessThreshold?: number;
  readonly readinessFailureThreshold?: number;
  // liveness Probe
  readonly livenessEnabled?: boolean;
  readonly livenessInitialDelaySeconds?: number;
  readonly livenessIimeoutSeconds?: number;
  readonly livenessPeriodSeconds?: number;
  readonly livenessSuccessThreshold?: number;
  readonly livenessFailureThreshold?: number;
}
```

#### PloneOptions
Interface
```typescript
  readonly version?: string;
  readonly siteId?: string;
  readonly variant?: PloneVariant;
  readonly backend?: PloneBaseOptions;
  readonly frontend?: PloneBaseOptions;
  readonly imagePullSecrets?: string[];
```

#### PloneVariants
Enum
```typescript
  VOLTO = 'volto',
  CLASSICUI = 'classicui', //only backend plone
```


## Development

Clone the repository and install the dependencies:

```bash
nvm use lts/*
corepack enable
npx projen
```

Then run the following command to run the test:

```bash
npx projen test
```
