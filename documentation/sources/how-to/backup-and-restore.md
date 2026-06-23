---
myst:
  html_meta:
    "description": "Back up and restore a cdk8s-plone deployment by protecting the PostgreSQL database that holds the Plone content."
    "property=og:description": "Back up and restore a cdk8s-plone deployment by protecting the PostgreSQL database that holds the Plone content."
    "property=og:title": "Back up and restore"
    "keywords": "Plone, cdk8s, Kubernetes, backup, restore, PostgreSQL, CloudNativePG, pg_dump, RelStorage"
---

# Back up and restore

This guide shows you how to back up and restore a Plone deployment.

`cdk8s-plone` does not run backups.
It deploys the application; your data lives in PostgreSQL, so you protect the database.

## What to back up

Plone stores its content in the ZODB, which this stack keeps in PostgreSQL through RelStorage.
A backup of the PostgreSQL database is a backup of your site content.

If your configuration keeps blobs on a separate volume rather than in the database, back up that volume as well.
The application images and Kubernetes manifests are reproducible from your `cdk8s-plone` code, so they do not need a backup.

## Back up a CloudNativePG database

CloudNativePG performs scheduled and on-demand backups to object storage through its own resources.

Configure object-store backups on the `Cluster`, then schedule them with a `ScheduledBackup`:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: ScheduledBackup
metadata:
  name: plone-daily
spec:
  schedule: "0 0 2 * * *"
  backupOwnerReference: self
  cluster:
    name: <cluster-name>
```

Take an immediate backup with a `Backup` resource:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: plone-manual
spec:
  cluster:
    name: <cluster-name>
```

See the [CloudNativePG backup documentation](https://cloudnative-pg.io/documentation/current/backup/) for object-store credentials and retention policies.

## Back up a Bitnami or standalone database

For a database without an operator, take a logical dump with `pg_dump` from a client pod:

```shell
kubectl exec -n <namespace> <postgres-pod> -- \
  pg_dump -U <user> -d <database> -Fc -f /tmp/plone.dump
kubectl cp <namespace>/<postgres-pod>:/tmp/plone.dump ./plone.dump
```

Run this on a schedule with a `CronJob`, and store the dump off-cluster.

## Restore

For CloudNativePG, create a new `Cluster` with a `bootstrap.recovery` stanza that points at a backup, following the [CloudNativePG recovery guide](https://cloudnative-pg.io/documentation/current/recovery/).

For a logical dump, restore into an empty database with `pg_restore`:

```shell
kubectl cp ./plone.dump <namespace>/<postgres-pod>:/tmp/plone.dump
kubectl exec -n <namespace> <postgres-pod> -- \
  pg_restore -U <user> -d <database> --clean --if-exists /tmp/plone.dump
```

After the database is restored, restart the backend so it reconnects:

```shell
kubectl rollout restart deployment/<backend-deployment> -n <namespace>
```

```{warning}
Restoring overwrites the current database.
Take a fresh backup before you restore, so you can return to the current state if the restore goes wrong.
```

## Verify

Confirm a backup completed and is recent:

```shell
kubectl get backup -n <namespace>
kubectl get scheduledbackup -n <namespace>
```

After a restore, open the site and confirm your content is present.

## See also

- {doc}`/how-to/upgrade-and-rollout` — back up before a risky upgrade.
- {doc}`/explanation/architecture` — where Plone stores its data.
- [CloudNativePG documentation](https://cloudnative-pg.io/documentation/current/) — backup, recovery, and retention.
