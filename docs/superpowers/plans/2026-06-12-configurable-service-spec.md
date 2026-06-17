# Configurable Service Spec Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the generated Kubernetes `Service` spec configurable — curated typed fields (incl. `trafficDistribution`) plus a generic `overrides` escape hatch — plumbed through a single grouped `service` option on backend/frontend.

**Architecture:** Add a `PloneServiceSpec` interface in `src/service.ts` with curated optional fields and an `overrides?: k8s.ServiceSpec` escape hatch. `PloneService` merges construct-managed base (`ports`/`selector`) < curated fields < `overrides` (highest precedence). A single `service?: PloneServiceSpec` prop on `PloneBaseOptions` (shared by backend & frontend) carries the config; the legacy `serviceAnnotations` is deprecated and merged for backward compatibility.

**Tech Stack:** TypeScript, cdk8s (`k8s.KubeService` raw API), Jest snapshot tests, Projen build, JSII (multi-language publish).

**Reference spec:** `docs/superpowers/specs/2026-06-12-configurable-service-spec-design.md`

---

## File Structure

- `src/service.ts` — new `PloneServiceSpec` interface; `PloneServiceOptions` gains `spec?`; merge logic in `PloneService` constructor.
- `src/plone.ts` — import `PloneServiceSpec`; add `service?` to `PloneBaseOptions`; deprecate `serviceAnnotations`; pass `spec` in backend & frontend `PloneService` calls.
- `test/service.test.ts` (+ `test/__snapshots__/service.test.ts.snap`) — new test cases.
- `documentation/sources/reference/configuration-options.md` — document `PloneServiceSpec`.
- `API.md` — regenerated via `npx projen docgen` (auto-generated, no manual edit).

---

## Task 1: Add `PloneServiceSpec` type and merge logic in `PloneService`

**Files:**
- Modify: `src/service.ts:5-37` (interface area), `src/service.ts:58-82` (constructor)
- Test: `test/service.test.ts`

- [ ] **Step 1: Write failing tests for the new behavior**

Replace the contents of `test/service.test.ts` with:

```typescript
import { Chart, Testing } from 'cdk8s';
import { PloneService } from '../src/service';

function synthService(props: any) {
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  new PloneService(chart, 'test', props);
  return Testing.synth(chart)[0];
}

test('defaults', () => {
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  new PloneService(chart, 'test', { targetPort: 8080, selectorLabel: { app: 'plone' } });
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('curated spec fields are applied', () => {
  const manifest = synthService({
    targetPort: 8080,
    selectorLabel: { app: 'plone' },
    spec: {
      type: 'LoadBalancer',
      trafficDistribution: 'PreferClose',
      sessionAffinity: 'ClientIP',
      externalTrafficPolicy: 'Local',
      internalTrafficPolicy: 'Local',
      publishNotReadyAddresses: true,
      loadBalancerClass: 'service.k8s.aws/nlb',
      loadBalancerSourceRanges: ['10.0.0.0/8'],
    },
  });
  expect(manifest.spec.type).toBe('LoadBalancer');
  expect(manifest.spec.trafficDistribution).toBe('PreferClose');
  expect(manifest.spec.sessionAffinity).toBe('ClientIP');
  expect(manifest.spec.externalTrafficPolicy).toBe('Local');
  expect(manifest.spec.internalTrafficPolicy).toBe('Local');
  expect(manifest.spec.publishNotReadyAddresses).toBe(true);
  expect(manifest.spec.loadBalancerClass).toBe('service.k8s.aws/nlb');
  expect(manifest.spec.loadBalancerSourceRanges).toEqual(['10.0.0.0/8']);
  // construct-managed base still present
  expect(manifest.spec.ports[0].port).toBe(8080);
  expect(manifest.spec.selector).toEqual({ app: 'plone' });
});

test('overrides escape hatch sets arbitrary spec fields', () => {
  const manifest = synthService({
    targetPort: 8080,
    selectorLabel: { app: 'plone' },
    spec: { overrides: { ipFamilyPolicy: 'PreferDualStack' } },
  });
  expect(manifest.spec.ipFamilyPolicy).toBe('PreferDualStack');
});

test('overrides take precedence over curated fields', () => {
  const manifest = synthService({
    targetPort: 8080,
    selectorLabel: { app: 'plone' },
    spec: { type: 'ClusterIP', overrides: { type: 'NodePort' } },
  });
  expect(manifest.spec.type).toBe('NodePort');
});

test('spec.annotations and spec.labels reach metadata', () => {
  const manifest = synthService({
    targetPort: 8080,
    selectorLabel: { app: 'plone' },
    spec: {
      annotations: { 'external-dns.alpha.kubernetes.io/hostname': 'plone.example.com' },
      labels: { tier: 'web' },
    },
  });
  expect(manifest.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']).toBe('plone.example.com');
  expect(manifest.metadata.labels.tier).toBe('web');
  // construct-managed labels still win/present
  expect(manifest.metadata.labels['app.kubernetes.io/part-of']).toBe('plone');
});

test('legacy options.annotations still merge with spec.annotations', () => {
  const manifest = synthService({
    targetPort: 8080,
    selectorLabel: { app: 'plone' },
    annotations: { a: '1' },
    spec: { annotations: { b: '2' } },
  });
  expect(manifest.metadata.annotations).toEqual({ a: '1', b: '2' });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest test/service.test.ts`
