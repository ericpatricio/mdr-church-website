import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {EventFeed, normalizeCmsEvents, publishedEventsUrl, STALE_LIMIT_MS} from '../assets/cms-events.mjs';
import {renderEventList} from '../assets/event-rendering.mjs';
import {languages} from '../content/site.mjs';
import {createEventReconciler} from '../assets/event-refresh.mjs';

const bilingual = text => ({es: text, en: text});
const event = {
  _id: 'poc-fixture', _type: 'event', slug: {current: 'poc-fixture'},
  title: bilingual('Solo prueba ficticia'), description: bilingual('Solo pruebas'),
  details: bilingual('No asistir'), imageAlt: bilingual('Volante de prueba'),
  start: '2099-01-01T16:00:00Z', end: '2099-01-01T18:00:00Z',
  timeZone: 'America/New_York', venue: 'Fictional venue', location: 'Fictional address',
  condition: 'scheduled', category: 'community',
  flyer: {url: 'https://cdn.sanity.io/images/u2olnd8u/poc/test-1200x1600.png', mimeType: 'image/png', size: 1000},
};
const normalized = normalizeCmsEvents([event]);
// Minimal DOM model: track actual node identity, mutations, focus and disclosure
// state, rather than merely comparing generated strings.
for (const language of ['es', 'en']) {
  let mutations = 0;
  const document = {activeElement: null, createElement() {
    return {set innerHTML(html) {
      mutations++;
      const details = {open: false};
      const control = {focus() {document.activeElement = control;}};
      const node = {html, details, control, querySelector: () => details,
        contains: element => element === control,
        remove() {list.children.splice(list.children.indexOf(node), 1); mutations++;},
        replaceWith(replacement) {list.children.splice(list.children.indexOf(node), 1, replacement); mutations++;},
      };
      this.content = {firstElementChild: node};
    }};
  }};
  const list = {ownerDocument: document, children: [], insertBefore(node, before) {
    if (this.children.includes(node)) this.children.splice(this.children.indexOf(node), 1);
    this.children.splice(before ? this.children.indexOf(before) : this.children.length, 0, node);
    mutations++;
  }};
  const update = createEventReconciler(list, language, languages[language]);
  const other = {...normalized[0], id: 'second', start: '2099-01-02T16:00:00Z', end: '2099-01-02T18:00:00Z'};
  update([...normalized, other]);
  const first = list.children[0];
  first.details.open = true;
  first.control.focus();
  const count = mutations;
  update(structuredClone([...normalized, other]));
  assert.equal(mutations, count, 'unchanged refresh must not mutate card DOM');
  assert.equal(list.children[0], first);
  assert.equal(document.activeElement, first.control);
  assert.equal(first.details.open, true);
  update([normalized[0], {...other, title: bilingual('Changed title')}]);
  assert(list.children[1].html.includes('Changed title'));
  assert.equal(list.children[0], first, 'editing another card preserves this card');
  assert.equal(document.activeElement, first.control);
  assert(first.details.open);
  update([normalized[0], {...other, start: '2098-12-31T16:00:00Z'}]);
  assert.equal(list.children[1], first, 'reordering retains unchanged nodes');
  assert.equal(document.activeElement, first.control);
  assert(first.details.open);
  update([{...normalized[0], status: 'cancelled'}]);
  assert.equal(list.children.length, 1, 'deleted event removed');
  assert(list.children[0].html.includes(languages[language].eventCancelled));
  assert(list.children[0].details.open, 'changed content retains disclosure state');
  update([{...normalized[0], status: 'cancelled'}], {homepage: true});
  assert.equal(list.children.length, 0, 'cancelled events excluded from home');
  update(normalized);
  update(normalized, {now: new Date(event.end)});
  assert.equal(list.children.length, 0, 'expiration removes event without network refresh');
}
// Browsers require native fetch to be called with its global receiver. Node's
// implementation permits other receivers, so model the browser restriction here.
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = function () {
    if (this !== globalThis) throw new TypeError('Illegal invocation');
    return Promise.resolve({ok: true, json: async () => ({result: [event]})});
  };
  const browserFeed = new EventFeed();
  assert.equal((await browserFeed.load()).status, 'ready', 'default fetch must preserve the browser receiver');
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(normalized[0].status, 'published');
for (const invalid of [
  {...event, _id: 'drafts.poc-fixture'}, {...event, _id: 'versions.release.poc-fixture'},
  {...event, condition: 'draft'}, {...event, title: {es: 'Solo español'}},
  {...event, end: event.start}, {...event, start: '2099-02-30T16:00:00Z'},
  {...event, flyer: {...event.flyer, url: 'https://example.invalid/flyer.png'}},
  {...event, flyer: {...event.flyer, url: 'https://cdn.sanity.io/images/u2olnd8u/production/test.png'}},
  {...event, flyer: {...event.flyer, size: 6 * 1024 * 1024}},
  {...event, registrationUrl: 'javascript:alert(1)'},
]) assert.throws(() => normalizeCmsEvents([invalid]));
assert.throws(() => normalizeCmsEvents([event, event]), /identificador/);
const url = new URL(publishedEventsUrl());
assert.equal(url.searchParams.get('perspective'), 'published');
assert(url.pathname.endsWith('/poc'));
const cancelled = normalizeCmsEvents([{...event, condition: 'cancelled'}]);
for (const lang of ['es', 'en']) {
  assert(renderEventList(normalized, lang, languages[lang]).includes(event.flyer.url));
  assert(renderEventList(cancelled, lang, languages[lang]).includes(languages[lang].eventCancelled));
  assert.equal(renderEventList(cancelled, lang, languages[lang], {homepage: true}), '');
  assert.equal(renderEventList(normalized, lang, languages[lang], {now: new Date(event.end)}), '');
}

