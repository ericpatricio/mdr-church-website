import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

// Exercise the real CLI dependency consumer, not only the parser APIs.
const require = createRequire(import.meta.url);
const frameworkEntry = require.resolve('@vercel/frameworks');
const frameworkRequire = createRequire(frameworkEntry);
const {readConfigFile} = require(path.join(path.dirname(frameworkEntry), 'read-config-file.js'));
assert.equal(frameworkRequire('js-yaml/package.json').version, '3.15.2');
const tomlEntry = frameworkRequire.resolve('smol-toml');
const tomlManifest = JSON.parse(fs.readFileSync(path.resolve(path.dirname(tomlEntry), '../package.json'), 'utf8'));
assert.equal(tomlManifest.version, '1.9.1');

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-parser-compat-'));
const configurationValue = value => JSON.parse(JSON.stringify(value));
try {
  const fixtures = [
    ['build.yaml', 'build:\n  command: npm run build\n  publish: dist\n', {build: {command: 'npm run build', publish: 'dist'}}],
    ['merge.yml', 'defaults: &defaults\n  enabled: true\npreview:\n  <<: *defaults\n  locales: [es, en]\n', {defaults: {enabled: true}, preview: {enabled: true, locales: ['es', 'en']}}],
    ['build.toml', '[build]\ncommand = "npm run build"\npublish = "dist"\n', {build: {command: 'npm run build', publish: 'dist'}}],
    ['redirects.toml', '[[redirects]]\nfrom = "/es"\nto = "/es/index.html"\nstatus = 301\n', {redirects: [{from: '/es', to: '/es/index.html', status: 301}]}],
    ['build.json', '{"build":{"command":"npm run build"}}', {build: {command: 'npm run build'}}],
  ];
  for (const [name, content, expected] of fixtures) {
    const file = path.join(temporary, name);
    fs.writeFileSync(file, content);
    // The patched TOML parser returns safer null-prototype maps. Verify the
    // configuration values, then exercise the framework consumers below.
    assert.deepEqual(configurationValue(await readConfigFile(file)), expected, name);
  }
  assert.equal(await readConfigFile(path.join(temporary, 'absent.toml')), null);
  assert.deepEqual(configurationValue(await readConfigFile([path.join(temporary, 'absent.yaml'), path.join(temporary, 'build.toml')])), fixtures[2][2]);
  const invalid = path.join(temporary, 'invalid.yaml');
  fs.writeFileSync(invalid, 'build: [unfinished');
  await assert.rejects(readConfigFile(invalid));
  const {frameworks} = require('@vercel/frameworks');
  fs.writeFileSync(path.join(temporary, 'config.toml'), 'publishDir = "generated-public"\n');
  assert.equal(await frameworks.find(framework => framework.slug === 'hugo').getOutputDirName(temporary), 'generated-public');
  fs.writeFileSync(path.join(temporary, '_config.yml'), 'destination: generated-site\n');
  assert.equal(await frameworks.find(framework => framework.slug === 'jekyll').getOutputDirName(temporary), 'generated-site');

  // Bound execution so a regression in the reported malformed-TOML hang cannot
  // hang the test runner. The child also verifies the YAML merge-budget fix.
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import {createRequire} from 'node:module';
    const require = createRequire(${JSON.stringify(frameworkEntry)});
    assert.throws(() => require('smol-toml').parse('a=[1 #'));
    assert.throws(() => require('js-yaml').safeLoad(
      'base: &base [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]\\nmerged:\\n  <<: *base\\n',
      {maxTotalMergeKeys: 10}));
  `], {timeout: 3000, encoding: 'utf8'});
  assert.equal(child.status, 0, child.stderr || String(child.error));
} finally {
  assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
  assert(path.basename(temporary).startsWith('mdr-parser-compat-'));
  fs.rmSync(temporary, {recursive: true, force: true});
}
console.log('PASS: scoped parser versions, real framework-reader YAML/TOML/JSON compatibility, malformed input and bounded security regressions.');
