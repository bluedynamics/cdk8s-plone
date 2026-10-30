import { Chart, Testing } from 'cdk8s';
import { Plone } from '../src/plone';
import { PloneVinylCache } from '../src/vinylcache';

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

test('with blicca variant (no frontend)', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  // legacy wire value 'classicui' must keep selecting the Blicca (backend-only) variant
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

test('with extraBackends', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    extraBackends: [
      {
        name: 'custom_api',
        serviceName: 'custom-api-service',
        port: 9090,
        probe: {
          url: '/healthz',
          interval: '10s',
          timeout: '3s',
          window: 5,
          threshold: 3,
        },
      },
    ],
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with nodeSelector', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    nodeSelector: {
      'kubernetes.io/os': 'linux',
      'node-type': 'cache',
    },
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with nodeSelector and tolerations', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    nodeSelector: {
      'node-type': 'cache',
    },
    tolerations: [
      {
        key: 'dedicated',
        operator: 'Equal',
        value: 'cache',
        effect: 'NoSchedule',
      },
    ],
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with shard director and shardBy URL', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    director: 'shard',
    shardBy: 'URL',
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('with full shard tuning (healthy, rampup, replicas)', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    director: 'shard',
    shardBy: 'URL',
    shardHealthy: 'ALL',
    shardRampup: '45s',
    shardReplicas: 128,
  });

  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});

test('shard options ignored when director is non-shard', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    director: 'round_robin',
    shardBy: 'URL',
    shardHealthy: 'ALL',
  });

  // THEN - emitted manifest must not contain a shard block
  const manifest = Testing.synth(chart);
  const vc = manifest.find(r => r.kind === 'VinylCache');
  expect(vc).toBeDefined();
  expect(vc.spec.director.type).toBe('round_robin');
  expect(vc.spec.director.shard).toBeUndefined();
});

test('with storage malloc', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    storage: [
      { name: 's0', type: 'malloc', size: '1Gi' },
    ],
  });

  // THEN
  const manifest = Testing.synth(chart);
  const vc = manifest.find((m: any) => m.kind === 'VinylCache');
  expect(vc).toBeDefined();
  expect(vc.spec.storage).toEqual([
    { name: 's0', type: 'malloc', size: '1Gi' },
  ]);
  expect(manifest).toMatchSnapshot();
});

test('with storage file + malloc', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    storage: [
      { name: 'mem', type: 'malloc', size: '500M' },
      { name: 'disk', type: 'file', path: '/var/lib/varnish/disk.bin', size: '5Gi' },
    ],
  });

  // THEN
  const manifest = Testing.synth(chart);
  const vc = manifest.find((m: any) => m.kind === 'VinylCache');
  expect(vc.spec.storage).toEqual([
    { name: 'mem', type: 'malloc', size: '500M' },
    { name: 'disk', type: 'file', path: '/var/lib/varnish/disk.bin', size: '5Gi' },
  ]);
  expect(manifest).toMatchSnapshot();
});

test('without storage omits spec.storage', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', { plone });

  // THEN
  const manifest = Testing.synth(chart);
  const vc = manifest.find((m: any) => m.kind === 'VinylCache');
  expect(vc.spec.storage).toBeUndefined();
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

test('cluster and varnishParameters are passed through', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', {
    plone,
    cluster: true,
    varnishParameters: { nuke_limit: '1000' },
  });

  // THEN
  const vc = Testing.synth(chart).find((o: any) => o.kind === 'VinylCache');
  expect(vc.spec.cluster).toEqual({ enabled: true });
  expect(vc.spec.varnishParameters).toEqual({ nuke_limit: '1000' });
});

test('cluster and varnishParameters are omitted by default', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'test', { plone });

  // THEN
  const vc = Testing.synth(chart).find((o: any) => o.kind === 'VinylCache');
  expect(vc.spec.cluster).toBeUndefined();
  expect(vc.spec.varnishParameters).toBeUndefined();
});

function synthVinylCache(chart: Chart): any {
  return Testing.synth(chart).find((m: any) => m.kind === 'VinylCache');
}

test('vinylCacheServiceName matches the VinylCache name, also for mixed-case ids', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'MyChart');

  // WHEN
  const plone = new Plone(chart, 'plone');
  const cache = new PloneVinylCache(chart, 'Cache', { plone });

  // THEN
  expect(cache.vinylCacheServiceName).toBe(synthVinylCache(chart).metadata.name);
  expect(cache.vinylCacheServiceName).toBe(cache.vinylCacheServiceName.toLowerCase());
});

test('invalidationUrl names the namespaced invalidation host', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone', { namespace: 'site' });

  // WHEN
  const plone = new Plone(chart, 'plone');
  const cache = new PloneVinylCache(chart, 'cache', { plone });

  // THEN
  const name = synthVinylCache(chart).metadata.name;
  expect(cache.invalidationUrl).toBe(`http://${name}-invalidation.site:8090`);
});

test('invalidationUrl throws without a namespace', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  const plone = new Plone(chart, 'plone');
  const cache = new PloneVinylCache(chart, 'cache', { plone });

  // THEN
  expect(() => cache.invalidationUrl).toThrow(/needs a namespace/);
});

