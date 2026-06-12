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

test('defaults-classicui', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'app');

  // WHEN
  new Plone(chart, 'plone', { variant: PloneVariant.CLASSICUI });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
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
    variant: PloneVariant.CLASSICUI,
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
