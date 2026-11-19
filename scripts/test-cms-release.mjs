import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {prepareCmsRelease} from './prepare-cms-release.mjs';
import {languages} from '../content/site.mjs';

const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-cms-release-'));
try {
  for (const directory of ['assets', 'es', 'en']) fs.cpSync(directory, path.join(temporary, directory), {recursive: true});
  fs.copyFileSync('index.html', path.join(temporary, 'index.html'));
  fs.mkdirSync(path.join(temporary, 'studio'));
  fs.copyFileSync('studio/sanity.config.ts', path.join(temporary, 'studio/sanity.config.ts'));
  const before = fs.readFileSync(path.join(temporary, 'es/index.html'), 'utf8');
  const release = prepareCmsRelease(temporary);
  assert.equal(fs.readFileSync(path.join(temporary, 'es/index.html'), 'utf8'), before);
  assert(!fs.existsSync(path.join(release, 'studio')));
  assert(!fs.existsSync(path.join(release, 'node_modules')));
  assert(fs.existsSync(path.join(release, '.nojekyll')));
  for (const language of ['es', 'en']) {
    for (const page of ['index', 'eventos']) {
      const html = fs.readFileSync(path.join(release, language, `${page}.html`), 'utf8');
      assert.equal((html.match(/data-cms-events-config/g) || []).length, 1);
      assert(html.includes('../assets/cms-public-ui.mjs'));
      assert(!html.includes('data-cms-poc-config'));
    }
    assert(!fs.readFileSync(path.join(release, language, 'nosotros.html'), 'utf8').includes('data-cms-events-config'));
  }
  execFileSync(process.execPath, [path.join(root, 'scripts/check.mjs')], {cwd: release});
  // Rebuild in an isolated copy to prove default CMS activation is reproducible
  // and file-mode rollback removes it without changing the production selector.
  for (const directory of ['content', 'scripts']) fs.cpSync(directory, path.join(temporary, directory), {recursive: true});
  fs.writeFileSync(path.join(temporary, 'content/event-source.mjs'), "export const EVENT_SOURCE = 'sanity';\n");
  execFileSync(process.execPath, ['scripts/build.mjs', '--file-events'], {cwd: temporary});
  for (const lang of ['es', 'en']) for (const page of ['index', 'eventos']) {
    assert(!fs.readFileSync(path.join(temporary, lang, page + '.html'), 'utf8').includes('data-cms-events-config'));
  }
  const rollbackArtifact = prepareCmsRelease(temporary);
  assert.equal((fs.readFileSync(path.join(rollbackArtifact, 'en/index.html'), 'utf8').match(/data-cms-events-config/g) || []).length, 1);
  execFileSync(process.execPath, ['scripts/build.mjs'], {cwd: temporary});
  for (const lang of ['es', 'en']) for (const page of ['index', 'eventos']) {
    assert.equal((fs.readFileSync(path.join(temporary, lang, page + '.html'), 'utf8').match(/data-cms-events-config/g) || []).length, 1);
  }
  prepareCmsRelease(temporary); // Already-active pages are safe to prepare again.
  const activePage = path.join(temporary, 'es/index.html');
  const activeHtml = fs.readFileSync(activePage, 'utf8');
  fs.writeFileSync(activePage, activeHtml.replace('</body>', '<script data-cms-events-config></script></body>'));
  assert.throws(() => prepareCmsRelease(temporary), /duplicate CMS bootstrap/);
  fs.writeFileSync(activePage, activeHtml);
  const config = path.join(temporary, 'studio/sanity.config.ts');
  fs.writeFileSync(config, fs.readFileSync(config, 'utf8').replace("dataset: 'poc'", "dataset: 'production'"));
  assert.throws(() => prepareCmsRelease(temporary), /dataset differs/);
} finally {
  assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
  assert(path.basename(temporary).startsWith('mdr-cms-release-'));
  fs.rmSync(temporary, {recursive: true, force: true});
}

// Boot the real public entry module with a minimal document and mocked network.
// This covers non-localhost activation, translated empty/error presentation,
// credential-free reads and default ready-state suppression of POC labels.
const saved = {document: globalThis.document, fetch: globalThis.fetch, setInterval: globalThis.setInterval};
try {
  for (const language of ['es', 'en']) {
    for (const unavailable of [false, true]) {
      let status;
      const list = {children: []};
      const group = {dataset: {}, prepend(node) {status = node;}, querySelector: () => list};
      const callbacks = [];
      const configuration = {textContent: JSON.stringify({language, translations: languages[language]})};
      globalThis.document = {
        hidden: false,
        querySelector: selector => selector === '[data-cms-events-config]' ? configuration : null,
        querySelectorAll: () => [group],
        createElement: () => ({textContent: '', setAttribute() {}}),
        dispatchEvent() {}, addEventListener() {},
      };
      list.ownerDocument = globalThis.document;
      globalThis.fetch = async (_url, options) => {
        assert.equal(options.credentials, 'omit');
        assert.equal(options.cache, 'no-store');
        assert(!options.headers);
        if (unavailable) throw new Error('synthetic outage');
        return {ok: true, json: async () => ({result: []})};
      };
      globalThis.setInterval = callback => {callbacks.push(callback); return 0;};
      const warning = console.warn;
      console.warn = () => {};
      try {
        await import(`../assets/cms-public-ui.mjs?language=${language}&unavailable=${unavailable}`);
        await new Promise(resolve => setImmediate(resolve));
      } finally {console.warn = warning;}
      assert.equal(callbacks.length, 1);
      assert.equal(group.dataset.cmsUnavailable, String(unavailable));
      assert.equal(status.hidden, !unavailable);
      if (unavailable) assert(status.textContent.includes(language === 'es' ? 'temporalmente' : 'temporarily'));
      else assert.equal(status.textContent, '');
    }
  }
} finally {Object.assign(globalThis, saved);}
console.log('PASS: isolated CMS release artifact, matching Studio target, static subpaths, production bootstrap and bilingual empty/outage states; reproducible default CMS activation and file-mode rollback.');
