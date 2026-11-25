import {church} from '../content/church.mjs';
export const EVENT_TIME_ZONE = church.timeZone;
const text = value => typeof value === 'string' && value.trim().length > 0;
const validDate = value => text(value) && Number.isFinite(Date.parse(value));
export const eventStatus = event => event.status !== undefined ? event.status : (event.verified === true ? 'published' : 'draft');
export function validEventDate(value) {
  if (!text(value) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(value) || !validDate(value)) return false;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: EVENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value)).map(part => [part.type, part.value]));
  // Round-trip the wall time to reject DST gaps, impossible dates and wrong offsets.
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}` === value.slice(0, 19);
}

export function upcomingEvents(records, now = new Date(), { includeCancelled = true } = {}) {
  return records.filter(record => {
    const status = eventStatus(record);
    return (status === 'published' || (includeCancelled && status === 'cancelled'))
      && Date.parse(record.end || record.start) > +now;
  }).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
