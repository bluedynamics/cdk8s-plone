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

test('default VCL renders through the chart', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN: no varnishVcl and no varnishVclFile, so src/config/varnish.tpl.vcl
  // goes through the chart's `indent 4` into a YAML block scalar (#251).
  new PloneHttpcache(chart, 'test', { plone: plone });

  // THEN
  const configMap = Testing.synth(chart).find(o => o.kind === 'ConfigMap');
  expect(configMap?.data['default.vcl.tmpl']).toMatch(/^vcl 4\.0;\n/);
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

test('with extra env vars', () => {
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
      varnishVcl: 'test-extra-env',
      existingSecret: 'testsecret',
      extraEnvVars: [
        { name: 'THUMBOR_SERVICE_NAME', value: 'my-thumbor' },
        { name: 'CUSTOM_VAR', value: 'custom-value' },
      ],
    },
  );

  // THEN
  const manifest = Testing.synth(chart);
  expect(manifest).toMatchSnapshot();
});

test('with tolerations', () => {
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
      tolerations: [
        {
          key: 'kubernetes.io/arch',
          operator: 'Equal',
          value: 'amd64',
          effect: 'NoSchedule',
        },
      ],
    },
  );

  // THEN
  const manifest = Testing.synth(chart);
  expect(manifest).toMatchSnapshot();
});
