const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.getElementById('mobile-menu');
function setMenu(open) {
  if (!toggle || !menu) return;
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? toggle.dataset.close : toggle.dataset.open);
}
toggle?.addEventListener('click', () => setMenu(menu.hidden));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu && !menu.hidden) { setMenu(false); toggle.focus(); }
});
menu?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('click', event => {
  if (menu && !menu.hidden && !event.target.closest('.site-header')) setMenu(false);
});
matchMedia('(min-width: 1101px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

const filters = [...document.querySelectorAll('[data-filter]')];
const eventGroups = [...document.querySelectorAll('[data-event-group]')];
let selectedCategory = 'all';
let selectedLabel = filters[0]?.dataset.label;

function applyFilter(category, label, group = document, now = Date.now()) {
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  let visible = 0;
  const limit = Number(group.dataset?.eventLimit) || Infinity;
  group.querySelectorAll('[data-category]').forEach(event => {
    const expired = event.dataset.expires && Date.parse(event.dataset.expires) <= now;
    event.hidden = Boolean(expired) || (category !== 'all' && event.dataset.category !== category) || visible >= limit;
    if (!event.hidden) visible++;
  });
  const status = group.querySelector('[data-filter-status]');
  if (status) status.textContent = `${status.dataset.prefix}: ${visible} · ${label}`;
  const empty = group.querySelector('[data-empty-events]');
  if (empty) empty.hidden = visible > 0 || group.dataset?.cmsUnavailable === 'true';
}
function refreshEvents() {
  if (eventGroups.length) {
    eventGroups.forEach(group => applyFilter(selectedCategory, selectedLabel, group));
  } else if (filters.length) {
    applyFilter(selectedCategory, selectedLabel);
  }
}

filters.forEach(button => button.addEventListener('click', () => {
  selectedCategory = button.dataset.filter;
  selectedLabel = button.dataset.label;
  refreshEvents();
}));
refreshEvents();
document.addEventListener('mdr-events-updated', refreshEvents);
if (eventGroups.length) {
  setInterval(refreshEvents, 30_000);
  document.addEventListener('visibilitychange', refreshEvents);
}

// Search is rendered only when the build contains verified recordings.
const sermonSearch = document.querySelector('[data-sermon-search]');
const searchText = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
sermonSearch?.addEventListener('input', () => {
  const query = searchText(sermonSearch.value);
  let visible = 0;
  document.querySelectorAll('[data-sermon]').forEach(card => {
    card.hidden = !searchText(card.dataset.search).includes(query);
    if (!card.hidden) visible++;
  });
  const status = document.querySelector('[data-sermon-status]');
  if (status) status.textContent = `${status.dataset.prefix}: ${visible}`;
  const empty = document.querySelector('[data-sermon-empty]');
  if (empty) empty.hidden = visible > 0;
});

// Arrows and eight-second autoplay share the same slide state.
const hero = document.querySelector('[data-hero]');
if (hero) {
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const status = hero.querySelector('[data-hero-status]');
  const playback = hero.querySelector('[data-hero-playback]');
  const playbackIcon = hero.querySelector('[data-hero-playback-icon]');
  // Remember the visitor's pause choice through reloads/language changes in this tab.
  let manuallyPaused = false;
  try { manuallyPaused = sessionStorage.getItem('mdr-hero-paused') === 'true'; } catch {}

  function updatePlayback() {
    if (!playback) return;
    playback.hidden = false;
    const label = manuallyPaused ? playback.dataset.playLabel : playback.dataset.pauseLabel;
    playback.setAttribute('aria-label', label);
    playback.setAttribute('title', label);
    playbackIcon?.setAttribute('d', manuallyPaused ? 'M8 4l12 8-12 8z' : 'M6 4h4v16H6zM14 4h4v16h-4z');
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hoverCapable = matchMedia('(hover: hover)');
  let current = 0;
  function updateAnnouncements() {
    // Automatic changes should not repeatedly interrupt screen-reader speech.
    status?.setAttribute('aria-live', manuallyPaused || reduced.matches ? 'polite' : 'off');
  }
  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    hero.dataset.slideType = slides[current].dataset.slideType;
    slides.forEach((slide, index) => { slide.hidden = index !== current; });
    if (status) status.textContent = `${current + 1} / ${slides.length}`;
  }
  hero.querySelector('[data-hero-prev]')?.addEventListener('click', () => showSlide(current - 1));
  hero.querySelector('[data-hero-next]')?.addEventListener('click', () => showSlide(current + 1));
  playback?.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    try {
      if (manuallyPaused) sessionStorage.setItem('mdr-hero-paused', 'true');
      else sessionStorage.removeItem('mdr-hero-paused');
    } catch {} // In-memory pause still works when browser storage is unavailable.
    updatePlayback();
    updateAnnouncements();
  });
  updatePlayback();
  reduced.addEventListener('change', updateAnnouncements);
  updateAnnouncements();
  showSlide(0);
  setInterval(() => {
    const focused = hero.contains(document.activeElement);
    if (manuallyPaused || reduced.matches || document.hidden ||
      (hoverCapable.matches && hero.matches(':hover')) || focused) return;
    showSlide(current + 1);
  }, 8000);
}
