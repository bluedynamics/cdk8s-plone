import { ApiObject, Chart, JsonPatch, Names, Testing } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { Plone, PloneVariant } from '../src/plone';


test('defaults', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone');

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('defaults-blicca', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', { variant: PloneVariant.BLICCA });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('deprecated CLASSICUI keeps its legacy value', () => {
  // The CLASSICUI alias is kept for backward compatibility: existing configuration
  // using the literal value 'classicui' must keep working unchanged.
  expect(PloneVariant.CLASSICUI).toBe('classicui');
  expect(PloneVariant.BLICCA).toBe('blicca');
});

test('deprecated CLASSICUI deploys backend-only like BLICCA', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', { variant: PloneVariant.CLASSICUI });

  // THEN — same backend-only shape as the BLICCA snapshot (no frontend resources)
  const manifest = Testing.synth(chart);
  expect(JSON.stringify(manifest)).not.toContain('plone-frontend');
});

test('defaults-with-pdps', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone_with_pdbs', {
    backend: {
      maxUnavailable: 1,
    },
    frontend: {
      minAvailable: 2,
    },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with-backend-servicemonitor', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', {
    variant: PloneVariant.BLICCA,
    backend: {
      servicemonitor: true,
    },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with-frontend-servicemonitor', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', {
    frontend: {
      servicemonitor: true,
      metricsPath: '/api/metrics',
      metricsPort: 9090,
    },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with-both-servicemonitors', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', {
    backend: {
      servicemonitor: true,
      metricsPath: '/backend/metrics',
    },
    frontend: {
      servicemonitor: true,
      metricsPath: '/frontend/metrics',
    },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with securityContext for capabilities', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', {
    backend: {
      securityContext: { capabilities: { add: ['SYS_PTRACE'] } },
    },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with nodeSelector for region affinity', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', {
    backend: {
      nodeSelector: { 'topology.kubernetes.io/region': 'fsn1' },
    },
    frontend: {
      nodeSelector: { 'topology.kubernetes.io/region': 'fsn1' },
    },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

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

test('shutdown timing is plumbed through to backend and frontend', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new Plone(chart, 'plone', {
    backend: { preStopDelaySeconds: 20, terminationGracePeriodSeconds: 90 },
    frontend: { preStopDelaySeconds: 0 },
  });

  // THEN
  const deployments = Testing.synth(chart).filter((m: any) => m.kind === 'Deployment');
  const podSpec = (name: string) => deployments.find(
    (d: any) => d.metadata.labels['app.kubernetes.io/name'] === `${name}-deployment`,
  ).spec.template.spec;
  const backend = podSpec('plone-backend');
  expect(backend.containers[0].lifecycle).toEqual({ preStop: { sleep: { seconds: 20 } } });
  expect(backend.terminationGracePeriodSeconds).toBe(90);
  const frontend = podSpec('plone-frontend');
  expect(frontend.containers[0].lifecycle).toBeUndefined();
  expect(frontend.terminationGracePeriodSeconds).toBeUndefined();
});

function synthKind(chart: Chart, kind: string, name: string): any {
  return Testing.synth(chart).find(
    (m: any) => m.kind === kind && m.metadata.labels['app.kubernetes.io/name'] === name,
  );
}

test('escape hatch patches keep plain IntOrString and Quantity values', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  plone.backendDeployment.addJsonPatch(
    JsonPatch.add('/spec/strategy', { type: 'RollingUpdate', rollingUpdate: { maxUnavailable: 0, maxSurge: '50%' } }),
    JsonPatch.add('/spec/template/spec/containers/0/resources/limits/cpu', '2'),
    JsonPatch.add('/spec/template/spec/containers/0/startupProbe', { httpGet: { path: '/', port: 8080 } }),
  );
  plone.backendService.addJsonPatch(JsonPatch.replace('/spec/ports/0/targetPort', 'http'));

  // THEN
  const deployment = synthKind(chart, 'Deployment', 'plone-backend-deployment');
  expect(deployment.spec.strategy).toEqual({ type: 'RollingUpdate', rollingUpdate: { maxUnavailable: 0, maxSurge: '50%' } });
  const container = deployment.spec.template.spec.containers[0];
  expect(container.resources.limits).toEqual({ cpu: '2', memory: '512Mi' });
  expect(container.startupProbe).toEqual({ httpGet: { path: '/', port: 8080 } });
  expect(synthKind(chart, 'Service', 'plone-backend-service').spec.ports[0].targetPort).toBe('http');
});

test('escape hatch patches can remove generated fields', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  plone.frontendDeployment!.addJsonPatch(JsonPatch.remove('/spec/template/spec/containers/0/lifecycle'));

  // THEN
  const container = synthKind(chart, 'Deployment', 'plone-frontend-deployment').spec.template.spec.containers[0];
  expect(container.lifecycle).toBeUndefined();
});

test('ApiObject.of reaches the same escape hatch', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  ApiObject.of(plone.backendDeployment).addJsonPatch(
    JsonPatch.add('/spec/template/spec/containers/0/args', ['--debug']),
  );

  // THEN
  const container = synthKind(chart, 'Deployment', 'plone-backend-deployment').spec.template.spec.containers[0];
  expect(container.args).toEqual(['--debug']);
});

test('frontend escape hatches are undefined for Blicca', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const plone = new Plone(chart, 'plone', { variant: PloneVariant.BLICCA });

  // THEN
  expect(plone.backendDeployment).toBeDefined();
  expect(plone.frontendDeployment).toBeUndefined();
  expect(plone.frontendService).toBeUndefined();
});

test('rollingUpdate is plumbed through to backend and frontend', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new Plone(chart, 'plone', {
    backend: { rollingUpdate: { maxUnavailable: 0, maxSurge: '50%' } },
    frontend: { rollingUpdate: { maxSurge: 1 } },
  });

  // THEN
  expect(synthKind(chart, 'Deployment', 'plone-backend-deployment').spec.strategy.rollingUpdate)
    .toEqual({ maxUnavailable: 0, maxSurge: '50%' });
  expect(synthKind(chart, 'Deployment', 'plone-frontend-deployment').spec.strategy.rollingUpdate)
    .toEqual({ maxSurge: 1 });
});

