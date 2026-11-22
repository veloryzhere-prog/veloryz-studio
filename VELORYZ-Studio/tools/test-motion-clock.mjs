import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const shell=JSON.parse(read('lib/site-shell.ts').trim().replace(/^export default /,'').replace(/;$/,''));
const clockSource=read('public/motion-clock.js');
const lenisSource=read('public/smooth-scroll.js');
const visual=read('public/visual-motion-v4.js');
const scarf=read('public/frame-cut.js');

assert(shell.indexOf('/motion-clock.js')<shell.indexOf('/visual-motion-v4.js'));
assert(shell.indexOf('/motion-clock.js')<shell.indexOf('/smooth-scroll.js'));
assert(shell.indexOf('/lenis-vendored.js')<shell.indexOf('/smooth-scroll.js'));
assert.match(lenisSource,/autoRaf:!window\.VeloryzMotionClock/);
assert.match(lenisSource,/\.attachLenis\(engine\)/);
assert.match(lenisSource,/\.detachLenis\(engine\)/);
assert.match(visual,/clock\?\.subscribeScroll\(schedule\)/);
assert.doesNotMatch(scarf,/clock\?\.subscribeScroll|requestAnimationFrame|addEventListener\('scroll'/,'The lightweight scarf is video-only; it must not consume scroll frames.');

const queue=new Map();
let nextId=0;
const handlers={};
const document={hidden:false,documentElement:{dataset:{motion:'full'}},addEventListener:(type,fn)=>handlers[type]=fn};
const window={addEventListener:()=>{}};
vm.runInNewContext(clockSource,{
 window,document,console,
 requestAnimationFrame(fn){const id=++nextId;queue.set(id,fn);return id;},
 cancelAnimationFrame(id){queue.delete(id);}
});
const clock=window.VeloryzMotionClock;
assert(clock,'Clock must be publicly available to the controllers');
let strokes=0,events=0;
const unsubscribe=clock.subscribeScroll(()=>events++);
const fakeLenis={on(event,callback){assert.equal(event,'scroll');this.notify=callback;},raf(){strokes++;if(strokes===1)this.notify();}};
clock.attachLenis(fakeLenis);
let sceneRuns=0;
clock.request('scene',()=>sceneRuns++);
clock.request('scene',()=>sceneRuns++); // duplicate work for a frame coalesces
assert.equal(queue.size,1,'Lenis and all scenes must share one pending browser animation frame');
const flush=()=>{const [id,callback]=queue.entries().next().value;queue.delete(id);callback(16)};
flush();
assert.equal(strokes,1);
assert.equal(events,1);
assert.equal(sceneRuns,1);
assert.equal(queue.size,1,'Lenis inertia should continue on the same clock');
clock.request('cancel-me',()=>{throw Error('Cancelled work executed')});
clock.cancel('cancel-me');
clock.detachLenis(fakeLenis);
assert.equal(queue.size,0,'No frame leaks after Lenis is torn down');
unsubscribe();
clock.notifyScroll();
assert.equal(events,1,'Unsubscribed scenes should not keep receiving scroll updates');
clock.request('hidden',()=>{throw Error('Should not render in hidden tab')});
document.hidden=true;
handlers.visibilitychange();
assert.equal(queue.size,0,'Hidden tabs must suspend the animation frame');
document.hidden=false;
handlers.visibilitychange();
assert.equal(queue.size,1,'Work should resume after the tab becomes visible');
clock.cancel('hidden');
flush();
assert.equal(queue.size,0);
console.log('PASS: shared Lenis animation clock and visual scenes, zero scarf scroll frames, visibility, coalescing, teardown.');
