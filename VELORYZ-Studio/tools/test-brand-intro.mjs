/* VELORYZ cinematic intro: source, brand asset, onboarding and lifecycle contracts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const shell=JSON.parse(read('lib/site-shell.ts').replace(/^export default\s*/,'').replace(/;\s*$/,''));
const js=read('public/brand-intro.js');
const css=read('public/brand-intro.css');
const gallery=read('public/intro-concepts.html');
const motion=read('public/motion.js');
const boot=read('public/motion-boot.js');
const scroll=read('public/smooth-scroll.js');
const app=read('public/app.js');

assert.doesNotThrow(()=>new vm.Script(js),'Brand intro script must parse as standalone browser JavaScript.');
assert.ok(shell.indexOf('/brand-intro.js')<shell.indexOf('/motion.js'),'Brand intro controller must initialize before motion preference gate.');
assert.ok(shell.indexOf('/brand-intro.css')<shell.indexOf('/brand-intro.js'),'Intro CSS must be present before boot.');
assert.ok(shell.includes('id="vz-intro"')&&shell.includes('data-vz-intro-skip'),'Official intro markup and accessible skip button are required.');
assert.ok(shell.includes('/assets/brand/veloryz-mark.svg'),'Intro must use the existing official V emblem.');
assert.ok(shell.includes('/assets/brand/official/Main-Transparent.webp'),'Intro must use the approved VELORYZ wordmark.');
for(const asset of ['public/assets/brand/veloryz-mark.svg','public/assets/brand/official/Main-Transparent.webp','public/assets/brand/official/Main-Dark-Ink-Transparent.webp'])
 assert.ok(fs.existsSync(new URL('../'+asset,import.meta.url)),'Official identity file missing: '+asset);
for(const design of ['prism','orbit','editorial'])assert.ok(gallery.includes('data-vz-demo="'+design+'"'),'Missing interactive sample '+design);
assert.ok(gallery.includes('data-vz-intro-preview="true"'),'Concept gallery must never autostart the public intro.');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Intro CSS braces must be balanced.');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'Reduced-motion CSS alternative required.');
assert.match(css,/vz-i-shutter-left/,'Fullscreen exit transition required.');
assert.match(js,/sessionStorage\.getItem\(sessionKey\)/,'The homepage intro should run once per tab session.');
assert.match(js,/window\.VeloryzIntro=/,'The intro must expose a readonly status and safe manual preview.');
assert.match(motion,/if\(window\.VeloryzIntro\?\.active\)return/,'The mandatory choice cannot cover the brand intro.');
assert.match(motion,/studio:brand-intro-complete/,'Motion gate must still open when the intro completes.');
assert.match(motion,/choose\('reduced'\)/,'Accessible reduced-motion exit must remain intact.');
assert.match(motion,/welcomeKey='veloryz.motion.intro.v3'/,'Mandatory first-visit choice must remain unchanged.');
assert.match(boot,/studio:brand-intro-complete/,'The original 3D V must resume after intro.');
assert.match(scroll,/studio:brand-intro-complete/,'Original Lenis smooth scroll must resume after intro.');
assert.match(app,/window.VeloryzIntro\?\.active\?'studio:brand-intro-complete':'studio:motion-intro-complete'/,'Existing ad and announcement timers must resume after the correct intro gate.');
assert.ok(!js.includes('fetch('),'The logo intro must not rely on an external request, fabricated progress or an API.');

