---
myst:
  html_meta:
    "description": "Information-oriented technical reference for cdk8s-plone: the generated API reference and a task-oriented configuration guide."
    "property=og:description": "Information-oriented technical reference for cdk8s-plone: the generated API reference and a task-oriented configuration guide."
    "property=og:title": "Reference"
    "keywords": "Plone, cdk8s, Kubernetes, reference, API, configuration"
---

# Reference

**Information-oriented technical specifications for cdk8s-plone.**

The reference has two parts that play different roles:

{doc}`API reference <api/index>`
:   The complete, authoritative list of every construct, interface, option, type, default value, and enum.
    It is generated from the TypeScript source with `npx projen docgen`, so it never drifts from the code.
    Use it to look up exactly what an option does, its type, and whether it is required.

{doc}`Configuration guide <configuration-options>`
:   A hand-written, task-oriented tour of the most common configuration, with copy-pasteable examples.
    It links into the API reference rather than repeating it.
    Use it to see how options fit together for a real deployment.

```{toctree}
---
maxdepth: 1
titlesonly: true
---
api/index
configuration-options
```

---

**Getting started?** Begin with the {doc}`/tutorials/index` for hands-on learning.

**Solving a specific problem?** Check the {doc}`/how-to/index` for task-oriented solutions.

**Understanding concepts?** Read the {doc}`/explanation/index` for architecture and design.
