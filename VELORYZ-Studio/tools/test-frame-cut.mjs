import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Regression: the real 3-second authored portal film must scrub bidirectionally
// before the original scarf loops; do not replace it with a static logo zoom.
const code=fs.readFileSync(new URL('../public/frame-cut.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../public/frame-cut.css',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
assert.match(app,/class="frame-reveal"/);
assert.match(app,/class="frame-reveal-canvas"/);
assert.match(code,/frames\/sheet-/);
assert.match(code,/TOTAL_FRAMES=90/);
assert.match(app,/assets\/frame-cut\/poster\.jpg/);
assert.match(code,/assets\/frame-cut\/reveal\.mp4/);
assert.match(code,/assets\/frame-cut\/scarf\.mp4/);
assert.match(css,/position:sticky/);
assert.match(css,/height:205svh/,'The V-to-scarf transition must not require three viewport scrolls');
assert.match(code,/range\(p,0,\.46\)/,'Frame scrub must complete promptly and track real scroll position');
assert.match(css,/frame-film-plane/);
assert.doesNotMatch(css,/animation-timeline/);

let FrameCut,visibility;
const frames=new Map();let nextFrame=0;
const window=Object.assign(new EventTarget(),{innerHeight:800,StudioMotion:Object.assign(new EventTarget(),{level:'full'})});
const document=Object.assign(new EventTarget(),{hidden:false});
class Element extends EventTarget{
 attrs=new Map();isConnected=true;hidden=false;
 hasAttribute(name){return this.attrs.has(name);}
 getAttribute(name){return this.attrs.get(name)??null;}
 toggleAttribute(name,value){if(value)this.attrs.set(name,'');else this.attrs.delete(name);}
 removeAttribute(name){this.attrs.delete(name);}
 setAttribute(name,value){this.attrs.set(name,String(value));}
}
class Video extends Element{
 paused=true;readyState=4;duration=3;preload='none';seeking=false;
 _time=0;calls=[];
 set src(url){this.attrs.set('src',url);this.calls.push(['src',url]);}
 get currentTime(){return this._time;}
 set currentTime(time){this._time=time;this.calls.push(['seek',time]);this.dispatchEvent(new Event('seeked'));}
 load(){this.calls.push(['load']);}
 play(){this.paused=false;this.calls.push(['play']);this.dispatchEvent(new Event('play'));return Promise.resolve();}
 pause(){this.paused=true;this.calls.push(['pause']);this.dispatchEvent(new Event('pause'));}
}
function flush(){let iterations=0;while(frames.size){if(++iterations>60)throw Error('Endless animation frame loop');for(const [id,cb]of [...frames]){frames.delete(id);cb();}}}
vm.runInNewContext(code,{
 window,document,HTMLElement:Element,AbortController,queueMicrotask,
 customElements:{get(){return undefined;},define(name,klass){FrameCut=klass;}},
 requestAnimationFrame(fn){frames.set(++nextFrame,fn);return nextFrame;},
 cancelAnimationFrame(id){frames.delete(id);},
 IntersectionObserver:class{constructor(fn){visibility=fn;}observe(){}disconnect(){}}
});
const scene=new FrameCut(),reveal=new Video(),scarf=new Video(),button=new Element();
const vars=new Map();
scene.style={setProperty(name,value){vars.set(name,value);}};
const stage={clientHeight:800};
scene.querySelector=selector=>({
 '.frame-stage':stage,'.frame-reveal':reveal,'.frame-scarf':scarf,'.frame-toggle':button
})[selector];
let top=0;scene.getBoundingClientRect=()=>({top,bottom:top+1960,height:1960});
scene.mount();flush();
assert.equal(scene.hasAttribute('data-full'),true);
assert.equal(reveal.hasAttribute('src'),false,'Do not download cinema files before the scene is nearby');
visibility([{isIntersecting:true}]);flush();
assert.match(reveal.getAttribute('src'),/reveal\.mp4/);
assert.match(scarf.getAttribute('src'),/scarf\.mp4/);
reveal.dispatchEvent(new Event('loadedmetadata'));
reveal.dispatchEvent(new Event('loadeddata'));flush();
const scroll=y=>{top=-y;window.dispatchEvent(new Event('scroll'));flush();};
scroll(300);
const early=reveal.currentTime;
assert(early>.2&&early<2.3,'Short responsive timeline should advance the real V film immediately');
assert.equal(Number(vars.get('--scarf-film-opacity')),0,'Scarf cannot flash during the portal scene');
scroll(710);
assert(reveal.currentTime>early,'The V film must advance as visitor scrolls');
assert(Number(vars.get('--scarf-film-opacity'))>0,'Scarf should begin its cinematic crossfade');
scroll(850);
assert.equal(scarf.paused,false,'The scarf should loop once the portal has revealed it');
assert.equal(Number(vars.get('--scarf-film-opacity')),1);
assert.equal(button.hidden,false);
scroll(240);
assert(reveal.currentTime<2,'Reversing scroll must scrub the V reveal backward');
assert.equal(scarf.paused,true,'Rewinding the V scene pauses scarf footage');
assert.equal(Number(vars.get('--scarf-film-opacity')),0);
scroll(850);
button.dispatchEvent(new Event('click'));flush();
assert.equal(scarf.paused,true,'Independent scarf pause button must still work');
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
assert.equal(reveal.hasAttribute('src'),false);
assert.equal(scarf.hasAttribute('src'),false);

{
 // Browser canvas path: authentic 90-frame WebP sheets must be used instead
 // of high-frequency MP4 seeks, including fast trackpad jumps.
 let SpriteFrameCut,spriteVisibility,frameId=0;
 const frames2=new Map(),draws=[],loadedSheets=[];
 const win=Object.assign(new EventTarget(),{
  innerHeight:800,innerWidth:1280,devicePixelRatio:1,
  StudioMotion:Object.assign(new EventTarget(),{level:'full'})
 });
 const doc=Object.assign(new EventTarget(),{hidden:false});
 class SheetImage{
  set src(url){this._url=url;loadedSheets.push(url);this.onload?.();}
  get src(){return this._url;}
 }
 vm.runInNewContext(code,{
  window:win,document:doc,HTMLElement:Element,AbortController,queueMicrotask,Image:SheetImage,
  customElements:{get(){return undefined;},define(name,klass){SpriteFrameCut=klass;}},
  requestAnimationFrame(fn){frames2.set(++frameId,fn);return frameId;},
  cancelAnimationFrame(id){frames2.delete(id);},
  IntersectionObserver:class{constructor(fn){spriteVisibility=fn;}observe(){}disconnect(){}}
 });
 const scene2=new SpriteFrameCut(),reveal2=new Video(),scarf2=new Video(),button2=new Element();
 const canvas2={width:0,height:0,getContext(){return {
  fillRect(){},drawImage(...args){draws.push(args);},
  set fillStyle(v){},set imageSmoothingEnabled(v){},set imageSmoothingQuality(v){}
 }}};
 const stage2={clientWidth:1280,clientHeight:800};
 const variables=new Map();
 scene2.style={setProperty(k,v){variables.set(k,v);}};
 scene2.querySelector=x=>({
  '.frame-stage':stage2,'.frame-reveal':reveal2,
  '.frame-reveal-canvas':canvas2,'.frame-scarf':scarf2,'.frame-toggle':button2
 })[x];
 let scrollPosition=0;
 scene2.getBoundingClientRect=()=>({top:-scrollPosition,bottom:1960-scrollPosition,height:1960});
 const pump=()=>{let loops=0;while(frames2.size){if(++loops>70)throw Error('Sprite frame loop exceeded budget');for(const [id,fn]of [...frames2]){frames2.delete(id);fn();}}};
 scene2.mount();pump();spriteVisibility([{isIntersecting:true}]);pump();
 assert(loadedSheets.some(url=>url.includes('sheet-0.webp')));
 assert(draws.length>0,'Canvas must render original film cells');
 assert.equal(reveal2.hasAttribute('src'),false,'Avoid MP4 decoder work while sprites are supported');
 scrollPosition=750;win.dispatchEvent(new Event('scroll'));pump();
 assert(loadedSheets.some(url=>url.includes('sheet-9.webp')));
 assert.equal(Number(variables.get('--frame-canvas-ready')),1);
 assert.equal(scarf2.paused,false);
 const lastFrame=draws.at(-1);
 assert.equal(lastFrame[3],768);
 assert.equal(lastFrame[4],432);
 scrollPosition=140;win.dispatchEvent(new Event('scroll'));pump();
 assert.equal(scarf2.paused,true);
 assert.equal(Number(variables.get('--scarf-film-opacity')),0);
 assert.equal(Number(variables.get('--frame-canvas-ready')),1);
 scene2.disconnectedCallback();
 assert.equal(frames2.size,0);
}

console.log('PASS: original V sprite/MP4 scrubbed forward/backward, original looping scarf, cinematic handoff, lazy prefetch, pause, accessibility and cleanup');
