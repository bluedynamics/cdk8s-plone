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
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="@bluedynamics/cdk8s-plone.Plone.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@bluedynamics/cdk8s-plone.Plone.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@bluedynamics/cdk8s-plone.Plone.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

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
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="@bluedynamics/cdk8s-plone.PloneHttpcache.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@bluedynamics/cdk8s-plone.PloneHttpcache.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@bluedynamics/cdk8s-plone.PloneHttpcache.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

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


### PloneVinylCache <a name="PloneVinylCache" id="@bluedynamics/cdk8s-plone.PloneVinylCache"></a>

PloneVinylCache construct for deploying Varnish Cache via cloud-vinyl operator.

Creates a VinylCache custom resource with Plone backend/frontend services
auto-configured as backends. The cloud-vinyl operator manages the full
Varnish lifecycle including VCL generation, agent delivery, and monitoring.

Requires the cloud-vinyl operator to be installed in the cluster.

*Example*

```typescript
const plone = new Plone(chart, 'plone');
const cache = new PloneVinylCache(chart, 'cache', {
  plone: plone,
  replicas: 2,
});
// Use cache.vinylCacheServiceName for IngressRoute
```


#### Initializers <a name="Initializers" id="@bluedynamics/cdk8s-plone.PloneVinylCache.Initializer"></a>

```typescript
import { PloneVinylCache } from '@bluedynamics/cdk8s-plone'

new PloneVinylCache(scope: Construct, id: string, options: PloneVinylCacheOptions)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.Initializer.parameter.options">options</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions">PloneVinylCacheOptions</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@bluedynamics/cdk8s-plone.PloneVinylCache.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@bluedynamics/cdk8s-plone.PloneVinylCache.Initializer.parameter.id"></a>

- *Type:* string

---

##### `options`<sup>Required</sup> <a name="options" id="@bluedynamics/cdk8s-plone.PloneVinylCache.Initializer.parameter.options"></a>

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions">PloneVinylCacheOptions</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="@bluedynamics/cdk8s-plone.PloneVinylCache.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@bluedynamics/cdk8s-plone.PloneVinylCache.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@bluedynamics/cdk8s-plone.PloneVinylCache.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@bluedynamics/cdk8s-plone.PloneVinylCache.isConstruct"></a>

```typescript
import { PloneVinylCache } from '@bluedynamics/cdk8s-plone'

PloneVinylCache.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@bluedynamics/cdk8s-plone.PloneVinylCache.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCache.property.vinylCacheServiceName">vinylCacheServiceName</a></code> | <code>string</code> | Name of the VinylCache service created by the operator. |

---

##### `node`<sup>Required</sup> <a name="node" id="@bluedynamics/cdk8s-plone.PloneVinylCache.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `vinylCacheServiceName`<sup>Required</sup> <a name="vinylCacheServiceName" id="@bluedynamics/cdk8s-plone.PloneVinylCache.property.vinylCacheServiceName"></a>

```typescript
public readonly vinylCacheServiceName: string;
```

- *Type:* string

Name of the VinylCache service created by the operator.

Use this to reference the cache service from ingress or other constructs.

---


## Structs <a name="Structs" id="Structs"></a>

### HttpcacheEnvVar <a name="HttpcacheEnvVar" id="@bluedynamics/cdk8s-plone.HttpcacheEnvVar"></a>

An environment variable to pass to the kube-httpcache container.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.HttpcacheEnvVar.Initializer"></a>

```typescript
import { HttpcacheEnvVar } from '@bluedynamics/cdk8s-plone'

const httpcacheEnvVar: HttpcacheEnvVar = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheEnvVar.property.name">name</a></code> | <code>string</code> | The name of the environment variable. |
| <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheEnvVar.property.value">value</a></code> | <code>string</code> | The value of the environment variable. |

---

##### `name`<sup>Required</sup> <a name="name" id="@bluedynamics/cdk8s-plone.HttpcacheEnvVar.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the environment variable.

---

##### `value`<sup>Required</sup> <a name="value" id="@bluedynamics/cdk8s-plone.HttpcacheEnvVar.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* string

The value of the environment variable.

---

### HttpcacheToleration <a name="HttpcacheToleration" id="@bluedynamics/cdk8s-plone.HttpcacheToleration"></a>

A Kubernetes toleration for the Varnish pods.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.HttpcacheToleration.Initializer"></a>

```typescript
import { HttpcacheToleration } from '@bluedynamics/cdk8s-plone'

