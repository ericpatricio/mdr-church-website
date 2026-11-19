import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// DOM contract checks. These synthetic elements are never rendered on the site.
function element(dataset = {}) {
  return { dataset, hidden: false, attrs: {}, listeners: {}, textContent: '',
    setAttribute(name,value) { this.attrs[name]=value; },
    addEventListener(name,callback) { this.listeners[name]=callback; },
    focus() { this.focused = true; },
  };
}
const buttons = ['all','worship','community'].map(filter => element({filter,label:filter}));
const rows = ['worship','community','worship'].map(category => element({category}));
const status = element({prefix:'Confirmed events'}), empty = element();
const toggle = element({open:'Open menu',close:'Close menu'}), menu = element();
menu.hidden = true;
const docEvents = {}, mediaEvents = {};
const document = {
  querySelector(selector) { return ({'[data-menu-toggle]':toggle,'[data-filter-status]':status,'[data-empty-events]':empty})[selector] ?? null; },
  getElementById(id) { return id === 'mobile-menu' ? menu : null; },
  querySelectorAll(selector) { return ({'[data-filter]':buttons,'[data-category]':rows})[selector] ?? []; },
  addEventListener(name,callback) { docEvents[name] = callback; },
};
vm.runInNewContext(fs.readFileSync('assets/app.js','utf8'), {document,matchMedia:()=>({addEventListener:(name,callback)=>{mediaEvents[name]=callback;}})});
assert(rows.every(row=>!row.hidden));
assert.equal(status.textContent,'Confirmed events: 3 · all');
buttons[1].listeners.click();
assert.deepEqual(rows.map(row=>row.hidden),[false,true,false]);
assert.equal(status.textContent,'Confirmed events: 2 · worship');
assert.equal(buttons[1].attrs['aria-pressed'],'true');
assert.equal(buttons[0].attrs['aria-pressed'],'false');
buttons[2].listeners.click();
assert.deepEqual(rows.map(row=>row.hidden),[true,false,true]);
assert.equal(status.textContent,'Confirmed events: 1 · community');
rows.forEach(row=>{row.dataset.category='worship';});
buttons[2].listeners.click();
assert(rows.every(row=>row.hidden));
assert.equal(empty.hidden,false);
buttons[0].listeners.click();
assert(rows.every(row=>!row.hidden));
assert.equal(empty.hidden,true);
toggle.listeners.click();
assert.equal(menu.hidden,false);
assert.equal(toggle.attrs['aria-expanded'],'true');
docEvents.keydown({key:'Escape'});
assert.equal(menu.hidden,true);
assert.equal(toggle.focused,true);
toggle.listeners.click();mediaEvents.change({matches:true});
assert.equal(menu.hidden,true);
console.log('PASS: populated and empty event filtering, result counts, pressed states; mobile menu open/Escape/focus/breakpoint behavior.');

// Search behavior uses synthetic cards; no recordings are published by this test.
const input = element(), searchStatus = element({prefix:'Messages found'}), searchEmpty = element();
const messages = [element({search:'Gracia Raúl esperanza'}),element({search:'Familia Cindy fe'})];
const searchDocument = {...document,querySelector(selector) { return ({'[data-sermon-search]':input,'[data-sermon-status]':searchStatus,'[data-sermon-empty]':searchEmpty})[selector] ?? document.querySelector(selector); },querySelectorAll(selector) { return selector==='[data-sermon]'?messages:document.querySelectorAll(selector); }};
vm.runInNewContext(fs.readFileSync('assets/app.js','utf8'),{document:searchDocument,matchMedia:()=>({addEventListener(){}})});
input.value='raul';input.listeners.input();assert.deepEqual(messages.map(m=>m.hidden),[false,true]);assert.equal(searchStatus.textContent,'Messages found: 1');
input.value='No matching title';input.listeners.input();assert(messages.every(m=>m.hidden));assert.equal(searchEmpty.hidden,false);
input.value='';input.listeners.input();assert(messages.every(m=>!m.hidden));assert.equal(searchEmpty.hidden,true);
console.log('PASS: message search by speaker/title, accents, empty matches and reset.');

const slides = ['photo', 'photo', 'announcement', 'announcement'].map(slideType => element({slideType}));
const previous = element(), next = element(), slideStatus = element();
const playback = element({pauseLabel: 'Pause slideshow', playLabel: 'Resume slideshow'}), playbackIcon = element();
let autoplay, hovering = false, focused = false;
let preferenceChange;
const reduced = {matches: false, addEventListener(_event, callback) {preferenceChange = callback;}};
const hoverCapable = {matches: true};
const hero = {...element(), querySelectorAll: () => slides,
  matches: () => hovering, contains: () => focused,
  querySelector: selector => ({'[data-hero-prev]': previous, '[data-hero-next]': next, '[data-hero-status]': slideStatus, '[data-hero-playback]': playback, '[data-hero-playback-icon]': playbackIcon})[selector]};
