import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@sanity/client';
import {Schema} from '@sanity/schema';
import {builtinTypes} from '@sanity/schema/_internal';
import {validateDocument} from '@sanity/validation';
import {event} from '../schema/event.ts';
import {normalizeCmsEvents} from '../../assets/cms-events.mjs';

// Test-only pinned compiler built-ins. Actual event schema and native validators;
// no user token, browser field stubs, network requests or production mutations.
const otherType = {name: 'otherDocument', type: 'document', fields: [
  {name: 'slug', type: 'slug', validation: rule => rule.required()},
]};
const compile = definition => Schema.compile({name: 'mdr-native-regression', types: [...builtinTypes, definition, otherType]});
const corrected = compile(event);
const before = compile({...event, fields: event.fields.map(field => {
  if (field.name !== 'slug') return field;
  const {options, ...legacy} = field; return legacy;
})});
const words = value => ({es: value, en: value});
const asset = {_id: 'image-43d511aec40b8f5eb1f75d3da80ea2ef227f4c0a-150x150-jpg',
  _type: 'sanity.imageAsset', mimeType: 'image/jpeg', size: 3328,
  url: 'https://cdn.sanity.io/images/u2olnd8u/poc/43d511aec40b8f5eb1f75d3da80ea2ef227f4c0a-150x150.jpg'};
