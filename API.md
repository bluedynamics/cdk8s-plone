# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Plone <a name="Plone" id="@bluedynamics/cdk8s-plone.Plone"></a>

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
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.backendServiceName">backendServiceName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.siteId">siteId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.variant">variant</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a></code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.Plone.property.frontendServiceName">frontendServiceName</a></code> | <code>string</code> | *No description.* |

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

---

##### `siteId`<sup>Required</sup> <a name="siteId" id="@bluedynamics/cdk8s-plone.Plone.property.siteId"></a>

```typescript
public readonly siteId: string;
```

- *Type:* string

---

##### `variant`<sup>Required</sup> <a name="variant" id="@bluedynamics/cdk8s-plone.Plone.property.variant"></a>

```typescript
public readonly variant: PloneVariant;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a>

---

##### `frontendServiceName`<sup>Optional</sup> <a name="frontendServiceName" id="@bluedynamics/cdk8s-plone.Plone.property.frontendServiceName"></a>

```typescript
public readonly frontendServiceName: string;
```

- *Type:* string

---


### PloneHttpcache <a name="PloneHttpcache" id="@bluedynamics/cdk8s-plone.PloneHttpcache"></a>

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
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcache.property.httpcacheServiceName">httpcacheServiceName</a></code> | <code>string</code> | *No description.* |

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

---


## Structs <a name="Structs" id="Structs"></a>

### PloneBaseOptions <a name="PloneBaseOptions" id="@bluedynamics/cdk8s-plone.PloneBaseOptions"></a>

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.Initializer"></a>

```typescript
import { PloneBaseOptions } from '@bluedynamics/cdk8s-plone'

const ploneBaseOptions: PloneBaseOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.environment">environment</a></code> | <code>cdk8s-plus-30.Env</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.image">image</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.imagePullPolicy">imagePullPolicy</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitCpu">limitCpu</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitMemory">limitMemory</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessEnabled">livenessEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessFailureThreshold">livenessFailureThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessIimeoutSeconds">livenessIimeoutSeconds</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessInitialDelaySeconds">livenessInitialDelaySeconds</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessPeriodSeconds">livenessPeriodSeconds</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessSuccessThreshold">livenessSuccessThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.maxUnavailable">maxUnavailable</a></code> | <code>string \| number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.minAvailable">minAvailable</a></code> | <code>string \| number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessEnabled">readinessEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessFailureThreshold">readinessFailureThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessIimeoutSeconds">readinessIimeoutSeconds</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessInitialDelaySeconds">readinessInitialDelaySeconds</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessPeriodSeconds">readinessPeriodSeconds</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessSuccessThreshold">readinessSuccessThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.replicas">replicas</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestCpu">requestCpu</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestMemory">requestMemory</a></code> | <code>string</code> | *No description.* |

---

##### `environment`<sup>Optional</sup> <a name="environment" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.environment"></a>

```typescript
public readonly environment: Env;
```

- *Type:* cdk8s-plus-30.Env

---

##### `image`<sup>Optional</sup> <a name="image" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.image"></a>

```typescript
public readonly image: string;
```

- *Type:* string

---

##### `imagePullPolicy`<sup>Optional</sup> <a name="imagePullPolicy" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.imagePullPolicy"></a>

```typescript
public readonly imagePullPolicy: string;
```

- *Type:* string

---

##### `limitCpu`<sup>Optional</sup> <a name="limitCpu" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitCpu"></a>

```typescript
public readonly limitCpu: string;
```

- *Type:* string

---

##### `limitMemory`<sup>Optional</sup> <a name="limitMemory" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.limitMemory"></a>

```typescript
public readonly limitMemory: string;
```

- *Type:* string

---

##### `livenessEnabled`<sup>Optional</sup> <a name="livenessEnabled" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessEnabled"></a>

```typescript
public readonly livenessEnabled: boolean;
```

- *Type:* boolean

---

##### `livenessFailureThreshold`<sup>Optional</sup> <a name="livenessFailureThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessFailureThreshold"></a>

```typescript
public readonly livenessFailureThreshold: number;
```

- *Type:* number

---

##### `livenessIimeoutSeconds`<sup>Optional</sup> <a name="livenessIimeoutSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessIimeoutSeconds"></a>

```typescript
public readonly livenessIimeoutSeconds: number;
```

