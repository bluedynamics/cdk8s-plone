import { Chart, Testing } from 'cdk8s';
import { PloneHttpcache } from '../src/httpcache';
import { Plone } from '../src/plone';

test('defaults', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneHttpcache(
    chart,
    'test',
    { plone: plone, varnishVcl: 'test', existingSecret: 'testsecret' },
  );

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with exporter disabled', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneHttpcache(
    chart,
    'test',
    {
      plone: plone,
      varnishVcl: 'test',
      existingSecret: 'testsecret',
      exporterEnabled: false,
    },
  );

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with custom appVersion', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneHttpcache(
    chart,
    'test',
    {
      plone: plone,
      varnishVcl: 'test',
      existingSecret: 'testsecret',
      appVersion: 'v1.2.3',
    },
  );

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});
