import { Chart, Testing } from 'cdk8s';
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
