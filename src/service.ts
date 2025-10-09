// eslint-disable-next-line import/no-extraneous-dependencies
import { Construct } from 'constructs';
import * as k8s from './imports/k8s';

export interface PloneServiceOptions {

  /**
   * targetPort number.
   */
  readonly targetPort: number;

  /**
   * Selector label.
   */
  readonly selectorLabel: { [name: string]: string };

  /**
   * Extra labels to associate with resources.
   * @default - none
   */
  readonly labels?: { [name: string]: string };

  /**
   * Port name for the service.
   * @default - 'http'
   */
  readonly portName?: string;
}

export class PloneService extends Construct {

  public name: string;

  constructor(scope: Construct, id: string, options: PloneServiceOptions) {
    super(scope, id);

    const targetPort = k8s.IntOrString.fromNumber(options.targetPort);
    const selectorLabel = options.selectorLabel;
    const service_labels = {
      ...options.labels ?? {},
      'app.kubernetes.io/part-of': 'plone',
      'app.kubernetes.io/managed-by': 'cdk8s-plone',
    };

    const serviceOpts: k8s.KubeServiceProps = {
      metadata: {
        labels: service_labels,
      },
      spec: {
        ports: [{ port: options.targetPort, targetPort: targetPort, name: options.portName ?? 'http' }],
        selector: selectorLabel,
      },
    };
    const service = new k8s.KubeService(this, 'service', serviceOpts);
    this.name = service.name;
  }
}