Expected: FAIL — new tests fail because `spec` is ignored (e.g. `manifest.spec.type` is `undefined`).

- [ ] **Step 3: Add `PloneServiceSpec` interface and `spec?` field in `src/service.ts`**

Insert the new interface immediately before `export interface PloneServiceOptions {` (before `src/service.ts:5`):

```typescript
/**
 * Configuration for the generated Kubernetes Service spec.
 *
 * Curated fields cover the common cases; use `overrides` as an escape hatch
 * for any other `ServiceSpec` field. `overrides` has the highest precedence and
 * can override every field, including the construct-managed `ports`/`selector`
 * (at your own risk).
 */
export interface PloneServiceSpec {
  /**
   * Service type, e.g. ClusterIP | NodePort | LoadBalancer | ExternalName.
   * @default - ClusterIP (Kubernetes default)
   */
  readonly type?: string;

  /**
   * Traffic distribution preference, e.g. 'PreferClose' for topology-aware routing.
   * @default - none
   */
  readonly trafficDistribution?: string;

  /**
   * Session affinity, 'ClientIP' | 'None'.
   * @default - None (Kubernetes default)
   */
  readonly sessionAffinity?: string;

  /**
   * External traffic policy, 'Cluster' | 'Local'.
   * @default - Cluster (Kubernetes default)
   */
  readonly externalTrafficPolicy?: string;

  /**
   * Internal traffic policy, 'Cluster' | 'Local'.
   * @default - Cluster (Kubernetes default)
   */
  readonly internalTrafficPolicy?: string;

  /**
   * Publish not-ready addresses (e.g. for headless services with StatefulSets).
   * @default - false
   */
  readonly publishNotReadyAddresses?: boolean;

  /**
   * Load balancer implementation class.
   * @default - none
   */
  readonly loadBalancerClass?: string;

  /**
   * Source IP ranges allowed to access a LoadBalancer service.
   * @default - none
   */
  readonly loadBalancerSourceRanges?: string[];

  /**
   * Annotations to add to the Service metadata.
   * @default - none
   */
  readonly annotations?: { [name: string]: string };

  /**
   * Extra labels to add to the Service metadata.
   * @default - none
   */
  readonly labels?: { [name: string]: string };

  /**
   * Raw ServiceSpec overrides. Highest precedence — merged on top of all curated
   * fields and the construct-managed base. Use for any field not covered above.
   * @default - none
   */
  readonly overrides?: k8s.ServiceSpec;
}
```

Then add a `spec?` field inside `PloneServiceOptions`, immediately after the existing `annotations` field (after `src/service.ts:36`, before the closing `}` at line 37):

```typescript
  /**
   * Service spec configuration (type, trafficDistribution, sessionAffinity,
   * raw overrides, ...).
   * @default - construct-managed defaults only
   */
  readonly spec?: PloneServiceSpec;
```

- [ ] **Step 4: Implement the merge in the `PloneService` constructor**

Replace the constructor body (`src/service.ts:58-82`, from `const targetPort` through `this.labels = service_labels;`) with:

