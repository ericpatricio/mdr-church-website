// These selectors do not fetch or fabricate content. Only verified records are published.
const text = value => typeof value === 'string' && value.trim().length > 0;
const bilingual = value => value && text(value.es) && text(value.en);
const validDate = value => text(value) && Number.isFinite(Date.parse(value));
const https = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const localImage = value => !value || (text(value) && !value.startsWith('/') && !value.includes('..') && !value.includes(':'));
const requireField = (ok, message) => { if (!ok) throw new Error(message); };
export function validateRecords(events, sermons) {
  const ids = new Set();
  for (const event of events.filter(record => record.verified === true)) {
    requireField(text(event.id) && !ids.has('event:'+event.id), 'Each verified event needs a unique id.'); ids.add('event:'+event.id);
    requireField(bilingual(event.title) && bilingual(event.description) && bilingual(event.details), 'Verified events need bilingual title, description and details.');
    requireField(validDate(event.start) && /(?:Z|[+-]\d\d:\d\d)$/.test(event.start), 'Verified events need an ISO start with timezone.');
    requireField(!event.end || (validDate(event.end) && Date.parse(event.end) >= Date.parse(event.start)), 'Event end must follow its start.');
    requireField(['worship','community'].includes(event.category) && text(event.location), 'Verified events need a category and location.');
    requireField(https(event.sourceUrl) && localImage(event.image), 'Verified events need an official source URL and a local image path.');
  }
  for (const sermon of sermons.filter(record => record.verified === true)) {
    requireField(text(sermon.id) && !ids.has('sermon:'+sermon.id), 'Each verified message needs a unique id.'); ids.add('sermon:'+sermon.id);
    requireField(bilingual(sermon.title) && text(sermon.speaker) && validDate(sermon.date), 'Verified messages need a bilingual title, speaker and date.');
    requireField(https(sermon.url) && localImage(sermon.image), 'Verified messages need an HTTPS recording URL and a local thumbnail path.');
  }
}
export function upcomingEvents(records, now = new Date()) {
  return records.filter(record => record.verified === true && Date.parse(record.end || record.start) >= +now).sort((a,b) => Date.parse(a.start)-Date.parse(b.start));
}
export function publishedSermons(records) {
  return records.filter(record => record.verified === true).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
}
