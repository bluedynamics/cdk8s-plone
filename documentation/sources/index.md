# cdk8s-plone Documentation

```{image} _static/kup6s-icon-plone.svg
:alt: cdk8s-plone logo
:width: 200px
:align: center
```

**CDK8S Construct Library for Plone CMS Deployment**

Welcome to the cdk8s-plone documentation. This documentation covers everything from initial setup to advanced configuration and architectural concepts for deploying Plone CMS using CDK8S.

## About cdk8s-plone

cdk8s-plone is a TypeScript construct library for [CDK8S](https://cdk8s.io/) that enables programmatic deployment of [Plone](https://plone.org/) CMS on Kubernetes. It provides type-safe, reusable constructs for Plone Backend and Frontend with production-grade defaults.

**Key Features:**
- Type-safe TypeScript constructs for Plone Backend and Frontend
- Production-grade defaults with full customization
- Support for PostgreSQL backends
- Comprehensive resource management (CPU, memory, storage)
- Component-level configuration options
- Built on CDK8S for infrastructure as code

## Documentation Structure

This documentation follows the [Diátaxis framework](https://diataxis.fr/), organizing content into four categories based on what you need:

::::{grid} 2
:gutter: 3

:::{grid-item-card} Tutorials
:img-top: _static/kup6s-icon-tutorials.svg
:link: tutorials/index
:link-type: doc

**Learning-oriented**: Step-by-step lessons to build skills

*Start here if you're new to cdk8s-plone*
:::

:::{grid-item-card} How-To Guides
:img-top: _static/kup6s-icon-howto.svg
:link: how-to/index
:link-type: doc

**Goal-oriented**: Solutions to specific problems

*Use these when you need to accomplish something*
:::

:::{grid-item-card} Reference
:img-top: _static/kup6s-icon-reference.svg
:link: reference/index
:link-type: doc

**Information-oriented**: Technical specifications and configurations

*Consult when you need detailed information*
:::

:::{grid-item-card} Explanation
:img-top: _static/kup6s-icon-explanation.svg
:link: explanation/index
:link-type: doc

**Understanding-oriented**: Concepts and design decisions

*Read to deepen your understanding*
:::

::::

## Quick Links

### Getting Started
- [Quick Start](tutorials/01-quick-start.md) - Deploy your first Plone instance
- [Setup Prerequisites](how-to/setup-prerequisites.md) - Prepare cluster infrastructure
- [Features Overview](explanation/features.md) - Explore capabilities

### Configuration
- [Configuration Options](reference/configuration-options.md) - Complete configuration reference
- [Architecture Overview](explanation/architecture.md) - High-level design

### Common Tasks
- Scale Resources - Adjust CPU and memory limits (coming soon)
- Configure Monitoring - Set up Prometheus metrics (coming soon)
- Backup and Restore - Protect your data (coming soon)

## Table of Contents

```{toctree}
---
maxdepth: 3
caption: Documentation
titlesonly: true
---
tutorials/index
how-to/index
reference/index
explanation/index
```

---

**Last updated:** 2025-01-12
**cdk8s-plone version:** 0.0.0
**CDK8S version:** ^2.70.27