```typescript
    const targetPort = k8s.IntOrString.fromNumber(options.targetPort);
    const selectorLabel = options.selectorLabel;
    const userSpec = options.spec ?? {};

    const service_labels = {
      ...userSpec.labels ?? {},
      ...options.labels ?? {},
      'app.kubernetes.io/part-of': 'plone',
      'app.kubernetes.io/managed-by': 'cdk8s-plone',
    };

    const mergedAnnotations = {
      ...options.annotations ?? {},
      ...userSpec.annotations ?? {},
    };
    const annotations = Object.keys(mergedAnnotations).length > 0 ? mergedAnnotations : undefined;

    const spec: k8s.ServiceSpec = {
      ports: [{ port: options.targetPort, targetPort: targetPort, name: options.portName ?? 'http' }],
      selector: selectorLabel,
      type: userSpec.type,
      trafficDistribution: userSpec.trafficDistribution,
      sessionAffinity: userSpec.sessionAffinity,
      externalTrafficPolicy: userSpec.externalTrafficPolicy,
      internalTrafficPolicy: userSpec.internalTrafficPolicy,
      publishNotReadyAddresses: userSpec.publishNotReadyAddresses,
      loadBalancerClass: userSpec.loadBalancerClass,
      loadBalancerSourceRanges: userSpec.loadBalancerSourceRanges,
      // overrides win over everything, including ports/selector
      ...userSpec.overrides ?? {},
    };

    const serviceOpts: k8s.KubeServiceProps = {
      metadata: {
        labels: service_labels,
        annotations: annotations,
      },
      spec: spec,
    };
    const service = new k8s.KubeService(this, 'service', serviceOpts);
    this.name = service.name;
    this.labels = service_labels;
```

> Note: curated fields left `undefined` are dropped by cdk8s during synth, so the `defaults` snapshot stays unchanged.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest test/service.test.ts`
Expected: PASS for all new tests. The `defaults` snapshot should still match (no change). If it reports an obsolete/changed snapshot for `defaults`, confirm the diff is empty; do not `-u` yet.

- [ ] **Step 6: Lint**

Run: `npx projen eslint`
Expected: no errors in `src/service.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/service.ts test/service.test.ts
git commit -m "feat(service): add configurable PloneServiceSpec with curated fields and overrides

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Plumb `service` through `PloneBaseOptions` (backend & frontend)

**Files:**
- Modify: `src/plone.ts:8` (import), `src/plone.ts:242-248` (add `service`, deprecate `serviceAnnotations`), `src/plone.ts:468-477` (backend), `src/plone.ts:562-571` (frontend)
- Test: `test/plone.test.ts` (snapshot regeneration)

- [ ] **Step 1: Import `PloneServiceSpec`**

In `src/plone.ts:8`, change:

```typescript
import { PloneService } from './service';
```

to:

```typescript
import { PloneService, PloneServiceSpec } from './service';
```

- [ ] **Step 2: Add `service` prop and deprecate `serviceAnnotations` in `PloneBaseOptions`**

In `src/plone.ts`, replace the existing `serviceAnnotations` doc-comment + field (currently `src/plone.ts:242-248`):

```typescript
  /**
   * Annotations to add to the Service metadata.
   * Common for external-dns, load balancers, service mesh, etc.
   * @example { 'external-dns.alpha.kubernetes.io/hostname': 'plone.example.com' }
   * @default - no additional annotations
   */
  readonly serviceAnnotations?: { [name: string]: string };
```

with:

```typescript
  /**
   * Annotations to add to the Service metadata.
   * Common for external-dns, load balancers, service mesh, etc.
   * @example { 'external-dns.alpha.kubernetes.io/hostname': 'plone.example.com' }
   * @deprecated use `service.annotations` instead
   * @default - no additional annotations
   */
  readonly serviceAnnotations?: { [name: string]: string };

  /**
   * Service configuration: type, trafficDistribution, sessionAffinity,
   * annotations/labels, and a raw `overrides` escape hatch for any other
   * ServiceSpec field. Applies to this component's Service.
   * @example { type: 'LoadBalancer', trafficDistribution: 'PreferClose' }
   * @default - construct-managed defaults only
   */
  readonly service?: PloneServiceSpec;
```

- [ ] **Step 3: Pass `spec` in the backend `PloneService` call**

In `src/plone.ts:468-477`, replace:

```typescript
    const backendService = new PloneService(backendDeployment, 'service', {
      labels: {
        'app.kubernetes.io/name': 'plone-backend-service',
        'app.kubernetes.io/component': 'service',
      },
      targetPort: backendPort,
      selectorLabel: { app: Names.toLabelValue(backendDeployment) },
      portName: 'backend-http',
      annotations: backend.serviceAnnotations,
    });
```

with:

