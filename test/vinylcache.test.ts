import { Chart, Testing } from 'cdk8s';
import { PloneVinylCache } from '../src/vinylcache';
import { Plone } from '../src/plone';

test('defaults', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', { plone });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with custom replicas and resources', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    replicas: 3,
    requestCpu: '200m',
    requestMemory: '256Mi',
    limitCpu: '1',
    limitMemory: '1Gi',
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with custom VCL snippets', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    vclRecvSnippet: '# custom recv logic',
    vclBackendResponseSnippet: '# custom backend response logic',
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with monitoring enabled', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    monitoring: true,
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with tolerations', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    tolerations: [
      {
        key: 'kubernetes.io/arch',
        operator: 'Equal',
        value: 'amd64',
        effect: 'NoSchedule',
      },
    ],
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with classic-ui variant (no frontend)', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone', { variant: 'classicui' as any });

  // WHEN
  new PloneVinylCache(chart, 'test', { plone });

  // THEN
  const manifest = Testing.synth(chart);
  // Should only have one backend (no frontend)
  expect(manifest).toMatchSnapshot();
});

test('with invalidation disabled', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    invalidation: false,
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with shard director', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    director: 'round_robin',
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('exposes vinylCacheServiceName', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  const cache = new PloneVinylCache(chart, 'test', { plone });

  // THEN
  expect(cache.vinylCacheServiceName).toBeDefined();
  expect(typeof cache.vinylCacheServiceName).toBe('string');
});