const fixture = (id, extra = {}) => ({
  _id: id, _type: 'event', ...event.initialValue(), category: 'community', title: words('Â¡NiÃ±os y oraciÃ³n!'),
  description: words('Contenido ficticio solo en memoria.'),
  start: '2099-01-01T16:00:00Z', end: '2099-01-01T18:00:00Z',
  imageAlt: words('Volante ficticio'), flyer: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}, ...extra,
});
const legacy = fixture('legacy-source', {slug: {_type: 'slug', current: 'same-legacy-value'}});
const canonical = id => id.replace(/^drafts\./, '');
function localClient(stored, metrics) {
  const raw = createClient({projectId: 'u2olnd8u', dataset: 'poc', apiVersion: '2026-11-17', useCdn: false});
  function wrap(client) {
    return new Proxy(client, {get(target, key) {
      if (key === 'withConfig') return config => wrap(target.withConfig(config));
      if (key === 'fetch') return async (query, params, options) => {
        if (options?.tag === 'validation.slug-is-unique') {
          metrics.uniqueness++;
          return !stored.some(doc => doc._type === params.docType && canonical(doc._id) !== params.published && doc.slug?.current === params.slug);
        }
        if (query.includes('mimeType,size') && params?.id === asset._id) {metrics.assets++; return asset;}
        if (query.includes('mimeType, extension, originalFilename') && params?.id === asset._id) {
          metrics.assetAccepts++; return {...asset, extension: 'jpg', originalFilename: 'fictional-test.jpg'};
        }
        throw new Error('Unexpected fetch; all network is forbidden in native regression.');
      };
      if (['request','mutate','create','patch','delete'].includes(key))
        return () => {throw new Error('Network/data mutation forbidden in native regression.');};
      const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value;
    }});
  }
  return wrap(raw);
}
async function check(document, {schema = corrected, stored = []} = {}) {
  const original = structuredClone(document), metrics = {uniqueness: 0, assets: 0, assetAccepts: 0};
  const result = await validateDocument({document, schema, client: localClient(stored, metrics),
    getDocumentExists: async ({id}) => id === asset._id, validateReferenceTypes: false});
  assert(result.complete, JSON.stringify(result.markers));
  assert.deepEqual(document, original, 'validation must never rewrite content or legacy slugs');
  return {...result, metrics};
}
const errors = result => result.markers.filter(marker => marker.level === 'error');
async function valid(document, options) {
  const result = await check(document, options);
  assert.deepEqual(errors(result), [], JSON.stringify(result.markers)); return result;
}
test('BEFORE: native inherited uniqueness rejects a copied legacy slug', async () => {
  const result = await check(fixture('copy-before', {slug: structuredClone(legacy.slug)}), {schema: before, stored: [legacy]});
  assert(result.metrics.uniqueness > 0);
  assert(errors(result).some(marker => marker.code === 'slug.not-unique' && marker.path[0] === 'slug'));
});
test('AFTER: new event without slug validates using automatic church/time-zone defaults', async () => {
  const record = fixture('new-no-slug'); assert.equal(record.slug, undefined);
  const result = await valid(record); assert.equal(result.metrics.uniqueness, 0);
  assert(result.metrics.assets > 0, 'real flyer validator must execute');
});
test('existing valid legacy slug validates and is preserved', async () => {await valid(legacy, {stored: [legacy]});});
test('existing draft with no slug validates under actual schema', async () => {await valid(fixture('drafts.existing-draft'));});
test('distinct documents sharing title and legacy slug both validate', async () => {
  const other = fixture('different-document', {slug: structuredClone(legacy.slug)}), stored = [legacy, other];
  assert.equal((await valid(legacy, {stored})).metrics.uniqueness, 0);
  assert.equal((await valid(other, {stored})).metrics.uniqueness, 0);
});
test('duplication preserves legacy value and external location', async () => {
  const source = fixture('external-source', {locationChoice: 'external', venue: 'Parque ficticio',
    location: 'DirecciÃ³n ficticia', slug: structuredClone(legacy.slug)});
  const duplicate = {...structuredClone(source), _id: 'drafts.external-copy'};
  await valid(duplicate, {stored: [source]}); assert.deepEqual(duplicate.slug, source.slug);
  assert.equal(duplicate.venue, source.venue); assert.equal(duplicate.location, source.location);
});
test('draft and published variants share canonical identity without slug errors', async () => {
  const draft = {...structuredClone(legacy), _id: 'drafts.' + legacy._id};
  await valid(legacy, {stored: [legacy, draft]}); await valid(draft, {stored: [legacy, draft]});
  assert.equal(canonical(draft._id), legacy._id);
});
test('title edit preserves native identity and stored legacy slug', async () => {
  const edited = {...structuredClone(legacy), title: words('TÃ­tulo corregido')};
  await valid(edited, {stored: [legacy]}); assert.equal(edited._id, legacy._id); assert.deepEqual(edited.slug, legacy.slug);
});
test('invalid native identity still blocks publication', async () => {
  for (const id of ['invalid.id', 'drafts.invalid.id'])
    assert(errors(await check(fixture(id))).some(marker => marker.message.includes('identificador')));
  // Native reference resolution itself needs a nonempty ID. Exercise empty IDs
  // against the unchanged document-level rule without unrelated asset traversal.
  const identityOnly = compile({...event, fields: []});
  for (const id of ['', 'drafts.'])
    assert(errors(await check({_id: id, _type: 'event'}, {schema: identityOnly}))
      .some(marker => marker.message.includes('identificador')));
});
test('unrelated title/end/flyer/external-place validation still rejects invalid content', async () => {
  for (const [extra, path] of [[{title: words(' ')}, 'title'],
    [{end: '2099-01-01T15:00:00Z'}, 'end'], [{flyer: undefined}, 'flyer'],
    [{locationChoice: 'external', venue: '', location: ''}, 'venue']]) {
    const result = await check(fixture('invalid-content', extra), {stored: [legacy]});
    assert(errors(result).some(marker => marker.path[0] === path), JSON.stringify(result.markers));
  }
});
test('public identities stay distinct despite same title/legacy slug and stable on title edit', () => {
  const other = fixture('public-copy', {slug: structuredClone(legacy.slug)});
  const records = [legacy, other].map(record => ({...record, flyer: asset}));
  const normalized = normalizeCmsEvents(records); assert.notEqual(normalized[0].id, normalized[1].id);
  assert.equal(normalizeCmsEvents([{...records[0], title: words('Otro tÃ­tulo')}])[0].id, normalized[0].id);
});
test('override is local: another document type still fails native uniqueness', async () => {
  const source = {_id: 'other-source', _type: 'otherDocument', slug: structuredClone(legacy.slug)};
  const result = await check({...source, _id: 'other-copy'}, {stored: [source]});
  assert(result.metrics.uniqueness > 0); assert(errors(result).some(marker => marker.code === 'slug.not-unique'));
});
test('legacy structural validation remains enabled, not globally skipped', async () => {
  const result = await check(fixture('malformed-legacy', {slug: {_type: 'slug'}}));
  assert(errors(result).some(marker => marker.path[0] === 'slug'));
});
test('hidden fields preserve valid backups; legacy missing technical fields remain repairable', async () => {
  await valid(fixture('saved-backup', {externalLocationBackup: {venue: 'Parque', location: 'Otra direcciÃ³n'}}));
  for (const fieldName of ['timeZone', 'venue', 'location']) {
    const record = fixture('invalid-hidden-' + fieldName, {[fieldName]: undefined});
    delete record.locationChoice;
    assert(errors(await check(record)).some(marker => marker.path[0] === fieldName));
    assert.equal(event.fields.find(field => field.name === fieldName).hidden({document: record}), false);
  }
});

test('missing category blocks actual native publication validation with the Spanish instruction', async () => {
  const document = fixture('missing-category'); delete document.category;
  const result = await check(document);
  assert(errors(result).some(marker => marker.path[0] === 'category' &&
    marker.message === 'Selecciona el tipo de evento: Cultos y servicios o Comunidad.'));
  assert.equal(document.category, undefined);
});
test('native validation preserves both categories for existing and duplicate documents', async () => {
  for (const category of ['worship', 'community']) {
    const source = fixture('existing-' + category, {category});
    const copy = {...structuredClone(source), _id: 'drafts.copy-' + category};
    await valid(source); await valid(copy); assert.equal(copy.category, category);
  }
});
