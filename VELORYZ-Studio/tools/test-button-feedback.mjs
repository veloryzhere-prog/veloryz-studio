/* VELORYZ 2026 button-motion release gate.
   Tests all public and private shells and verifies independent, nonblocking
   pointer/keyboard feedback without altering existing action handlers. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('public/button-feedback.css'),script=read('public/button-feedback.js');
assert.doesNotThrow(()=>new vm.Script(script),'Universal feedback script must parse');
assert.equal(css.split('{').length,css.split('}').length,'Feedback CSS blocks must balance');
for(const path of [
 'lib/claude-reference-shell.ts','lib/site-shell.ts',
 'lib/client-portal-shell.ts','lib/admin-shell.ts',
 'lib/reviews-page.ts','lib/roadmap-page.ts'
]){
 const page=read(path);
 assert(page.includes('/button-feedback.css?v=20261122-unified-buttons-v1'),'Styles missing from '+path);
 assert(page.includes('/button-feedback.js?v=20261122-unified-buttons-v1'),'Script missing from '+path);
}
for(const label of ['button','input[type="button"]','input[type="submit"]','input[type="reset"]','[role="button"]','a.btn','a.button','a.whatsapp-float'])
 assert(script.includes(label),'Every standard control type needs feedback: '+label);
assert(script.includes('MutationObserver')&&script.includes('record.addedNodes'),'Dynamic chat, form, admin and portal buttons must be discovered');
assert(!/preventDefault\s*\(|stopPropagation\s*\(|stopImmediatePropagation\s*\(/.test(script),'Motion enhancement may not interfere with original button actions');
assert(!/innerHTML\s*=|replaceChildren\s*\(|appendChild\s*\(/.test(script),'Do not alter the inner DOM of app-controlled buttons');
assert(css.includes('.vz-fx-fill::before')&&css.includes('translate3d(-103%,0,0)'),'Sliding fill needs an offscreen beginning');
assert(css.includes('.vz-fx-fill::after')&&css.includes('mask-composite:exclude'),'Animated rounded border is mandatory');
assert(css.includes('box-shadow:0 0 0 1px')&&css.includes('var(--vz-fx-glow)'),'Soft hover glows must be present');
assert(css.includes(':focus-visible')&&css.includes('outline:2px solid var(--vz-fx-ink)'),'Keyboard focus feedback is required');
assert(css.includes('@media(hover:none)')&&css.includes('prefers-reduced-motion:reduce'),'Touch and reduced motion must not be forced to animate');
assert(css.includes('html[data-motion="paused"]')&&css.includes('html[data-motion="reduced"]'),'Existing Motion control setting must disable decorations');
assert(script.includes("if(event.detail!==0)return")&&script.includes("document.addEventListener('pointerdown'"),'Clicks and keyboard activation must both animate');
const events={},frames=[],elements=[],observations=[];
class MockElement {
 constructor(tag,attrs={}){this.nodeType=1;this.tag=tag;this.attrs=attrs;this.dataset={};this.isConnected=true;this.inner=[];this.added=0;this.animated=[];this.classes=new Set();
  this.classList={add:(...n)=>n.forEach(x=>this.classes.add(x)),contains:n=>this.classes.has(n)};
 }
 getAttribute(n){return this.attrs[n]||null;}
 matches(q){
  if(q==='input')return this.tag==='input';
  if(q.includes(':disabled')||q.includes('[disabled]')||q.includes('[aria-disabled='))return !!this.attrs.disabled;
  if(q.includes('data-vz-fx-off')||q.includes('.vz-fx-opt-out'))return false;
  if(q==='[inert]')return false;
  return q.includes('button')&&this.tag==='button'||q.includes('a.btn')&&this.tag==='a';
 }
 closest(q){return this.matches(q)?this:null;}
 querySelector(q){return null;}
 querySelectorAll(q){return [];}
 animate(...args){this.animated.push(args);return {finished:Promise.resolve()};}
 }
const regular=new MockElement('button'),disabled=new MockElement('button',{disabled:true}),link=new MockElement('a');
elements.push(regular,disabled,link);
const document={
 readyState:'complete',hidden:false,nodeType:9,
 documentElement:{dataset:{motion:'full'}},
 querySelectorAll:()=>elements,
 addEventListener:(type,handler)=>{events[type]=handler;}
};
const window={matchMedia:()=>({matches:false})};
const styles=(el,pseudo)=>pseudo?{content:'none'}:{position:'static',boxShadow:'none'};
const context={window,document,Element:MockElement,HTMLElement:MockElement,
 MutationObserver:class {constructor(callback){this.callback=callback;observations.push(this);}observe(){}},
 requestAnimationFrame:callback=>{frames.push(callback);return frames.length;},
 getComputedStyle:styles,console};
vm.runInNewContext(script,context);
while(frames.length)frames.shift()();
assert(regular.classes.has('vz-fx-button')&&regular.classes.has('vz-fx-fill'),'Native button should get sliding fill');
assert(link.classes.has('vz-fx-button'),'CTA-style links should have feedback');
assert(disabled.classes.has('vz-fx-button'),'Temporarily disabled buttons should be ready when enabled');
events.pointerdown({button:0,target:regular});
assert.equal(regular.animated.length,1,'Pointer press should animate without handler replacement');
events.click({detail:0,target:link});
assert.equal(link.animated.length,1,'Keyboard activation should show the same feedback');
events.pointerdown({button:0,target:disabled});
assert.equal(disabled.animated.length,0,'Disabled buttons must not react');
document.documentElement.dataset.motion='paused';
events.pointerdown({button:0,target:regular});
assert.equal(regular.animated.length,1,'Motion paused must prevent press animations');
document.documentElement.dataset.motion='full';
const dynamic=new MockElement('button');elements.push(dynamic);
observations[0].callback([{type:'childList',addedNodes:[dynamic],target:dynamic}]);
while(frames.length)frames.shift()();
assert(dynamic.classes.has('vz-fx-button'),'Asynchronously rendered AI/admin buttons must be detected');
events.pointerdown({button:0,target:dynamic});
assert.equal(dynamic.animated.length,1,'Dynamically mounted controls must receive click feedback');
console.log('PASS: all six shells, safe moving fills/edges/glows, pointer and keyboard taps, dynamic controls, disabled/reduced-motion access, unchanged handlers.');
