import { Construct } from 'constructs';
import * as cnpg from './imports/postgresql.cnpg.io'

export class PGCloudNativePGChart extends Construct {
    // uses the CloudNativePG operator
    // https://cloudnative-pg.io/

    public readonly dbServiceName: string;
    public readonly clusterName: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const db = new cnpg.Cluster(
            this,
            'db',
            {
                metadata: {
                    labels: {
                        'app.kubernetes.io/name': 'plone-postgresql',
                        'app.kubernetes.io/instance': 'postgresql',
                        'app.kubernetes.io/component': 'database',
                        'app.kubernetes.io/part-of': 'plone',
                    }
                },
                spec: {
                    instances: 2,
                    postgresql: {
                        parameters: {
                            'max_connections': '200',
                            'shared_buffers': '256MB',
                            'effective_cache_size': '1GB',
                            'maintenance_work_mem': '64MB',
                            'checkpoint_completion_target': '0.9',
                            'wal_buffers': '16MB',
                            'default_statistics_target': '100',
                            'random_page_cost': '1.1',
                            'effective_io_concurrency': '200',
                            'work_mem': '4MB',
                            'min_wal_size': '1GB',
                            'max_wal_size': '4GB',
                        }
                    },
                    bootstrap: {
                        initdb: {
                            database: 'plone',
                            owner: 'plone',
                        }
                    },
                    storage: {
                        size: '10Gi',
                    },
                }
            }
        );

        // CloudNativePG creates a service named {cluster-name}-rw for read-write access
        // CloudNativePG creates a secret named {cluster-name}-app with username/password
        // Use the CDK8S-generated name, never hard-code metadata.name
        this.clusterName = db.name;
        this.dbServiceName = `${db.name}-rw`;
    }
}
