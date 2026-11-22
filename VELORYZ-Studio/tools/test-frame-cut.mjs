/* Standalone scarf video regression: no scroll-pinning, logo transition or rAF loop. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync(new URL('../public/frame-cut.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../public/frame-cut.css',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
assert.doesNotThrow(()=>new vm.Script(src));
assert.doesNotMatch(src,/addEventListener\(\s*['"](?:scroll|wheel)['"]/,'The scarf must not observe scroll or wheel events.');
assert.doesNotMatch(src,/requestAnimationFrame|subscribeScroll|--scarf-progress/,'The scarf must not run a scroll rAF controller.');
assert.doesNotMatch(css,/340svh|280svh|position:sticky|\.frame-emblem|\.frame-rings/,'Remove all tall scroll-linked stage and logo styling.');
assert.match(css,/\.frame-scarf/);
assert.match(app,/assets\/frame-cut\/scarf\.mp4|assets\/frame-cut\/scarf\.jpg/);
assert.doesNotMatch(app,/class="frame-emblem"|class="frame-rings"|class="frame-mark"/,'Homepage should show only the scarf film, no moving V or rings.');
assert.match(app,/aria-label="VELORYZ moving scarf film"/);
let Constructor,callback,disconnects=0;
const window=Object.assign(new EventTarget(),{StudioMotion:Object.assign(new EventTarget(),{level:'full',onboardingActive:false})});
const document=Object.assign(new EventTarget(),{hidden:false});
const device=Object.assign(new EventTarget(),{saveData:false});
const media=Object.assign(new EventTarget(),{matches:false});
class Node extends EventTarget{
 constructor(){super();this.attrs=new Map();this.hidden=false;this.isConnected=true;this.textContent='';this.disabled=false;}
 hasAttribute(k){return this.attrs.has(k);}
 setAttribute(k,v){this.attrs.set(k,String(v));}
 removeAttribute(k){this.attrs.delete(k);}
 toggleAttribute(k,enabled){if(enabled)this.setAttribute(k,'');else this.removeAttribute(k);}
}
class Video extends Node{
 paused=true;loads=0;plays=0;preload='none';
 set src(value){this.setAttribute('src',value);}
 get src(){return this.attrs.get('src');}
 play(){this.paused=false;this.plays++;this.dispatchEvent(new Event('play'));return Promise.resolve();}
 pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
 load(){this.loads++;}
}
vm.runInNewContext(src,{
 window,document,navigator:{connection:device},matchMedia:()=>media,HTMLElement:Node,
 queueMicrotask,AbortController,
 customElements:{get:()=>undefined,define:(name,klass)=>{assert.equal(name,'veloryz-frame-cut');Constructor=klass;}},
 IntersectionObserver:class{constructor(fn){callback=fn;}observe(){}disconnect(){disconnects++;}},
 console
});
const scene=new Constructor(),video=new Video(),button=new Node();
scene.querySelector=k=>({'.frame-scarf':video,'.frame-toggle':button})[k];
scene.mount();
assert.equal(video.hasAttribute('src'),false,'Do not load 7MB scarf before intersection');
assert.equal(video.paused,true);
callback([{target:scene,isIntersecting:true,intersectionRatio:.25}]);
assert.equal(video.src,'/assets/frame-cut/scarf.mp4','Load the real bundled scarf when needed');
assert.equal(video.paused,false,'Scarf begins playing when visible');
button.dispatchEvent(new Event('click'));
assert.equal(video.paused,true,'Viewer can pause scarf');
button.dispatchEvent(new Event('click'));
assert.equal(video.paused,false,'Viewer can resume scarf');
callback([{target:scene,isIntersecting:false,intersectionRatio:0}]);
assert.equal(video.paused,true,'Offscreen video pauses; not tied to scroll progress');
document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));
assert.equal(video.paused,true);
document.hidden=false;
media.matches=true;media.dispatchEvent(new Event('change'));
callback([{target:scene,isIntersecting:true,intersectionRatio:.4}]);
assert.equal(video.paused,true,'Reduced-motion preference disables autoplay');
button.dispatchEvent(new Event('click'));
assert.equal(video.paused,false,'Explicit manual play remains possible');
scene.disconnectedCallback();
assert.equal(video.hasAttribute('src'),false,'Unloaded film does not linger across route changes');
assert(disconnects>0,'Visibility observer must be disconnected');
assert(video.paused);
console.log('PASS: one original scarf video, lazy play/pause, no 3D logo/rings, no sticky scroll, reduced-motion/manual control and teardown.');
