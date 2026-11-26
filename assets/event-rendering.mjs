import { EVENT_TIME_ZONE, eventStatus, upcomingEvents } from './event-model.mjs';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export function renderEventCard(event, lang, translations, hidden = false) {
  const esc = escapeHtml;
  const cancelled = eventStatus(event) === 'cancelled';
  const format = value => new Intl.DateTimeFormat(lang, {
    dateStyle: 'long', timeStyle: 'short', timeZone: EVENT_TIME_ZONE,
  }).format(new Date(value));
  const time = value => `<time datetime="${esc(value)}">${esc(format(value))}</time>`;
  return `<article class="event" data-category="${esc(event.category)}" data-expires="${esc(event.end || event.start)}"${hidden ? ' hidden' : ''}>
  ${event.image || event.imageUrl ? `<img src="${event.imageUrl ? esc(event.imageUrl) : '../assets/' + esc(event.image)}" alt="${esc(event.imageAlt?.[lang] || event.title[lang])}" width="1200" height="1600" loading="lazy" decoding="async">` : ''}
  <div><p class="eyebrow">${time(event.start)}${event.end ? ` – ${time(event.end)}` : ''} · ${EVENT_TIME_ZONE}</p>
  ${cancelled ? `<p class="event-cancelled"><strong>${translations.eventCancelled}</strong></p>` : ''}
  <h3>${esc(event.title[lang])}</h3><p>${event.venue ? `${esc(event.venue)}<br>` : ''}${esc(event.location)}</p>
  <p>${esc(event.description[lang])}</p>${event.details?.[lang] || event.contact ? `<details><summary>${translations.eventDetails}</summary>${event.details?.[lang] ? `<p>${esc(event.details[lang])}</p>` : ''}
  ${event.contact ? `<p>${esc(event.contact[lang])}</p>` : ''}</details>` : ''}
  ${event.registrationUrl && !cancelled ? `<a class="text-link" href="${esc(event.registrationUrl)}">${translations.eventRegister}</a>` : ''}</div>
</article>`;
}

export function renderEventList(records, lang, translations, { homepage = false, now = new Date() } = {}) {
  const upcoming = upcomingEvents(records, now, { includeCancelled: !homepage });
  // Later cards let the browser promote the next event after an earlier one expires.
  return upcoming.map((event, index) => renderEventCard(event, lang, translations, homepage && index >= 3)).join('');
}