test('Service and PDB select on name and instance; each Deployment keeps its own app selector', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const plone = new Plone(chart, 'plone', { backend: { replicas: 2 }, frontend: { replicas: 2 } });

  // THEN
  const manifests = Testing.synth(chart);
  const instance = Names.toLabelValue(plone);
  for (const role of ['plone-backend', 'plone-frontend']) {
    const roleSelector = { 'app.kubernetes.io/name': role, 'app.kubernetes.io/instance': instance };
    const deployment = synthKind(chart, 'Deployment', `${role}-deployment`);
    const podLabels = deployment.spec.template.metadata.labels;
    expect(podLabels).toMatchObject({ ...roleSelector, 'cdk8s-plone.bluedynamics.eu/group': 'default' });
    // the Deployment selector is immutable and must not change
    expect(Object.keys(deployment.spec.selector.matchLabels)).toEqual(['app']);
    expect(synthKind(chart, 'Service', `${role}-service`).spec.selector).toEqual(roleSelector);
  }
  const pdbSelectors = manifests
    .filter((m: any) => m.kind === 'PodDisruptionBudget')
    .map((pdb: any) => pdb.spec.selector.matchLabels);
  expect(pdbSelectors).toEqual([
    { 'app.kubernetes.io/name': 'plone-backend', 'app.kubernetes.io/instance': instance },
    { 'app.kubernetes.io/name': 'plone-frontend', 'app.kubernetes.io/instance': instance },
  ]);
});

test('instance label differs between two Plone constructs', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new Plone(chart, 'site-a', { variant: PloneVariant.BLICCA });
  new Plone(chart, 'site-b', { variant: PloneVariant.BLICCA });

  // THEN
  const instances = Testing.synth(chart)
    .filter((m: any) => m.kind === 'Deployment')
    .map((d: any) => d.spec.template.metadata.labels['app.kubernetes.io/instance']);
  expect(new Set(instances).size).toBe(2);
});

function groupDeployment(chart: Chart, role: string, group: string): any {
  return Testing.synth(chart).find((m: any) => m.kind === 'Deployment'
    && m.metadata.labels['app.kubernetes.io/name'] === `${role}-deployment`
    && m.spec.template.metadata.labels['cdk8s-plone.bluedynamics.eu/group'] === group);
}

function envOf(deployment: any): { [name: string]: string } {
  return Object.fromEntries(deployment.spec.template.spec.containers[0].env.map((e: any) => [e.name, e.value]));
}

