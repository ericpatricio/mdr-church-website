import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { validateRecords, upcomingEvents, validEventDate } from '../content/catalog.mjs';
import { renderEventCard, renderEventList } from './event-rendering.mjs';
import { languages } from '../content/site.mjs';

// Synthetic fixtures stay out of the live catalog and are built only in a temporary directory.
const event = {
  id: 'development-only', status: 'published', category: 'community',
  title: { es: 'Prueba solamente', en: 'Test only' },
  description: { es: 'Descripción de prueba', en: 'Test description' },
  details: { es: 'Detalles de prueba', en: 'Test details' },
  start: '2099-01-01T11:00:00-05:00', end: '2099-01-01T13:00:00-05:00',
  timeZone: 'America/New_York', venue: 'Test venue', location: 'Test address',
  image: 'mdr-logo.png', imageAlt: { es: 'Imagen de prueba', en: 'Test image' },
  registrationUrl: 'https://example.invalid/register',
};
validateRecords([event], []);
validateRecords([{ id: 'unfinished', status: 'draft' }], []);
for (const [change, pattern] of [
  [{ status: 'public' }, /development-only: status/],
  [{ status: null }, /development-only: status/],
  [{ title: { es: 'Solo' } }, /development-only: title/],
  [{ image: 'missing-flyer.png' }, /development-only: image.*not found/],
  [{ image: '../secret.png' }, /development-only: image/],
  [{ image: 'MDR-logo.png' }, /development-only: image/],
  [{ imageAlt: { en: 'Only' } }, /imageAlt/],
  [{ registrationUrl: 'javascript:alert(1)' }, /registrationUrl/],
  [{ sourceUrl: 'https://user:password@example.invalid/' }, /sourceUrl/],
  [{ timeZone: 'UTC' }, /timeZone/],
  [{ venue: '' }, /venue/],
  [{ end: '2099-01-01T10:00:00-05:00' }, /end/],
  [{ contact: { en: 'Only' } }, /contact/],
]) assert.throws(() => validateRecords([{ ...event, ...change }], []), pattern);
assert.throws(() => validateRecords([event, { ...event, status: 'draft' }], []), /unique/);

for (const value of [
  '2026-03-08T01:59:59-05:00', '2026-03-08T03:00:00-04:00',
  '2026-11-01T01:30:00-04:00', '2026-11-01T01:30:00-05:00',
  '2026-01-01T00:00:00-05:00',
]) assert(validEventDate(value), value);
for (const value of [
  '2026-03-08T02:30:00-05:00', '2026-07-01T11:00:00-05:00',
  '2026-02-30T11:00:00-05:00', '2026-01-01T11:00:00Z',
  '2026-01-01T11:00:00',
]) assert(!validEventDate(value), value);

const cancelled = { ...event, id: 'cancelled', status: 'cancelled' };
const draft = { ...event, id: 'draft', status: 'draft' };
const later = { ...event, id: 'later', start: '2099-02-01T11:00:00-05:00', end: undefined };
const now = new Date('2098-01-01');
assert.deepEqual(upcomingEvents([later, draft, event], now).map(record => record.id), [event.id, later.id]);
assert.equal(upcomingEvents([event], new Date(event.end)).length, 0);
assert.equal(upcomingEvents([cancelled], now).length, 1);
assert.equal(upcomingEvents([cancelled], now, { includeCancelled: false }).length, 0);
for (const lang of ['es', 'en']) {
  for (const key of ['eventCancelled', 'eventRegister', 'eventJavaScript']) assert.equal(typeof languages[lang][key], 'string');
  const html = renderEventCard(event, lang, languages[lang]);
  assert(html.includes(event.title[lang]));
  assert(html.includes(event.description[lang]));
  assert(html.includes(event.imageAlt[lang]));
  assert(html.includes('../assets/mdr-logo.png'));
  assert(html.includes(event.end));
  assert(html.includes('America/New_York'));
  assert(html.includes(event.registrationUrl));
  const cancelledHtml = renderEventCard(cancelled, lang, languages[lang]);
  assert(cancelledHtml.includes(languages[lang].eventCancelled));
  assert(!cancelledHtml.includes(event.registrationUrl));
  assert.equal(renderEventList([draft], lang, languages[lang], { now }), '');
  assert.equal(renderEventList([cancelled], lang, languages[lang], { homepage: true, now }), '');
}
assert(renderEventCard({ ...event, title: { es: '<script>', en: '<script>' } }, 'es', languages.es).includes('&lt;script&gt;'));