const httpcacheToleration: HttpcacheToleration = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheToleration.property.key">key</a></code> | <code>string</code> | The taint key to tolerate. |
| <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheToleration.property.effect">effect</a></code> | <code>string</code> | The taint effect to tolerate (NoSchedule, PreferNoSchedule, NoExecute). |
| <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheToleration.property.operator">operator</a></code> | <code>string</code> | The operator (Equal or Exists). |
| <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheToleration.property.value">value</a></code> | <code>string</code> | The taint value to match (when operator is Equal). |

---

##### `key`<sup>Required</sup> <a name="key" id="@bluedynamics/cdk8s-plone.HttpcacheToleration.property.key"></a>

```typescript
public readonly key: string;
```

- *Type:* string

The taint key to tolerate.

---

##### `effect`<sup>Optional</sup> <a name="effect" id="@bluedynamics/cdk8s-plone.HttpcacheToleration.property.effect"></a>

```typescript
public readonly effect: string;
```

- *Type:* string
- *Default:* tolerate all effects

The taint effect to tolerate (NoSchedule, PreferNoSchedule, NoExecute).

---

##### `operator`<sup>Optional</sup> <a name="operator" id="@bluedynamics/cdk8s-plone.HttpcacheToleration.property.operator"></a>

```typescript
public readonly operator: string;
```

- *Type:* string
- *Default:* 'Equal'

The operator (Equal or Exists).

---

##### `value`<sup>Optional</sup> <a name="value" id="@bluedynamics/cdk8s-plone.HttpcacheToleration.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* string
- *Default:* no value

The taint value to match (when operator is Equal).

---

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
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.metricsPath">metricsPath</a></code> | <code>string</code> | Path to scrape metrics from. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.metricsPort">metricsPort</a></code> | <code>string \| number</code> | Port name or number to scrape metrics from. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.minAvailable">minAvailable</a></code> | <code>string \| number</code> | Minimum number of pods that must be available during updates. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.nodeSelector">nodeSelector</a></code> | <code>{[ key: string ]: string}</code> | Node selector labels for pod scheduling. |
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
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.securityContext">securityContext</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext">PloneSecurityContext</a></code> | Security context for the container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.serviceAnnotations">serviceAnnotations</a></code> | <code>{[ key: string ]: string}</code> | Annotations to add to the Service metadata. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.servicemonitor">servicemonitor</a></code> | <code>boolean</code> | Enable Prometheus ServiceMonitor for metrics collection. |

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

##### `metricsPath`<sup>Optional</sup> <a name="metricsPath" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.metricsPath"></a>

```typescript
public readonly metricsPath: string;
```

- *Type:* string
- *Default:* '/metrics'

Path to scrape metrics from.

Only used when servicemonitor is enabled.

---

##### `metricsPort`<sup>Optional</sup> <a name="metricsPort" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.metricsPort"></a>

```typescript
public readonly metricsPort: string | number;
```

- *Type:* string | number
- *Default:* uses the main service port

Port name or number to scrape metrics from.

Only used when servicemonitor is enabled.

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

##### `nodeSelector`<sup>Optional</sup> <a name="nodeSelector" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.nodeSelector"></a>

```typescript
public readonly nodeSelector: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no node selector

Node selector labels for pod scheduling.

Use to constrain pods to nodes with matching labels, e.g. for region affinity.

---

*Example*

```typescript
{ 'topology.kubernetes.io/region': 'fsn1' }
```


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


##### `securityContext`<sup>Optional</sup> <a name="securityContext" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.securityContext"></a>

```typescript
public readonly securityContext: PloneSecurityContext;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext">PloneSecurityContext</a>
- *Default:* no security context