test('a backend group becomes its own Deployment that inherits the role settings', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const plone = new Plone(chart, 'plone', {
    variant: PloneVariant.BLICCA,
    backend: {
      replicas: 4,
      image: 'plone/plone-backend:6.1.3',
      limitMemory: '2Gi',
      rollingUpdate: { maxUnavailable: 0, maxSurge: 1 },
      environment: new kplus.Env([], { ZODB_CACHE_SIZE: kplus.EnvValue.fromValue('50000'), KEEP: kplus.EnvValue.fromValue('1') }),
      groups: [{
        name: 'jemalloc',
        replicas: 2,
        environment: new kplus.Env([], {
          LD_PRELOAD: kplus.EnvValue.fromValue('/usr/lib/x86_64-linux-gnu/libjemalloc.so.2'),
          ZODB_CACHE_SIZE: kplus.EnvValue.fromValue('80000'),
        }),
      }],
    },
  });

  // THEN
  const base = groupDeployment(chart, 'plone-backend', 'default');
  const group = groupDeployment(chart, 'plone-backend', 'jemalloc');
  expect(base.spec.replicas).toBe(4);
  expect(group.spec.replicas).toBe(2);
  // disjoint Deployment selectors
  expect(Object.keys(group.spec.selector.matchLabels)).toEqual(['app']);
  expect(group.spec.selector.matchLabels.app).not.toBe(base.spec.selector.matchLabels.app);
  expect(group.spec.template.metadata.labels).toMatchObject({
    'app.kubernetes.io/name': 'plone-backend',
    'app.kubernetes.io/instance': Names.toLabelValue(plone),
    'cdk8s-plone.bluedynamics.eu/group': 'jemalloc',
  });
  // inherited
  const groupContainer = group.spec.template.spec.containers[0];
  const baseContainer = base.spec.template.spec.containers[0];
  expect(groupContainer.image).toBe('plone/plone-backend:6.1.3');
  expect(groupContainer.resources).toEqual(baseContainer.resources);
  expect(groupContainer.readinessProbe).toEqual(baseContainer.readinessProbe);
  expect(groupContainer.lifecycle).toEqual(baseContainer.lifecycle);
  expect(group.spec.strategy).toEqual(base.spec.strategy);
  // environment merged, group wins
  expect(envOf(group)).toEqual({
    ZODB_CACHE_SIZE: '80000',
    KEEP: '1',
    LD_PRELOAD: '/usr/lib/x86_64-linux-gnu/libjemalloc.so.2',
  });
  expect(envOf(base)).toEqual({ ZODB_CACHE_SIZE: '50000', KEEP: '1' });
  // escape hatch
  expect(Object.keys(plone.backendGroupDeployments)).toEqual(['jemalloc']);
  expect(plone.frontendGroupDeployments).toEqual({});
});

test('groups share the role PDB, which counts all pods', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN: 1 + 1 pods, a PDB only exists from 2 pods on
  new Plone(chart, 'plone', {
    variant: PloneVariant.BLICCA,
    backend: { replicas: 1, groups: [{ name: 'canary', image: 'plone/plone-backend:6.2.0' }] },
  });

  // THEN
  const pdbs = Testing.synth(chart).filter((m: any) => m.kind === 'PodDisruptionBudget');
  expect(pdbs).toHaveLength(1);
  expect(pdbs[0].spec.selector.matchLabels['app.kubernetes.io/name']).toBe('plone-backend');
  expect(groupDeployment(chart, 'plone-backend', 'canary').spec.template.spec.containers[0].image)
    .toBe('plone/plone-backend:6.2.0');
});

test('frontend groups inherit the backend connection', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const plone = new Plone(chart, 'plone', { frontend: { groups: [{ name: 'next', image: 'plone/plone-frontend:18.0.0' }] } });

  // THEN
  const base = groupDeployment(chart, 'plone-frontend', 'default');
  const group = groupDeployment(chart, 'plone-frontend', 'next');
  expect(group.spec.replicas).toBe(1);
  expect(envOf(group).RAZZLE_INTERNAL_API_PATH).toBe(envOf(base).RAZZLE_INTERNAL_API_PATH);
  expect(Object.keys(plone.frontendGroupDeployments)).toEqual(['next']);
});

test('without groups no extra Deployment is rendered', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const plone = new Plone(chart, 'plone');

  // THEN
  expect(Testing.synth(chart).filter((m: any) => m.kind === 'Deployment')).toHaveLength(2);
  expect(plone.backendGroupDeployments).toEqual({});
});

test.each([
  [[{ name: 'Jemalloc' }], /"Jemalloc" is not a lowercase DNS label/],
  [[{ name: 'a_b' }], /not a lowercase DNS label/],
  [[{ name: 'default' }], /"default" is reserved/],
  [[{ name: 'x' }, { name: 'x' }], /"x" is used more than once/],
  [[{ name: 'x', replicas: -1 }], /replicas must be a non-negative integer/],
])('rejects invalid groups %j', (groups, message) => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // THEN
  expect(() => new Plone(chart, 'plone', { backend: { groups } })).toThrow(message);
});

test('ServiceMonitor transfers the group label', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new Plone(chart, 'plone', { backend: { servicemonitor: true } });

  // THEN
  const monitor = Testing.synth(chart).find((m: any) => m.kind === 'ServiceMonitor');
  expect(monitor.spec.podTargetLabels).toEqual(['cdk8s-plone.bluedynamics.eu/group']);
});
