import {CMS_PROJECT, CMS_DATASET} from './cms-config.mjs';
import {eventIdentity} from './event-identity.mjs';
// Keep existing POC script imports compatible while sharing the release target.
export {CMS_PROJECT as POC_PROJECT, CMS_DATASET as POC_DATASET};
export const STALE_LIMIT_MS = 5 * 60_000;

const hasText = value => typeof value === 'string' && value.trim().length > 0;
const translated = value => value && hasText(value.es) && hasText(value.en);
const instant = value => {
  if (!hasText(value) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const time = new Date(value);
  return Number.isFinite(+time) && time.toISOString().replace('.000', '') === value.replace('.000', '');
};
const httpsUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
};

export function normalizeCmsEvents(records) {
  if (!Array.isArray(records)) throw new Error('La respuesta de eventos no es una lista.');
  const ids = new Set();
  return records.map(record => {
    const fail = field => { throw new Error(`Evento ${record?._id || '?'}: revisa ${field}.`); };
    if (!record || record._type !== 'event' || !hasText(record._id) || record._id.includes('.')) fail('documento publicado');
    const id = eventIdentity(record._id);
    if (!hasText(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) fail('identificador único');
    ids.add(id);
    for (const field of ['title', 'description', 'imageAlt']) if (!translated(record[field])) fail(field);
    if (record.details && (hasText(record.details.es) || hasText(record.details.en)) && !translated(record.details)) fail('details');
    if (!instant(record.start) || (record.end && (!instant(record.end) || Date.parse(record.end) <= Date.parse(record.start)))) fail('fechas');
    if (record.timeZone !== 'America/New_York') fail('zona horaria');
    if (!['scheduled', 'cancelled'].includes(record.condition)) fail('estado');
    if (!['community', 'worship'].includes(record.category)) fail('categoría');
    if (!hasText(record.venue) || !hasText(record.location)) fail('lugar y dirección');
    const asset = record.flyer;
    if (!asset || !httpsUrl(asset.url)) fail('volante');
    const url = new URL(asset.url);
    if (url.hostname !== 'cdn.sanity.io' || !url.pathname.startsWith(`/images/${CMS_PROJECT}/${CMS_DATASET}/`) ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType) ||
      !(asset.size > 0 && asset.size <= 5 * 1024 * 1024)) fail('volante (JPG, PNG o WebP; máximo 5 MB)');
    for (const field of ['registrationUrl', 'sourceUrl']) if (record[field] !== undefined && record[field] !== null && !httpsUrl(record[field])) fail(field);
    if (record.contact && !translated(record.contact)) fail('contacto bilingüe');
    return {
      id, status: record.condition === 'cancelled' ? 'cancelled' : 'published',
      title: record.title, description: record.description, details: translated(record.details) ? record.details : undefined,
      imageAlt: record.imageAlt, imageUrl: asset.url, start: record.start,
      end: record.end || undefined, timeZone: record.timeZone, category: record.category,
      venue: record.venue, location: record.location, contact: record.contact || undefined,
      registrationUrl: record.registrationUrl || undefined,
    };
  });
}

export function publishedEventsUrl() {
  const query = `*[_type == "event" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] {
    _id, _type, slug, title, description, details, start, end, timeZone, category,
    venue, location, condition, imageAlt, registrationUrl, sourceUrl, contact,
    "flyer": flyer.asset->{url, mimeType, size}
  }`;
  const url = new URL(`https://${CMS_PROJECT}.api.sanity.io/v2026-11-17/data/query/${CMS_DATASET}`);
  url.searchParams.set('perspective', 'published');
  url.searchParams.set('query', query);
  return url.href;
}

// Public read-only requests. No cookies, tokens, draft perspective or persistent cache.
export class EventFeed {
  constructor({fetcher = (...args) => globalThis.fetch(...args), now = Date.now, timeout = 10_000} = {}) {
    this.fetcher = fetcher;
    this.now = now;
    this.timeout = timeout;
    this.events = [];
    this.lastSuccess = null;
    this.failed = false;
    this.lastError = null;
    this.failures = 0;
    this.nextAttempt = 0;
    this.inFlight = false;
  }

  snapshot() {
    if (this.lastSuccess === null) return {status: this.failed ? 'unavailable' : 'loading', events: []};
    if (this.now() - this.lastSuccess >= STALE_LIMIT_MS) return {status: 'unavailable', events: []};
    return {status: this.failed ? 'stale' : 'ready', events: this.events};
  }

  async load() {
    if (this.inFlight) return this.snapshot();
    this.inFlight = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await this.fetcher(publishedEventsUrl(), {
        signal: controller.signal, credentials: 'omit', cache: 'no-store',
      });
      if (!response.ok) throw new Error(`CMS HTTP ${response.status}`);
      const payload = await response.json();
      this.events = normalizeCmsEvents(payload.result);
      this.lastSuccess = this.now();
      this.failed = false;
      this.lastError = null;
      this.failures = 0;
      this.nextAttempt = this.now() + 60_000;
    } catch (error) {
      this.failed = true;
      this.lastError = error instanceof Error ? error.message : 'Error desconocido';
      this.failures++;
      this.nextAttempt = this.now() + Math.min(120_000, 30_000 * 2 ** Math.min(this.failures - 1, 2));
    } finally {
      clearTimeout(timer);
      this.inFlight = false;
    }
    return this.snapshot();
  }
}
