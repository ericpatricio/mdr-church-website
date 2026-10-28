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