test('invalidationUrl throws when invalidation is disabled', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone', { namespace: 'site' });

  // WHEN
  const plone = new Plone(chart, 'plone');
  const cache = new PloneVinylCache(chart, 'cache', { plone, invalidation: false });

  // THEN
  expect(() => cache.invalidationUrl).toThrow(/invalidation is disabled/);
});

test('renders vinyl.bluedynamics.eu/v1 with varnish 9.1 by default', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', { plone: new Plone(chart, 'plone') });

  // THEN
  const vc = synthVinylCache(chart);
  expect(vc.apiVersion).toBe('vinyl.bluedynamics.eu/v1');
  expect(vc.spec.image).toBe('varnish:9.1.0');
});

test('shardBy HASH is rejected with a reason', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // THEN
  expect(() => new PloneVinylCache(chart, 'cache', { plone, shardBy: 'HASH' })).toThrow(/cloud-vinyl 1.0 removed "HASH"/);
});

test('purgeHosts render into spec.invalidation.purge.hosts', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', {
    plone: new Plone(chart, 'plone'),
    purgeHosts: ['example.org', 'www.example.org'],
  });

  // THEN
  expect(synthVinylCache(chart).spec.invalidation.purge).toEqual({
    enabled: true,
    hosts: ['example.org', 'www.example.org'],
  });
});

test('without purgeHosts the purge block stays as before', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', { plone: new Plone(chart, 'plone') });

  // THEN
  expect(synthVinylCache(chart).spec.invalidation.purge).toEqual({ enabled: true });
});

test.each([
  [{ purgeHosts: ['example.org'], invalidation: false }, /needs invalidation enabled/],
  [{ purgeHosts: ['Example.org'] }, /not a lowercase hostname/],
  [{ purgeHosts: ['https://example.org'] }, /not a lowercase hostname/],
  [{ purgeHosts: ['example.org', 'example.org'] }, /duplicates/],
  [{ purgeHosts: Array.from({ length: 17 }, (_, i) => `h${i}.example.org`) }, /at most 16/],
])('rejects invalid purgeHosts %#', (opts, message) => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // THEN
  expect(() => new PloneVinylCache(chart, 'cache', { plone, ...opts })).toThrow(message);
});

test('default vcl_recv snippet leaves PURGE and BAN to cloud-vinyl', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', { plone: new Plone(chart, 'plone') });

  // THEN
  // cloud-vinyl injects the snippet for GET/HEAD only and imports vmod_purge,
  // so `client.ip ~ purge` fails to compile ("Symbol 'purge' type (vmod)").
  const recv: string = synthVinylCache(chart).spec.vcl.snippets.vclRecv;
  expect(recv).not.toMatch(/req\.method|~\s*purge\b/);
});

test('tracing renders an enabled tracer with OTLP settings', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', {
    plone: new Plone(chart, 'plone'),
    tracing: {
      otlpEndpoint: 'otel-collector.monitoring:4317',
      insecure: true,
      serviceName: 'plone-cache',
      requestCpu: '50m',
      limitMemory: '128Mi',
    },
  });

  // THEN
  expect(synthVinylCache(chart).spec.tracing).toEqual({
    enabled: true,
    otlp: { endpoint: 'otel-collector.monitoring:4317', insecure: true },
    serviceName: 'plone-cache',
    resources: { requests: { cpu: '50m' }, limits: { memory: '128Mi' } },
  });
});

test('tracing with only an endpoint leaves the rest to the operator', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', {
    plone: new Plone(chart, 'plone'),
    tracing: { otlpEndpoint: '[fd00::1]:4318', protocol: 'http/protobuf' },
  });

  // THEN
  expect(synthVinylCache(chart).spec.tracing).toEqual({
    enabled: true,
    otlp: { endpoint: '[fd00::1]:4318', protocol: 'http/protobuf' },
  });
});

test('no tracing and esi blocks by default', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', { plone: new Plone(chart, 'plone') });

  // THEN
  const spec = synthVinylCache(chart).spec;
  expect(spec.tracing).toBeUndefined();
  expect(spec.esi).toBeUndefined();
});

test('esi renders spec.esi.enabled', () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');

  // WHEN
  new PloneVinylCache(chart, 'cache', { plone: new Plone(chart, 'plone'), esi: true });

  // THEN
  expect(synthVinylCache(chart).spec.esi).toEqual({ enabled: true });
});

test.each([
  [{ otlpEndpoint: 'http://collector:4317' }, /host:port without scheme/],
  [{ otlpEndpoint: 'collector' }, /host:port without scheme/],
  [{ otlpEndpoint: '' }, /host:port without scheme/],
  [{ otlpEndpoint: 'collector:4317', protocol: 'http' }, /"grpc" or "http\/protobuf"/],
])('rejects invalid tracing %j', (tracing, message) => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, 'plone');
  const plone = new Plone(chart, 'plone');

  // THEN
  expect(() => new PloneVinylCache(chart, 'cache', { plone, tracing })).toThrow(message);
});
