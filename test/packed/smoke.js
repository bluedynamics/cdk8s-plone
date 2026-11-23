// Smoke test against the packed npm module (#251).
//
// The Jest tests import from src/, where src/config/ exists, so they cannot
// notice a file that is missing from lib/ or dropped by .npmignore. This script
// unpacks the tarball that `package:js` built and constructs the classes that
// read their default VCL from disk at synth time, without passing any VCL.
//
// Run by the `test:packed` task at the end of `package`.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const distDir = path.join(root, 'dist', 'js');
const tarballs = fs.existsSync(distDir) ? fs.readdirSync(distDir).filter(f => f.endsWith('.tgz')) : [];
if (tarballs.length !== 1) {
  throw new Error(`expected exactly one tarball in ${distDir}, found ${tarballs.length}; run "npx projen package:js" first`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cdk8s-plone-packed-'));
try {
  execFileSync('tar', ['-xzf', path.join(distDir, tarballs[0]), '-C', tmp]);
  // Peer dependencies come from the repo. Node resolves the symlink to its real
  // path, so the package and this script share one cdk8s and one constructs.
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(tmp, 'node_modules'), 'dir');

  const { App, Chart } = require('cdk8s');
  const pkg = require(path.join(tmp, 'package'));

  const app = new App({ outdir: path.join(tmp, 'out') });
  const chart = new Chart(app, 'smoke');
  const plone = new pkg.Plone(chart, 'plone');
  new pkg.PloneVinylCache(chart, 'vinylcache', { plone });
  new pkg.PloneHttpcache(chart, 'httpcache', { plone });
  app.synth();

  console.log(`packed module OK: ${tarballs[0]}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
