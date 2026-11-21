import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('public/animation-providers.js');
const css=read('public/animation-providers.css');
const lottie=JSON.parse(read('public/assets/motion/project-confirmation.json'));
const shell=JSON.parse(read('lib/site-shell.ts').trim().replace(/^export default /,'').replace(/;$/,''));
const scroll=read('public/smooth-scroll.js');
const micro=read('public/micro-interactions.js');
assert.equal(lottie.nm,'VELORYZ Studio project request confirmed');
assert(lottie.layers.length>=2&&lottie.op>20,'Lottie confirmation must be a real vector timeline');
assert(shell.includes('/animation-providers.js')&&shell.includes('/animation-providers.css'));
assert(shell.indexOf('/motion-clock.js')<shell.indexOf('/animation-providers.js'));
assert(shell.indexOf('/smooth-scroll.js')<shell.indexOf('/animation-providers.js'));
assert(source.includes('motion@14.11.1/mini/+esm'),'Motion JavaScript runtime must be pinned');
assert(source.includes('lottie-web@5.13.0/build/player/lottie_light.min.js'),'Lottie light runtime must be pinned');
assert(source.includes('veloryz:creator-state')&&source.includes("state==='success'"));
assert(source.includes("reduce.matches")&&source.includes('network?.saveData'));
assert(source.includes('IntersectionObserver'),'Motion should only animate visible elements');
assert(!source.includes("addEventListener('scroll'"),'Provider integrations must not poll scroll');
assert(!source.includes('new Lenis'),'Only the existing Lenis engine owns scrolling');
assert(!source.includes('window.scrollTo('),'Provider animations must not hijack scrolling');
assert(css.includes('prefers-reduced-motion:reduce'));
assert(micro.includes("document.addEventListener('pointerover'"),'Cursor halo must avoid costly per-move selector traversal');
assert(micro.includes('if(cursor)scheduleCursor();'),'Cursor should only animate while visible');
assert.doesNotThrow(()=>new Function(source));

const handler={};
const doc={
 documentElement:{dataset:{motion:'full'}},hidden:false,readyState:'complete',
 addEventListener(name,fn){handler[name]=fn},
 querySelectorAll(){return []},
 querySelector(){return null}
};
const win={addEventListener(){},StudioMotion:{addEventListener(){}}};
const context={
 window:win,document:doc,navigator:{connection:{saveData:false,addEventListener(){}},deviceMemory:8},
 matchMedia:()=>({matches:false,addEventListener(){}}),
 requestAnimationFrame:()=>1,
 CustomEvent:class {constructor(type,options){this.type=type;this.detail=options?.detail}},
 console,IntersectionObserver:class {constructor(){}observe(){}disconnect(){}}
};
vm.runInNewContext(source,context);
assert(win.VeloryzAnimationProviders,'Provider module must mount independently of fetch availability');
assert.equal(win.VeloryzAnimationProviders.motionAvailable,false,'Motion must not load before needed');
assert.equal(win.VeloryzAnimationProviders.lottieRequested,false,'Lottie must not load on ordinary page views');
doc.documentElement.dataset.motion='reduced';
handler['veloryz:creator-state']?.({detail:{state:'success'}});
assert.equal(win.VeloryzAnimationProviders.lottieRequested,false,'Reduced-motion success should not fetch Lottie');
assert(scroll.includes('autoRaf:!window.VeloryzMotionClock'),'Lenis stays on one shared animation clock');
console.log('PASS: Motion and Lottie integrations lazy, pinned, reduced-motion compliant, and no second scroll engine.');