Security context for the container.

Use to set capabilities, run as non-root, read-only filesystem, etc.

---

*Example*

```typescript
{ capabilities: { add: ['SYS_PTRACE'] } }
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


##### `servicemonitor`<sup>Optional</sup> <a name="servicemonitor" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.servicemonitor"></a>

```typescript
public readonly servicemonitor: boolean;
```

- *Type:* boolean
- *Default:* false

Enable Prometheus ServiceMonitor for metrics collection.

Requires Prometheus Operator to be installed in the cluster.
When enabled, a ServiceMonitor resource will be created to scrape metrics.

---

### PloneCapabilities <a name="PloneCapabilities" id="@bluedynamics/cdk8s-plone.PloneCapabilities"></a>

Linux capabilities to add or drop on a container.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneCapabilities.Initializer"></a>

```typescript
import { PloneCapabilities } from '@bluedynamics/cdk8s-plone'

const ploneCapabilities: PloneCapabilities = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneCapabilities.property.add">add</a></code> | <code>string[]</code> | Capabilities to add (e.g. 'SYS_PTRACE', 'NET_ADMIN'). |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneCapabilities.property.drop">drop</a></code> | <code>string[]</code> | Capabilities to drop (e.g. 'ALL', 'NET_RAW'). |

---

##### `add`<sup>Optional</sup> <a name="add" id="@bluedynamics/cdk8s-plone.PloneCapabilities.property.add"></a>

```typescript
public readonly add: string[];
```

- *Type:* string[]
- *Default:* no capabilities added

Capabilities to add (e.g. 'SYS_PTRACE', 'NET_ADMIN').

---

##### `drop`<sup>Optional</sup> <a name="drop" id="@bluedynamics/cdk8s-plone.PloneCapabilities.property.drop"></a>

```typescript
public readonly drop: string[];
```

- *Type:* string[]
- *Default:* no capabilities dropped

Capabilities to drop (e.g. 'ALL', 'NET_RAW').

---

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
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.appVersion">appVersion</a></code> | <code>string</code> | Version of the kube-httpcache Container Image to use. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.chartVersion">chartVersion</a></code> | <code>string</code> | Version of the kube-httpcache Helm chart to use. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.existingSecret">existingSecret</a></code> | <code>string</code> | Name of an existing Kubernetes secret containing Varnish admin credentials. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.exporterEnabled">exporterEnabled</a></code> | <code>boolean</code> | Enable the Prometheus exporter for Varnish metrics. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.extraEnvVars">extraEnvVars</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheEnvVar">HttpcacheEnvVar</a>[]</code> | Additional environment variables to pass to the kube-httpcache container. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitCpu">limitCpu</a></code> | <code>string</code> | CPU limit for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitMemory">limitMemory</a></code> | <code>string</code> | Memory limit for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.replicas">replicas</a></code> | <code>number</code> | Number of Varnish pod replicas to run. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestCpu">requestCpu</a></code> | <code>string</code> | CPU request for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestMemory">requestMemory</a></code> | <code>string</code> | Memory request for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.servicemonitor">servicemonitor</a></code> | <code>boolean</code> | Enable Prometheus ServiceMonitor for metrics collection. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.tolerations">tolerations</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.HttpcacheToleration">HttpcacheToleration</a>[]</code> | Tolerations for the Varnish pods. |
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

##### `appVersion`<sup>Optional</sup> <a name="appVersion" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.appVersion"></a>

```typescript
public readonly appVersion: string;
```

- *Type:* string
- *Default:* undefined (chartVersion = with each chart release there is an image release too )

Version of the kube-httpcache Container Image to use.

If not specified, the latest version from the repository will be used.

---

##### `chartVersion`<sup>Optional</sup> <a name="chartVersion" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.chartVersion"></a>

```typescript
public readonly chartVersion: string;
```

- *Type:* string
- *Default:* undefined (latest)

Version of the kube-httpcache Helm chart to use.

If not specified, the latest version from the repository will be used.

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

