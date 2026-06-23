import { Construct } from 'constructs';
import * as k8s from './imports/k8s';

/**
 * Operator-free PostgreSQL for the example.
 *
 * Deploys a single-instance PostgreSQL StatefulSet using the official
 * `postgres` Docker image. No operator and no third-party Helm chart are
 * required, which keeps the dependency surface minimal. It is intended for
 * development and small production setups; for high availability, point-in-time
 * recovery, and automated failover use the CloudNativePG variant instead.
 */
export class PGPlainChart extends Construct {
    public readonly dbServiceName: string;
    public readonly secretName: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const dbname = 'plone';
        const dbuser = 'plone';
        const dbpass = 'admin@plone';

        const labels = {
            'app.kubernetes.io/name': 'plone-postgresql',
            'app.kubernetes.io/instance': 'postgresql',
            'app.kubernetes.io/component': 'database',
            'app.kubernetes.io/part-of': 'plone',
        };

        const secret = new k8s.KubeSecret(this, 'secret', {
            metadata: { labels },
            stringData: { username: dbuser, password: dbpass, database: dbname },
        });
        this.secretName = secret.name;

        const service = new k8s.KubeService(this, 'service', {
            metadata: { labels },
            spec: {
                selector: labels,
                ports: [
                    { port: 5432, targetPort: k8s.IntOrString.fromNumber(5432), name: 'postgresql' },
                ],
            },
        });
        this.dbServiceName = service.name;

        new k8s.KubeStatefulSet(this, 'db', {
            metadata: { labels },
            spec: {
                serviceName: service.name,
                replicas: 1,
                selector: { matchLabels: labels },
                template: {
                    metadata: { labels },
                    spec: {
                        // The official postgres image runs as uid/gid 999.
                        // fsGroup makes the mounted volume group-writable for it.
                        securityContext: { fsGroup: 999 },
                        containers: [
                            {
                                name: 'postgresql',
                                image: 'postgres:18',
                                ports: [{ containerPort: 5432, name: 'postgresql' }],
                                env: [
                                    { name: 'POSTGRES_USER', valueFrom: { secretKeyRef: { name: secret.name, key: 'username' } } },
                                    { name: 'POSTGRES_PASSWORD', valueFrom: { secretKeyRef: { name: secret.name, key: 'password' } } },
                                    { name: 'POSTGRES_DB', valueFrom: { secretKeyRef: { name: secret.name, key: 'database' } } },
                                    // Keep PGDATA in a subdirectory so the volume root can hold lost+found.
                                    { name: 'PGDATA', value: '/var/lib/postgresql/data/pgdata' },
                                ],
                                volumeMounts: [
                                    { name: 'data', mountPath: '/var/lib/postgresql/data' },
                                ],
                                readinessProbe: {
                                    exec: { command: ['pg_isready', '-U', dbuser, '-d', dbname] },
                                    initialDelaySeconds: 10,
                                    periodSeconds: 10,
                                    timeoutSeconds: 5,
                                },
                                livenessProbe: {
                                    exec: { command: ['pg_isready', '-U', dbuser, '-d', dbname] },
                                    initialDelaySeconds: 30,
                                    periodSeconds: 15,
                                    timeoutSeconds: 5,
                                },
                                resources: {
                                    requests: {
                                        cpu: k8s.Quantity.fromString('100m'),
                                        memory: k8s.Quantity.fromString('256Mi'),
                                    },
                                    limits: {
                                        cpu: k8s.Quantity.fromString('1'),
                                        memory: k8s.Quantity.fromString('1Gi'),
                                    },
                                },
                            },
                        ],
                    },
                },
                volumeClaimTemplates: [
                    {
                        metadata: { name: 'data', labels },
                        spec: {
                            accessModes: ['ReadWriteOnce'],
                            resources: {
                                requests: { storage: k8s.Quantity.fromString('10Gi') },
                            },
                        },
                    },
                ],
            },
        });
    }
}