- *Type:* number

---

##### `livenessInitialDelaySeconds`<sup>Optional</sup> <a name="livenessInitialDelaySeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessInitialDelaySeconds"></a>

```typescript
public readonly livenessInitialDelaySeconds: number;
```

- *Type:* number

---

##### `livenessPeriodSeconds`<sup>Optional</sup> <a name="livenessPeriodSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessPeriodSeconds"></a>

```typescript
public readonly livenessPeriodSeconds: number;
```

- *Type:* number

---

##### `livenessSuccessThreshold`<sup>Optional</sup> <a name="livenessSuccessThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.livenessSuccessThreshold"></a>

```typescript
public readonly livenessSuccessThreshold: number;
```

- *Type:* number

---

##### `maxUnavailable`<sup>Optional</sup> <a name="maxUnavailable" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.maxUnavailable"></a>

```typescript
public readonly maxUnavailable: string | number;
```

- *Type:* string | number

---

##### `minAvailable`<sup>Optional</sup> <a name="minAvailable" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.minAvailable"></a>

```typescript
public readonly minAvailable: string | number;
```

- *Type:* string | number

---

##### `readinessEnabled`<sup>Optional</sup> <a name="readinessEnabled" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessEnabled"></a>

```typescript
public readonly readinessEnabled: boolean;
```

- *Type:* boolean

---

##### `readinessFailureThreshold`<sup>Optional</sup> <a name="readinessFailureThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessFailureThreshold"></a>

```typescript
public readonly readinessFailureThreshold: number;
```

- *Type:* number

---

##### `readinessIimeoutSeconds`<sup>Optional</sup> <a name="readinessIimeoutSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessIimeoutSeconds"></a>

```typescript
public readonly readinessIimeoutSeconds: number;
```

- *Type:* number

---

##### `readinessInitialDelaySeconds`<sup>Optional</sup> <a name="readinessInitialDelaySeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessInitialDelaySeconds"></a>

```typescript
public readonly readinessInitialDelaySeconds: number;
```

- *Type:* number

---

##### `readinessPeriodSeconds`<sup>Optional</sup> <a name="readinessPeriodSeconds" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessPeriodSeconds"></a>

```typescript
public readonly readinessPeriodSeconds: number;
```

- *Type:* number

---

##### `readinessSuccessThreshold`<sup>Optional</sup> <a name="readinessSuccessThreshold" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.readinessSuccessThreshold"></a>

```typescript
public readonly readinessSuccessThreshold: number;
```

- *Type:* number

---

##### `replicas`<sup>Optional</sup> <a name="replicas" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.replicas"></a>

```typescript
public readonly replicas: number;
```

- *Type:* number

---

##### `requestCpu`<sup>Optional</sup> <a name="requestCpu" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestCpu"></a>

```typescript
public readonly requestCpu: string;
```

- *Type:* string

---

##### `requestMemory`<sup>Optional</sup> <a name="requestMemory" id="@bluedynamics/cdk8s-plone.PloneBaseOptions.property.requestMemory"></a>

```typescript
public readonly requestMemory: string;
```

- *Type:* string

---

### PloneHttpcacheOptions <a name="PloneHttpcacheOptions" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions"></a>

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.Initializer"></a>

```typescript
import { PloneHttpcacheOptions } from '@bluedynamics/cdk8s-plone'

const ploneHttpcacheOptions: PloneHttpcacheOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.plone">plone</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.Plone">Plone</a></code> | plone chart. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.existingSecret">existingSecret</a></code> | <code>string</code> | existingSecret - Read admin credentials from user provided secret. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitCpu">limitCpu</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitMemory">limitMemory</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestCpu">requestCpu</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestMemory">requestMemory</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.servicemonitor">servicemonitor</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVcl">varnishVcl</a></code> | <code>string</code> | varnishVcl. |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVclFile">varnishVclFile</a></code> | <code>string</code> | varnishVclFile. |

---

##### `plone`<sup>Required</sup> <a name="plone" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.plone"></a>

```typescript
public readonly plone: Plone;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.Plone">Plone</a>
- *Default:* none

plone chart.

---

##### `existingSecret`<sup>Optional</sup> <a name="existingSecret" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.existingSecret"></a>

```typescript
public readonly existingSecret: string;
```

- *Type:* string
- *Default:* undefined