function simulate({isPreview=false,seen=false,reduced=false,saveData=false,path='/',motionPreference='auto'}={}){
 const listeners={},timers=new Map(),frames=[],events=[];
 let timerIndex=0;
 const logo={src:'/assets/brand/official/Main-Transparent.webp'};
 const skip={focus(){}};
 const overlay={hidden:false,dataset:{concept:'prism'},setAttribute(key,val){this[key]=val;},removeAttribute(key){delete this[key];},querySelector(sel){return sel.includes('wordmark')?logo:sel.includes('skip')?skip:null;}};
 const root={dataset:{...(isPreview?{vzIntroPreview:'true'}:{})}};
 const main={inert:false,focus(){}};
 const body={style:{overflow:''}};
 const storage=new Map(seen?[['veloryz.brand.intro.session.v1','1']]:[]);
 const fakeDocument={
  documentElement:root,body,hidden:false,
  addEventListener(type,callback){listeners[type]=callback;},
  getElementById(id){return id==='vz-intro'?overlay:null;},
  querySelectorAll(s){return s==='#main'?[main]:[];},
  querySelector(s){return s==='#main'?main:null;},
  dispatchEvent(event){events.push(event);}
 };
 const context={
  document:fakeDocument,window:{addEventListener(){}},navigator:{deviceMemory:8,connection:{saveData,addEventListener(){}}},
  location:{pathname:path},matchMedia:()=>({matches:reduced,addEventListener(){}}),
  localStorage:{getItem:()=>motionPreference},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  setTimeout(callback,delay){const id=++timerIndex;timers.set(id,{callback,delay});return id;},
  clearTimeout(id){timers.delete(id);},
  requestAnimationFrame(callback){frames.push(callback);return frames.length;},
  CustomEvent:class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail;}},
 };
 vm.runInNewContext(js,context,{timeout:2000});
 return {context,root,body,overlay,logo,storage,listeners,events,frames,timers,
  framesRun(){while(frames.length)frames.shift()();},
  timerRun(delay){const entry=[...timers.entries()].find(([,x])=>x.delay===delay);assert.ok(entry,'Timer not scheduled for '+delay);timers.delete(entry[0]);entry[1].callback();}
 };
}
const fresh=simulate();
assert.equal(fresh.context.window.VeloryzIntro.active,true,'Fresh homepage starts the intro.');
assert.equal(fresh.root.dataset.vzIntro,'preparing');
fresh.listeners.DOMContentLoaded();
assert.equal(fresh.body.style.overflow,'hidden','Intro locks scroll briefly.');
fresh.framesRun();
assert.equal(fresh.root.dataset.vzIntro,'playing','Intro enters the animated state.');
fresh.timerRun(2110);
assert.equal(fresh.root.dataset.vzIntro,'exiting','Intro transitions into the page.');
fresh.timerRun(740);
assert.equal(fresh.root.dataset.vzIntro,'done');
assert.equal(fresh.body.style.overflow,'','Scrolling returns after reveal.');
assert.equal(fresh.storage.get('veloryz.brand.intro.session.v1'),'1','First entrance is remembered this session.');
assert.equal(fresh.events.find(x=>x.type==='studio:brand-intro-complete')?.detail?.skipped,false,'Event tells motion gate the logo reveal is complete.');

const skipped=simulate();
skipped.listeners.DOMContentLoaded();
skipped.context.window.VeloryzIntro.skip();
assert.equal(skipped.root.dataset.vzIntro,'done','Skip must immediately unlock the site.');
assert.equal(skipped.events.find(x=>x.type==='studio:brand-intro-complete')?.detail.skipped,true);

for(const opt of [{seen:true},{reduced:true},{saveData:true},{path:'/docs/'},{motionPreference:'reduced'}]){
 const state=simulate(opt);state.listeners.DOMContentLoaded();
 assert.equal(state.context.window.VeloryzIntro.active,false,'No fullscreen intro when ineligible.');
 assert.equal(state.overlay.hidden,true,'Ineligible intro must never remain visible.');
}
const demo=simulate({isPreview:true,path:'/intro-concepts.html'});
demo.listeners.DOMContentLoaded();
assert.equal(demo.context.window.VeloryzIntro.active,false,'Demo gallery does not autoplay.');
demo.context.window.VeloryzIntro.replay('editorial');
assert.equal(demo.overlay.dataset.concept,'editorial');
assert.ok(demo.logo.src.includes('Main-Dark-Ink-Transparent.webp'));
demo.context.window.VeloryzIntro.skip();
assert.equal(demo.context.window.VeloryzIntro.active,false);
demo.context.window.VeloryzIntro.replay('orbit');
assert.equal(demo.overlay.dataset.concept,'orbit');
assert.ok(demo.logo.src.includes('Main-Transparent.webp'));

console.log('PASS: official VELORYZ identity, 3 playable concepts, first-session cinematic intro, skip, reduced-motion, original motion choice, 3D/Lenis handoff.');
