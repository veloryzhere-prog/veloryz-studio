import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const shell=JSON.parse(read('lib/site-shell.ts').trim().replace(/^export default /,'').replace(/;$/,''));
const js=read('public/micro-interactions.js'),css=read('public/micro-interactions.css'),creator=read('public/creator-v4.js');
assert(shell.includes('/micro-interactions.js')&&shell.includes('/micro-interactions.css'));
assert(shell.indexOf('/motion-clock.js')<shell.indexOf('/micro-interactions.js'),'Load motion-clock before decorative micro-effects');
assert(!js.includes("addEventListener('scroll'"),'Micro animation must not add a scroll engine');
assert(!js.includes('wheelMultiplier')&&!js.includes('new Lenis'),'No competing scrolling runtime');
assert(js.includes("motionOK=()=>root.dataset.motion==='full'"),'Respect on-site motion preference');
assert(js.includes('prefers-reduced-motion: reduce'),'Respect OS reduced-motion preference');
assert(js.includes("pointerType!=='mouse'"),'Do not render custom cursor for touch');
assert(js.includes("if(state==='success')"),'Success animation must use actual project outcome');
assert(js.includes("if(state==='error')"),'Error animation must use actual failure');
assert(creator.includes("state:'success'")&&creator.includes("state:'error'"),'Project creator must emit real outcome events');
assert(css.includes('@media (prefers-reduced-motion:reduce)'),'Disable nonessential animations on reduced motion');
assert(css.includes('html[data-motion="paused"]'),'Paused motion must disable effects');
assert(css.includes('.vz-micro-cursor{display:none!important}'),'Touch cursor should be hidden');
for(const code of [js,creator])assert.doesNotThrow(()=>new Function(code));
let mounted,observer,didMutate=false;
const handlers={};
const body={append(){},};
class Element {matches(){return false}querySelectorAll(){return []}}
class MutationObserver {constructor(fn){observer=this;this.callback=fn}observe(target,options){assert.equal(target,body);assert(options.subtree);mounted=true}}
const media={matches:false};
const document={
 readyState:'complete',hidden:false,body,documentElement:{dataset:{motion:'full'}},
 addEventListener(type,fn){handlers[type]=fn},
 querySelectorAll(){return []},
 querySelector(){return null},
 dispatchEvent(){didMutate=true}
};
const win={addEventListener(){},PointerEvent:class {}};
vm.runInNewContext(js,{
 window:win,document,Element,MutationObserver,matchMedia:()=>media,
 requestAnimationFrame(fn){return 1;},cancelAnimationFrame(){},
 CustomEvent:class {constructor(name,opts){this.type=name;this.detail=opts.detail}},
 getComputedStyle:()=>({position:'relative'}),setTimeout,console
});
assert(mounted&&observer,'Arrival observer must be mounted');
assert(win.VeloryzMicroMotion.enabled,'Full motion should enable micro effects');
document.documentElement.dataset.motion='paused';
assert.equal(win.VeloryzMicroMotion.enabled,false,'Paused motion must suppress animations');
document.documentElement.dataset.motion='full';
document.hidden=true;
assert.equal(win.VeloryzMicroMotion.enabled,false,'Hidden tab must not animate');
console.log('PASS: VELORYZ micro-motion release preserves motion preferences, native scrolling, touch accessibility and real creator outcomes.');
