import {EventFeed} from './cms-events.mjs';
import {createEventReconciler} from './event-refresh.mjs';

// Shared rendering for the local POC and the opt-in static release candidate.
export function mountCmsEvents(configuration, {preview = false} = {}) {
  const {language, translations} = configuration;
  const spanish = language === 'es';
  const introduction = document.querySelector('.page-intro .lead');
  if (introduction) introduction.textContent = spanish
    ? 'Consulta los próximos encuentros y sus detalles.'
    : 'Explore upcoming gatherings and their details.';
  const feed = new EventFeed();
  const groups = [...document.querySelectorAll('[data-event-group]')];
  const containers = groups.map(group => {
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.className = 'filter-status';
    group.prepend(status);
    let list = group.querySelector('.event-list');
    if (!list) {
      list = document.createElement('div');
      group.insertBefore(list, group.querySelector('[data-empty-events]'));
    }
    return {group, status, update: createEventReconciler(list, language, translations)};
  });
  function render() {
    const snapshot = feed.snapshot();
    const available = ['ready', 'stale'].includes(snapshot.status);
    for (const {group, status, update} of containers) {
      update(available ? snapshot.events : [], {
        homepage: group.dataset.eventLimit === '3',
      });
      const message = snapshot.status === 'loading'
        ? (spanish ? 'Cargando eventos…' : 'Loading events…')
        : snapshot.status === 'stale'
          ? (spanish ? 'No se pudo actualizar. Los eventos pueden estar desactualizados.' : 'Unable to refresh. Events may be outdated.')
          : snapshot.status === 'unavailable'
            ? (spanish ? 'Eventos temporalmente no disponibles. Vuelve a intentarlo.' : 'Events temporarily unavailable. Please try again.')
            : preview ? (spanish ? 'Vista local de prueba · Sanity' : 'Local test preview · Sanity') : '';
      if (status.textContent !== message) status.textContent = message;
      status.hidden = !message;
      group.dataset.cmsUnavailable = String(!available);
    }
    document.dispatchEvent(new Event('mdr-events-updated'));
  }
  async function refresh(force = false) {
    if (document.hidden) return;
    if (force || Date.now() >= feed.nextAttempt) {
      await feed.load();
      if (feed.failed) console.warn('MDR events:', feed.lastError);
    }
    render();
  }
  render();
  refresh(true);
  setInterval(() => refresh(), 10_000);
  document.addEventListener('visibilitychange', () => refresh(true));
}