##### `exporterEnabled`<sup>Optional</sup> <a name="exporterEnabled" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.exporterEnabled"></a>

```typescript
public readonly exporterEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable the Prometheus exporter for Varnish metrics.

When enabled, the exporter sidecar container will be deployed alongside Varnish.

---

##### `extraEnvVars`<sup>Optional</sup> <a name="extraEnvVars" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.extraEnvVars"></a>

```typescript
public readonly extraEnvVars: HttpcacheEnvVar[];
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.HttpcacheEnvVar">HttpcacheEnvVar</a>[]
- *Default:* no additional env vars

Additional environment variables to pass to the kube-httpcache container.

These are appended to the built-in env vars (BACKEND_SERVICE_NAME, etc.)
and can be referenced in VCL templates using Go template syntax: {{ .Env.VAR_NAME }}

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

##### `tolerations`<sup>Optional</sup> <a name="tolerations" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.tolerations"></a>

```typescript
public readonly tolerations: HttpcacheToleration[];
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.HttpcacheToleration">HttpcacheToleration</a>[]
- *Default:* no tolerations

Tolerations for the Varnish pods.

Use this to allow scheduling on nodes with specific taints,
e.g. nodes tainted with kubernetes.io/arch=amd64:NoSchedule.

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

### PloneSecurityContext <a name="PloneSecurityContext" id="@bluedynamics/cdk8s-plone.PloneSecurityContext"></a>

Security context for a Plone container.

Controls privilege and access settings.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.Initializer"></a>

```typescript
import { PloneSecurityContext } from '@bluedynamics/cdk8s-plone'

const ploneSecurityContext: PloneSecurityContext = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext.property.allowPrivilegeEscalation">allowPrivilegeEscalation</a></code> | <code>boolean</code> | Allow privilege escalation for the container process. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext.property.capabilities">capabilities</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneCapabilities">PloneCapabilities</a></code> | Linux capabilities to add or drop. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext.property.privileged">privileged</a></code> | <code>boolean</code> | Run the container in privileged mode. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext.property.readOnlyRootFilesystem">readOnlyRootFilesystem</a></code> | <code>boolean</code> | Mount the root filesystem as read-only. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext.property.runAsGroup">runAsGroup</a></code> | <code>number</code> | Run the container as a specific group ID. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext.property.runAsNonRoot">runAsNonRoot</a></code> | <code>boolean</code> | Require the container to run as non-root. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneSecurityContext.property.runAsUser">runAsUser</a></code> | <code>number</code> | Run the container as a specific user ID. |

---

##### `allowPrivilegeEscalation`<sup>Optional</sup> <a name="allowPrivilegeEscalation" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.property.allowPrivilegeEscalation"></a>

```typescript
public readonly allowPrivilegeEscalation: boolean;
```

- *Type:* boolean
- *Default:* undefined

Allow privilege escalation for the container process.

---

##### `capabilities`<sup>Optional</sup> <a name="capabilities" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.property.capabilities"></a>

```typescript
public readonly capabilities: PloneCapabilities;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneCapabilities">PloneCapabilities</a>
- *Default:* no capability changes

Linux capabilities to add or drop.

---

*Example*

```typescript
{ add: ['SYS_PTRACE'] }
```


##### `privileged`<sup>Optional</sup> <a name="privileged" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.property.privileged"></a>

```typescript
public readonly privileged: boolean;
```

- *Type:* boolean
- *Default:* undefined

Run the container in privileged mode.

---

##### `readOnlyRootFilesystem`<sup>Optional</sup> <a name="readOnlyRootFilesystem" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.property.readOnlyRootFilesystem"></a>

```typescript
public readonly readOnlyRootFilesystem: boolean;
```

- *Type:* boolean
- *Default:* undefined

Mount the root filesystem as read-only.

---

##### `runAsGroup`<sup>Optional</sup> <a name="runAsGroup" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.property.runAsGroup"></a>

```typescript
public readonly runAsGroup: number;
```

- *Type:* number
- *Default:* container default

Run the container as a specific group ID.

---

##### `runAsNonRoot`<sup>Optional</sup> <a name="runAsNonRoot" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.property.runAsNonRoot"></a>

```typescript
public readonly runAsNonRoot: boolean;
```

- *Type:* boolean
- *Default:* undefined

Require the container to run as non-root.

---

##### `runAsUser`<sup>Optional</sup> <a name="runAsUser" id="@bluedynamics/cdk8s-plone.PloneSecurityContext.property.runAsUser"></a>

```typescript
public readonly runAsUser: number;
```

- *Type:* number
- *Default:* container default

Run the container as a specific user ID.

---

### PloneVinylCacheOptions <a name="PloneVinylCacheOptions" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions"></a>

Configuration options for PloneVinylCache (cloud-vinyl operator).

Creates a VinylCache custom resource that the cloud-vinyl operator
reconciles into a Varnish Cache cluster with agent-based VCL delivery.

Requires the cloud-vinyl operator to be installed in the cluster.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.Initializer"></a>

```typescript
import { PloneVinylCacheOptions } from '@bluedynamics/cdk8s-plone'

