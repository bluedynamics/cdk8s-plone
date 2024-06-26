# CMS Plone Chart for CDK8S

This chart provides a library to bootstrap a Plone deployment on a Kubernetes cluster using the [CDK8S](https://cdk8s.io) framework.

It provides
- backend (with `plone.volto` or Classic-UI)
- frontend (Plone-Volto, a ReactJS based user interface)
- varnish (optional)

## Usage

TODO

## Development

Clone the repository and install the dependencies:

```bash
yarn install
```

Then run the following command to run the test:

```bash
npx projen test
```

### WIP Checklist:

Each step need to be implemented with tests!

- [ ] Start Backend
    - [ ] deployment
        - [ ] depend on "some" postgres db - which can be provided in different ways
    - [ ] service
    - [ ] pdb
    - [ ] init container running plone-site-create
    - [ ] lifecycle checks (readiness, liveness)
    - [ ] sidecars
        - [ ] generic way to inject sidecars
        - [ ] (optional) direct way to specify metrics sidecar (prometheus exporter)
        - [ ] (optional) direct way to specify logging sidecar (fluentd/loki?)
- [ ] Start Frontend
    - [ ] deployment
        - [ ] depend on ready/live backend
    - [ ] service
    - [ ] pdb
    - [ ] lifecycle checks (readiness, liveness)
    - [ ] sidecars
        - [ ] generic way to inject sidecars
        - [ ] (optional) direct way to specify metrics sidecar (prometheus exporter)
        - [ ] (optional) direct way to specify logging sidecar (fluentd/loki?)

- [ ] Start Varnish
    - [ ] deployment
        - [ ] do not depend on backend/front end to be  up, but configure to deliver from cache if possible.
    - [ ] service
    - [ ] pdb
    - [ ] lifecycle checks (readiness, liveness)
    - [ ] sidecars
        - [ ] generic way to inject sidecars
        - [ ] (optional) direct way to specify metrics sidecar (prometheus exporter)
        - [ ] (optional) direct way to specify logging sidecar (fluentd/loki?)
    - find a way to purge caches. based on kitconcept varnish purger? needs

- [ ] Other Languages
    - [ ] Check Python distribution
    - [ ] Check Java distribution
    - [ ] Check Go distribution