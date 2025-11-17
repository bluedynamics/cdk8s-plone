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
  projenrcTs: true,
  repositoryUrl: 'https://github.com/bluedynamics/cdk8s-plone.git',
  description: 'Provides a CMS Plone Backend and Frontend for Kubernetes with cdk8s',
  deps: [
    'cdk8s',
    constructs,
    kplus,
  ],
  peerDeps: [
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

// // Fix upgrade workflow permissions for PR job
// const upgradeMain = project.tryFindObjectFile('.github/workflows/upgrade-main.yml');
// if (upgradeMain) {
//   upgradeMain.addOverride('jobs.pr.permissions.pull-requests', 'write');
//   upgradeMain.addOverride('jobs.pr.permissions.contents', 'write');
//   // Use built-in GITHUB_TOKEN instead of PROJEN_GITHUB_TOKEN secret
//   upgradeMain.addOverride('jobs.pr.steps.4.with.token', '${{ github.token }}');
// }

// Configure release workflow to skip documentation-only changes
const releaseWorkflow = project.tryFindObjectFile('.github/workflows/release.yml');
if (releaseWorkflow) {
  releaseWorkflow.addOverride('on.push.paths-ignore', [
    'documentation/**',
    'examples/**',
    '*.md',
    '.github/workflows/documentation.yml',
  ]);
}

project.synth();