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
  if (empty) empty.hidden = visible > 0;
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

// Hero rotation: no visible controls, as requested by the site owner.
const hero = document.querySelector('[data-hero]');
if (hero) {
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  setInterval(() => {
    if (reduced.matches || document.hidden || hero.matches(':hover') || hero.contains(document.activeElement)) return;
    current = (current + 1) % slides.length;
    hero.dataset.slideType = slides[current].dataset.slideType;
    slides.forEach((slide, index) => { slide.hidden = index !== current; });
  }, 8000);
}
