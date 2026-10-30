import { ApiObject, JsonPatch } from 'cdk8s';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Construct } from 'constructs';
import * as k8s from './imports/k8s';
import { PloneKubeService, toManifestValue } from './kube';

/**
 * Configuration for the generated Kubernetes Service spec.
 *
 * Curated fields cover the common cases; use `overrides` as an escape hatch
 * for any other `ServiceSpec` field. `overrides` has the highest precedence and
 * can override every field, including the construct-managed `ports`/`selector`
 * (at your own risk).
 */
export interface PloneServiceSpec {
  /**
   * Service type, e.g. ClusterIP | NodePort | LoadBalancer | ExternalName.
   * @default - ClusterIP (Kubernetes default)
   */
  readonly type?: string;

  /**
   * Traffic distribution preference, e.g. 'PreferClose' for topology-aware routing.
   * @default - none
   */
  readonly trafficDistribution?: string;

  /**
   * Session affinity, 'ClientIP' | 'None'.
   * @default - None (Kubernetes default)
   */
  readonly sessionAffinity?: string;

  /**
   * External traffic policy, 'Cluster' | 'Local'.
   * @default - Cluster (Kubernetes default)
   */
  readonly externalTrafficPolicy?: string;

  /**
   * Internal traffic policy, 'Cluster' | 'Local'.
   * @default - Cluster (Kubernetes default)
   */
  readonly internalTrafficPolicy?: string;

  /**
   * Publish not-ready addresses (e.g. for headless services with StatefulSets).
   * @default - false
   */
  readonly publishNotReadyAddresses?: boolean;

  /**
   * Load balancer implementation class.
   * @default - none
   */
  readonly loadBalancerClass?: string;

  /**
   * Source IP ranges allowed to access a LoadBalancer service.
   * @default - none
   */
  readonly loadBalancerSourceRanges?: string[];

  /**
   * Annotations to add to the Service metadata.
   * @default - none
   */
  readonly annotations?: { [name: string]: string };

  /**
   * Extra labels to add to the Service metadata.
   * @default - none
   */
  readonly labels?: { [name: string]: string };

  /**
   * Raw ServiceSpec overrides as a free-form map in manifest form (e.g.
   * `{ ipFamilyPolicy: 'PreferDualStack' }`). Highest precedence: each
   * top-level key replaces the field on top of all curated fields and the
   * construct-managed base. Use for any ServiceSpec field not covered above.
   * Keys and values are written to the Service spec verbatim and are not
   * validated by this construct. cdk8s value objects such as
   * `IntOrString.fromNumber(8080)` are unwrapped, and the TypeScript spellings
   * `clusterIp`, `loadBalancerIp` and `sessionAffinityConfig.clientIp` are
   * accepted for `clusterIP`, `loadBalancerIP` and `clientIP`.
   * @default - none
   */
  readonly overrides?: { [key: string]: any };
}

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

  /**
   * Annotations to add to the Service metadata.
   * Common annotations include: external-dns config, load balancer settings,
   * service mesh configuration, etc.
   * @example { 'external-dns.alpha.kubernetes.io/hostname': 'plone.example.com' }
   * @default - no additional annotations
   */
  readonly annotations?: { [name: string]: string };

  /**
   * Service spec configuration (type, trafficDistribution, sessionAffinity,
   * raw overrides, ...).
   * @default - construct-managed defaults only
   */
  readonly spec?: PloneServiceSpec;
}

/**
 * PloneService creates a Kubernetes Service for accessing Plone pods.
 *
 * This is an internal construct used by the Plone class.
 * It creates a ClusterIP service that routes traffic to the backend
 * or frontend deployment pods.
 */
export class PloneService extends Construct {
  /**
   * The name of the created Kubernetes service.
   * Can be used to reference this service from other resources.
   */
  public name: string;

  /**
   * The labels applied to this service.
   */
  public labels: { [name: string]: string };

  /**
   * The Kubernetes Service, for JSON patches as an escape hatch.
   */
  public readonly service: ApiObject;

  constructor(scope: Construct, id: string, options: PloneServiceOptions) {
    super(scope, id);

    const targetPort = k8s.IntOrString.fromNumber(options.targetPort);
    const selectorLabel = options.selectorLabel;
    const userSpec = options.spec ?? {};

    const service_labels = {
      ...userSpec.labels ?? {},
      ...options.labels ?? {},
      'app.kubernetes.io/part-of': 'plone',
      'app.kubernetes.io/managed-by': 'cdk8s-plone',
    };

    const mergedAnnotations = {
      ...options.annotations ?? {},
      ...userSpec.annotations ?? {},
    };
    const annotations = Object.keys(mergedAnnotations).length > 0 ? mergedAnnotations : undefined;

    const spec: k8s.ServiceSpec = {
      ports: [{ port: options.targetPort, targetPort: targetPort, name: options.portName ?? 'http' }],
      selector: selectorLabel,
      type: userSpec.type,
      trafficDistribution: userSpec.trafficDistribution,
      sessionAffinity: userSpec.sessionAffinity,
      externalTrafficPolicy: userSpec.externalTrafficPolicy,
      internalTrafficPolicy: userSpec.internalTrafficPolicy,
      publishNotReadyAddresses: userSpec.publishNotReadyAddresses,
      loadBalancerClass: userSpec.loadBalancerClass,
      loadBalancerSourceRanges: userSpec.loadBalancerSourceRanges,
    };

    const serviceOpts: k8s.KubeServiceProps = {
      metadata: {
        labels: service_labels,
        annotations: annotations,
      },
      spec: spec,
    };
    this.service = new PloneKubeService(this, 'service', serviceOpts);
    this.name = this.service.name;
    this.labels = service_labels;

    // Overrides win over everything, including ports/selector. They are
    // patched onto the converted spec: spread into k8s.ServiceSpec, the
    // generated toJson functions would drop plain IntOrString values and
    // unknown keys (#227).
    for (const [key, raw] of Object.entries(userSpec.overrides ?? {})) {
      if (raw === undefined) {
        continue;
      }
      let value = toManifestValue(raw);
      if (key === 'sessionAffinityConfig' && value?.clientIp !== undefined) {
        const { clientIp, ...rest } = value;
        value = { clientIP: clientIp, ...rest };
      }
      this.service.addJsonPatch(JsonPatch.add(`/spec/${LEGACY_SPEC_KEYS[key] ?? key}`, value));
    }
  }
}

/**
 * ServiceSpec keys whose TypeScript spelling in the generated imports differs
 * from the manifest. Overrides used to go through the typed conversion, so
 * the TypeScript spelling keeps working.
 */
const LEGACY_SPEC_KEYS: { [key: string]: string } = {
  clusterIp: 'clusterIP',
  loadBalancerIp: 'loadBalancerIP',
};
