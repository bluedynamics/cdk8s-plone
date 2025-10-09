import { Construct } from 'constructs';
import * as k8s from './imports/k8s';

/**
 * Configuration options for PodDisruptionBudget.
 */
export interface PlonePDBOptions {
  /**
   * Maximum number or percentage of pods that can be unavailable during voluntary disruptions.
   * Can be an absolute number (e.g., 1) or a percentage (e.g., '50%').
   * Cannot be used together with minAvailable.
   * @example 1 or '25%'
   * @default - not set (defaults to minAvailable=1 if neither is specified)
   */
  readonly maxUnavailable?: number | string;

  /**
   * Minimum number or percentage of pods that must remain available during voluntary disruptions.
   * Can be an absolute number (e.g., 1) or a percentage (e.g., '50%').
   * Cannot be used together with maxUnavailable.
   * @example 2 or '50%'
   * @default 1 (if maxUnavailable is not set)
   */
  readonly minAvailable?: number | string;

  /**
   * Additional Kubernetes labels for the PodDisruptionBudget.
   * @default - standard Plone labels only
   */
  readonly labels?: { [name: string]: string };
}

/**
 * PlonePDB creates a Kubernetes PodDisruptionBudget for high availability.
 *
 * This is an internal construct used by PloneDeployment.
 * It ensures a minimum number of pods remain available during voluntary
 * disruptions like node drains or cluster upgrades.
 */
export class PlonePDB extends Construct {

  constructor(scope: Construct, id: string, selectorLabel: { [name: string]: string }, options: PlonePDBOptions) {
    super(scope, id);

    var spec: k8s.PodDisruptionBudgetSpec = {};
    if (typeof options.maxUnavailable === 'number') {
      spec = {
        maxUnavailable: k8s.IntOrString.fromNumber(options.maxUnavailable as number),
      };
    } else if (typeof options.maxUnavailable === 'string') {
      spec = {
        maxUnavailable: k8s.IntOrString.fromString(options.maxUnavailable as string),
      };
    }
    if (typeof options.minAvailable === 'number') {
      spec = {
        ...spec,
        minAvailable: k8s.IntOrString.fromNumber(options.minAvailable as number),
      };
    } else if (typeof options.minAvailable === 'string') {
      spec = {
        ...spec,
        minAvailable: k8s.IntOrString.fromString(options.minAvailable as string),
      };
    }
    if (options.maxUnavailable === undefined && options.minAvailable === undefined) {
      spec = {
        minAvailable: k8s.IntOrString.fromNumber(1),
      };
    }

    spec = {
      ...spec,
      selector: { matchLabels: selectorLabel },
    };
    const pdb_labels = {
      ...options.labels ?? {},
      'app.kubernetes.io/part-of': 'plone',
      'app.kubernetes.io/managed-by': 'cdk8s-plone',
    };

    new k8s.KubePodDisruptionBudget(this, 'PDB', {
      metadata: {
        labels: pdb_labels,
      },
      spec: spec,
    });
  }
}
