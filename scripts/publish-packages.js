#!/usr/bin/env node

/**
 * Publishes specified packages to npm.
 *
 * Usage: node scripts/publish-packages.js [--provenance] [--dry-run]
 *
 * Only publishes the 4 packages that consumer apps use.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const provenance = args.includes('--provenance');

// Only publish the packages the webapp actually uses
const PUBLISH_PACKAGES = ['core', 'environment-glimmerx', 'scripts', 'template'];

const packagesDir = path.join(__dirname, '..', 'packages');

console.log(`Publishing ${PUBLISH_PACKAGES.length} packages${dryRun ? ' (dry run)' : ''}:\n`);

let failed = [];

PUBLISH_PACKAGES.forEach((name) => {
  const pkgDir = path.join(packagesDir, name);
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

  const flags = ['--access', 'public'];
  if (provenance) flags.push('--provenance');
  if (dryRun) flags.push('--dry-run');

  const cmd = `npm publish ${flags.join(' ')}`;
  console.log(`  ${pkg.name}@${pkg.version}: ${cmd}`);

  try {
    execSync(cmd, { cwd: pkgDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`  FAILED: ${pkg.name}`);
    failed.push(pkg.name);
  }
});

console.log(`\nPublished ${PUBLISH_PACKAGES.length - failed.length}/${PUBLISH_PACKAGES.length} packages`);
if (failed.length > 0) {
  console.error(`\nFailed packages:\n${failed.map((n) => `  - ${n}`).join('\n')}`);
  process.exit(1);
}
