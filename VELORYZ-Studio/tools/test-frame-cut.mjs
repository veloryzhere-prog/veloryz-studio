/* Scarf-only autoplay regression: no overlays, manual controls or scroll physics. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const src=read('public/frame-cut.js'),css=read('public/frame-cut.css'),app=read('public/app.js');
assert.doesNotThrow(()=>new vm.Script(src));
assert.doesNotMatch(src,/addEventListener\(\s*['"](?:scroll|wheel)['"]|requestAnimationFrame|subscribeScroll|--scarf-progress/);
assert.doesNotMatch(css,/340svh|280svh|position:sticky|\.frame-(?:emblem|rings|title|footer|overlay|toggle)/);
assert.doesNotMatch(app,/class="frame-(?:emblem|rings|mark|overlay|toggle|title|footer|eyebrow)"/);
const scarfMarkup=app.match(/<veloryz-frame-cut\b[\s\S]*?<\/veloryz-frame-cut>/)?.[0]||'';
assert(scarfMarkup,'The scarf section should exist');
for(const phrase of ['VELORYZ / A STUDY IN MOTION','01 / Fabric · Form · Flow','Made to<br><em>move.</em>','Play scarf motion','Pause scarf motion'])
 assert(!scarfMarkup.includes(phrase),'Removed scarf text/control still present in scarf section: '+phrase);
assert.match(app,/<veloryz-frame-cut role="group"/);
assert.match(app,/<video class="frame-scarf" autoplay muted loop playsinline preload="none"/);
assert.match(src,/video\.autoplay=true/);
assert.match(css,/object-fit:contain/);
let Constructor,observe,disconnects=0;
const window=Object.assign(new EventTarget(),{StudioMotion:Object.assign(new EventTarget(),{level:'full',onboardingActive:false})});
const document=Object.assign(new EventTarget(),{hidden:false});
const device=Object.assign(new EventTarget(),{saveData:false});
const media=Object.assign(new EventTarget(),{matches:false});
class Node extends EventTarget{
 constructor(){super();this.attrs=new Map();this.isConnected=true;}
 setAttribute(k,v){this.attrs.set(k,String(v))}
 hasAttribute(k){return this.attrs.has(k)}
 removeAttribute(k){this.attrs.delete(k)}
}
class Video extends Node{
 paused=true;loads=0;plays=0;preload='none';
 set src(v){this.setAttribute('src',v)}
 get src(){return this.attrs.get('src')}
 play(){this.paused=false;this.plays++;return Promise.resolve()}
 pause(){this.paused=true}
 load(){this.loads++}
}
vm.runInNewContext(src,{
 window,document,navigator:{connection:device},matchMedia:()=>media,HTMLElement:Node,
 queueMicrotask,AbortController,
 customElements:{get:()=>undefined,define:(name,klass)=>{assert.equal(name,'veloryz-frame-cut');Constructor=klass}},
 IntersectionObserver:class{constructor(fn){observe=fn}observe(){}disconnect(){disconnects++}},
 console
});
const scene=new Constructor(),video=new Video();
scene.querySelector=selector=>selector==='.frame-scarf'?video:null;
scene.mount();
assert(!video.hasAttribute('src'),'Video should not fetch its heavy source before intersection');
assert(video.autoplay&&video.muted&&video.loop&&video.playsInline,'Browser autoplay requires muted inline looping playback');
observe([{target:scene,isIntersecting:true,intersectionRatio:.3}]);
assert.equal(video.src,'/assets/frame-cut/scarf.mp4');
assert.equal(video.paused,false,'Scarf automatically plays on entry');
observe([{target:scene,isIntersecting:false,intersectionRatio:0}]);
assert.equal(video.paused,true,'Offscreen video must pause to save resources');
await Promise.resolve();await Promise.resolve();
assert.notEqual(scene.attrs.get('data-scarf-state'),'playing','Late play resolution must not report offscreen playback');
document.hidden=true;
observe([{target:scene,isIntersecting:true,intersectionRatio:.3}]);
assert.equal(video.paused,true,'Hidden tabs must never autoplay');
document.hidden=false;
media.matches=true;window.StudioMotion.level='reduced';media.dispatchEvent(new Event('change'));
assert.equal(video.paused,true,'Respect reduced motion');
media.matches=false;window.StudioMotion.level='full';media.dispatchEvent(new Event('change'));
assert.equal(video.paused,false,'Motion resumes automatically when allowed');
device.saveData=true;device.dispatchEvent(new Event('change'));
assert.equal(video.paused,true,'Save Data prevents autoplay');
scene.disconnectedCallback();
assert.equal(video.hasAttribute('src'),false,'Release video resource after navigating away');
assert(disconnects>0,'Disconnect the observer');
console.log('PASS: scarf-only autoplay, no labels or controls, visibility, reduced motion, data saving and cleanup.');
