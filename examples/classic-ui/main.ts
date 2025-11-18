import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { Plone, PloneVariant, PloneHttpcache } from '@bluedynamics/cdk8s-plone';
import * as kplus from 'cdk8s-plus-30';
import * as path from 'path';
import { IngressChart } from './ingress';
import { config } from 'dotenv';
import { PGBitnamiChart } from './postgres.bitnami';
import { PGCloudNativePGChart } from './postgres.cloudnativepg';


export class ClassicUIChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    config();

    // ================================================================================================================
    // Postgresql
    let db: PGBitnamiChart | PGCloudNativePGChart;
    let postgresql_username;
    let postgresql_password;
    if ((process.env.DATABASE ?? 'bitnami') == 'cloudnativepg') {
      const cloudnativepgDb = new PGCloudNativePGChart(this, 'db');
      db = cloudnativepgDb;
      // CloudNativePG creates secrets with format: {cluster-name}-app
      // Use the CDK8S-generated cluster name, never hard-code
      const secretName = `${cloudnativepgDb.clusterName}-app`;
      postgresql_username = { valueFrom: { secretKeyRef: { name: secretName, key: 'username' }}};
      postgresql_password = { valueFrom: { secretKeyRef: { name: secretName, key: 'password' }}};
    } else {
      const bitnamiDb = new PGBitnamiChart(this, 'db');
      db = bitnamiDb;
      postgresql_username = { value: 'plone' };
      postgresql_password = { valueFrom: { secretKeyRef: { name: `${bitnamiDb.dbServiceName}`, key: 'password' }}};
    }

    // ================================================================================================================
    // Plone Classic UI

    // prepare the environment variables for the plone deployment
    const dbMDName = db.dbServiceName
    const env = new kplus.Env(
      [],
      {
        SECRET_POSTGRESQL_USERNAME: postgresql_username,
        SECRET_POSTGRESQL_PASSWORD: postgresql_password,
        INSTANCE_db_storage: { value: `relstorage` },
        INSTANCE_db_blob_mode: { value: `cache` },
        INSTANCE_db_cache_size: { value: `5000` },
        INSTANCE_db_cache_size_bytes: { value: `1500MB` },
        INSTANCE_db_relstorage: { value: `postgresql` },
        INSTANCE_db_relstorage_postgresql_dsn: { value: `host='${dbMDName}' dbname='plone' user='$(SECRET_POSTGRESQL_USERNAME)' password='$(SECRET_POSTGRESQL_PASSWORD)'` },
        INSTANCE_db_relstorage_cache_local_mb: { value: `800` },
      },
    );

    // create the plone deployment with Classic UI variant
    const plone = new Plone(this, 'plone', {
      version: 'classic.version',
      variant: PloneVariant.CLASSICUI,
      backend: {
        image: process.env.PLONE_BACKEND_IMAGE ?? 'plone/plone-backend:6.1.3',
        environment: env,
        replicas: 2,
      },
    })

    // ================================================================================================================
    // Varnish with kube-httpcache
    const httpcache = new PloneHttpcache(
      this,
      'httpcache',
      {
        plone: plone,
        varnishVclFile: path.join(__dirname, 'config', 'varnish.tpl.vcl'),
      }
    )

    // ================================================================================================================
    // Ingress
    new IngressChart(
      this,
      'ingress',
      {
        ingressType: 'traefik',
        issuer: process.env.CLUSTER_ISSUER ?? 'letsencrypt-prod',
        domainCached: process.env.DOMAIN_CACHED ?? 'plone-cached.example.com',
        domainUncached: process.env.DOMAIN_UNCACHED ?? 'plone-uncached.example.com',
        domainMaintenance: process.env.DOMAIN_MAINTENANCE ?? 'plone-maintenance.example.com',
        backendServiceName: plone.backendServiceName,
        httpcacheServiceName: httpcache.httpcacheServiceName,
      });
  }
}


const app = new App();
new ClassicUIChart(app, 'plone-classic');
app.synth();