const pauseStorage = new Map();
const sessionStorage = {getItem: key => pauseStorage.get(key) ?? null, setItem: (key, value) => pauseStorage.set(key, value), removeItem: key => pauseStorage.delete(key)};
const heroDocument = {...document, querySelector: selector => selector === '[data-hero]' ? hero : document.querySelector(selector)};
vm.runInNewContext(fs.readFileSync('assets/app.js','utf8'), {document: heroDocument, sessionStorage,
  matchMedia: query => query.includes('reduced-motion') ? reduced : query.includes('hover: hover') ? hoverCapable : {addEventListener() {}},
  setInterval(callback, interval) {assert.equal(interval, 8000); autoplay = callback;}});
assert.deepEqual(slides.map(slide => slide.hidden), [false, true, true, true]);
previous.listeners.click();
assert.equal(slideStatus.textContent, '4 / 4');
assert.equal(hero.dataset.slideType, 'announcement');
next.listeners.click();
assert.equal(slideStatus.textContent, '1 / 4');
next.listeners.click();
assert.deepEqual(slides.map(slide => slide.hidden), [true, false, true, true]);
assert.equal(hero.dataset.slideType, 'photo');
autoplay();
assert.equal(slideStatus.textContent, '3 / 4');
for (const reason of ['hover', 'focus', 'hidden', 'reduced']) {
  hovering = reason === 'hover'; focused = reason === 'focus';
  heroDocument.hidden = reason === 'hidden'; reduced.matches = reason === 'reduced';
  autoplay();
  assert.equal(slideStatus.textContent, '3 / 4', `autoplay pauses for ${reason}`);
}
hovering = focused = heroDocument.hidden = reduced.matches = false;
autoplay();
assert.equal(slideStatus.textContent, '4 / 4');
hoverCapable.matches = false; hovering = true;
autoplay();
assert.equal(slideStatus.textContent, '1 / 4', 'touch sticky hover must not pause autoplay');
reduced.matches = true; preferenceChange();
autoplay();
assert.equal(slideStatus.textContent, '1 / 4', 'reduced motion stops autoplay');
reduced.matches = false; preferenceChange();
autoplay();
assert.equal(slideStatus.textContent, '2 / 4', 'autoplay resumes when reduced motion is disabled');
assert.equal(playback.attrs['aria-label'], 'Pause slideshow');
playback.listeners.click();
assert.equal(playback.attrs['aria-label'], 'Resume slideshow');
assert.equal(slideStatus.attrs['aria-live'], 'polite');
const manuallyHeld = slideStatus.textContent;
for (const reason of ['none', 'hover', 'focus', 'hidden', 'reduced', 'none']) {
  hovering = reason === 'hover'; focused = reason === 'focus';
  heroDocument.hidden = reason === 'hidden'; reduced.matches = reason === 'reduced';
  preferenceChange(); autoplay();
  assert.equal(slideStatus.textContent, manuallyHeld, 'manual pause survives ' + reason);
}
next.listeners.click();
const selectedWhilePaused = slideStatus.textContent;
autoplay();
assert.equal(slideStatus.textContent, selectedWhilePaused, 'manual arrows do not resume autoplay');
playback.listeners.click();
assert.equal(playback.attrs['aria-label'], 'Pause slideshow');
assert.equal(slideStatus.attrs['aria-live'], 'off');
for (const reason of ['hover', 'focus', 'hidden', 'reduced']) {
  hoverCapable.matches = true; hovering = reason === 'hover'; focused = reason === 'focus';
  heroDocument.hidden = reason === 'hidden'; reduced.matches = reason === 'reduced';
  autoplay(); assert.equal(slideStatus.textContent, selectedWhilePaused, 'manual resume still respects ' + reason);
}
hovering = focused = heroDocument.hidden = reduced.matches = false;
autoplay();assert.notEqual(slideStatus.textContent, selectedWhilePaused, 'only explicit resume re-enables autoplay');
reduced.matches = true; playback.listeners.click(); playback.listeners.click();
const reducedHeld = slideStatus.textContent; autoplay();
assert.equal(slideStatus.textContent, reducedHeld, 'play never overrides reduced-motion preference');
reduced.matches = false; playback.listeners.click();
assert.equal(pauseStorage.get('mdr-hero-paused'), 'true');
function reloadHero(storage) {
  vm.runInNewContext(fs.readFileSync('assets/app.js', 'utf8'), {document: heroDocument, sessionStorage: storage,
    matchMedia: query => query.includes('reduced-motion') ? reduced : query.includes('hover: hover') ? hoverCapable : {addEventListener() {}},
    setInterval(callback, interval) {assert.equal(interval, 8000); autoplay = callback;}});
}
reloadHero(sessionStorage);
assert.equal(playback.attrs['aria-label'], 'Resume slideshow');
autoplay(); assert.equal(slideStatus.textContent, '1 / 4', 'pause choice survives page/language reload');
playback.listeners.click();assert.equal(pauseStorage.has('mdr-hero-paused'), false);
autoplay();assert.equal(slideStatus.textContent, '2 / 4');
reloadHero({getItem() {throw Error('Storage disabled');}, setItem() {throw Error('Storage disabled');}, removeItem() {throw Error('Storage disabled');}});
playback.listeners.click();autoplay();assert.equal(slideStatus.textContent, '1 / 4', 'storage failure must not break in-memory pause');
playback.listeners.click();autoplay();assert.equal(slideStatus.textContent, '2 / 4');
console.log('PASS: hero arrows, eight-second autoplay, persistent manual pause/resume (including reload/storage failure) and automatic pause precedence.');
