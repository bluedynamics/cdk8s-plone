# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Plone <a name="Plone" id="@bluedynamics/cdk8s-plone.Plone"></a>

Plone construct for deploying Plone CMS to Kubernetes.

This construct creates all necessary Kubernetes resources for running Plone:
- Deployment(s) for backend (and optionally frontend)
- Service(s) for network access
- Optional PodDisruptionBudget for high availability

Supports two deployment variants:
- VOLTO: Modern React frontend with REST API backend (default)
- CLASSICUI: Traditional server-side rendered Plone

*Example*

```typescript
new Plone(chart, 'my-plone', {
  variant: PloneVariant.VOLTO,
  backend: {
    image: 'plone/plone-backend:6.0.10',
    replicas: 3,
  },
  frontend: {
    image: 'plone/plone-frontend:16.0.0',
  },
});
```


#### Initializers <a name="Initializers" id="@bluedynamics/cdk8s-plone.Plone.Initializer"></a>

```typescript
import { Plone } from '@bluedynamics/cdk8s-plone'

new Plone(scope: Construct, id: string, options?: PloneOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.Initializer.parameter.options">options</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions">PloneOptions</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@bluedynamics/cdk8s-plone.Plone.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@bluedynamics/cdk8s-plone.Plone.Initializer.parameter.id"></a>

- *Type:* string

---

##### `options`<sup>Optional</sup> <a name="options" id="@bluedynamics/cdk8s-plone.Plone.Initializer.parameter.options"></a>

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneOptions">PloneOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@bluedynamics/cdk8s-plone.Plone.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@bluedynamics/cdk8s-plone.Plone.isConstruct"></a>

```typescript
import { Plone } from '@bluedynamics/cdk8s-plone'

Plone.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="@bluedynamics/cdk8s-plone.Plone.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.backendServiceName">backendServiceName</a></code> | <code>string</code> | Name of the backend Kubernetes service. |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.siteId">siteId</a></code> | <code>string</code> | The Plone site ID in ZODB. |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.variant">variant</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a></code> | The deployment variant being used (VOLTO or CLASSICUI). |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.frontendServiceName">frontendServiceName</a></code> | <code>string</code> | Name of the frontend Kubernetes service. |

---

##### `node`<sup>Required</sup> <a name="node" id="@bluedynamics/cdk8s-plone.Plone.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `backendServiceName`<sup>Required</sup> <a name="backendServiceName" id="@bluedynamics/cdk8s-plone.Plone.property.backendServiceName"></a>

```typescript
public readonly backendServiceName: string;
```

- *Type:* string

Name of the backend Kubernetes service.

Use this to reference the backend service from other constructs.

---

##### `siteId`<sup>Required</sup> <a name="siteId" id="@bluedynamics/cdk8s-plone.Plone.property.siteId"></a>

```typescript
public readonly siteId: string;
```

- *Type:* string

The Plone site ID in ZODB.

---

##### `variant`<sup>Required</sup> <a name="variant" id="@bluedynamics/cdk8s-plone.Plone.property.variant"></a>

```typescript
public readonly variant: PloneVariant;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a>

The deployment variant being used (VOLTO or CLASSICUI).

---

##### `frontendServiceName`<sup>Optional</sup> <a name="frontendServiceName" id="@bluedynamics/cdk8s-plone.Plone.property.frontendServiceName"></a>

```typescript
public readonly frontendServiceName: string;
```

- *Type:* string

Name of the frontend Kubernetes service.

Only set when variant is VOLTO, otherwise undefined.

---


### PloneHttpcache <a name="PloneHttpcache" id="@bluedynamics/cdk8s-plone.PloneHttpcache"></a>

PloneHttpcache construct for deploying Varnish HTTP caching layer.

Uses the mittwald/kube-httpcache Helm chart to deploy Varnish as a
caching proxy in front of Plone backend and/or frontend services.

The cache automatically connects to the Plone services and provides
HTTP cache invalidation capabilities.

*Example*

```typescript
const plone = new Plone(chart, 'plone');
const cache = new PloneHttpcache(chart, 'cache', {
  plone: plone,
  existingSecret: 'varnish-secret',
});
```


#### Initializers <a name="Initializers" id="@bluedynamics/cdk8s-plone.PloneHttpcache.Initializer"></a>

```typescript
import { PloneHttpcache } from '@bluedynamics/cdk8s-plone'