let clock = 100;
let mode = 'success';
const feed = new EventFeed({now: () => clock, fetcher: async (_url, options) => {
  assert.equal(options.credentials, 'omit');
  assert.equal(options.cache, 'no-store');
  assert(!options.headers);
  if (mode === 'offline') throw new Error('offline');
  return {ok: true, json: async () => ({result: mode === 'empty' ? [] : [event]})};
}});
assert.equal(feed.snapshot().status, 'loading');
assert.equal((await feed.load()).status, 'ready');
mode = 'offline';
clock += 60_000;
assert.equal((await feed.load()).status, 'stale');
clock += STALE_LIMIT_MS;
assert.equal(feed.snapshot().status, 'unavailable');
assert.equal(feed.snapshot().events.length, 0);
mode = 'empty';
assert.deepEqual(await feed.load(), {status: 'ready', events: []});
const offline = new EventFeed({fetcher: async () => {throw new Error('offline');}});
assert.equal((await offline.load()).status, 'unavailable');
const timeout = new EventFeed({timeout: 1, fetcher: (_url, {signal}) => new Promise((_resolve, reject) => {
  signal.addEventListener('abort', () => reject(new Error('timeout')));
})});
assert.equal((await timeout.load()).status, 'unavailable');

for (const cms of [false, true]) {
  const child = spawn(process.execPath, ['scripts/serve.mjs', ...(cms ? ['--cms-poc'] : [])], {
    env: {...process.env, MDR_PREVIEW_PORT: '0'}, stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    const base = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Preview startup timed out')), 10_000);
      child.once('error', error => {clearTimeout(timer); reject(error);});
      child.once('exit', code => {clearTimeout(timer); reject(new Error(`Preview exited ${code}`));});
      child.stdout.on('data', data => {
        const match = data.toString().match(/http:\/\/127\.0\.0\.1:\d+\/mdr-church-website\//);
        if (match) {clearTimeout(timer); resolve(match[0]);}
      });
    });
    for (const lang of ['es', 'en']) for (const page of ['index', 'eventos']) {
      const response = await fetch(`${base}${lang}/${page}.html`);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.equal(html.includes('data-cms-poc-config'), cms);
      if (cms) assert(!html.includes('data-cms-events-config'), 'POC preview must not mount a second public feed');
    }
    assert.equal((await fetch(`${base}studio/sanity.config.ts`)).status, 403);
    assert.equal((await fetch(`${base}assets/cms-events.mjs`)).headers.get('content-type'), 'text/javascript');
  } finally {child.kill();}
}
console.log('PASS: CMS normalization, draft rejection, cancellation, expiry, outage/timeout recovery and local-only injection.');
await import('./test-cms-release.mjs');
