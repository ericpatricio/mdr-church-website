import test from 'node:test';
import assert from 'node:assert/strict';
import {eventIdentity} from '../assets/event-identity.mjs';
import {createExpirationClock} from '../assets/event-expiration.mjs';
import {upcomingEvents} from '../assets/event-model.mjs';
import {normalizeCmsEvents} from '../assets/cms-events.mjs';
import {renderEventCard} from '../assets/event-rendering.mjs';
import {church} from '../content/church.mjs';
import {languages} from '../content/site.mjs';
import {newEventDefaults, eventLocationMode, locationChanges, validateVenue, validateAddress} from '../studio/lib/event-location.mjs';
import {validateEnd, validateDocumentIdentity, optionalBilingual} from '../studio/lib/event-validation.mjs';

const words = value => ({es: value, en: value});
const fixture = (overrides = {}) => ({_id: 'new-document-123', _type: 'event',
  ...newEventDefaults(), title: words('¡NIÑOS, oración & FE!'), description: words('Descripción'),
  start: '2026-12-25T00:00:00Z', end: '2026-12-25T02:00:00Z',
  imageAlt: words('Volante'), flyer: {url: 'https://cdn.sanity.io/images/u2olnd8u/poc/test.jpg', mimeType: 'image/jpeg', size: 100},
  ...overrides,
});
const apply = (doc, choice) => Object.assign({}, doc, ...locationChanges(doc, choice).map(p => ({[p.path[0]]: p.value})));

