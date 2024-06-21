// eslint-disable-next-line import/no-extraneous-dependencies
import { Construct } from 'constructs';
import { IntOrString, KubeServiceProps, KubeService } from './imports/k8s';

export interface PloneBackendServiceOptions {
  /**
   * Port number.
   * @default 8080
   */
  readonly port?: number;

  /**
   * Port number.
   * @default 8080;
   */
  readonly targetPort?: number;

  /**
   * Selector label.
   */
  readonly selectorLabel: { [name: string]: string };

  /**
   * Extra labels to associate with resources.
   * @default - none
   */
  readonly labels?: { [name: string]: string };
}

export class PloneBackendService extends Construct {

  constructor(scope: Construct, id: string, options: PloneBackendServiceOptions) {
    super(scope, id);

    const port = options.port ?? 8080;
    const targetPort = IntOrString.fromNumber(options.targetPort ?? 8080);
    const selectorLabel = options.selectorLabel;

    const serviceOpts: KubeServiceProps = {
      metadata: {
        labels: options.labels ?? {},
      },
      spec: {
        type: 'ClusterIP',
        clusterIp: 'None',
        ports: [{ port: port, targetPort: targetPort }],
        selector: selectorLabel,
      },
    };
    new KubeService(this, 'service', serviceOpts);
  }
}