// Exercise the actual generated pages and link checker with populated bilingual content.
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mdr-events-test-'));
try {
  for (const folder of ['content', 'scripts', 'assets']) fs.cpSync(folder, path.join(temporary, folder), { recursive: true });
  for (const lang of ['es', 'en']) fs.mkdirSync(path.join(temporary, lang));
  const site = path.join(temporary, 'content/site.mjs');
  fs.writeFileSync(site, fs.readFileSync(site, 'utf8').replace('export const events = [];', `export const events = ${JSON.stringify([event, cancelled, draft])};`));
  execFileSync(process.execPath, ['scripts/build.mjs', '--file-events'], { cwd: temporary });
  execFileSync(process.execPath, ['scripts/check.mjs'], { cwd: temporary });
  for (const lang of ['es', 'en']) {
    const homepage = fs.readFileSync(path.join(temporary, lang, 'index.html'), 'utf8');
    const eventsPage = fs.readFileSync(path.join(temporary, lang, 'eventos.html'), 'utf8');
    assert.equal((homepage.match(/data-expires=/g) || []).length, 1);
    assert.equal((eventsPage.match(/data-expires=/g) || []).length, 2);
    assert(eventsPage.includes(languages[lang].eventCancelled));
    assert(homepage.includes(event.title[lang]));
  }
  const generated = path.join(temporary, 'en/index.html');
  const original = fs.readFileSync(generated, 'utf8');
  for (const [broken, expected] of [
    [original.replace('alt="Test image"', 'alt="undefined"'), /descriptive image alt/],
    [original.replace('../assets/mdr-logo.png', '../assets/MDR-logo.png'), /capitalization|missing/],
  ]) {
    fs.writeFileSync(generated, broken);
    assert.throws(() => execFileSync(process.execPath, ['scripts/check.mjs'], {
      cwd: temporary, stdio: 'pipe',
    }), error => expected.test(error.stderr.toString()));
  }
  fs.writeFileSync(generated, original);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

// Run the browser script with a clock that advances past an event while the page stays open.
let clock = Date.parse('2098-01-01T00:00:00Z');
const rows = Array.from({ length: 4 }, (_, index) => ({
  dataset: { category: 'community', expires: index === 0 ? '2098-01-02T00:00:00Z' : event.end }, hidden: false,
}));
const empty = { hidden: true };
const group = {
  dataset: { eventLimit: '3' },
  querySelectorAll: () => rows,
  querySelector: selector => selector === '[data-empty-events]' ? empty : null,
};
const callbacks = {};
const document = {
  querySelectorAll: selector => selector === '[data-event-group]' ? [group] : [],
  querySelector: () => null, getElementById: () => null,
  addEventListener: (name, callback) => { callbacks[name] = callback; },
};
vm.runInNewContext(fs.readFileSync('assets/app.js', 'utf8'), {
  document, Date: class extends Date { static now() { return clock; } },
  matchMedia: () => ({ addEventListener() {} }),
  setInterval: callback => { callbacks.interval = callback; },
});
assert.deepEqual(rows.map(row => row.hidden), [false, false, false, true]);
clock = Date.parse('2098-01-02T00:00:00Z');
callbacks.interval();
assert.deepEqual(rows.map(row => row.hidden), [true, false, false, false]);
clock = Date.parse(event.end);
callbacks.visibilitychange();
assert(rows.every(row => row.hidden));
assert.equal(empty.hidden, false);
console.log('PASS: event states, flyers, bilingual generated pages, subpaths, DST, expiry and homepage promotion.');
