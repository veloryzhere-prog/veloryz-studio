import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let FrameCut, visibility;
const frames=new Map();
let frameId=0;
const window=Object.assign(new EventTarget(),{innerHeight:800,StudioMotion:Object.assign(new EventTarget(),{level:'full'})});
const document=Object.assign(new EventTarget(),{hidden:false});
class Element extends EventTarget {
  attrs=new Map();hidden=false;isConnected=true;
  hasAttribute(k){return this.attrs.has(k);}
  toggleAttribute(k,on){if(on)this.attrs.set(k,'');else this.attrs.delete(k);}
  removeAttribute(k){this.attrs.delete(k);}
  setAttribute(k,v){this.attrs.set(k,String(v));}
}
class Video extends Element {
  paused=true;readyState=4;
  set src(v){this.attrs.set('src',v);}
  play(){this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}
  pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
  load(){}
}
function flush(){let ticks=0;while(frames.size){if(++ticks>30)throw Error('rAF loop never settled');for(const [id,cb] of [...frames]){frames.delete(id);cb();}}}
vm.runInNewContext(fs.readFileSync(new URL('../public/frame-cut.js',import.meta.url),'utf8'),{
  window,document,HTMLElement:Element,AbortController,queueMicrotask,
  customElements:{get(){return undefined;},define(name,clazz){FrameCut=clazz;}},
  requestAnimationFrame(fn){frames.set(++frameId,fn);return frameId;},
  cancelAnimationFrame(id){frames.delete(id);},
  IntersectionObserver:class {constructor(callback){visibility=callback;}observe(){}disconnect(){}}
});
const scene=new FrameCut(),scarf=new Video(),button=new Element();
const vars=new Map();
scene.style={setProperty(k,v){vars.set(k,v)}};
const stage={clientHeight:800};
scene.querySelector=s=>({'.frame-scarf':scarf,'.frame-toggle':button,'.frame-stage':stage})[s];
let top=0;
scene.getBoundingClientRect=()=>({top,bottom:top+1960,height:1960});
scene.mount();flush();
assert.equal(scene.hasAttribute('data-full'),true);
assert.equal(Number(vars.get('--scarf-scale')),4.1);
assert.equal(scarf.hasAttribute('src'),false);
visibility([{isIntersecting:true}]);flush();
const scroll=y=>{top=-y;window.dispatchEvent(new Event('scroll'));flush()};
scroll(522);
assert.ok(Math.abs(Number(vars.get('--scarf-progress'))-.45)<.001);
assert.equal(Number(vars.get('--scarf-rings-opacity')),1);
assert.equal(scarf.hasAttribute('src'),true);
assert.equal(scarf.paused,true);
scroll(850);
assert.equal(scarf.paused,false);
assert.ok(Number(vars.get('--scarf-film-opacity'))>.5);
assert.ok(Number(vars.get('--scarf-emblem-opacity'))<.5);
assert.equal(button.hidden,false);
button.dispatchEvent(new Event('click'));flush();
assert.equal(scarf.paused,true);
scroll(180);
assert.ok(Math.abs(Number(vars.get('--scarf-progress'))-180/1160)<.001);
assert.equal(Number(vars.get('--scarf-film-opacity')),0);
assert.equal(button.hidden,true);
window.StudioMotion.level='reduced';
window.StudioMotion.dispatchEvent(new Event('change'));flush();
assert.equal(scene.hasAttribute('data-full'),false);
assert.equal(scarf.paused,true);
assert.equal(button.hidden,true);
window.StudioMotion.level='full';
window.StudioMotion.dispatchEvent(new Event('change'));flush();
assert.equal(scene.hasAttribute('data-full'),true);
scene.disconnectedCallback();
assert.equal(frames.size,0);
console.log('PASS: scroll-controlled original V/rings/scarf, both directions, preload, playback, pause, motion preference and teardown.');
