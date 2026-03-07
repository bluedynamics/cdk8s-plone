import { ClassicUIChart } from './main';
import { Testing } from 'cdk8s';

describe('Classic UI Example', () => {
  test('Synthesizes correctly', () => {
    const app = Testing.app();
    const chart = new ClassicUIChart(app, 'test-chart');
    const results = Testing.synth(chart);
    expect(results).toMatchSnapshot();
  });
});
