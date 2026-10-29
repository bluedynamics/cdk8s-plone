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

test('no PDB for single replica', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'single', { port: 8080, replicas: 1, pdb: {} });

  // THEN
  const pdbs = Testing.synth(chart).filter((r: any) => r.kind === 'PodDisruptionBudget');
  expect(pdbs).toHaveLength(0);
});

test('PDB for multi replica carries AlwaysAllow', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'multi', { port: 8080, replicas: 2, pdb: {} });

  // THEN
  const pdbs = Testing.synth(chart).filter((r: any) => r.kind === 'PodDisruptionBudget');
  expect(pdbs).toHaveLength(1);
  expect(pdbs[0].spec.unhealthyPodEvictionPolicy).toBe('AlwaysAllow');
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

test('with-security-context', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'with_security_context', {
    port: 8080,
    securityContext: {
      capabilities: { add: ['SYS_PTRACE'] },
    },
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

function synthDeployment(chart: Chart): any {
  return Testing.synth(chart).find((r: any) => r.kind === 'Deployment');
}

test('preStop delay defaults to 15s with a 45s grace period', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', { port: 8080 });

  // THEN
  const podSpec = synthDeployment(chart).spec.template.spec;
  expect(podSpec.containers[0].lifecycle).toEqual({ preStop: { sleep: { seconds: 15 } } });
  expect(podSpec.terminationGracePeriodSeconds).toBe(45);
});

test('grace period follows a custom preStop delay', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', { port: 8080, preStopDelaySeconds: 20 });

  // THEN
  const podSpec = synthDeployment(chart).spec.template.spec;
  expect(podSpec.containers[0].lifecycle).toEqual({ preStop: { sleep: { seconds: 20 } } });
  expect(podSpec.terminationGracePeriodSeconds).toBe(50);
});

test('preStop delay 0 disables the hook and leaves the grace period unset', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', { port: 8080, preStopDelaySeconds: 0 });

  // THEN
  const podSpec = synthDeployment(chart).spec.template.spec;
  expect(podSpec.containers[0].lifecycle).toBeUndefined();
  expect(podSpec.terminationGracePeriodSeconds).toBeUndefined();
});

test('explicit grace period is used as given', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', { port: 8080, terminationGracePeriodSeconds: 120 });

  // THEN
  const podSpec = synthDeployment(chart).spec.template.spec;
  expect(podSpec.containers[0].lifecycle).toEqual({ preStop: { sleep: { seconds: 15 } } });
  expect(podSpec.terminationGracePeriodSeconds).toBe(120);
});

test('explicit grace period without preStop hook', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', {
    port: 8080,
    preStopDelaySeconds: 0,
    terminationGracePeriodSeconds: 10,
  });

  // THEN
  const podSpec = synthDeployment(chart).spec.template.spec;
  expect(podSpec.containers[0].lifecycle).toBeUndefined();
  expect(podSpec.terminationGracePeriodSeconds).toBe(10);
});

test('preStop hook only on the Plone container, not on sidecars', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', {
    port: 8080,
    sidecars: [{ name: 'log-forwarder', image: 'fluentd:latest' }],
  });

  // THEN
  const containers = synthDeployment(chart).spec.template.spec.containers;
  expect(containers[0].lifecycle).toBeDefined();
  expect(containers[1].lifecycle).toBeUndefined();
});

test.each([
  [{ terminationGracePeriodSeconds: 15 }, /must be greater than preStopDelaySeconds \(15\)/],
  [{ preStopDelaySeconds: 30, terminationGracePeriodSeconds: 20 }, /must be greater than preStopDelaySeconds \(30\)/],
  [{ preStopDelaySeconds: -1 }, /preStopDelaySeconds must be a non-negative integer/],
  [{ preStopDelaySeconds: 1.5 }, /preStopDelaySeconds must be a non-negative integer/],
  [{ terminationGracePeriodSeconds: -5 }, /terminationGracePeriodSeconds must be a non-negative integer/],
])('rejects invalid shutdown timing %j', (timing, message) => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // THEN
  expect(() => new PloneDeployment(chart, 'test', { port: 8080, ...timing })).toThrow(message);
});

test('containerOverrides keep plain IntOrString and Quantity values', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', {
    port: 8080,
    containerOverrides: {
      args: ['--debug'],
      startupProbe: { httpGet: { path: '/', port: 8080 }, failureThreshold: 30 },
      resources: { limits: { cpu: '2' } },
    },
  });

  // THEN
  const container = synthDeployment(chart).spec.template.spec.containers[0];
  expect(container.args).toEqual(['--debug']);
  expect(container.startupProbe).toEqual({ httpGet: { path: '/', port: 8080 }, failureThreshold: 30 });
  // a top-level key replaces the generated field as a whole
  expect(container.resources).toEqual({ limits: { cpu: '2' } });
  // untouched fields stay as generated
  expect(container.lifecycle).toEqual({ preStop: { sleep: { seconds: 15 } } });
});

test('containerOverrides null removes a generated field', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', { port: 8080, containerOverrides: { lifecycle: null } });

  // THEN
  expect(synthDeployment(chart).spec.template.spec.containers[0].lifecycle).toBeNull();
});

test('containerOverrides apply to the Plone container only', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneDeployment(chart, 'test', {
    port: 8080,
    sidecars: [{ name: 'log-forwarder', image: 'fluentd:latest' }],
    containerOverrides: { args: ['--debug'] },
  });

  // THEN
  const containers = synthDeployment(chart).spec.template.spec.containers;
  expect(containers[0].args).toEqual(['--debug']);
  expect(containers[1]).toEqual({ name: 'log-forwarder', image: 'fluentd:latest' });
});
