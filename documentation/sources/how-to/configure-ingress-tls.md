---
myst:
  html_meta:
    "description": "Expose a cdk8s-plone deployment with a Kubernetes Ingress and TLS certificates from cert-manager."
    "property=og:description": "Expose a cdk8s-plone deployment with a Kubernetes Ingress and TLS certificates from cert-manager."
    "property=og:title": "Configure ingress and TLS"
    "keywords": "Plone, cdk8s, Kubernetes, ingress, TLS, cert-manager, Traefik, Volto"
---

# Configure ingress and TLS

This guide shows you how to expose a Plone deployment to the internet with a Kubernetes Ingress and TLS certificates from cert-manager.

`cdk8s-plone` does not create ingress resources.
It creates the Services you route to, and you add the ingress yourself.

## Prerequisites

- A working Plone deployment created with `cdk8s-plone`.
- An ingress controller in the cluster, such as [Traefik](https://doc.traefik.io/traefik/) or [ingress-nginx](https://kubernetes.github.io/ingress-nginx/).
- [cert-manager](https://cert-manager.io/) installed, with a `ClusterIssuer` for your certificate authority.
- DNS records for your domains pointing at the ingress controller.

## Identify the services to route to

The constructs expose the Service names you need as read-only members:

```typescript
const plone = new Plone(chart, 'plone', {
  backend: { image: 'plone/plone-backend:6.1.3' },
  frontend: { image: 'plone/plone-frontend:16.0.0' },
});

const backendService = plone.backendServiceName;   // backend REST API, port 8080
const frontendService = plone.frontendServiceName; // Volto frontend, port 3000 (Volto only)
```

Both Services name their port `http`, so reference them by that name in an Ingress.
For the Blicca variant there is no frontend Service; route public traffic to the backend instead.
When you run a cache, route public traffic to the cache Service from {doc}`/how-to/deploy-with-httpcache` or {doc}`/how-to/deploy-with-vinyl-cache`.

## Add an Ingress with TLS

Apply an Ingress that routes your domain to the frontend Service and requests a certificate through cert-manager.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: plone
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - plone.example.com
      secretName: plone-tls
  rules:
    - host: plone.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: <frontendServiceName>
                port:
                  name: http
```

cert-manager watches the `tls` block and the `cluster-issuer` annotation, issues the certificate, and stores it in the `plone-tls` Secret.

## Route a cache, an API, and a maintenance domain

A production setup commonly uses three domains:

- a public domain that points at the Varnish cache Service,
- an uncached domain that points at the frontend Service for testing,
- a maintenance domain that points at the backend Service for the Plone control panel.

Add one `host` rule per domain, each with its own `tls` entry, pointing at the matching Service.

```{tip}
The [production-volto example](https://github.com/bluedynamics/cdk8s-plone/tree/main/examples/production-volto) implements this three-domain pattern with Traefik `IngressRoute` resources in `ingress.ts`.
Use it as a complete, tested reference, including the Kong and Traefik variants.
```

## Verify

Confirm the ingress and certificate exist and resolve:

```shell
kubectl get ingress -n <namespace>
kubectl get certificate -n <namespace>
kubectl describe certificate plone-tls -n <namespace>
```

Once the certificate is `Ready`, request the site over HTTPS:

```shell
curl -sI https://plone.example.com/
```

## See also

- {doc}`/how-to/deploy-with-httpcache` — route public traffic through Varnish.
- {doc}`/how-to/deploy-production-volto` — a full deployment that includes ingress and TLS.
- {doc}`/reference/api/index` — `backendServiceName` and `frontendServiceName` reference.
