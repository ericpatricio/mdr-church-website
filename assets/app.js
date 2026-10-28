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
  if (event.key === 'Escape' && menu && !menu.hidden) {
    setMenu(false);
    toggle.focus();
  }
});
menu?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
matchMedia('(min-width: 821px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
