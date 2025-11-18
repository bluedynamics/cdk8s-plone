# CDK8S Best Practices

## Naming Convention Rule

**NEVER use `metadata.name` in CDK8S constructs.**

- CDK8S automatically generates unique names for all Kubernetes resources
- Always let CDK8S decide the name and reference it via the construct's `name` property
- Manual names can cause conflicts and break CDK8S's naming conventions

### ❌ Wrong:
```typescript
const db = new cnpg.Cluster(this, 'db', {
    metadata: {
        name: 'my-cluster',  // NEVER do this!
    },
    spec: { /* ... */ }
});
this.dbServiceName = 'my-cluster-rw';  // Wrong: hard-coded name
```

### ✅ Correct:
```typescript
const db = new cnpg.Cluster(this, 'db', {
    metadata: {
        // No name property - let CDK8S generate it
        labels: { /* ... */ }
    },
    spec: { /* ... */ }
});
// Reference the generated name
this.dbServiceName = `${db.name}-rw`;
```

This ensures:
- No naming conflicts
- Proper CDK8S resource tracking
- Consistent naming across the application
- Easy refactoring and composition