test('new event has church name/address/time zone with no manual entry', () => {
  const doc = newEventDefaults();
  assert.equal(doc.venue, church.name); assert.equal(doc.location, church.address);
  assert.equal(doc.timeZone, 'America/New_York'); assert.equal(doc.locationChoice, 'church');
  assert.equal(validateVenue(doc.venue, doc), true); assert.equal(validateAddress(doc.location, doc), true);
});
test('external selection requires both fields before publication', () => {
  const doc = apply(newEventDefaults(), 'external');
  assert.equal(doc.venue, ''); assert.equal(doc.location, '');
  assert.match(validateVenue('', doc), /nombre/); assert.match(validateAddress(' ', doc), /dirección/);
  assert.equal(validateVenue('Parque', doc), true); assert.equal(validateAddress('Otra calle', doc), true);
});
test('round trip preserves alternative venue and address without overwriting existing data', () => {
  const custom = {venue: 'Parque', location: 'Dirección propia'};
  assert.equal(eventLocationMode(custom), 'external');
  assert.deepEqual(locationChanges(custom, 'external'), []);
  const atChurch = apply(custom, 'church');
  assert.equal(atChurch.venue, church.name); assert.equal(atChurch.location, church.address);
  const restored = apply(atChurch, 'external');
  assert.equal(restored.venue, custom.venue); assert.equal(restored.location, custom.location);
  assert.deepEqual(custom, {venue: 'Parque', location: 'Dirección propia'});
});
test('duplicates retain intended external or default church location', () => {
  for (const source of [newEventDefaults(), {venue: 'Otro lugar', location: 'Otra dirección'}]) {
    const copy = structuredClone(source); assert.equal(eventLocationMode(copy), eventLocationMode(source));
    assert.deepEqual(locationChanges(copy, eventLocationMode(copy)), []);
  }
});
test('unchanged church selection emits no destructive patches', () => {
  assert.deepEqual(locationChanges(newEventDefaults(), 'church'), []);
  assert.throws(() => locationChanges({}, 'unknown'));
});
test('both public languages display authoritative church and alternative location', () => {
  for (const lang of ['es', 'en']) for (const place of [newEventDefaults(), {venue: 'Parque', location: 'Otra dirección'}]) {
    const [event] = normalizeCmsEvents([fixture(place)]);
    const html = renderEventCard(event, lang, languages[lang]);
    assert(html.includes(place.venue)); assert(html.includes(place.location)); assert(!html.includes('undefined'));
  }
});
for (const title of ['Niños y oración', '¡FE, PAZ & COMUNIÓN!', '  Navidad / 2026  ', '', '🎉']) {
  test('automatic native identity is independent of title: ' + JSON.stringify(title), () => {
    const record = fixture({title: words(title)});
    assert.match(eventIdentity(record._id), /^[a-z0-9-]+$/);
    assert.equal(validateDocumentIdentity({...record, _id: 'drafts.' + record._id}), true);
  });
}
test('same titles and copied legacy slugs cannot collide across documents', () => {
  const a = fixture({slug: {current: 'culto'}}), b = fixture({_id: 'duplicate-456', slug: {current: 'culto'}});
  const records = normalizeCmsEvents([a, b]); assert.notEqual(records[0].id, records[1].id);
});
test('missing slug draft can publish after native lifecycle strips draft prefix', () => {
  const doc = fixture(); assert.equal(doc.slug, undefined);
  assert.equal(validateDocumentIdentity({...doc, _id: 'drafts.' + doc._id}), true);
  assert.equal(normalizeCmsEvents([doc]).length, 1);
  assert.throws(() => normalizeCmsEvents([{...doc, _id: 'drafts.' + doc._id}]));
});
test('title edits retain identity and stored legacy identifier', () => {
  const doc = fixture({slug: {current: 'existing-stable'}});
  const edited = {...doc, title: words('Nuevo título')};
  assert.equal(normalizeCmsEvents([doc])[0].id, normalizeCmsEvents([edited])[0].id);
  assert.deepEqual(doc.slug, {current: 'existing-stable'});
});
test('invalid native identity fails with one understandable Spanish error', () => {
  for (const id of ['', undefined, 'drafts.x', 'invalid.id', '<script>']) assert.throws(() => eventIdentity(id), /administrador técnico/);
  assert.match(validateDocumentIdentity({_id: ''}), /identificador/);
  assert.notEqual(eventIdentity('ABC'), eventIdentity('abc'));
});
test('blank titles still fail required bilingual public content validation', () => {
  assert.throws(() => normalizeCmsEvents([fixture({title: words(' ')})]), /title/);
});
test('details are optional; old bilingual details and contact remain rendered', () => {
  for (const lang of ['es', 'en']) {
    const simple = renderEventCard(normalizeCmsEvents([fixture()])[0], lang, languages[lang]);
    assert(!simple.includes('<details>'));
    const old = renderEventCard(normalizeCmsEvents([fixture({details: words('Contenido conservado'), contact: words('Contacto')})])[0], lang, languages[lang]);
    assert(old.includes('Contenido conservado')); assert(old.includes('Contacto'));
  }
  assert.match(optionalBilingual({es: 'Solo español'}), /ambos/);
  assert.equal(optionalBilingual(undefined), true);
  assert.throws(() => normalizeCmsEvents([fixture({details: {es: 'Falta inglés'}})]), /details/);
});
test('new end is required and strictly after start; old missing end still expires at start', () => {
  const doc = fixture();
  for (const end of [undefined, '', 'bad', doc.start, '2026-12-24T00:00:00Z']) assert.notEqual(validateEnd(end, doc), true);
  assert.equal(validateEnd(doc.end, doc), true);
  const legacy = normalizeCmsEvents([fixture({end: undefined})])[0];
  assert.equal(upcomingEvents([legacy], new Date(legacy.start)).length, 0);
});
const ranges = [
  ['same day', '2026-12-25T19:00:00-05:00', '2026-12-25T21:00:00-05:00'],
  ['midnight', '2026-12-25T23:00:00-05:00', '2026-12-26T01:00:00-05:00'],
  ['multiple days / year boundary', '2026-12-30T19:00:00-05:00', '2027-01-02T09:00:00-05:00'],
  ['spring DST gap crossing', '2027-03-14T01:30:00-05:00', '2027-03-14T03:30:00-04:00'],
  ['autumn repeated hour', '2026-11-01T01:30:00-04:00', '2026-11-01T01:30:00-05:00'],
];
for (const [name, start, end] of ranges) test('expiration boundary ' + name + ' for either location', () => {
  assert.equal(validateEnd(end, {start}), true);
  for (const place of [newEventDefaults(), {venue: 'External', location: 'Outside'}]) {
    const event = {id: 'boundary', status: 'published', start, end, ...place};
    for (const delta of [-1000, 0, 1000]) assert.equal(upcomingEvents([event], new Date(Date.parse(end) + delta)).length, delta < 0 ? 1 : 0);
    assert.equal(upcomingEvents([event], new Date(start)).length, 1);
  }
});
test('local deadline fires exactly at end without waiting for network refresh', () => {
  let now = 0, scheduled, delay, cleared = 0, visible = 1;
  const timer = createExpirationClock(() => {visible = 0;}, {now: () => now, schedule: (cb, ms) => {scheduled = cb; delay = ms; return 1;}, cancel: () => cleared++});
  timer.update([{end: new Date(5000).toISOString()}]); assert.equal(delay, 5000);
  now = 4999; assert.equal(visible, 1); now = 5000; scheduled(); assert.equal(visible, 0);
  timer.update([]); assert.equal(cleared, 0);
});
test('editing/extension reschedules the deadline; deletion cancels pending timer', () => {
  let delay, clear = 0;
  const timer = createExpirationClock(() => {}, {now: () => 0, schedule: (_cb, ms) => {delay = ms; return 1;}, cancel: () => clear++});
  timer.update([{end: new Date(1000).toISOString()}]); timer.update([{end: new Date(6000).toISOString()}]);
  assert.equal(delay, 6000); assert.equal(clear, 1); timer.update([]); assert.equal(clear, 2);
});
test('suspension catch-up, past events and invalid deadlines cannot schedule a busy loop', () => {
  let calls = 0; const timer = createExpirationClock(() => {}, {now: () => 5000, schedule: () => calls++, cancel: () => {}});
  timer.update([{end: new Date(4000).toISOString()}, {end: 'bad'}]); assert.equal(calls, 0);
  assert.equal(upcomingEvents([{status: 'published', end: new Date(4000).toISOString()}], new Date(5000)).length, 0);
});
test('long future dates are bounded to supported browser timer range', () => {
  let delay; const timer = createExpirationClock(() => {}, {now: () => 0, schedule: (_cb, ms) => {delay = ms; return 1;}, cancel: () => {}});
  timer.update([{end: '2099-01-01T00:00:00Z'}]); assert.equal(delay, 2147483647); timer.stop();
});
test('cancelled events expire at exact end and stay excluded from upcoming homepage', () => {
  const doc = {...fixture(), condition: 'cancelled'};
  const [event] = normalizeCmsEvents([doc]);
  assert.equal(upcomingEvents([event], new Date(Date.parse(event.end) - 1)).length, 1);
  assert.equal(upcomingEvents([event], new Date(Date.parse(event.end) - 1), {includeCancelled: false}).length, 0);
  assert.equal(upcomingEvents([event], new Date(event.end)).length, 0);
});
