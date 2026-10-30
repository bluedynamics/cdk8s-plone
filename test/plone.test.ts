import { ApiObject, Chart, JsonPatch, Testing } from 'cdk8s';
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
