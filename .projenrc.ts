import { cdk, JsonPatch, github } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';

const kplus = 'cdk8s-plus-30';
const constructs = 'constructs@^10.4.2';
const project = new cdk.JsiiProject({
  // majorVersion: 1,
  author: 'Jens W. Klein',
  authorAddress: 'jk@kleinundpartner.at',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.9.11',
  name: '@bluedynamics/cdk8s-plone',
  // Short-lived tokens from the bluedynamics-projen GitHub App (secrets
  // PROJEN_APP_ID, PROJEN_APP_PRIVATE_KEY) instead of a yearly PAT.
  projenCredentials: github.GithubCredentials.fromApp(),
  projenrcTs: true,
  repositoryUrl: 'https://github.com/bluedynamics/cdk8s-plone.git',
  description: 'Provides a CMS Plone Backend and Frontend for Kubernetes with cdk8s',
  deps: [
    'cdk8s',
    constructs,
    kplus,
  ],
  peerDeps: [
    'cdk8s',
    constructs,
    kplus,
  ],
  devDeps: [
    constructs, // this is ignored by projen
    kplus,
    'yaml@^2.8.1',
    'cdk8s-cli',
  ],
  publishToPypi: {
    distName: 'cdk8s-plone',
    module: 'cdk8s_plone',
  },
  // publishToGo: {
  //   moduleName: 'github.com/bluedynamics/cdk8s-plone-go',
  // },
  npmProvenance: true,
  npmTrustedPublishing: true,
  npmAccess: NpmAccess.PUBLIC,
  depsUpgradeOptions: {
    workflowOptions: {
      permissions: {
        contents: github.workflows.JobPermission.WRITE,
        pullRequests: github.workflows.JobPermission.WRITE,
      },
    },
  },
});


const eslintJson = project.tryFindObjectFile('.eslintrc.json');
if (!eslintJson) {
  throw new Error('.eslintrc.json not found');
}
eslintJson.patch(JsonPatch.add('/ignorePatterns/-', 'imports/'));

// Add task to import Prometheus Operator ServiceMonitor CRD
project.addTask('import:servicemonitor', {
  description: 'Import Prometheus Operator ServiceMonitor CRD',
  exec: 'cdk8s import https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml --language typescript --output src/imports/',
});

// Pinned to a release, so the import matches the operator users install.
const cloudVinylVersion = 'v1.2.0';
project.addTask('import:vinylcache', {
  description: `Import cloud-vinyl VinylCache CRD (${cloudVinylVersion})`,
  exec: `cdk8s import https://raw.githubusercontent.com/bluedynamics/cloud-vinyl/${cloudVinylVersion}/config/crd/bases/vinyl.bluedynamics.eu_vinylcaches.yaml --language typescript --output src/imports/`,
});

// PloneVinylCache and PloneHttpcache read their default VCL next to the
// compiled module at synth time; jsii only emits .js and .d.ts into lib/ (#251).
project.postCompileTask.exec('mkdir -p lib/config && cp src/config/*.vcl lib/config/');

// Keep repo-only material out of the npm tarball (and the Python package,
// which bundles it).
for (const pattern of ['/.claude/', '/CLAUDE.md', '/docs/', '/documentation/', '/examples/']) {
  project.addPackageIgnore(pattern);
}

// The Jest tests run against src/ and cannot see what the npm tarball lacks.
// Construct the classes from the packed module after packaging (#251).
const packedTest = project.addTask('test:packed', {
  description: 'Smoke test against the packed npm module',
  exec: 'node test/packed/smoke.js',
});
project.packageTask.spawn(packedTest);

// // Fix upgrade workflow permissions for PR job
// const upgradeMain = project.tryFindObjectFile('.github/workflows/upgrade-main.yml');
// if (upgradeMain) {
//   upgradeMain.addOverride('jobs.pr.permissions.pull-requests', 'write');
//   upgradeMain.addOverride('jobs.pr.permissions.contents', 'write');
//   // Use built-in GITHUB_TOKEN instead of PROJEN_GITHUB_TOKEN secret
//   upgradeMain.addOverride('jobs.pr.steps.4.with.token', '${{ github.token }}');
// }

// Configure release workflow to skip documentation and examples changes
const releaseWorkflow = project.tryFindObjectFile('.github/workflows/release.yml');
if (releaseWorkflow) {
  releaseWorkflow.addOverride('on.push.paths-ignore', [
    'documentation/**',
    'examples/**',
    '*.md',
    '.github/workflows/documentation.yml',
  ]);
  // npm OIDC trusted publishing needs Node 24+ (npm CLI 11.5.1+) and the
  // 'release' environment. No registry-url on setup-node: publib-npm handles
  // registry and OIDC itself, and the .npmrc setup-node would write breaks
  // yarn install since setup-node v7 no longer exports a dummy
  // NODE_AUTH_TOKEN ("Failed to replace env in config").
  releaseWorkflow.patch(JsonPatch.add('/jobs/release_npm/environment', 'release'));
  releaseWorkflow.patch(JsonPatch.replace('/jobs/release_npm/steps/0/with/node-version', '24.x'));
}

project.synth();