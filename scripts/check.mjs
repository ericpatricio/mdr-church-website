import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {church, events, sermons, ministries} from '../content/site.mjs';
import {validateRecords} from '../content/catalog.mjs';
const pages = ['index','nosotros','ministerios','eventos','mensajes','visitanos',...ministries.map(m=>'ministerio-'+m.id)];
let links = 0, images = 0;
for (const lang of ['es','en']) for (const page of pages) {
  const file = `${lang}/${page}.html`;
  const html = fs.readFileSync(file,'utf8');
  assert(html.includes(`<html lang="${lang}">`));
  assert.equal((html.match(/<h1>/g)||[]).length, 1, `${file}: one h1`);
  assert(html.includes(`../${lang==='es'?'en':'es'}/${page}.html`));
  assert(html.includes('aria-controls="mobile-menu"'));
  assert(html.includes('aria-label="'+(lang==='es'?'Navegación principal':'Main navigation')+'"'));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate ids`);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = raw.replaceAll('&amp;','&');
    if (/^(https?:|tel:|mailto:)/.test(url)) continue;
    assert(!url.startsWith('/'), `${file}: root-relative asset breaks subpath`);
    const [target, fragment] = url.split('#');
    const dest = target ? path.resolve(path.dirname(file),target) : path.resolve(file);
    assert(fs.existsSync(dest), `${file}: missing ${url}`);
    if (fragment) assert(fs.readFileSync(dest,'utf8').includes(`id="${fragment}"`), `${file}: missing fragment ${url}`);
    links++;
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/alt="[^"]*"/.test(tag),`${file}: missing alt`);
    assert(/width="\d+"/.test(tag) && /height="\d+"/.test(tag),`${file}: image layout dimensions`);
    images++;
  }
  if(page==='index') {
    assert(html.includes(lang==='es'?'Una iglesia de familia para la familia.':'A family church for the family.'));
    assert(html.includes('nosotros.html#liderazgo'));
    assert(html.includes('ministerio-kidzz.html'));
    assert(html.includes('href="'+church.maps+'"'));
  }
  if(page==='eventos') assert.equal((html.match(/data-filter="/g)||[]).length,3);
}
validateRecords(events,sermons);
console.log(`PASS: 18 bilingual pages, ${links} local references including fragment targets, ${images} images; menu/language semantics, metadata, hero links and verified-content constraints.`);
