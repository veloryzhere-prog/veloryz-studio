/* VELORYZ Motion On + buttery Lenis scroll: source, behavior and accessibility regression checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const shell=JSON.parse(read('lib/site-shell.ts').replace(/^export default\s*/,'').replace(/;\s*$/,''));
const packageJson=JSON.parse(read('package.json'));
const motion=read('public/motion.js'),scroll=read('public/smooth-scroll.js');
const scrollCSS=read('public/motion-pacing-2026.css'),script=read('scripts/build-scroll.mjs');
for(const file of ['src/vendor/lenis/src/lenis.ts','src/vendor/lenis/src/virtual-scroll.ts','src/vendor/lenis/browser.ts','src/vendor/lenis/LICENSE','public/lenis-vendored.css'])assert.ok(read(file).length>150,'Missing pinned MIT Lenis source: '+file);
assert.match(read('src/vendor/lenis/LICENSE'),/MIT License/);
assert.ok(script.includes("entry:'src/vendor/lenis/browser.ts'")&&script.includes("lenis-vendored.js"),'Self-hosted vendor bundle must be built by Vite');
assert.ok(packageJson.scripts.prebuild.includes('node scripts/build-scroll.mjs'),'Lenis bundle not included in production builds');
assert.ok(packageJson.scripts.predev.includes('node scripts/build-scroll.mjs'),'Lenis bundle not included in development builds');
assert.ok(shell.includes('data-guided-motion-intro="true"'),'First-visit motion dialog must be enabled in HTML');
assert.ok(shell.indexOf('/lenis-vendored.js')<shell.indexOf('/smooth-scroll.js'),'Self-hosted Lenis must load before controller');
assert.ok(shell.includes('motion-pacing-2026.css'),'Motion CSS must be loaded');
assert.ok(motion.includes("welcomeKey='veloryz.motion.intro.v3'"),'First-visit preference should persist after the choice');
assert.ok(motion.includes('requestAnimationFrame(()=>{if(gateActive)panel();});'),'Mandatory modal must appear automatically');
assert.ok(motion.includes("choose('reduced')"),'Accessible reduced motion exit must work');
assert.ok(motion.includes("introDone=true"),'Completing the first-screen action must remember preference');
assert.ok(motion.includes('Turn motion on'),'Motion activation must be a visible CTA');
assert.ok(scrollCSS.includes('motion-accessible-exit:not([hidden])'),'Reduced motion choice must remain visible');
assert.ok(scrollCSS.includes('html.lenis')&&scrollCSS.includes('scroll-behavior:auto!important'),'Avoid Lenis + CSS double easing');
assert.ok(scroll.includes("syncTouch:false"),'Mobile touch must stay native');
assert.ok(scroll.includes('allowNestedScroll:false'),'Nested scroll should use targeted exclusions rather than per-event DOM scanning');
assert.ok(scroll.includes('respectReducedMotion:true'),'Lenis must honor OS accessibility');
assert.ok(scroll.includes("!coarse.matches&&!narrow.matches"),'Mobile/tablet should not be intercepted');
assert.ok(scroll.includes('stopInertiaOnNavigate:true'),'Navigation should interrupt scrolling inertia');
assert.ok(!scroll.includes("addEventListener('wheel'"),'Do not implement a second wheel handler');
assert.doesNotThrow(()=>new Function(scroll),'Smooth-scroll controller JS must parse');
assert.doesNotThrow(()=>new Function(motion),'Motion preferences script JS must parse');
const docEvents={},winEvents={},media=[],frames=[];
class FakeLenis{
 static instances=[];
 constructor(options){this.options=options;this.destroyed=false;this.calls=[];FakeLenis.instances.push(this)}
 destroy(){this.destroyed=true}
 resize(){this.calls.push('resize')}
 scrollTo(target,options){this.calls.push({target,options})}
}
const root={dataset:{motion:'full'},style:{scrollBehavior:''},removeAttribute(key){if(key==='data-vz-smooth-wheel')delete this.dataset.vzSmoothWheel}};
const getMedia=q=>{const x={matches:false,query:q,addEventListener(){}};media.push(x);return x};
const state={level:'full',onboardingActive:false};
const mockWindow={Lenis:FakeLenis,scrollY:60,StudioMotion:{get level(){return state.level},get onboardingActive(){return state.onboardingActive},addEventListener(k,fn){winEvents.motion=fn}},addEventListener(k,fn){winEvents[k]=fn}};
const mockDoc={documentElement:root,hidden:false,readyState:'complete',addEventListener(k,fn){docEvents[k]=fn},querySelector:()=>null};
const fakeNavigator={deviceMemory:8,connection:{saveData:false,addEventListener(){}}};
vm.runInNewContext(scroll,{window:mockWindow,document:mockDoc,matchMedia:getMedia,navigator:fakeNavigator,requestAnimationFrame(fn){frames.push(fn);return frames.length},cancelAnimationFrame(){},console});
assert.equal(FakeLenis.instances.length,1,'Full motion on desktop must instantiate Lenis once');
assert.equal(root.dataset.vzSmoothWheel,'lenis');
const engine=FakeLenis.instances[0];
assert.equal(engine.options.lerp,.14,'Balanced Lenis smoothing');
assert.equal(engine.options.wheelMultiplier,.94,'Moderate wheel distance');
assert.equal(engine.options.syncTouch,false);
assert.ok(engine.options.prevent({matches:s=>s==='dialog'}),'Nested modal should scroll natively');
mockWindow.VeloryzScroll.sync();
assert.equal(FakeLenis.instances.length,1,'Repeated scroll sync must not create more instances');
docEvents['studio:route']();
frames[0]();
assert.ok(engine.calls.includes('resize'),'Page transitions must resize scroll bounds');
assert.ok(engine.calls.find(x=>x?.options?.immediate===true),'Page transitions must sync actual scroll position');
state.level='reduced';winEvents.motion();
assert.equal(engine.destroyed,true,'Reduced mode must stop Lenis');
state.level='full';media.find(x=>x.query.includes('pointer: coarse')).matches=true;
mockWindow.VeloryzScroll.sync();
assert.equal(FakeLenis.instances.length,1,'Coarse touch devices must keep native scrolling');
media.find(x=>x.query.includes('pointer: coarse')).matches=false;
fakeNavigator.connection.saveData=true;mockWindow.VeloryzScroll.sync();
assert.equal(FakeLenis.instances.length,1,'Data saver must not instantiate Lenis');
fakeNavigator.connection.saveData=false;state.onboardingActive=true;mockWindow.VeloryzScroll.sync();
assert.equal(FakeLenis.instances.length,1,'Opening welcome dialog must prevent smooth scroll engine activation');
state.onboardingActive=false;mockWindow.VeloryzScroll.sync();
assert.equal(FakeLenis.instances.length,2,'Selecting Full motion activates Lenis again');
console.log('PASS: mandatory first-screen motion, remembered choice, reduced-motion alternative, Lenis desktop tuning, nested scroll and native mobile.');
