import * as fs from 'fs';
import * as path from 'path';
import { Helm } from 'cdk8s';
import { Construct } from 'constructs';
import { Plone } from './plone';

export interface PloneHttpcacheOptions {
  /**
   * plone chart
   * @default - none
   */
  readonly plone: Plone;

  /** varnishVcl
   * @default - file in config folder
   */
  readonly varnishVcl?: string;

  /** varnishVclFile
   * @default - undefined
   */
  readonly varnishVclFile?: string | undefined;

  /** existingSecret - Read admin credentials from user provided secret
   * @default - undefined
  */
  readonly existingSecret?: string;


  // resources
  readonly limitCpu?: string;
  readonly limitMemory?: string;
  readonly requestCpu?: string;
  readonly requestMemory?: string;
  // metrics
  readonly servicemonitor?: boolean;
}

export class PloneHttpcache extends Construct {

  public readonly httpcacheServiceName: string;

  constructor(scope: Construct, id: string, options: PloneHttpcacheOptions) {
    super(scope, id);
    let varnishVcl: string;
    if (!options.varnishVcl) {
      let vclPath: string;
      if (!options.varnishVclFile) {
        vclPath = path.join(__dirname, 'config', 'varnish.tpl.vcl');
      } else {
        vclPath = options.varnishVclFile;
      }
      varnishVcl = fs.readFileSync(vclPath, 'utf8');
    } else {
      varnishVcl = options.varnishVcl;
    }
    const httpcache = new Helm(this, 'httpcache', {
      // see https://github.com/mittwald/kube-httpcache/chart
      repo: 'https://helm.mittwald.de',
      chart: 'kube-httpcache',
      values: {
        replicaCount: 2,
        cache: {
          // need to looks at the frontendWatch, do we need it?
          frontendWatch: false,
          backendWatch: false,
          existingSecret: options.existingSecret ?? undefined,
        },
        vclTemplate: varnishVcl,
        extraEnvVars: [
          { name: 'BACKEND_SERVICE_NAME', value: options.plone.backendServiceName },
          { name: 'BACKEND_SERVICE_PORT', value: '8080' },
          { name: 'BACKEND_SITE_ID', value: options.plone.siteId },
          { name: 'FRONTEND_SERVICE_NAME', value: options.plone.frontendServiceName },
          { name: 'FRONTEND_SERVICE_PORT', value: '3000' },
        ],
        // see https://github.com/mittwald/kube-httpcache/issues/253
        nodeSelector: {
          'kubernetes.io/arch': 'amd64',
        },
        resources: {
          limits: {
            cpu: options.limitCpu || '500m',
            memory: options.limitMemory || '500Mi',
          },
          requests: {
            cpu: options.requestCpu || '100m',
            memory: options.requestMemory || '100Mi',
          },
        },
        rbac: {
          enabled: false,
        },
        exporter: {
          enabled: true,
          resources: {
            limits: {
              cpu: '100m',
              memory: '100Mi',
            },
            requests: {
              cpu: '10m',
              memory: '50Mi',
            },
          },
        },
        serviceMonitor: {
          enabled: options.servicemonitor || false,
          scrapeSignaller: options.servicemonitor || false,
        },
      },
    });
    const httpcacheService = httpcache.apiObjects.find((construct) => {
      if ((construct.kind === 'Service') && (construct.metadata.name?.endsWith('kube-httpcache'))) {
        return construct.name;
      }
      return undefined;
    });
    if (httpcacheService === undefined) {
      throw new Error('Could not find httpcache service');
    }
    this.httpcacheServiceName = httpcacheService.name;
  }
}