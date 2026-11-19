import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CMS_PROJECT, CMS_DATASET} from '../assets/cms-config.mjs';
import {events, languages} from '../content/site.mjs';

export function prepareCmsRelease(root = process.cwd()) {
  const destination = path.resolve(root, 'release-preview');
  const marker = path.join(destination, 'RELEASE_MANIFEST.json');
  if (fs.existsSync(destination) && (!fs.existsSync(marker) ||
    JSON.parse(fs.readFileSync(marker, 'utf8')).managedBy !== 'mdr-cms-release')) {
    throw new Error('release-preview already exists without an MDR release marker. Preserve it and choose another workspace.');
  }
  if (events.length) throw new Error('Review file-catalog events before preparing the CMS handoff; the approved rollback catalog must be empty.');
  const studio = fs.readFileSync(path.join(root, 'studio/sanity.config.ts'), 'utf8');
  for (const [field, value] of [['projectId', CMS_PROJECT], ['dataset', CMS_DATASET]]) {
    if (!studio.includes(`${field}: '${value}'`)) throw new Error(`Studio ${field} differs from the release candidate. Align targets after approval.`);
  }
  fs.mkdirSync(destination, {recursive: true});
  for (const directory of ['assets', 'es', 'en']) {
    fs.cpSync(path.join(root, directory), path.join(destination, directory), {recursive: true});
  }
  fs.copyFileSync(path.join(root, 'index.html'), path.join(destination, 'index.html'));
  fs.writeFileSync(path.join(destination, '.nojekyll'), '');
  for (const [language, translations] of Object.entries(languages)) {
    const configuration = JSON.stringify({language, translations: {
      eventDetails: translations.eventDetails,
      eventCancelled: translations.eventCancelled,
      eventRegister: translations.eventRegister,
    }}).replaceAll('<', '\\u003c');
    const injection = `<script type="application/json" data-cms-events-config>${configuration}</script><script type="module" src="../assets/cms-public-ui.mjs"></script>`;
    for (const page of ['index', 'eventos']) {
      const file = path.join(destination, language, `${page}.html`);
      const html = fs.readFileSync(file, 'utf8');
      if (html.includes('data-cms-events-config') || html.includes('data-cms-poc-config')) throw new Error('Build the normal file-based pages before preparing this artifact.');
      fs.writeFileSync(file, html.replace('</body>', injection + '</body>'));
    }
  }
  fs.writeFileSync(marker, JSON.stringify({
    managedBy: 'mdr-cms-release', mode: 'sanity', projectId: CMS_PROJECT,
    dataset: CMS_DATASET, publicOrigin: 'https://ericpatricio.github.io',
    approvalRequired: true, rollback: 'Normal npm.cmd run build remains file-based.',
  }, null, 2) + '\n');
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Prepared local-only CMS release candidate: ${prepareCmsRelease()}`);
  console.log('Normal generated pages remain file-based. No upload or deployment performed.');
}
