import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let elementClass, visibility;
const frames = new Map();
let sequence = 0;
const window = new EventTarget();
window.StudioMotion = Object.assign(new EventTarget(), {level:'full'});
const document = Object.assign(new EventTarget(), {hidden:false});
class Element extends EventTarget {
  attrs = new Map();
  hasAttribute(key) { return this.attrs.has(key); }
  toggleAttribute(key, on) { if (on) this.attrs.set(key,''); else this.attrs.delete(key); }
  removeAttribute(key) { this.attrs.delete(key); }
  setAttribute(key, value) { this.attrs.set(key,String(value)); }
}
class Video extends Element {
  paused = true; currentTime = 0; readyState = 4;
  set src(value) { this.attrs.set('src', value); }
  play() { this.paused = false; this.dispatchEvent(new Event('play')); return Promise.resolve(); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  load() {}
}
let clock=0;
function flush(){for(let tick=0;frames.size&&tick<140;tick++){clock+=16;for(const [id,fn] of [...frames]){frames.delete(id);fn(clock);}}assert.equal(frames.size,0);}
vm.runInNewContext(fs.readFileSync(new URL('../public/frame-cut.js',import.meta.url),'utf8'), {
  window, document, AbortController, HTMLElement:Element, queueMicrotask,
  customElements:{define(_,cls){elementClass=cls;}},
  matchMedia:()=>new EventTarget(),
  requestAnimationFrame(fn){frames.set(++sequence,fn);return sequence;},
  cancelAnimationFrame(id){frames.delete(id);},
  IntersectionObserver:class {constructor(fn){visibility=fn;}observe(){}disconnect(){}},
});
const scene=new elementClass(), reveal=new Video(), scarf=new Video(), button=new Element();
scene.querySelector=s=>({'.frame-reveal':reveal,'.frame-scarf':scarf,'.frame-toggle':button})[s];
let top=0;
scene.getBoundingClientRect=()=>({top,height:1960});
scene.firstElementChild={clientHeight:800};
scene.mount(); flush(); assert.equal(reveal.hasAttribute('src'),false);
visibility([{isIntersecting:true}]); flush();
function scroll(y){top=-y;window.dispatchEvent(new Event('scroll'));flush();}
scroll(522);assert.ok(Math.abs(reveal.currentTime-2.15)<.04);
scroll(1050);assert.ok(scene.hasAttribute('data-scarf'));assert.equal(scarf.paused,false);
await Promise.resolve();await Promise.resolve();
button.dispatchEvent(new Event('click'));flush();assert.ok(scarf.paused);
scroll(180);assert.ok(reveal.currentTime<.85);assert.equal(scene.hasAttribute('data-scarf'),false);
window.StudioMotion.level='reduced';window.StudioMotion.dispatchEvent(new Event('change'));flush();
assert.equal(scene.hasAttribute('data-full'),false);assert.equal(reveal.hasAttribute('src'),false);
scene.disconnectedCallback();assert.equal(frames.size,0);
console.log('PASS: lazy media, forward/reverse scroll, scarf handoff, pause, reduced motion and route cleanup.');
