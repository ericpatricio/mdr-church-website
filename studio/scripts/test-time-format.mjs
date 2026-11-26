import test from 'node:test';
import assert from 'node:assert/strict';
import {format, parse} from '@sanity/util/legacyDateFormat';
import {event} from '../schema/event.ts';

const field = name => event.fields.find(field => field.name === name);
for (const name of ['start', 'end']) test(name + ': native 12-hour format keeps fixed New York zone and validators', () => {
  assert.equal(field(name).options.timeFormat, 'h:mm A');
  assert.equal(field(name).options.displayTimeZone, 'America/New_York');
  assert.equal(field(name).options.allowTimeZoneSwitch, false);
  assert.equal(typeof field(name).validation, 'function');
});

const cases = [
  ['midnight', '2026-11-27T05:00:00.000Z', '2026-11-27 12:00 AM'],
  ['noon', '2026-11-27T17:00:00.000Z', '2026-11-27 12:00 PM'],
  ['morning', '2026-11-27T14:30:00.000Z', '2026-11-27 9:30 AM'],
  ['evening', '2026-11-28T00:45:00.000Z', '2026-11-27 7:45 PM'],
  ['after midnight', '2026-11-28T05:15:00.000Z', '2026-11-28 12:15 AM'],
  ['before spring DST', '2026-03-08T06:30:00.000Z', '2026-03-08 1:30 AM'],
  ['after spring DST', '2026-03-08T07:30:00.000Z', '2026-03-08 3:30 AM'],
  ['summer daylight time', '2026-07-01T13:30:00.000Z', '2026-07-01 9:30 AM'],
];
for (const [name, iso, expected] of cases) test('installed native formatter/parser: ' + name, () => {
  for (const name of ['start', 'end']) {
    const pattern = 'YYYY-MM-DD ' + field(name).options.timeFormat;
    assert.equal(format(new Date(iso), pattern, {timeZone: 'America/New_York'}), expected);
    const result = parse(expected, pattern, 'America/New_York');
    assert.equal(result.isValid, true);
    assert.equal(result.date.toISOString(), iso);
  }
});
test('fall DST repeated hour displays both stored instants without rewriting either', () => {
  const record = {start: '2026-11-01T05:30:00.000Z', end: '2026-11-01T06:30:00.000Z'};
  const original = structuredClone(record);
  for (const value of Object.values(record))
    assert.equal(format(new Date(value), 'YYYY-MM-DD h:mm A', {timeZone: 'America/New_York'}), '2026-11-01 1:30 AM');
  assert.deepEqual(record, original);
  assert.equal(Date.parse(record.end) - Date.parse(record.start), 3600000);
});
