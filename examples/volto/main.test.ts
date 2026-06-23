import { ExampleChart } from './main';
import { Testing } from 'cdk8s';

describe('Production Volto Example', () => {
  test('Synthesizes correctly', () => {
    const app = Testing.app();
    const chart = new ExampleChart(app, 'test-chart');
    const results = Testing.synth(chart);
    // kube-httpcache generates a random Varnish admin secret on each synth.
    // Redact it so the snapshot stays deterministic.
    for (const obj of results) {
      if (obj.kind === 'Secret' && obj.data && typeof obj.data.secret === 'string') {
        obj.data.secret = '<redacted-for-snapshot>';
      }
    }
    expect(results).toMatchSnapshot();
  });
});