const ploneVinylCacheOptions: PloneVinylCacheOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.plone">plone</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.Plone">Plone</a></code> | The Plone construct to attach the cache to. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.director">director</a></code> | <code>string</code> | Director type for load distribution. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.extraBackends">extraBackends</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackend">VinylCacheBackend</a>[]</code> | Additional backends to add after the auto-generated Plone backends. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.image">image</a></code> | <code>string</code> | Container image for the Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.invalidation">invalidation</a></code> | <code>boolean</code> | Enable cache invalidation (PURGE, BAN, xkey). |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.limitCpu">limitCpu</a></code> | <code>string</code> | CPU limit for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.limitMemory">limitMemory</a></code> | <code>string</code> | Memory limit for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.monitoring">monitoring</a></code> | <code>boolean</code> | Enable Prometheus monitoring (metrics + ServiceMonitor). |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.nodeSelector">nodeSelector</a></code> | <code>{[ key: string ]: string}</code> | Node selector labels for the Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.replicas">replicas</a></code> | <code>number</code> | Number of Varnish pod replicas. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.requestCpu">requestCpu</a></code> | <code>string</code> | CPU request for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.requestMemory">requestMemory</a></code> | <code>string</code> | Memory request for Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.tolerations">tolerations</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheToleration">VinylCacheToleration</a>[]</code> | Tolerations for the Varnish pods. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclBackendErrorSnippet">vclBackendErrorSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_backend_error subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclBackendFetchSnippet">vclBackendFetchSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_backend_fetch subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclBackendResponseSnippet">vclBackendResponseSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_backend_response subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclDeliverSnippet">vclDeliverSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_deliver subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclFiniSnippet">vclFiniSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_fini subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclHashSnippet">vclHashSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_hash subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclHitSnippet">vclHitSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_hit subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclInitSnippet">vclInitSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_init subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclMissSnippet">vclMissSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_miss subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclPassSnippet">vclPassSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_pass subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclPipeSnippet">vclPipeSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_pipe subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclPurgeSnippet">vclPurgeSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_purge subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclRecvSnippet">vclRecvSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_recv subroutine. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclSynthSnippet">vclSynthSnippet</a></code> | <code>string</code> | Custom VCL snippet for vcl_synth subroutine. |

---

##### `plone`<sup>Required</sup> <a name="plone" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.plone"></a>

```typescript
public readonly plone: Plone;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.Plone">Plone</a>

The Plone construct to attach the cache to.

Backends are auto-configured from the Plone services.

---

##### `director`<sup>Optional</sup> <a name="director" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.director"></a>

```typescript
public readonly director: string;
```

- *Type:* string
- *Default:* 'shard'

Director type for load distribution.

---

##### `extraBackends`<sup>Optional</sup> <a name="extraBackends" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.extraBackends"></a>

```typescript
public readonly extraBackends: VinylCacheBackend[];
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.VinylCacheBackend">VinylCacheBackend</a>[]
- *Default:* no extra backends

