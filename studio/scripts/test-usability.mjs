import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import * as location from '../lib/event-location.mjs';
import * as validation from '../lib/event-validation.mjs';
import {church} from '../../content/church.mjs';
const require = createRequire(import.meta.url);
const ui = require('@sanity/ui');
let document = location.newEventDefaults();
const sanity = {defineField: x => x, defineType: x => x, useFormValue: () => document,
  set: (value, path) => ({type: 'set', value, path}), PatchEvent: {from: patches => ({patches})}};
function load(file, dependencies) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const {outputText} = ts.transpileModule(source, {compilerOptions: {jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS}});
  const exports = {}; new Function('exports', 'require', 'React', outputText)(exports, id => dependencies[id] || require(id), React);
  return exports;
}
const components = load('../components/EventInput.tsx', {'sanity': sanity,
  '../../content/church.mjs': {church}, '../lib/event-location.mjs': location});
const schema = load('../schema/event.ts', {'sanity': sanity,
  '../components/ConditionField': {ConditionField: () => null}, '../components/EventInput': components,
  '../../content/church.mjs': {church}, '../lib/event-location.mjs': location, '../lib/event-validation.mjs': validation}).event;
const field = name => schema.fields.find(x => x.name === name);
function validator(name) {
  let run; field(name).validation({custom(fn) {run = fn; return this;}, uri() {return this;}});
  return run;
}
test('actual schema initial values publish church location without venue entry', () => {
  const doc = schema.initialValue();
  assert.equal(validator('venue')(doc.venue, {document: doc}), true);
  assert.equal(validator('location')(doc.location, {document: doc}), true);
  assert.equal(field('venue').hidden({document: doc}), true);
  assert.equal(field('location').hidden({document: doc}), true);
});
test('native document identity replaces required manual slug; stored slug remains defined', () => {
  assert.equal(field('slug').hidden, true); assert.equal(field('slug').readOnly, true);
  assert.equal(field('slug').validation, undefined);
  let run; schema.validation({custom(fn) {run = fn; return this;}});
  assert.equal(run({_id: 'drafts.new-UUID'}), true); assert.match(run({}), /administrador técnico/);
});
test('actual schema enforces end, alternative location and both language content', () => {
  assert.match(validator('end')(undefined, {document: {}}), /finalización/);
  assert.notEqual(validator('end')('2026-12-25T00:00:00Z', {document: {start: '2026-12-25T00:00:00Z'}}), true);
  const doc = {locationChoice: 'external', venue: 'Parque', location: 'Otra calle'};
  assert.equal(field('venue').hidden({document: doc}), false);
  assert.match(validator('venue')(' ', {document: doc}), /nombre/);
  assert.match(validator('location')('', {document: doc}), /dirección/);
  let childRule; field('title').fields[0].validation({custom(fn) {childRule = fn; return this;}});
  assert.notEqual(childRule(' '), true);
});
test('flyer validation keeps meaningful errors, file limit and network failure protection', async () => {
  const run = validator('flyer');
  assert.match(await run(undefined, {}), /volante/);
  const value = {asset: {_ref: 'asset'}};
  for (const asset of [{mimeType: 'text/html', size: 100}, {mimeType: 'image/png', size: 6000000}])
    assert.notEqual(await run(value, {getClient: () => ({fetch: async () => asset})}), true);
  assert.equal(await run(value, {getClient: () => ({fetch: async () => ({mimeType: 'image/png', size: 100})})}), true);
  assert.match(await run(value, {getClient: () => ({fetch: async () => {throw Error('offline');}})}), /Reintenta/);
});
test('opening legacy draft/custom location and duplicating emit no patches', () => {
  const changes = [];
  const element = components.EventInput({value: {venue: 'Own', location: 'Custom'}, onChange: p => changes.push(p), renderDefault: () => null});
  assert.equal(changes.length, 0);
  element.props.value('church'); assert.equal(changes.length, 1);
  assert.equal(changes[0].patches.length, 4);
  assert(changes[0].patches.some(p => p.path[0] === 'externalLocationBackup' && p.value.venue === 'Own'));
});
test('read-only document cannot change location through custom selector', () => {
  const element = components.EventInput({readOnly: true, value: location.newEventDefaults(),
    onChange: () => assert.fail('read-only patch'), renderDefault: () => null});
  element.props.value('external');
});
test('actual selector renders labelled native radios and concise read-only church summary', () => {
  document = location.newEventDefaults();
  const selector = React.createElement(components.LocationInput, {elementProps: {id: 'place'}, validation: []});
  const form = React.createElement(components.EventInput, {value: document, onChange() {}, renderDefault: () => selector});
  const html = renderToStaticMarkup(React.createElement(ui.ThemeProvider, {theme: ui.studioTheme}, form));
  assert(html.includes('<legend>Lugar del evento</legend>'));
  assert.equal((html.match(/type="radio"/g) || []).length, 2);
  assert(html.includes('En nuestra iglesia')); assert(html.includes('Otra ubicación'));
  assert(html.includes(church.name)); assert(html.includes(church.address));
  assert(html.includes('aria-describedby="place-summary"')); assert(html.includes('role="status"'));
});
test('optional stored fields retained and publication guidance is current', () => {
  for (const name of ['slug', 'sourceUrl', 'details', 'contact']) assert(field(name));
  assert(schema.description.includes('Al publicar')); assert(!schema.description.includes('todavía'));
  assert.match(field('end').description, /automáticamente/);
});
