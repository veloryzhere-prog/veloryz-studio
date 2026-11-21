/** VELORYZ cross-device visual, motion and wiring release tests. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';

const root=join(import.meta.dirname,'..');
const file=path=>readFileSync(join(root,path),'utf8');
const publicCss=file('public/studio-fluid-2026.css');
const consoleCss=file('public/studio-console-fluid-2026.css');
const motion=file('public/studio-fluid-motion.js');
const visual=file('public/visual-motion-v4.js');
const siteShell=JSON.parse(file('lib/site-shell.ts').replace(/^export default\s*/,'').replace(/;\s*$/,''));
const clientShell=JSON.parse(file('lib/client-portal-shell.ts').replace(/^export default\s*/,'').replace(/;\s*$/,''));
const adminShell=file('lib/admin-shell.ts');

function validateCss(input){
 let braces=0,quote=null,comment=false;
 for(let i=0;i<input.length;i++){
  const ch=input[i],next=input[i+1];
  if(comment){if(ch==='*'&&next==='/'){i++;comment=false}continue}
  if(quote){if(ch==='\\'){i++;continue}if(ch===quote)quote=null;continue}
  if(ch==='/'&&next==='*'){i++;comment=true;continue}
  if(ch==='"'||ch==="'"){quote=ch;continue}
  if(ch==='{')braces++;
  if(ch==='}')braces--;
  assert.ok(braces>=0,'Unexpected closing brace in CSS');
 }
 assert.equal(braces,0,'CSS declaration block was not closed');
 assert.equal(quote,null,'Unclosed CSS string');
 assert.equal(comment,false,'Unclosed CSS comment');
}
validateCss(publicCss);validateCss(consoleCss);
assert.ok(siteShell.includes('studio-fluid-2026.css?v=20261121-fluid-v1'));
assert.ok(siteShell.includes('studio-fluid-motion.js?v=20261121-fluid-v1'));
assert.ok(siteShell.indexOf('/studio-fluid-2026.css')>siteShell.indexOf('/knowledge-figma.css'),'Fluid CSS must load after legacy styles');
assert.ok(siteShell.indexOf('/studio-fluid-motion.js')>siteShell.indexOf('/app.js'),'Motion enhancement must follow the SPA boot script');
assert.ok(siteShell.includes('data-guided-motion-intro="false"'),'First visit should not force a motion-choice gate');
assert.ok(clientShell.includes('/studio-console-fluid-2026.css'),'Client portal must use the new responsive layer');
assert.ok(adminShell.includes('/studio-console-fluid-2026.css'),'Studio Control must use the new responsive layer');
for(const [label,content]of [['public',publicCss],['console',consoleCss]]){
 assert.ok(content.includes('prefers-reduced-motion:reduce'),label+' must respect accessibility preference');
 assert.ok(content.includes('(pointer:coarse)')||content.includes('(hover:none)'),label+' must support touch devices');
 assert.ok(content.includes('max-width:650px')||content.includes('max-width:640px'),label+' must handle phone screens');
 assert.ok(content.includes('max-width:900px')||content.includes('max-width:850px'),label+' must handle tablets');
 assert.ok(content.includes('max-width:400px')||content.includes('max-width:380px'),label+' must handle narrow screens');
}
assert.ok(publicCss.includes('body.motion-edition .hero h1'),'Responsive hero typography must be present');
assert.ok(publicCss.includes('body.motion-edition .project-art'),'Original project media cards must remain');
assert.ok(publicCss.includes('body.motion-edition .kb-v4'),'Documentation needs coordinated styling');
assert.ok(publicCss.includes('body.motion-edition .v4-root'),'Project Creator needs coordinated styling');
assert.ok(publicCss.includes('body.motion-edition .vz-chat'),'Support chat needs coordinated styling');
assert.ok(publicCss.includes('.vz-footer-help'),'Need Help card must remain visually prominent');
assert.ok(!publicCss.includes('pointer-events:none} /* Preserve original V sculpture'), 'Do not disable the V sculpture interaction');
assert.ok(consoleCss.includes('.admin-layout')&&consoleCss.includes('.cp-body'),'Admin and portal styles must be separately scoped');
assert.ok(consoleCss.includes('.ka-agent-card'),'AI Management responsive cards must be enhanced');
assert.ok(visual.includes('const frameBudget=economical?32:19'),'Motion should adapt frame budgets');
assert.ok(visual.includes('Math.abs(el.vzSceneProgress-progress)>0.003'),'Avoid redundant animation style writes');
assert.ok(visual.includes('if (economical || navigator.connection?.saveData) return;'),'Skip expensive decoration on low-powered devices');
assert.ok(motion.includes('IntersectionObserver'),'Motion entrances must rely on visibility');
assert.ok(!motion.includes("addEventListener('scroll'"),'New motion layer must not register a scroll loop');
assert.ok(!motion.includes('getBoundingClientRect'),'New entrance layer must not force layout reads');
assert.ok(motion.includes('prefers-reduced-motion'),'Reduced motion must be supported');
assert.ok(motion.includes('saveData'),'Data-saver mode must be respected');
assert.doesNotThrow(()=>new Function(motion),'The new motion script must be valid JS');
assert.doesNotThrow(()=>new Function(visual),'Visual scene script must remain valid JS');
assert.doesNotThrow(()=>new Function(file('public/motion.js')),'Main motion preferences must remain valid JS');

const frames=[],listeners={},targets=[
 {isConnected:true,animate(keyframes,options){frames.push({keyframes,options})}},
 {isConnected:true,animate(keyframes,options){frames.push({keyframes,options})}}
];
let instance=null;
class IntersectionObserverFake{
 constructor(callback){this.callback=callback;instance=this}
 observe(el){this.target=el}
 disconnect(){}
 unobserve(){}
}
const fakeMedia=()=>({matches:false,addEventListener(){}});
const fakeDocument={documentElement:{dataset:{}},readyState:'complete',hidden:false,
 addEventListener(name,fn){listeners[name]=fn},querySelectorAll(){return targets}};
const fakeWindow={matchMedia:fakeMedia,StudioMotion:{level:'full',addEventListener(){}},addEventListener(){}};
vm.runInNewContext(motion,{
 window:fakeWindow,document:fakeDocument,navigator:{deviceMemory:8,connection:{saveData:false}},
 IntersectionObserver:IntersectionObserverFake,requestAnimationFrame:fn=>fn(),console
});
assert.ok(instance,'Visible-section observer must be installed');
instance.callback([{target:targets[0],isIntersecting:true}]);
assert.equal(frames.length,1,'Visible entrance must animate once');
assert.deepEqual(Object.keys(frames[0].keyframes[0]).sort(),['opacity','transform']);
instance.callback([{target:targets[0],isIntersecting:true}]);
assert.equal(frames.length,1,'Do not replay the same section animation after scroll');

console.log('Studio fluid checks passed: public/admin/client responsive styles, 4 viewport tiers, preserved V, motion accessibility and GPU-friendly entrances.');