Additional backends to add after the auto-generated Plone backends.

Uses the same backend type structure as the VinylCache CRD.

---

##### `image`<sup>Optional</sup> <a name="image" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.image"></a>

```typescript
public readonly image: string;
```

- *Type:* string
- *Default:* 'varnish:7.6'

Container image for the Varnish pods.

---

##### `invalidation`<sup>Optional</sup> <a name="invalidation" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.invalidation"></a>

```typescript
public readonly invalidation: boolean;
```

- *Type:* boolean
- *Default:* true

Enable cache invalidation (PURGE, BAN, xkey).

---

##### `limitCpu`<sup>Optional</sup> <a name="limitCpu" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.limitCpu"></a>

```typescript
public readonly limitCpu: string;
```

- *Type:* string
- *Default:* '500m'

CPU limit for Varnish pods.

---

##### `limitMemory`<sup>Optional</sup> <a name="limitMemory" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.limitMemory"></a>

```typescript
public readonly limitMemory: string;
```

- *Type:* string
- *Default:* '512Mi'

Memory limit for Varnish pods.

---

##### `monitoring`<sup>Optional</sup> <a name="monitoring" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.monitoring"></a>

```typescript
public readonly monitoring: boolean;
```

- *Type:* boolean
- *Default:* false

Enable Prometheus monitoring (metrics + ServiceMonitor).

---

##### `nodeSelector`<sup>Optional</sup> <a name="nodeSelector" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.nodeSelector"></a>

```typescript
public readonly nodeSelector: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no node selector

Node selector labels for the Varnish pods.

Constrains pods to nodes matching all specified labels.

---

##### `replicas`<sup>Optional</sup> <a name="replicas" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.replicas"></a>

```typescript
public readonly replicas: number;
```

- *Type:* number
- *Default:* 2

Number of Varnish pod replicas.

---

##### `requestCpu`<sup>Optional</sup> <a name="requestCpu" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.requestCpu"></a>

```typescript
public readonly requestCpu: string;
```

- *Type:* string
- *Default:* '100m'

CPU request for Varnish pods.

---

##### `requestMemory`<sup>Optional</sup> <a name="requestMemory" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.requestMemory"></a>

```typescript
public readonly requestMemory: string;
```

- *Type:* string
- *Default:* '256Mi'

Memory request for Varnish pods.

---

##### `tolerations`<sup>Optional</sup> <a name="tolerations" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.tolerations"></a>

```typescript
public readonly tolerations: VinylCacheToleration[];
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.VinylCacheToleration">VinylCacheToleration</a>[]
- *Default:* no tolerations

Tolerations for the Varnish pods.

---

##### `vclBackendErrorSnippet`<sup>Optional</sup> <a name="vclBackendErrorSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclBackendErrorSnippet"></a>

```typescript
public readonly vclBackendErrorSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_backend_error subroutine.

---

##### `vclBackendFetchSnippet`<sup>Optional</sup> <a name="vclBackendFetchSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclBackendFetchSnippet"></a>

```typescript
public readonly vclBackendFetchSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_backend_fetch subroutine.

---

##### `vclBackendResponseSnippet`<sup>Optional</sup> <a name="vclBackendResponseSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclBackendResponseSnippet"></a>

```typescript
public readonly vclBackendResponseSnippet: string;
```

- *Type:* string
- *Default:* uses built-in plone-vinyl-backend-response.vcl

Custom VCL snippet for vcl_backend_response subroutine.

Replaces the default Plone backend_response snippet.

---

##### `vclDeliverSnippet`<sup>Optional</sup> <a name="vclDeliverSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclDeliverSnippet"></a>

```typescript
public readonly vclDeliverSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_deliver subroutine.

---

##### `vclFiniSnippet`<sup>Optional</sup> <a name="vclFiniSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclFiniSnippet"></a>

```typescript
public readonly vclFiniSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_fini subroutine.

---

##### `vclHashSnippet`<sup>Optional</sup> <a name="vclHashSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclHashSnippet"></a>

