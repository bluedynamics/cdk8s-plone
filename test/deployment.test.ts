import { Chart, Testing } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { PloneDeployment } from '../src/deployment';

test('defaults', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', { port: 8080 });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with-pdp', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'with_pdb', {
    port: 3000,
    pdb: { minAvailable: 1 },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with-environment', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const env = new kplus.Env([], { MY_ENV: { value: 'my-value' } });
  new PloneDeployment(chart, 'with_environment', {
    port: 3000,
    environment: env,
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with-environment-valueFrom', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const env = new kplus.Env([], { MY_ENV: { valueFrom: { secretKeyRef: { name: 'my-secret', key: 'MY_ENV_SECRET' } } } });
  new PloneDeployment(chart, 'with_environment_valueFrom', {
    port: 3000,
    environment: env,
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with-environment-from-secret', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const envfrom = kplus.Env.fromSecret(new kplus.Secret(chart, 'foo'));
  const env = new kplus.Env([envfrom], {});
  new PloneDeployment(chart, 'with_environment_secret', {
    port: 3000,
    environment: env,
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});
