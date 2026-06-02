---
myst:
  html_meta:
    "description": "Goal-oriented how-to guides for solving specific cdk8s-plone deployment and configuration problems."
    "property=og:description": "Goal-oriented how-to guides for solving specific cdk8s-plone deployment and configuration problems."
    "property=og:title": "How-to guides"
    "keywords": "Plone, cdk8s, Kubernetes, how-to, deployment, configuration"
---

```{image} ../_static/kup6s-icon-howto.svg
:align: center
:class: section-icon-large
```

# How-to guides

**Goal-oriented guides showing you how to solve specific problems with cdk8s-plone.**

How-to guides are recipes that take you through the steps involved in addressing specific tasks and problems. They are more advanced than tutorials and assume you have some knowledge of how cdk8s-plone works.

## Prerequisites

**Set up required infrastructure before deploying Plone:**

```{toctree}
---
maxdepth: 1
titlesonly: true
---
setup-prerequisites
```

## Deployment

**Deploy complete Plone examples to your Kubernetes cluster:**

```{toctree}
---
maxdepth: 1
titlesonly: true
---
deploy-production-volto
deploy-classic-ui
deploy-with-vinyl-cache
```

## Configuration

```{toctree}
---
maxdepth: 1
titlesonly: true
---
configure-security-context
schedule-pods
```

## Operations & maintenance

```{toctree}
---
maxdepth: 1
titlesonly: true
---
enable-prometheus-monitoring
```

## Troubleshooting

*This section will be populated with troubleshooting guides in future releases.*

---

**New to cdk8s-plone?** Start with the [Tutorials](../tutorials/index.md) for step-by-step lessons.

**Need technical specifications?** See the [Reference](../reference/index.md) section for API documentation.

**Want to understand concepts?** Read the [Explanation](../explanation/index.md) section for architecture and design decisions.