```typescript
public readonly vclHashSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_hash subroutine.

---

##### `vclHitSnippet`<sup>Optional</sup> <a name="vclHitSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclHitSnippet"></a>

```typescript
public readonly vclHitSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_hit subroutine.

---

##### `vclInitSnippet`<sup>Optional</sup> <a name="vclInitSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclInitSnippet"></a>

```typescript
public readonly vclInitSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_init subroutine.

---

##### `vclMissSnippet`<sup>Optional</sup> <a name="vclMissSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclMissSnippet"></a>

```typescript
public readonly vclMissSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_miss subroutine.

---

##### `vclPassSnippet`<sup>Optional</sup> <a name="vclPassSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclPassSnippet"></a>

```typescript
public readonly vclPassSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_pass subroutine.

---

##### `vclPipeSnippet`<sup>Optional</sup> <a name="vclPipeSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclPipeSnippet"></a>

```typescript
public readonly vclPipeSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_pipe subroutine.

---

##### `vclPurgeSnippet`<sup>Optional</sup> <a name="vclPurgeSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclPurgeSnippet"></a>

```typescript
public readonly vclPurgeSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_purge subroutine.

---

##### `vclRecvSnippet`<sup>Optional</sup> <a name="vclRecvSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclRecvSnippet"></a>

```typescript
public readonly vclRecvSnippet: string;
```

- *Type:* string
- *Default:* uses built-in plone-vinyl-recv.vcl

Custom VCL snippet for vcl_recv subroutine.

Replaces the default Plone recv snippet.

---

##### `vclSynthSnippet`<sup>Optional</sup> <a name="vclSynthSnippet" id="@bluedynamics/cdk8s-plone.PloneVinylCacheOptions.property.vclSynthSnippet"></a>

```typescript
public readonly vclSynthSnippet: string;
```

- *Type:* string
- *Default:* no snippet

Custom VCL snippet for vcl_synth subroutine.

---

### VinylCacheBackend <a name="VinylCacheBackend" id="@bluedynamics/cdk8s-plone.VinylCacheBackend"></a>

An additional backend for the VinylCache.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.VinylCacheBackend.Initializer"></a>

```typescript
import { VinylCacheBackend } from '@bluedynamics/cdk8s-plone'

const vinylCacheBackend: VinylCacheBackend = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackend.property.name">name</a></code> | <code>string</code> | VCL identifier for this backend. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackend.property.port">port</a></code> | <code>number</code> | Port to use for this backend. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackend.property.serviceName">serviceName</a></code> | <code>string</code> | Kubernetes Service name to use as backend. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackend.property.probe">probe</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe">VinylCacheBackendProbe</a></code> | Health probe configuration. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackend.property.weight">weight</a></code> | <code>number</code> | Relative weight for the director. |

---

##### `name`<sup>Required</sup> <a name="name" id="@bluedynamics/cdk8s-plone.VinylCacheBackend.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

VCL identifier for this backend.

Must match ^[a-zA-Z][a-zA-Z0-9_]*$.

---

##### `port`<sup>Required</sup> <a name="port" id="@bluedynamics/cdk8s-plone.VinylCacheBackend.property.port"></a>

```typescript
public readonly port: number;
```

- *Type:* number

Port to use for this backend.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="@bluedynamics/cdk8s-plone.VinylCacheBackend.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

Kubernetes Service name to use as backend.

---

##### `probe`<sup>Optional</sup> <a name="probe" id="@bluedynamics/cdk8s-plone.VinylCacheBackend.property.probe"></a>

```typescript
public readonly probe: VinylCacheBackendProbe;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe">VinylCacheBackendProbe</a>
- *Default:* no probe

Health probe configuration.

---

##### `weight`<sup>Optional</sup> <a name="weight" id="@bluedynamics/cdk8s-plone.VinylCacheBackend.property.weight"></a>

```typescript
public readonly weight: number;
```

- *Type:* number
- *Default:* operator default

Relative weight for the director.

0 means standby.

---

### VinylCacheBackendProbe <a name="VinylCacheBackendProbe" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe"></a>

Health probe configuration for a VinylCache backend.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.Initializer"></a>

```typescript
import { VinylCacheBackendProbe } from '@bluedynamics/cdk8s-plone'