```typescript
    const backendService = new PloneService(backendDeployment, 'service', {
      labels: {
        'app.kubernetes.io/name': 'plone-backend-service',
        'app.kubernetes.io/component': 'service',
      },
      targetPort: backendPort,
      selectorLabel: { app: Names.toLabelValue(backendDeployment) },
      portName: 'backend-http',
      spec: {
        ...backend.service,
        annotations: { ...backend.serviceAnnotations, ...backend.service?.annotations },
      },
    });
```

- [ ] **Step 4: Pass `spec` in the frontend `PloneService` call**

In `src/plone.ts:562-571`, replace:

```typescript
      const frontendService = new PloneService(frontendDeployment, 'service', {
        labels: {
          'app.kubernetes.io/name': 'plone-frontend-service',
          'app.kubernetes.io/component': 'service',
        },
        targetPort: frontendPort,
        selectorLabel: { app: Names.toLabelValue(frontendDeployment) },
        portName: 'frontend-http',
        annotations: frontend.serviceAnnotations,
      });
```

with:

```typescript
      const frontendService = new PloneService(frontendDeployment, 'service', {
        labels: {
          'app.kubernetes.io/name': 'plone-frontend-service',
          'app.kubernetes.io/component': 'service',
        },
        targetPort: frontendPort,
        selectorLabel: { app: Names.toLabelValue(frontendDeployment) },
        portName: 'frontend-http',
        spec: {
          ...frontend.service,
          annotations: { ...frontend.serviceAnnotations, ...frontend.service?.annotations },
        },
      });
```

- [ ] **Step 5: Verify existing snapshots are unchanged (no regression)**

Run: `npx jest test/plone.test.ts`
Expected: PASS with NO snapshot changes — when neither `serviceAnnotations` nor `service` is set, `spec.annotations` resolves to `{}` → dropped to `undefined`, so output is identical.
If a snapshot diff appears, STOP and inspect: a non-empty diff means a regression, not an expected update.

- [ ] **Step 6: Add a Plone-level integration test for `service`**

Append to `test/plone.test.ts` (a test that exercises the plumbing end-to-end). First confirm the import style at the top of that file matches (it uses `import { Plone } from '../src/plone';`). Add:

```typescript
test('backend service config is plumbed through', () => {
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  new Plone(chart, 'plone', {
    backend: {
      service: {
        type: 'LoadBalancer',
        trafficDistribution: 'PreferClose',
      },
    },
  });
  const manifests = Testing.synth(chart);
  const backendSvc = manifests.find(
    (m: any) => m.kind === 'Service' && m.metadata.labels['app.kubernetes.io/name'] === 'plone-backend-service',
  );
  expect(backendSvc.spec.type).toBe('LoadBalancer');
  expect(backendSvc.spec.trafficDistribution).toBe('PreferClose');
});
```

> If `test/plone.test.ts` does not already import `Chart`/`Testing` from `cdk8s`, add `import { Chart, Testing } from 'cdk8s';` at the top (check first — most test files in this repo already do).

- [ ] **Step 7: Run the new integration test**

Run: `npx jest test/plone.test.ts -t 'backend service config is plumbed through'`
Expected: PASS.

- [ ] **Step 8: Run full test suite + lint**

Run: `npx projen test`
Expected: all suites PASS, no unexpected snapshot changes.
Run: `npx projen eslint`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/plone.ts test/plone.test.ts test/__snapshots__/
git commit -m "feat(plone): expose service config on backend/frontend, deprecate serviceAnnotations

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Documentation

**Files:**
- Modify: `documentation/sources/reference/configuration-options.md:200-220` (Annotations section → add Service section)
- Regenerate: `API.md`

- [ ] **Step 1: Invoke the doc-style skill**

Before editing the handwritten docs under `documentation/sources/`, invoke the `plone-doc-style:author` skill (Diataxis classification, MyST markup, style enforcement). The `configuration-options.md` page is **Reference** quadrant. Do NOT apply the skill to the auto-generated `API.md`.

- [ ] **Step 2: Document `PloneServiceSpec` in the Reference page**

In `documentation/sources/reference/configuration-options.md`, locate the "Annotations" subsection (around line 200). Mark `serviceAnnotations` as deprecated in its table row and add a new "Service" subsection after the Annotations example block (after line 220). Insert:

