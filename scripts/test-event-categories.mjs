import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {EventFeed, normalizeCmsEvents} from '../assets/cms-events.mjs';
import {renderEventList} from '../assets/event-rendering.mjs';
import {createExpirationClock} from '../assets/event-expiration.mjs';
import {languages} from '../content/site.mjs';

const words = value => ({es:value,en:value});
const fixture = category => ({_id:'category-fixture',_type:'event',title:words('Memory test'),description:words('Memory only'),
  imageAlt:words('Test image'),start:'2099-01-01T16:00:00Z',end:'2099-01-01T18:00:00Z',
  timeZone:'America/New_York',venue:'Test venue',location:'Test address',condition:'scheduled',category,
  flyer:{url:'https://cdn.sanity.io/images/u2olnd8u/poc/test.png',mimeType:'image/png',size:100}});
for (const lang of ['es','en']) test(lang + ': existing public labels map to the unchanged CMS category values', () => {
  const html = fs.readFileSync(lang+'/eventos.html','utf8');
  for (const [index,value] of ['all','worship','community'].entries()) {
    assert(html.includes('data-filter="'+value+'"'));
    assert(html.includes('data-label="'+languages[lang].categories[index]+'"'));
  }
  assert.deepEqual(languages[lang].categories,lang==='es'?['Todos','Cultos','Comunidad']:['All','Services','Community']);
});
test('a draft category edit is hidden until publication; feed/render then update the same event', async () => {
  let published = fixture('community');
  const feed = new EventFeed({fetcher:async()=>({ok:true,json:async()=>({result:[published]})})});
  assert.equal((await feed.load()).events[0].category,'community');
  const draft = {...published,category:'worship'};
  assert.equal((await feed.load()).events[0].category,'community');
  published = draft;
  const updated = (await feed.load()).events[0];
  assert.equal(updated.category,'worship');
  assert.equal(updated.end,fixture('community').end);
  for (const lang of ['es','en'])
    assert(renderEventList([updated],lang,languages[lang],{now:new Date('2098-01-01')}).includes('data-category="worship"'));
});
for (const lang of ['es','en']) test(lang + ': All and both category filters refresh after a published category change', () => {
  const element = dataset => ({dataset,hidden:false,attrs:{},listeners:{},textContent:'',
    setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){this.listeners[k]=v}});
  const filters = ['all','worship','community'].map((filter,i)=>element({filter,label:languages[lang].categories[i]}));
  const rows = ['worship','community'].map(category=>element({category}));
  const status=element({prefix:'Events'}),empty=element({}),events={};
  const document={querySelector:s=>s==='[data-filter-status]'?status:s==='[data-empty-events]'?empty:null,
    getElementById:()=>null,querySelectorAll:s=>s==='[data-filter]'?filters:s==='[data-category]'?rows:[],
    addEventListener:(k,v)=>{events[k]=v}};
  vm.runInNewContext(fs.readFileSync('assets/app.js','utf8'),{document,matchMedia:()=>({addEventListener(){}})});
  assert(rows.every(row=>!row.hidden));
  filters[1].listeners.click();assert.deepEqual(rows.map(row=>row.hidden),[false,true]);
  filters[2].listeners.click();assert.deepEqual(rows.map(row=>row.hidden),[true,false]);
  rows[1].dataset.category='worship';events['mdr-events-updated']();
  assert(rows.every(row=>row.hidden));
  filters[1].listeners.click();assert(rows.every(row=>!row.hidden));
  filters[0].listeners.click();assert(rows.every(row=>!row.hidden));
});
test('category selection never changes expiry deadlines or homepage promotion policy', () => {
  for (const category of ['worship','community']) {
    const [event] = normalizeCmsEvents([fixture(category)]);
    let callback,delay;
    const now=Date.parse(event.end)-1000;
    const clock=createExpirationClock(()=>{}, {now:()=>now,schedule:(fn,ms)=>{callback=fn;delay=ms;return 1},cancel(){}});
    clock.update([event]);assert.equal(delay,1000);assert.equal(typeof callback,'function');
    for (const lang of ['es','en']) {
      assert.notEqual(renderEventList([event],lang,languages[lang],{homepage:true,now:new Date(now)}),'');
      assert.equal(renderEventList([event],lang,languages[lang],{homepage:true,now:new Date(event.end)}),'');
    }
    clock.stop();
  }
});