const vinylCacheBackendProbe: VinylCacheBackendProbe = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.expectedResponse">expectedResponse</a></code> | <code>number</code> | Expected HTTP response status code. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.interval">interval</a></code> | <code>string</code> | How often to probe the backend. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.threshold">threshold</a></code> | <code>number</code> | Minimum successful probes within window for healthy status. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.timeout">timeout</a></code> | <code>string</code> | Maximum time to wait for a probe response. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.url">url</a></code> | <code>string</code> | URL to probe. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.window">window</a></code> | <code>number</code> | Number of most recent probes to consider. |

---

##### `expectedResponse`<sup>Optional</sup> <a name="expectedResponse" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.expectedResponse"></a>

```typescript
public readonly expectedResponse: number;
```

- *Type:* number
- *Default:* 200

Expected HTTP response status code.

---

##### `interval`<sup>Optional</sup> <a name="interval" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.interval"></a>

```typescript
public readonly interval: string;
```

- *Type:* string
- *Default:* '5s'

How often to probe the backend.

---

##### `threshold`<sup>Optional</sup> <a name="threshold" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.threshold"></a>

```typescript
public readonly threshold: number;
```

- *Type:* number
- *Default:* 8

Minimum successful probes within window for healthy status.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.timeout"></a>

```typescript
public readonly timeout: string;
```

- *Type:* string
- *Default:* '2s'

Maximum time to wait for a probe response.

---

##### `url`<sup>Optional</sup> <a name="url" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.url"></a>

```typescript
public readonly url: string;
```

- *Type:* string
- *Default:* '/'

URL to probe.

---

##### `window`<sup>Optional</sup> <a name="window" id="@bluedynamics/cdk8s-plone.VinylCacheBackendProbe.property.window"></a>

```typescript
public readonly window: number;
```

- *Type:* number
- *Default:* 10

Number of most recent probes to consider.

---

### VinylCacheToleration <a name="VinylCacheToleration" id="@bluedynamics/cdk8s-plone.VinylCacheToleration"></a>

A Kubernetes toleration for the Varnish pods.

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.VinylCacheToleration.Initializer"></a>

```typescript
import { VinylCacheToleration } from '@bluedynamics/cdk8s-plone'

const vinylCacheToleration: VinylCacheToleration = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheToleration.property.key">key</a></code> | <code>string</code> | The taint key to tolerate. |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheToleration.property.effect">effect</a></code> | <code>string</code> | The taint effect to tolerate (NoSchedule, PreferNoSchedule, NoExecute). |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheToleration.property.operator">operator</a></code> | <code>string</code> | The operator (Equal or Exists). |
| <code><a href="#@bluedynamics/cdk8s-plone.VinylCacheToleration.property.value">value</a></code> | <code>string</code> | The taint value to match (when operator is Equal). |

---

##### `key`<sup>Required</sup> <a name="key" id="@bluedynamics/cdk8s-plone.VinylCacheToleration.property.key"></a>

```typescript
public readonly key: string;
```

- *Type:* string

The taint key to tolerate.

---

##### `effect`<sup>Optional</sup> <a name="effect" id="@bluedynamics/cdk8s-plone.VinylCacheToleration.property.effect"></a>

```typescript
public readonly effect: string;
```

- *Type:* string
- *Default:* tolerate all effects

The taint effect to tolerate (NoSchedule, PreferNoSchedule, NoExecute).

---

##### `operator`<sup>Optional</sup> <a name="operator" id="@bluedynamics/cdk8s-plone.VinylCacheToleration.property.operator"></a>

```typescript
public readonly operator: string;
```

- *Type:* string
- *Default:* 'Equal'

The operator (Equal or Exists).

---

##### `value`<sup>Optional</sup> <a name="value" id="@bluedynamics/cdk8s-plone.VinylCacheToleration.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* string
- *Default:* no value

The taint value to match (when operator is Equal).

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

