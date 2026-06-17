import { BliccaChart } from './main';
import { Testing } from 'cdk8s';

describe('Blicca Example', () => {
  test('Synthesizes correctly', () => {
    const app = Testing.app();
    const chart = new BliccaChart(app, 'test-chart');
    const results = Testing.synth(chart);
    expect(results).toMatchSnapshot();
  });
});
