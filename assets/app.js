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
function applyFilter(category, label) {
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  let visible = 0;
  document.querySelectorAll('[data-category]').forEach(event => {
    event.hidden = category !== 'all' && event.dataset.category !== category;
    if (!event.hidden) visible++;
  });
  const status = document.querySelector('[data-filter-status]');
  if (status) status.textContent = `${status.dataset.prefix}: ${visible} · ${label}`;
  const empty = document.querySelector('[data-empty-events]');
  if (empty) empty.hidden = visible > 0;
}
filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter, button.dataset.label)));
if (filters.length) applyFilter('all', filters[0].dataset.label);

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