existingSecret - Read admin credentials from user provided secret.

---

##### `limitCpu`<sup>Optional</sup> <a name="limitCpu" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitCpu"></a>

```typescript
public readonly limitCpu: string;
```

- *Type:* string

---

##### `limitMemory`<sup>Optional</sup> <a name="limitMemory" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.limitMemory"></a>

```typescript
public readonly limitMemory: string;
```

- *Type:* string

---

##### `requestCpu`<sup>Optional</sup> <a name="requestCpu" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestCpu"></a>

```typescript
public readonly requestCpu: string;
```

- *Type:* string

---

##### `requestMemory`<sup>Optional</sup> <a name="requestMemory" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.requestMemory"></a>

```typescript
public readonly requestMemory: string;
```

- *Type:* string

---

##### `servicemonitor`<sup>Optional</sup> <a name="servicemonitor" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.servicemonitor"></a>

```typescript
public readonly servicemonitor: boolean;
```

- *Type:* boolean

---

##### `varnishVcl`<sup>Optional</sup> <a name="varnishVcl" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVcl"></a>

```typescript
public readonly varnishVcl: string;
```

- *Type:* string
- *Default:* file in config folder

varnishVcl.

---

##### `varnishVclFile`<sup>Optional</sup> <a name="varnishVclFile" id="@bluedynamics/cdk8s-plone.PloneHttpcacheOptions.property.varnishVclFile"></a>

```typescript
public readonly varnishVclFile: string;
```

- *Type:* string
- *Default:* undefined

varnishVclFile.

---

### PloneOptions <a name="PloneOptions" id="@bluedynamics/cdk8s-plone.PloneOptions"></a>

#### Initializer <a name="Initializer" id="@bluedynamics/cdk8s-plone.PloneOptions.Initializer"></a>

```typescript
import { PloneOptions } from '@bluedynamics/cdk8s-plone'

const ploneOptions: PloneOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.backend">backend</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a></code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.frontend">frontend</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a></code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.imagePullSecrets">imagePullSecrets</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.siteId">siteId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.variant">variant</a></code> | <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a></code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneOptions.property.version">version</a></code> | <code>string</code> | *No description.* |

---

##### `backend`<sup>Optional</sup> <a name="backend" id="@bluedynamics/cdk8s-plone.PloneOptions.property.backend"></a>

```typescript
public readonly backend: PloneBaseOptions;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a>

---

##### `frontend`<sup>Optional</sup> <a name="frontend" id="@bluedynamics/cdk8s-plone.PloneOptions.property.frontend"></a>

```typescript
public readonly frontend: PloneBaseOptions;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneBaseOptions">PloneBaseOptions</a>

---

##### `imagePullSecrets`<sup>Optional</sup> <a name="imagePullSecrets" id="@bluedynamics/cdk8s-plone.PloneOptions.property.imagePullSecrets"></a>

```typescript
public readonly imagePullSecrets: string[];
```

- *Type:* string[]

---

##### `siteId`<sup>Optional</sup> <a name="siteId" id="@bluedynamics/cdk8s-plone.PloneOptions.property.siteId"></a>

```typescript
public readonly siteId: string;
```

- *Type:* string

---

##### `variant`<sup>Optional</sup> <a name="variant" id="@bluedynamics/cdk8s-plone.PloneOptions.property.variant"></a>

```typescript
public readonly variant: PloneVariant;
```

- *Type:* <a href="#@bluedynamics/cdk8s-plone.PloneVariant">PloneVariant</a>

---

##### `version`<sup>Optional</sup> <a name="version" id="@bluedynamics/cdk8s-plone.PloneOptions.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

---



## Enums <a name="Enums" id="Enums"></a>

### PloneVariant <a name="PloneVariant" id="@bluedynamics/cdk8s-plone.PloneVariant"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant.VOLTO">VOLTO</a></code> | *No description.* |
| <code><a href="#@bluedynamics/cdk8s-plone.PloneVariant.CLASSICUI">CLASSICUI</a></code> | *No description.* |

---

##### `VOLTO` <a name="VOLTO" id="@bluedynamics/cdk8s-plone.PloneVariant.VOLTO"></a>

---


##### `CLASSICUI` <a name="CLASSICUI" id="@bluedynamics/cdk8s-plone.PloneVariant.CLASSICUI"></a>

---