```markdown
#### Service

Configure the generated Kubernetes `Service` via the grouped `service` option
(available on both `backend` and `frontend`). Curated fields cover common cases;
`overrides` is an escape hatch for any other `ServiceSpec` field and has the
highest precedence.

| Property | Type | Description |
|----------|------|-------------|
| `service.type` | `string` | Service type: `ClusterIP` (default), `NodePort`, `LoadBalancer`, `ExternalName` |
| `service.trafficDistribution` | `string` | Traffic distribution preference, e.g. `PreferClose` |
| `service.sessionAffinity` | `string` | `ClientIP` or `None` |
| `service.externalTrafficPolicy` | `string` | `Cluster` or `Local` |
| `service.internalTrafficPolicy` | `string` | `Cluster` or `Local` |
| `service.publishNotReadyAddresses` | `boolean` | Publish not-ready addresses |
| `service.loadBalancerClass` | `string` | Load balancer implementation class |
| `service.loadBalancerSourceRanges` | `string[]` | Allowed source IP ranges for LoadBalancer |
| `service.annotations` | `Record<string, string>` | Service metadata annotations (replaces `serviceAnnotations`) |
| `service.labels` | `Record<string, string>` | Extra Service metadata labels |
| `service.overrides` | `ServiceSpec` | Raw spec overrides; highest precedence |

> `serviceAnnotations` is deprecated — use `service.annotations` instead.

**Example:**
```typescript
backend: {
  service: {
    type: 'LoadBalancer',
    trafficDistribution: 'PreferClose',
    loadBalancerSourceRanges: ['10.0.0.0/8'],
    annotations: {
      'external-dns.alpha.kubernetes.io/hostname': 'backend.example.com',
    },
    overrides: {
      ipFamilyPolicy: 'PreferDualStack',
    },
  },
}
```
```

- [ ] **Step 3: Update the deprecated `serviceAnnotations` table row**

In the same file, change the `serviceAnnotations` row (line ~206) to:

```markdown
| `serviceAnnotations` | `Record<string, string>` | **Deprecated** — use `service.annotations`. Service annotations (e.g., for external-dns) |
```

- [ ] **Step 4: Regenerate API docs**

Run: `npx projen docgen`
Expected: `API.md` updated to include `PloneServiceSpec` and the new `service` property.

- [ ] **Step 5: Build the docs to verify**

Run: `cd documentation && make docs`
Expected: build succeeds with no errors/warnings for the edited page.

- [ ] **Step 6: Commit**

```bash
git add documentation/sources/reference/configuration-options.md API.md
git commit -m "docs(service): document PloneServiceSpec configuration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Final verification & build

- [ ] **Step 1: Full build**

Run: `npx projen build`
Expected: compile + JSII bindings succeed (confirms `k8s.ServiceSpec` in the public API is JSII-compatible), tests pass, no lint errors.

- [ ] **Step 2: Confirm snapshots intentional**

Run: `git status` and `git diff --stat`
Expected: only intended files changed. If `test/__snapshots__/service.test.ts.snap` changed beyond the new test cases, inspect the diff — the `defaults` snapshot must be unchanged.

- [ ] **Step 3: Push and open PR**

```bash
git push -u origin feat/configurable-service-spec
gh pr create --title "feat(service): configurable Service spec (trafficDistribution + overrides)" --body "$(cat <<'EOF'
## Summary
- Add `PloneServiceSpec` with curated fields (`type`, `trafficDistribution`, `sessionAffinity`, traffic policies, load balancer settings) plus a generic `overrides` escape hatch.
- Plumb a single grouped `service?` option through `PloneBaseOptions` (backend & frontend).
- Deprecate `serviceAnnotations` in favor of `service.annotations` (backward compatible, merged).
- Document in reference docs; regenerate API.md.

## Test plan
- New unit tests in `test/service.test.ts` (curated fields, overrides precedence, annotations/labels merge, legacy compat).
- Integration test in `test/plone.test.ts` (end-to-end plumbing).
- Existing snapshots unchanged when `service` is unset.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review notes

- **Spec coverage:** §1 PloneServiceSpec → Task 1 Step 3; §2 PloneServiceOptions.spec → Task 1 Step 3; §3 merge precedence → Task 1 Step 4 + tests; §4 plumbing → Task 2; §5 backward-compat → Task 1 Step 4 (annotation merge) + Task 2 Step 5; §6 tests → Task 1 Step 1, Task 2 Step 6; §7 docs → Task 3.
- **Type consistency:** `PloneServiceSpec` (with `overrides?: k8s.ServiceSpec`) used identically in `service.ts`, `PloneServiceOptions.spec`, and `PloneBaseOptions.service`. Field names match across interface, merge code, tests, and docs.
- **No placeholders:** all steps contain concrete code/commands.
