/* Audited button families and credited WhatsApp adaptation — release regression. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function html(path){
 const raw=read(path);const i=raw.indexOf('export default ');
 if(i<0)throw Error('No default HTML in '+path);
 return JSON.parse(raw.slice(i+15).trim().replace(/;$/,''));
}
const js=read('public/button-feedback.js');
const css=read('public/button-families.css');
const wa=read('public/uiverse-whatsapp.css');
const restored=read('public/reference-restored-features.js');
const home=html('lib/claude-reference-shell.ts'),legacy=html('lib/site-shell.ts');
const credit1='From Uiverse.io by alshahwan - https://uiverse.io/alshahwan/good-dolphin-78';
const credit2='MIT License, Copyright (c) alshahwan (Mohammad Alshahwan)';
assert(wa.startsWith('/* '+credit1),'Keep the supplied Uiverse author credit at the top of imported CSS');
assert(wa.includes(credit2),'Keep required copyright notice');
assert(restored.includes(credit1)&&restored.includes(credit2),'Keep author credit adjacent to JS markup adaptation');
assert(legacy.includes(credit1)&&legacy.includes(credit2),'Keep author credit adjacent to HTML adaptation');
assert(!/\nbutton\s*\{|\nbutton\s+p\s*\{|\nbutton:hover/.test(wa),'Do not leak generic Uiverse button selectors');
assert(wa.includes('body a.whatsapp-float.vz-wa-uiverse'),'Style only the dedicated WhatsApp button');
assert(wa.includes('background-color:#25D366')&&wa.includes('border:1px solid #25D366'),'Preserve WhatsApp white/green Uiverse styling');
assert(wa.includes('left:1.15em')&&wa.includes('left:.5em'),'Preserve the original sliding label behavior');
assert(wa.includes('opacity:0')&&wa.includes('opacity:1'),'Preserve hidden-to-visible WhatsApp symbol');
assert(wa.includes('.vz-wa-uiverse:focus-visible')&&wa.includes('@media(hover:none)'),'Keep keyboard and touch alternatives');
assert(restored.includes("talk.setAttribute('data-vz-fx-off','')"),'Do not layer generic hover animation on Uiverse control');
assert(legacy.includes('class="whatsapp-float vz-wa-uiverse" data-vz-fx-off'),'Use new scoped component on functional pages');
assert(home.includes('/uiverse-whatsapp.css')&&legacy.includes('/uiverse-whatsapp.css'),'Uiverse styles load in both homepage and functional shell');
for(const page of ['lib/claude-reference-shell.ts','lib/site-shell.ts','lib/client-portal-shell.ts','lib/admin-shell.ts','lib/reviews-page.ts','lib/roadmap-page.ts']){
 assert(read(page).includes('/button-families.css?v=20261122-contextual-v1'),'Contextual family styles missing '+page);
}
assert.doesNotThrow(()=>new vm.Script(js),'Button classifier script must parse');
assert.doesNotThrow(()=>new vm.Script(restored),'WhatsApp page builder script must parse');
for(const src of [css,wa])assert.equal(src.split('{').length,src.split('}').length,'CSS block balancing');
assert(css.includes('.vz-fx-secondary.vz-fx-layer:not(.vz-fx-fill)::after'),'Secondary buttons get edge-trace not primary fill');
assert(css.includes('.vz-fx-ai.vz-fx-layer::after'),'AI buttons get soft bloom');
assert(css.includes('.vz-fx-sculpture'),'3D model controls get reserved contour');
assert(css.includes('.vz-fx-admin')&&css.includes('.vz-fx-danger'),'Admin and destructive controls need distinct affordances');
assert(css.includes('.vz-fx-portal')&&css.includes('.vz-fx-portal-primary'),'Client portal must have its own treatment');
assert(css.includes('.vz-fx-navigation.vz-fx-layer::after'),'Menu/Motion should get a subtle navigation underline');
assert(css.includes('.vz-fx-toggle[aria-pressed="true"]'),'Selection stays visually distinct');
assert(css.includes('.vz-fx-submit.vz-fx-fill::before'),'Form submission gets a separate green-tinted sheen');
assert(css.includes('prefers-reduced-motion:reduce')&&css.includes('data-motion="paused"'),'Respect motion preferences');
const events={},frames=[],els=[],observers=[];
class MockElement{
 constructor(tag,attrs={}){
  this.tag=tag;this.attrs=attrs;this.nodeType=1;this.isConnected=true;this.dataset={};this.className=attrs.class||'';
  this.textContent=attrs.text||'';this.presses=0;this.classes=new Set(this.className.split(/\s+/).filter(Boolean));
  this.classList={add:(...a)=>{a.forEach(v=>this.classes.add(v));this.className=[...this.classes].join(' ');},contains:v=>this.classes.has(v)};
 }
 getAttribute(k){return Object.hasOwn(this.attrs,k)?this.attrs[k]:null;}
 matches(query){
  return query.split(',').some(part=>{
   const p=part.trim();if(!p)return false;
   if(p==='input')return this.tag==='input';
   if(p===':disabled'||p==='[disabled]')return !!this.attrs.disabled;
   if(p==='[aria-disabled="true"]')return this.attrs['aria-disabled']==='true';
   if(p==='[inert]')return !!this.attrs.inert;
   if(p==='[data-vz-fx-off]')return Object.hasOwn(this.attrs,'data-vz-fx-off');
   if(p==='.vz-fx-opt-out')return this.classes.has('vz-fx-opt-out');
   if(p.startsWith('#'))return this.attrs.id===p.slice(1);
   const tag=p.match(/^(input|button|a)(?=\[|\.|$)/)?.[1];
   if(tag&&this.tag!==tag)return false;
   const cl=p.match(/\.([a-zA-Z0-9_-]+)/g)||[];
   if(cl.some(x=>!this.classes.has(x.slice(1))))return false;
   const attr=[...p.matchAll(/\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/g)];
   for(const a of attr){
    if(!Object.hasOwn(this.attrs,a[1]))return false;
    if(a[2]&&this.attrs[a[1]]!==a[2])return false;
   }
   if(tag||cl.length||attr.length)return true;
   return false;
  });
 }
 closest(query){
  if(this.matches(query))return this;
  if(!this.attrs.parents)return null;
  return query.split(',').some(q=>this.attrs.parents.split(' ').includes(q.trim()))?{nodeType:1}:null;
 }
 querySelector(){return null;}querySelectorAll(){return [];}
 animate(frames,options){this.presses++;return {finished:Promise.resolve()};}
}
const instances=[
 ['primary',new MockElement('a',{class:'btn fill',href:'/create/',text:'Create your project'})],
 ['secondary',new MockElement('a',{class:'btn',href:'/work/',text:'Explore work'})],
 ['navigation',new MockElement('button',{id:'mb',class:'mbtn',text:'Menu'})],
 ['sculpture',new MockElement('button',{'data-logo-action':'spin',text:'360 Rotate'})],
 ['ai',new MockElement('button',{class:'vz-ai-launch',text:'Ask Happy'})],
 ['ai-send',new MockElement('button',{class:'vz-ai-send',type:'submit',text:'Send'})],
 ['toggle',new MockElement('button',{'data-filter':'design',text:'Design'})],
 ['submit',new MockElement('button',{class:'vz-bug-submit',type:'submit',text:'Send bug report'})],
 ['admin',new MockElement('button',{class:'admin-button',parents:'#admin-root',text:'Save settings'})],
 ['danger',new MockElement('button',{class:'admin-button danger',parents:'#admin-root',text:'Delete'})],
 ['portal-primary',new MockElement('button',{class:'cp-approve-button',parents:'.cp-body',text:'Approve'})],
 ['portal',new MockElement('button',{class:'cp-refresh-button',parents:'.cp-body',text:'Refresh'})],
 ['neutral',new MockElement('button',{text:'Other action'})]
];
const waLink=new MockElement('a',{class:'whatsapp-float vz-wa-uiverse',href:'https://wa.me/919955326740','data-vz-fx-off':''});
const disabled=new MockElement('button',{class:'btn',disabled:true,text:'Disabled'});
els.push(...instances.map(x=>x[1]),waLink,disabled);
const doc={nodeType:9,readyState:'complete',hidden:false,documentElement:{dataset:{motion:'full'}},querySelectorAll:()=>els,addEventListener:(k,fn)=>{events[k]=fn;}};
const ctx={window:{matchMedia:()=>({matches:false})},document:doc,
 Element:MockElement,HTMLElement:MockElement,
 MutationObserver:class{constructor(cb){this.cb=cb;observers.push(this);}observe(){}},
 requestAnimationFrame:cb=>{frames.push(cb);return frames.length;},
 getComputedStyle:(el,pseudo)=>pseudo?{content:'none'}:{position:'static',boxShadow:'none'},console};
vm.runInNewContext(js,ctx);
while(frames.length)frames.shift()();
for(const [role,element]of instances)assert.equal(element.dataset.vzFxVariant,role,'Wrong visual family: '+role+' got '+element.dataset.vzFxVariant);
assert.equal(waLink.dataset.vzFx,undefined,'Credited WhatsApp component must remain independent of general effects');
const primary=instances[0][1],secondary=instances[1][1];
assert(primary.classes.has('vz-fx-fill'),'Primary CTA should get sliding fill');
assert(!secondary.classes.has('vz-fx-fill'),'Secondary CTA should get a different outline treatment');
events.pointerdown({button:0,target:instances[2][1]});
assert.equal(instances[2][1].presses,1,'Menu click feedback must not block native click');
events.click({detail:0,target:instances[6][1]});
assert.equal(instances[6][1].presses,1,'Keyboard filter action should animate');
events.pointerdown({button:0,target:disabled});
assert.equal(disabled.presses,0,'Disabled controls do not respond');
doc.documentElement.dataset.motion='paused';
events.pointerdown({button:0,target:primary});
assert.equal(primary.presses,0,'Global motion preference disables press animation');
doc.documentElement.dataset.motion='full';
const dynamic=new MockElement('button',{class:'vz-ai-launch',text:'Ask Nikhil'});
els.push(dynamic);observers[0].cb([{type:'childList',addedNodes:[dynamic],target:dynamic}]);
while(frames.length)frames.shift()();
assert.equal(dynamic.dataset.vzFxVariant,'ai','New AI buttons receive AI style without polling');
console.log('PASS: credited Uiverse WhatsApp visual, all site shells, 13 distinct button roles, keyboard/touch/reduced-motion, native actions and dynamically added controls.');