new PloneHttpcache(scope: Construct, id: string, options: PloneHttpcacheOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.Initializer.parameter.options">options</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions">PloneHttpcacheOptions</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@bluedynamics/cdk8s-plone.PloneHttpcache.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@bluedynamics/cdk8s-plone.PloneHttpcache.Initializer.parameter.id"></a>

- *Type:* string

---

##### `options`<sup>Required</sup> <a name="options" id="@bluedynamics/cdk8s-plone.PloneHttpcache.Initializer.parameter.options"></a>

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions">PloneHttpcacheOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@bluedynamics/cdk8s-plone.PloneHttpcache.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@bluedynamics/cdk8s-plone.PloneHttpcache.isConstruct"></a>

```typescript
import { PloneHttpcache } from '@bluedynamics/cdk8s-plone'

PloneHttpcache.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="@bluedynamics/cdk8s-plone.PloneHttpcache.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.property.httpcacheServiceName">httpcacheServiceName</a></code> | <code>string</code> | Name of the Varnish service created by the Helm chart. |

---

##### `node`<sup>Required</sup> <a name="node" id="@bluedynamics/cdk8s-plone.PloneHttpcache.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `httpcacheServiceName`<sup>Required</sup> <a name="httpcacheServiceName" id="@bluedynamics/cdk8s-plone.PloneHttpcache.property.httpcacheServiceName"></a>

```typescript
public readonly httpcacheServiceName: string;
```

- *Type:* string

Name of the Varnish service created by the Helm chart.

Use this to reference the cache service from ingress or other constructs.

---


## Structs <a name="Structs" id="Structs"></a>

### PloneBaseOptions <a name="PloneBaseOptions" id="@bluedynamics/cdk8s-plone.PloneBaseOptions"></a>

Base options for Plone backend or frontend configuration.

These options control container image, replica count, resource limits,
environment variables, and health probes.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.Initializer"></a>

```typescript
import { PloneBaseOptions } from '@bluedynamics/cdk8s-plone'

const ploneBaseOptions: PloneBaseOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.annotations">annotations</a></code> | <code>{[ key: string ]: string}</code> | Annotations to add to the Deployment metadata. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.environment">environment</a></code> | <code>cdk8s-plus-30.Env</code> | Environment variables to set in the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.image">image</a></code> | <code>string</code> | Container image to use for the deployment. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.imagePullPolicy">imagePullPolicy</a></code> | <code>string</code> | Image pull policy for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitCpu">limitCpu</a></code> | <code>string</code> | CPU limit for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitMemory">limitMemory</a></code> | <code>string</code> | Memory limit for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessEnabled">livenessEnabled</a></code> | <code>boolean</code> | Enable liveness probe for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessFailureThreshold">livenessFailureThreshold</a></code> | <code>number</code> | Minimum consecutive failures for the liveness probe to be considered failed. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessInitialDelaySeconds">livenessInitialDelaySeconds</a></code> | <code>number</code> | Number of seconds after container start before liveness probe is initiated. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessPeriodSeconds">livenessPeriodSeconds</a></code> | <code>number</code> | How often (in seconds) to perform the liveness probe. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessSuccessThreshold">livenessSuccessThreshold</a></code> | <code>number</code> | Minimum consecutive successes for the liveness probe to be considered successful. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessTimeoutSeconds">livenessTimeoutSeconds</a></code> | <code>number</code> | Number of seconds after which the liveness probe times out. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.maxUnavailable">maxUnavailable</a></code> | <code>string \| number</code> | Maximum number of pods that can be unavailable during updates. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.minAvailable">minAvailable</a></code> | <code>string \| number</code> | Minimum number of pods that must be available during updates. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.podAnnotations">podAnnotations</a></code> | <code>{[ key: string ]: string}</code> | Annotations to add to the Pod template metadata. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessEnabled">readinessEnabled</a></code> | <code>boolean</code> | Enable readiness probe for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessFailureThreshold">readinessFailureThreshold</a></code> | <code>number</code> | Minimum consecutive failures for the readiness probe to be considered failed. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessInitialDelaySeconds">readinessInitialDelaySeconds</a></code> | <code>number</code> | Number of seconds after container start before readiness probe is initiated. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessPeriodSeconds">readinessPeriodSeconds</a></code> | <code>number</code> | How often (in seconds) to perform the readiness probe. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessSuccessThreshold">readinessSuccessThreshold</a></code> | <code>number</code> | Minimum consecutive successes for the readiness probe to be considered successful. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessTimeoutSeconds">readinessTimeoutSeconds</a></code> | <code>number</code> | Number of seconds after which the readiness probe times out. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.replicas">replicas</a></code> | <code>number</code> | Number of pod replicas to run. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestCpu">requestCpu</a></code> | <code>string</code> | CPU request for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestMemory">requestMemory</a></code> | <code>string</code> | Memory request for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.serviceAnnotations">serviceAnnotations</a></code> | <code>{[ key: string ]: string}</code> | Annotations to add to the Service metadata. |

---

##### `annotations`<sup>Optional</sup> <a name="annotations" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.annotations"></a>

```typescript
public readonly annotations: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no additional annotations

Annotations to add to the Deployment metadata.

---

*Example*

```typescript
{ 'deployment.kubernetes.io/revision': '1' }
```


##### `environment`<sup>Optional</sup> <a name="environment" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.environment"></a>

```typescript
public readonly environment: Env;
```

- *Type:* cdk8s-plus-30.Env
- *Default:* undefined (no additional environment variables)

Environment variables to set in the container.

Use cdk8s-plus-30 Env class to define variables and sources.

---

##### `image`<sup>Optional</sup> <a name="image" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.image"></a>

```typescript
public readonly image: string;
```

- *Type:* string
- *Default:* 'plone/plone-backend:latest' for backend, 'plone/plone-frontend:latest' for frontend

Container image to use for the deployment.

---

*Example*

```typescript
'plone/plone-backend:6.0.10' or 'plone/plone-frontend:16.0.0'
```


##### `imagePullPolicy`<sup>Optional</sup> <a name="imagePullPolicy" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.imagePullPolicy"></a>

```typescript
public readonly imagePullPolicy: string;
```

- *Type:* string
- *Default:* 'IfNotPresent'

Image pull policy for the container.

---

##### `limitCpu`<sup>Optional</sup> <a name="limitCpu" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitCpu"></a>

```typescript
public readonly limitCpu: string;
```

- *Type:* string
- *Default:* '500m' for both backend and frontend

CPU limit for the container.

---

*Example*

```typescript
'500m' or '1' or '2000m'
```


##### `limitMemory`<sup>Optional</sup> <a name="limitMemory" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitMemory"></a>

```typescript
public readonly limitMemory: string;
```

- *Type:* string
- *Default:* '512Mi' for backend, '1Gi' for frontend

Memory limit for the container.

---

*Example*

```typescript
'512Mi' or '1Gi'
```


##### `livenessEnabled`<sup>Optional</sup> <a name="livenessEnabled" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessEnabled"></a>

```typescript
public readonly livenessEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Enable liveness probe for the container.

Liveness probes determine when to restart a container.
Recommended: true for frontend, false for backend (Zope has its own recovery).

---

##### `livenessFailureThreshold`<sup>Optional</sup> <a name="livenessFailureThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessFailureThreshold"></a>

```typescript
public readonly livenessFailureThreshold: number;
```

- *Type:* number
- *Default:* 3

Minimum consecutive failures for the liveness probe to be considered failed.

---

##### `livenessInitialDelaySeconds`<sup>Optional</sup> <a name="livenessInitialDelaySeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessInitialDelaySeconds"></a>

```typescript
public readonly livenessInitialDelaySeconds: number;
```

- *Type:* number
- *Default:* 30

Number of seconds after container start before liveness probe is initiated.

---

##### `livenessPeriodSeconds`<sup>Optional</sup> <a name="livenessPeriodSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessPeriodSeconds"></a>

```typescript
public readonly livenessPeriodSeconds: number;
```

- *Type:* number
- *Default:* 10

How often (in seconds) to perform the liveness probe.

---

##### `livenessSuccessThreshold`<sup>Optional</sup> <a name="livenessSuccessThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessSuccessThreshold"></a>

```typescript
public readonly livenessSuccessThreshold: number;
```

- *Type:* number
- *Default:* 1

Minimum consecutive successes for the liveness probe to be considered successful.

---

##### `livenessTimeoutSeconds`<sup>Optional</sup> <a name="livenessTimeoutSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessTimeoutSeconds"></a>

```typescript
public readonly livenessTimeoutSeconds: number;
```

- *Type:* number
- *Default:* 5

Number of seconds after which the liveness probe times out.

---

##### `maxUnavailable`<sup>Optional</sup> <a name="maxUnavailable" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.maxUnavailable"></a>

```typescript
public readonly maxUnavailable: string | number;
```

- *Type:* string | number
- *Default:* undefined (not set)

Maximum number of pods that can be unavailable during updates.

Can be an absolute number (e.g., 1) or a percentage (e.g., '50%').
Used in PodDisruptionBudget if specified.

---

##### `minAvailable`<sup>Optional</sup> <a name="minAvailable" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.minAvailable"></a>

```typescript
public readonly minAvailable: string | number;
```

- *Type:* string | number
- *Default:* undefined (not set)

Minimum number of pods that must be available during updates.

Can be an absolute number (e.g., 1) or a percentage (e.g., '50%').
Used in PodDisruptionBudget if specified.

---

##### `podAnnotations`<sup>Optional</sup> <a name="podAnnotations" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.podAnnotations"></a>

```typescript
public readonly podAnnotations: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no additional annotations

Annotations to add to the Pod template metadata.

Common for Prometheus, Istio, backup policies, etc.

---

*Example*

```typescript
{ 'prometheus.io/scrape': 'true', 'prometheus.io/port': '8080' }
```


##### `readinessEnabled`<sup>Optional</sup> <a name="readinessEnabled" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessEnabled"></a>

```typescript
public readonly readinessEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable readiness probe for the container.

Readiness probes determine when a container is ready to accept traffic.

---

##### `readinessFailureThreshold`<sup>Optional</sup> <a name="readinessFailureThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessFailureThreshold"></a>

```typescript
public readonly readinessFailureThreshold: number;
```

- *Type:* number
- *Default:* 3

Minimum consecutive failures for the readiness probe to be considered failed.

---

##### `readinessInitialDelaySeconds`<sup>Optional</sup> <a name="readinessInitialDelaySeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessInitialDelaySeconds"></a>

```typescript
public readonly readinessInitialDelaySeconds: number;
```

- *Type:* number
- *Default:* 10

Number of seconds after container start before readiness probe is initiated.

---

##### `readinessPeriodSeconds`<sup>Optional</sup> <a name="readinessPeriodSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessPeriodSeconds"></a>

```typescript
public readonly readinessPeriodSeconds: number;
```

- *Type:* number
- *Default:* 10

How often (in seconds) to perform the readiness probe.

---

##### `readinessSuccessThreshold`<sup>Optional</sup> <a name="readinessSuccessThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessSuccessThreshold"></a>

```typescript
public readonly readinessSuccessThreshold: number;
```

- *Type:* number
- *Default:* 1

Minimum consecutive successes for the readiness probe to be considered successful.

---

##### `readinessTimeoutSeconds`<sup>Optional</sup> <a name="readinessTimeoutSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessTimeoutSeconds"></a>

```typescript
public readonly readinessTimeoutSeconds: number;
```

- *Type:* number
- *Default:* 15

Number of seconds after which the readiness probe times out.

---

##### `replicas`<sup>Optional</sup> <a name="replicas" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.replicas"></a>

```typescript
public readonly replicas: number;
```

- *Type:* number
- *Default:* 2

Number of pod replicas to run.

---

##### `requestCpu`<sup>Optional</sup> <a name="requestCpu" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestCpu"></a>

```typescript
public readonly requestCpu: string;
```

- *Type:* string
- *Default:* '200m'

CPU request for the container.

---

*Example*

```typescript
'200m' or '0.5'
```


##### `requestMemory`<sup>Optional</sup> <a name="requestMemory" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestMemory"></a>

```typescript
public readonly requestMemory: string;
```

- *Type:* string
- *Default:* '256Mi'

Memory request for the container.

---

*Example*

```typescript
'256Mi' or '512Mi'
```


##### `serviceAnnotations`<sup>Optional</sup> <a name="serviceAnnotations" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.serviceAnnotations"></a>

```typescript
public readonly serviceAnnotations: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no additional annotations

Annotations to add to the Service metadata.

Common for external-dns, load balancers, service mesh, etc.

---

*Example*

```typescript
{ 'external-dns.alpha.kubernetes.io/hostname': 'plone.example.com' }
```


### PloneHttpcacheOptions <a name="PloneHttpcacheOptions" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions"></a>

Configuration options for PloneHttpcache (Varnish caching layer).

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.Initializer"></a>

```typescript
import { PloneHttpcacheOptions } from '@bluedynamics/cdk8s-plone'

const ploneHttpcacheOptions: PloneHttpcacheOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.plone">plone</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.Plone">Plone</a></code> | The Plone construct to attach the HTTP cache to. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.existingSecret">existingSecret</a></code> | <code>string</code> | Name of an existing Kubernetes secret containing Varnish admin credentials. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitCpu">limitCpu</a></code> | <code>string</code> | CPU limit for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitMemory">limitMemory</a></code> | <code>string</code> | Memory limit for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.replicas">replicas</a></code> | <code>number</code> | Number of Varnish pod replicas to run. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestCpu">requestCpu</a></code> | <code>string</code> | CPU request for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestMemory">requestMemory</a></code> | <code>string</code> | Memory request for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.servicemonitor">servicemonitor</a></code> | <code>boolean</code> | Enable Prometheus ServiceMonitor for metrics collection. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVcl">varnishVcl</a></code> | <code>string</code> | Varnish VCL configuration as a string. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVclFile">varnishVclFile</a></code> | <code>string</code> | Path to a Varnish VCL configuration file. |

---

##### `plone`<sup>Required</sup> <a name="plone" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.plone"></a>

```typescript
public readonly plone: Plone;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.Plone">Plone</a>

The Plone construct to attach the HTTP cache to.

The cache will automatically connect to the backend and frontend services.

---

##### `existingSecret`<sup>Optional</sup> <a name="existingSecret" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.existingSecret"></a>

```typescript
public readonly existingSecret: string;
```

- *Type:* string
- *Default:* undefined (no existing secret)

Name of an existing Kubernetes secret containing Varnish admin credentials.

The secret should be created separately in the same namespace.

---

##### `limitCpu`<sup>Optional</sup> <a name="limitCpu" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitCpu"></a>

```typescript
public readonly limitCpu: string;
```

- *Type:* string
- *Default:* '500m'

CPU limit for Varnish pods.

---

##### `limitMemory`<sup>Optional</sup> <a name="limitMemory" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitMemory"></a>

```typescript
public readonly limitMemory: string;
```

- *Type:* string
- *Default:* '500Mi'

Memory limit for Varnish pods.

---

##### `replicas`<sup>Optional</sup> <a name="replicas" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.replicas"></a>

```typescript
public readonly replicas: number;
```

- *Type:* number
- *Default:* 2

Number of Varnish pod replicas to run.

---

##### `requestCpu`<sup>Optional</sup> <a name="requestCpu" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestCpu"></a>

```typescript
public readonly requestCpu: string;
```

- *Type:* string
- *Default:* '100m'

CPU request for Varnish pods.

---

##### `requestMemory`<sup>Optional</sup> <a name="requestMemory" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestMemory"></a>

```typescript
public readonly requestMemory: string;
```

- *Type:* string
- *Default:* '100Mi'

Memory request for Varnish pods.

---

##### `servicemonitor`<sup>Optional</sup> <a name="servicemonitor" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.servicemonitor"></a>

```typescript
public readonly servicemonitor: boolean;
```

- *Type:* boolean
- *Default:* false

Enable Prometheus ServiceMonitor for metrics collection.

Requires Prometheus Operator to be installed in the cluster.

---

##### `varnishVcl`<sup>Optional</sup> <a name="varnishVcl" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVcl"></a>

```typescript
public readonly varnishVcl: string;
```

- *Type:* string
- *Default:* loaded from varnishVclFile or default config file

Varnish VCL configuration as a string.

If provided, this takes precedence over varnishVclFile.

---

##### `varnishVclFile`<sup>Optional</sup> <a name="varnishVclFile" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVclFile"></a>

```typescript
public readonly varnishVclFile: string;
```

- *Type:* string
- *Default:* uses default config/varnish.tpl.vcl

Path to a Varnish VCL configuration file.

If not provided, uses the default VCL file included in the library.

---

### PloneOptions <a name="PloneOptions" id="@bluedynamics/cdk8s-plone.PloneOptions"></a>

Main configuration options for Plone deployment.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneOptions.Initializer"></a>

```typescript
import { PloneOptions } from '@bluedynamics/cdk8s-plone'

const ploneOptions: PloneOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.backend">backend</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a></code> | Backend (Plone API) configuration. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.frontend">frontend</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a></code> | Frontend (Volto) configuration. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.imagePullSecrets">imagePullSecrets</a></code> | <code>string[]</code> | Names of Kubernetes secrets to use for pulling private container images. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.siteId">siteId</a></code> | <code>string</code> | Plone site ID in the ZODB. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.variant">variant</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a></code> | Plone deployment variant to use. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.version">version</a></code> | <code>string</code> | Version string for labeling the deployment. |

---

##### `backend`<sup>Optional</sup> <a name="backend" id="@bluedynamics/cdk8s-plone.PloneOptions.property.backend"></a>

```typescript
public readonly backend: PloneBaseOptions;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a>
- *Default:* {} (uses default values from PloneBaseOptions)

Backend (Plone API) configuration.

---

##### `frontend`<sup>Optional</sup> <a name="frontend" id="@bluedynamics/cdk8s-plone.PloneOptions.property.frontend"></a>

```typescript
public readonly frontend: PloneBaseOptions;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a>
- *Default:* {} (uses default values from PloneBaseOptions)

Frontend (Volto) configuration.

Only used when variant is PloneVariant.VOLTO.

---

##### `imagePullSecrets`<sup>Optional</sup> <a name="imagePullSecrets" id="@bluedynamics/cdk8s-plone.PloneOptions.property.imagePullSecrets"></a>

```typescript
public readonly imagePullSecrets: string[];
```

- *Type:* string[]
- *Default:* [] (no image pull secrets)

Names of Kubernetes secrets to use for pulling private container images.

These secrets must exist in the same namespace as the deployment.

---

*Example*

```typescript
['my-registry-secret']
```


##### `siteId`<sup>Optional</sup> <a name="siteId" id="@bluedynamics/cdk8s-plone.PloneOptions.property.siteId"></a>

```typescript
public readonly siteId: string;
```

- *Type:* string
- *Default:* 'Plone'

Plone site ID in the ZODB.

This is used to construct the internal API path for Volto frontend.

---

##### `variant`<sup>Optional</sup> <a name="variant" id="@bluedynamics/cdk8s-plone.PloneOptions.property.variant"></a>

```typescript
public readonly variant: PloneVariant;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a>
- *Default:* PloneVariant.VOLTO

Plone deployment variant to use.

---

##### `version`<sup>Optional</sup> <a name="version" id="@bluedynamics/cdk8s-plone.PloneOptions.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string
- *Default:* 'undefined'

Version string for labeling the deployment.

This is used in Kubernetes labels and doesn't affect the actual image versions.

---



## Enums <a name="Enums" id="Enums"></a>

### PloneVariant <a name="PloneVariant" id="@bluedynamics/cdk8s-plone.PloneVariant"></a>

Plone deployment variants.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant.VOLTO">VOLTO</a></code> | Volto variant: ReactJS frontend (Volto) with REST API backend. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant.CLASSICUI">CLASSICUI</a></code> | Classic UI variant: Traditional Plone with server-side rendering. |

---

##### `VOLTO` <a name="VOLTO" id="@bluedynamics/cdk8s-plone.PloneVariant.VOLTO"></a>

Volto variant: ReactJS frontend (Volto) with REST API backend.

Deploys both frontend and backend services.

---


##### `CLASSICUI` <a name="CLASSICUI" id="@bluedynamics/cdk8s-plone.PloneVariant.CLASSICUI"></a>

Classic UI variant: Traditional Plone with server-side rendering.

Deploys only the backend service.

---

