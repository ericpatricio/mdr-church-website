import fs from 'node:fs';

import { EVENT_TIME_ZONE, eventStatus, validEventDate, upcomingEvents } from '../assets/event-model.mjs';
export { EVENT_TIME_ZONE, eventStatus, validEventDate, upcomingEvents };
const text = value => typeof value === 'string' && value.trim().length > 0;
const bilingual = value => value && text(value.es) && text(value.en);
const validDate = value => text(value) && Number.isFinite(Date.parse(value));
const https = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};
const localImage = value => !value || (text(value) && /^[a-zA-Z0-9_/-]+\.(webp|png|jpe?g)$/i.test(value) && !value.startsWith('/') && !value.includes('..'));
const requireField = (ok, message) => { if (!ok) throw new Error(message); };


export function validateRecords(events, sermons) {
  const ids = new Set();
  for (const [index, event] of events.entries()) {
    const label = `Event ${event.id || `at index ${index}`}`;
    const check = (ok, field, instruction) => requireField(ok, `${label}: ${field} — ${instruction}`);
    const status = eventStatus(event);
    check(['draft', 'published', 'cancelled'].includes(status), 'status', 'use draft, published or cancelled.');
    if (event.id || event.status !== undefined || status !== 'draft') {
      check(text(event.id) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.id) && !ids.has('event:' + event.id), 'id', 'use a unique lowercase slug.');
      ids.add('event:' + event.id);
    }
    if (status === 'draft') continue;
    for (const field of ['title', 'description', 'details']) {
      check(bilingual(event[field]), field, 'provide nonempty bilingual es and en text.');
    }
    check(validEventDate(event.start), 'start timezone', 'use a real New York time with seconds and its correct -05:00 winter or -04:00 summer offset.');
    check(event.end === undefined || (validEventDate(event.end) && Date.parse(event.end) > Date.parse(event.start)), 'end', 'use a valid New York timestamp after start, or omit end.');
    check(['worship', 'community'].includes(event.category), 'category', 'use worship or community.');
    check(text(event.location), 'location', 'provide the verified address.');
    if (event.status !== undefined) {
      check(event.timeZone === EVENT_TIME_ZONE, 'timeZone', `use ${EVENT_TIME_ZONE}.`);
      check(text(event.venue), 'venue', 'provide the verified venue name.');
      check(bilingual(event.imageAlt), 'imageAlt', 'provide descriptive flyer alt text in es and en.');
      check(text(event.image) && localImage(event.image), 'image', 'provide an assets-relative local flyer path (jpg, png or webp).');
    }
    if (event.sourceUrl !== undefined) check(https(event.sourceUrl), 'sourceUrl', 'use an official HTTPS source URL.');
    if (event.registrationUrl !== undefined) check(https(event.registrationUrl), 'registrationUrl', 'use a verified HTTPS registration URL.');
    if (event.contact !== undefined) check(bilingual(event.contact), 'contact', 'provide verified contact text in es and en, or omit contact.');
    if (event.image !== undefined) {
      check(text(event.image) && localImage(event.image), 'image', 'use a local assets-relative image path.');
      const file = new URL(event.image, new URL('../assets/', import.meta.url));
      check(fs.existsSync(file) && fs.statSync(file).isFile(), 'image', `flyer not found: assets/${event.image}. Add the file or correct its name.`);
      let directory = new URL('../assets/', import.meta.url);
      for (const segment of event.image.split('/')) {
        check(fs.readdirSync(directory).includes(segment), 'image', `match filename capitalization exactly: assets/${event.image}.`);
        directory = new URL(`${segment}/`, directory);
      }
    }
  }
  for (const sermon of sermons.filter(record => record.verified === true)) {
    requireField(text(sermon.id) && !ids.has('sermon:'+sermon.id), 'Each verified message needs a unique id.'); ids.add('sermon:'+sermon.id);
    requireField(bilingual(sermon.title) && text(sermon.speaker) && validDate(sermon.date), 'Verified messages need a bilingual title, speaker and date.');
    requireField(https(sermon.url) && localImage(sermon.image), 'Verified messages need an HTTPS recording URL and a local thumbnail path.');
  }
}
export function publishedSermons(records) {
  return records.filter(record => record.verified === true).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
}
