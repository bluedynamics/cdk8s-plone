---
myst:
  html_meta:
    "description": "Auto-generated API reference for cdk8s-plone constructs, interfaces, and enums."
    "property=og:description": "Auto-generated API reference for cdk8s-plone constructs, interfaces, and enums."
    "property=og:title": "API reference"
    "keywords": "Plone, cdk8s, Kubernetes, API, reference, TypeScript, Python"
---

# API reference

Complete API reference for cdk8s-plone constructs, generated from the TypeScript source code.
This is the authoritative reference for every option, type, default, and required flag.

## Overview

The cdk8s-plone library provides the following constructs:

- **Plone**: main construct for deploying Plone CMS, with support for both the Volto (React frontend) and Blicca (server-side rendered) variants
- **PloneHttpcache**: Varnish caching layer via the mittwald kube-httpcache Helm chart (self-contained)
- **PloneVinylCache**: Varnish caching layer via the cloud-vinyl operator (requires the operator in-cluster)

## Language support

This API documentation shows TypeScript usage examples. The library is also available for Python via JSII transpilation:

- **TypeScript/JavaScript**: [`@bluedynamics/cdk8s-plone`](https://www.npmjs.com/package/@bluedynamics/cdk8s-plone) on npm
- **Python**: [`cdk8s-plone`](https://pypi.org/project/cdk8s-plone/) on PyPI

For Python-specific usage, the API remains the same but follows Python naming conventions (snake_case instead of camelCase).

---

```{include} ../../../../API.md
:relative-docs: ../../../../
:relative-images:
:start-line: 2
```

*This API reference is automatically generated from the TypeScript source code. For the latest version, run `npx projen docgen` in the project root.*
