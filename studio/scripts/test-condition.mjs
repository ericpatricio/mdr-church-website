import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';

// Render the real field component without starting Studio or writing test data.
const source = readFileSync(new URL('../components/ConditionField.tsx', import.meta.url), 'utf8');
const {outputText} = ts.transpileModule(source, {compilerOptions: {
  jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS,
}});
const exports = {};
new Function('exports', 'React', outputText)(exports, React);
const props = {inputId: 'condition', title: 'Estado del encuentro',
  description: 'Selecciona el estado.', validation: [], children: React.createElement('input', {type: 'radio'})};
const render = validation => renderToStaticMarkup(React.createElement(exports.ConditionField, {...props, validation}));
const valid = render([]);
assert(valid.includes('<legend>Estado del encuentro</legend>'));
assert(valid.includes('<fieldset aria-describedby="condition-description condition-errors" aria-invalid="false"'));
assert(valid.includes('id="condition-description"'));
assert(valid.includes('id="condition-errors" role="alert" aria-atomic="true"'));
assert(!valid.includes('<label'), 'group heading must not become a single-input label');
const invalid = render([{level: 'error', message: 'Selecciona un estado.'}]);
assert(invalid.includes('aria-invalid="true"'));
assert(invalid.includes('<p>Selecciona un estado.</p>'));
assert(valid.includes('type="radio"'), 'Sanity native children remain intact');
console.log('PASS: Studio semantic group, description/error associations, alert region and native input preservation (static rendering; no screen-reader claim).');
