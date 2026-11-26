import test from 'node:test';
import assert from 'node:assert/strict';
import {renderEventCard} from '../assets/event-rendering.mjs';

const words = value => ({es: value, en: value});
const fixture = (start, end) => ({id:'time-only-fixture',status:'published',category:'community',
  title:words('Time fixture'),description:words('In-memory only'),location:'Test location',start,end});
for (const lang of ['es', 'en']) test(lang + ': shared Studio preview/public cards use 12 at midnight/noon with distinct day periods', () => {
  const event = fixture('2026-11-27T05:00:00.000Z', '2026-11-27T17:00:00.000Z');
  const original = structuredClone(event), html = renderEventCard(event, lang, {});
  const times = [...html.matchAll(/<time datetime="([^"]+)">([^<]+)<\/time>/g)];
  assert.equal(times.length, 2);
  assert.equal(times[0][1], event.start); assert.equal(times[1][1], event.end);
  assert.match(times[0][2].replace(/\s/g, ''), /12:00(?:a\.m\.|AM)/);
  assert.match(times[1][2].replace(/\s/g, ''), /12:00(?:p\.m\.|PM)/);
  assert.deepEqual(event, original);
});
for (const lang of ['es', 'en']) test(lang + ': overnight and DST cards retain UTC data-expires and timestamps', () => {
  for (const [start,end] of [
    ['2026-11-28T04:30:00.000Z','2026-11-28T05:15:00.000Z'],
    ['2026-03-08T06:30:00.000Z','2026-03-08T07:30:00.000Z'],
    ['2026-11-01T05:30:00.000Z','2026-11-01T06:30:00.000Z'],
  ]) {
    const event = fixture(start,end), html = renderEventCard(event, lang, {});
    assert(html.includes('data-expires="' + end + '"'));
    assert(html.includes('datetime="' + start + '"')); assert(html.includes('datetime="' + end + '"'));
    assert(!html.includes('23:30')); assert(!html.includes('00:15'));
  }
});
