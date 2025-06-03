import { cdk, JsonPatch } from 'projen';
import { NpmAccess } from 'projen/lib/javascript';

const kplus = 'cdk8s-plus-29';
const constructs = 'constructs@^10.0.0';
const project = new cdk.JsiiProject({
  // majorVersion: 1,
  author: 'Jens W. Klein',
  authorAddress: 'jk@kleinundpartner.at',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.5.0',
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
    'yaml@^2.6.0',
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
});


const eslintJson = project.tryFindObjectFile('.eslintrc.json');
if (!eslintJson) {
  throw new Error('.eslintrc.json not found');
}
eslintJson.patch(JsonPatch.add('/ignorePatterns/-', 'imports/'));

project.synth();