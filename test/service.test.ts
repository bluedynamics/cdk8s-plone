import { Chart, JsonPatch, Testing } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import * as k8s from '../src/imports/k8s';
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

test('overrides keep plain IntOrString values', () => {
  const svc = synthService({
    targetPort: 8080,
    spec: { overrides: { ports: [{ name: 'http', port: 80, targetPort: 8080 }] } },
  });
  expect(svc.spec.ports).toEqual([{ name: 'http', port: 80, targetPort: 8080 }]);
});

test('overrides unwrap IntOrString objects from both imports', () => {
  const svc = synthService({
    targetPort: 8080,
    spec: {
      overrides: {
        ports: [
          { name: 'a', port: 80, targetPort: k8s.IntOrString.fromNumber(8080) },
          { name: 'b', port: 81, targetPort: kplus.k8s.IntOrString.fromString('http') },
        ],
      },
    },
  });
  expect(svc.spec.ports).toEqual([
    { name: 'a', port: 80, targetPort: 8080 },
    { name: 'b', port: 81, targetPort: 'http' },
  ]);
});

test.each([
  [{ clusterIp: 'None' }, { clusterIP: 'None' }],
  [{ clusterIP: 'None' }, { clusterIP: 'None' }],
  [{ loadBalancerIp: '10.0.0.1' }, { loadBalancerIP: '10.0.0.1' }],
  [
    { sessionAffinityConfig: { clientIp: { timeoutSeconds: 600 } } },
    { sessionAffinityConfig: { clientIP: { timeoutSeconds: 600 } } },
  ],
])('overrides accept TypeScript and manifest spellings %j', (overrides, expected) => {
  const svc = synthService({ targetPort: 8080, spec: { overrides } });
  expect(svc.spec).toMatchObject(expected);
  expect(svc.spec.clusterIp).toBeUndefined();
  expect(svc.spec.loadBalancerIp).toBeUndefined();
});

test('patches on the service win over overrides', () => {
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const service = new PloneService(chart, 'test', { targetPort: 8080, spec: { overrides: { type: 'NodePort' } } });
  service.service.addJsonPatch(JsonPatch.replace('/spec/type', 'LoadBalancer'));
  expect(Testing.synth(chart)[0].spec.type).toBe('LoadBalancer');
});
