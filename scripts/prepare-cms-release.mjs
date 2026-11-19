import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CMS_PROJECT, CMS_DATASET} from '../assets/cms-config.mjs';
import {events, languages} from '../content/site.mjs';

export function assertCmsTarget(root) {
  if (events.length) throw new Error('CMS mode requires the file event catalog to stay empty; use one event source.');
  const studio = fs.readFileSync(path.join(root, 'studio/sanity.config.ts'), 'utf8');
  for (const [field, value] of [['projectId', CMS_PROJECT], ['dataset', CMS_DATASET]]) {
    if (!studio.includes(field + ": '" + value + "'")) throw new Error('Studio ' + field + ' differs from the release candidate. Align targets after approval.');
  }
}

export function cmsBootstrap(language, translations) {
  const configuration = JSON.stringify({language, translations: {
    eventDetails: translations.eventDetails,
    eventCancelled: translations.eventCancelled,
    eventRegister: translations.eventRegister,
  }}).replaceAll('<', '\u003c');
  return '<script type="application/json" data-cms-events-config>' + configuration + '</script><script type="module" src="../assets/cms-public-ui.mjs"></script>';
}

export function prepareCmsRelease(root = process.cwd()) {
  const destination = path.resolve(root, 'release-preview');
  const marker = path.join(destination, 'RELEASE_MANIFEST.json');
  if (fs.existsSync(destination) && (!fs.existsSync(marker) ||
    JSON.parse(fs.readFileSync(marker, 'utf8')).managedBy !== 'mdr-cms-release')) {
    throw new Error('release-preview already exists without an MDR release marker. Preserve it and choose another workspace.');
  }
  assertCmsTarget(root);
  fs.mkdirSync(destination, {recursive: true});
  for (const directory of ['assets', 'es', 'en']) {
    fs.cpSync(path.join(root, directory), path.join(destination, directory), {recursive: true});
  }
  fs.copyFileSync(path.join(root, 'index.html'), path.join(destination, 'index.html'));
  fs.writeFileSync(path.join(destination, '.nojekyll'), '');
  for (const [language, translations] of Object.entries(languages)) {
    const injection = cmsBootstrap(language, translations);
    for (const page of ['index', 'eventos']) {
      const file = path.join(destination, language, page + '.html');
      const html = fs.readFileSync(file, 'utf8');
      const count = (html.match(/data-cms-events-config/g) || []).length;
      if (html.includes('data-cms-poc-config') || count > 1 || (count === 1 && !html.includes(injection))) {
        throw new Error('Unexpected/duplicate CMS bootstrap. Rebuild before preparing the artifact.');
      }
      if (!count) fs.writeFileSync(file, html.replace('</body>', injection + '</body>'));
    }
  }
  fs.writeFileSync(marker, JSON.stringify({
    managedBy: 'mdr-cms-release', mode: 'sanity', projectId: CMS_PROJECT,
    dataset: CMS_DATASET, publicOrigin: 'https://ericpatricio.github.io',
    approvalRequired: true, rollback: "Set EVENT_SOURCE to 'file', rebuild and commit the rollback through main.",
  }, null, 2) + '\n');
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Prepared local-only CMS artifact: ' + prepareCmsRelease());
  console.log('Source pages are not modified. Default build mode is controlled by content/event-source.mjs.');
}
