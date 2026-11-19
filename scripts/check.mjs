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
    if (target) {
      let directory = process.cwd();
      assert(!path.relative(directory, dest).startsWith('..'), `${file}: local reference leaves the repository: ${url}`);
      for (const segment of path.relative(directory, dest).split(path.sep)) {
        assert(fs.readdirSync(directory).includes(segment), `${file}: incorrect filename capitalization in ${url}`);
        directory = path.join(directory, segment);
      }
    }
    if (fragment) assert(fs.readFileSync(dest,'utf8').includes(`id="${fragment}"`), `${file}: missing fragment ${url}`);
    links++;
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/alt="[^"]*"/.test(tag),`${file}: missing alt`);
    assert(!/alt="(?:undefined|null|\s*)"/.test(tag), `${file}: provide descriptive image alt text`);
    assert(/width="\d+"/.test(tag) && /height="\d+"/.test(tag),`${file}: image layout dimensions`);
    images++;
  }
  if(page==='index') {
    assert(/class="hero-slide"[^>]*>\s*<picture><source[^>]*srcset="\.\.\/assets\/waterfall-realistic-960\.webp"/.test(html), `${file}: first hero slide must use optimized supplied waterfall`);
    assert(html.includes('srcset="../assets/waterfall-realistic-1920.webp"'));
    assert(html.includes('src="../assets/waterfall-realistic-1920.jpg"'));
    for (const asset of ['waterfall-realistic.jpg', 'waterfall-realistic-960.webp', 'waterfall-realistic-1920.webp', 'waterfall-realistic-1920.jpg']) assert(fs.existsSync(path.join('assets', asset)), `${file}: missing waterfall variant ${asset}`);
    assert(html.includes('data-hero-playback hidden aria-controls="hero-slides"'), `${file}: accessible manual playback control`);
    assert(html.includes(lang === 'es' ? 'Pausar presentaci\u00f3n' : 'Pause slideshow'));
    assert(html.includes(lang === 'es' ? 'Reanudar presentaci\u00f3n' : 'Resume slideshow'));
    assert(html.includes('data-hero-playback-icon'));
    assert(html.includes('data-hero-prev aria-controls="hero-slides" aria-label="'));
    assert(html.includes('data-hero-next aria-controls="hero-slides" aria-label="'));
    assert(html.includes('ministry-logo ministry-logo-men'));
    assert(html.includes(lang==='es'?'Una iglesia de familia para la familia.':'A family church for the family.'));
    assert(html.includes('nosotros.html#liderazgo'));
    assert(html.includes('ministerio-kidzz.html'));
    assert(html.includes('href="'+church.maps+'"'));
  }
  if(page==='eventos') assert.equal((html.match(/data-filter="/g)||[]).length,3);
}
validateRecords(events,sermons);
console.log(`PASS: ${pages.length * 2} bilingual pages, ${links} local references including fragment targets, ${images} images; menu/language semantics, metadata, hero links and verified-content constraints.`);
