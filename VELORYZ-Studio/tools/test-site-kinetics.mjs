/* VELORYZ global kinetic animation runtime and accessibility regressions. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const shell=JSON.parse(read('lib/site-shell.ts').trim().replace(/^export default /,'').replace(/;$/,''));
const js=read('public/site-kinetics.js'),css=read('public/site-kinetics.css');
const old=read('public/micro-interactions.js');
assert(shell.includes('/site-kinetics.js')&&shell.includes('/site-kinetics.css'),'Whole site loads kinetic layer');
assert(shell.indexOf('/site-kinetics.js')<shell.indexOf('/micro-interactions.js'),'Kinetic layer must prevent double legacy pointer effects');
assert(old.includes('window.VeloryzKineticSite'),'Old cursor controller must not compete');
for(const item of ['.vz-kinetic-button','.vz-kinetic-card','.vz-kinetic-halo','.vz-kinetic-glow','.vz-kinetic-ambient','.vz-kinetic-chat-in','.vz-kinetic-failed','.vz-kinetic-confirm'])assert(css.includes(item),'Missing visible UI motion: '+item);
for(const item of ['buttonSelector','cardSelector','revealSelector','chatSelector','errorSelector','successSelector','MutationObserver','IntersectionObserver','veloryz:creator-state','studio:route'])assert(js.includes(item),'Missing global animation integration: '+item);
assert(js.includes('navigator.connection')||js.includes('navigator.deviceMemory'));
assert(js.includes("root.dataset.motion!=='paused'")&&js.includes("root.dataset.motion!=='reduced'"));
assert(css.includes('@media (prefers-reduced-motion:reduce)')&&css.includes('pointer:coarse'));
assert(!js.includes("addEventListener('scroll'"),'Do not add another continuous scroll handler');
assert(!js.includes("addEventListener('wheel'"),'No competing wheel smoothing');
assert(!js.includes('new Lenis'),'Keep existing scroll engine');
assert.doesNotThrow(()=>new Function(js),'Runtime must parse');
class Element{constructor(){this.classList={add(){},contains(){return false}};this.isConnected=true;}matches(){return false;}querySelectorAll(){return []}}
const root={dataset:{motion:'full'}},events={};
let observing=false;
class MutationObserver{constructor(callback){this.callback=callback}observe(node,o){observing=true;assert(o.subtree&&o.childList);assert(o.attributeFilter.includes('aria-invalid'));}}
class IntersectionObserver{constructor(){}observe(){}disconnect(){}}
const doc={
 documentElement:root,readyState:'complete',hidden:false,
 body:Object.assign(new Element(),{append(){}}),
 addEventListener(name,callback){events[name]=callback},
 querySelector(){return null},createElement(){return Object.assign(new Element(),{setAttribute(){},style:{setProperty(){}},append(){}})}
};
const window={StudioMotion:{addEventListener(){}},addEventListener(){}};
vm.runInNewContext(js,{
 window,document:doc,Element,IntersectionObserver,MutationObserver,
 matchMedia:()=>({matches:false,addEventListener(){}}),
 navigator:{connection:{saveData:true,addEventListener(){}},deviceMemory:2},
 requestAnimationFrame:()=>1,
 setTimeout,console
});
assert(observing,'Mutation observer must mount across the whole site');
assert(window.VeloryzKineticSite.decorated,'Global runtime should finish setup');
assert(window.VeloryzKineticSite.enabled);
root.dataset.motion='reduced';assert.equal(window.VeloryzKineticSite.enabled,false,'Site reduced preference');
root.dataset.motion='full';doc.hidden=true;assert.equal(window.VeloryzKineticSite.enabled,false,'Hidden tab pause');
console.log('PASS: visibly animated site-wide interaction layer, native scrolling, responsive and reduced-motion safeguards.');
