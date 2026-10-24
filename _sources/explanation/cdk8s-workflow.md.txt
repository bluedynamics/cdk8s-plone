---
myst:
  html_meta:
    "description": "How cdk8s-plone fits into the cdk8s workflow: constructs, synthesis to Kubernetes manifests, and applying them by hand or through GitOps."
    "property=og:description": "How cdk8s-plone fits into the cdk8s workflow: constructs, synthesis to Kubernetes manifests, and applying them by hand or through GitOps."
    "property=og:title": "About the cdk8s workflow"
    "keywords": "Plone, cdk8s, Kubernetes, synth, constructs, GitOps, ArgoCD, Helm"
---

# About the cdk8s workflow

This page explains where `cdk8s-plone` sits in the cdk8s workflow and why that workflow looks the way it does.
It is background reading, not a set of steps; for the steps, see {doc}`/tutorials/01-quick-start`.

## Code, synth, apply

[cdk8s](https://cdk8s.io/) is a framework for defining Kubernetes resources in a general-purpose programming language.
You write TypeScript or Python that constructs objects, run a synthesis step, and get plain Kubernetes YAML.
Nothing about cdk8s talks to a cluster: it is a manifest generator.

The workflow has three distinct phases, and keeping them apart explains most of how cdk8s-plone behaves.
First you write code that instantiates constructs inside an `App` and one or more `Chart` objects.
Then you run `cdk8s synth`, which evaluates that code and writes Kubernetes manifests into the `dist/` directory.
Finally you apply those manifests to a cluster, either with `kubectl apply` or through a GitOps controller.

The separation matters because the manifests are an ordinary, reviewable artifact.
You can read the YAML, diff it across changes, and run policy checks on it before anything reaches the cluster.

## Where cdk8s-plone fits

`cdk8s-plone` is a construct library, not an application you run.
You compose its constructs, mainly `Plone` and one of the cache constructs, inside your own cdk8s app.
A construct is a reusable building block: `Plone` expands into the Deployments, Services, and optional PodDisruptionBudget and ServiceMonitor that a Plone site needs, with production-minded defaults you can override.

This is the same idea as a Helm chart or a Kustomize base, but expressed in code rather than templated YAML.
Because the inputs are typed options rather than free-form values, your editor and the compiler catch mistakes before synthesis, and the {doc}`API reference </reference/api/index>` is generated from those types.

## Synthesis time versus apply time

The two cache constructs illustrate the phase distinction well, because they resolve at different times.

`PloneHttpcache` renders the mittwald kube-httpcache Helm chart during synthesis.
It shells out to the `helm` CLI, so `helm` must be present where you run `cdk8s synth`, and the chart's resources land in your `dist/` output as ordinary manifests.

`PloneVinylCache` instead emits a `VinylCache` custom resource.
That resource does nothing on its own; the cloud-vinyl operator reconciles it at apply time and creates the underlying Varnish deployment in the cluster.
The work happens later, and in a different place, than the synthesis that produced the manifest.

Neither approach is universally better.
Rendering at synthesis keeps everything in one reviewable artifact, while delegating to an operator keeps the cluster as the source of truth and lets the operator manage the cache over its lifetime.
For the practical trade-offs between the two caches, see {doc}`architecture`.

## Applying by hand or through GitOps

Because synthesis produces plain YAML, you can apply it however you already deploy Kubernetes resources.
A small project applies `dist/` directly with `kubectl`.
A larger one commits the synthesized manifests to a repository and lets a GitOps controller such as Argo CD or Flux reconcile them, so the cluster always matches what is in version control.

A common middle path runs `cdk8s synth` in continuous integration and publishes the result, so the synthesis is reproducible and the applied manifests are auditable.
In every case the cdk8s-plone code stays the single definition of the deployment, and the manifests are a derived, inspectable product of it.

## See also

- {doc}`architecture` — the components a `Plone` construct creates and how they relate.
- {doc}`/tutorials/01-quick-start` — the workflow applied end to end.
- [cdk8s documentation](https://cdk8s.io/docs/latest/) — the framework this builds on.
