import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const asset = name => readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const shell=readFileSync(new URL('../lib/site-shell.ts',import.meta.url),'utf8');

test('scarf uses original video, native muted autoplay and recovers on route/visibility',()=>{
 const js=asset('frame-cut.js');
 for(const snippet of ["'/assets/frame-cut/scarf.mp4'","video.muted=true","video.loop=true","video.playsInline=true","video.play()","'visibilitychange'","'studio:brand-intro-complete'"]){
  assert.ok(js.includes(snippet),snippet);
 }
 assert.ok(!js.includes('video.currentTime=performance.now()'),'do not drive video from expensive rAF');
});
test('hero word cycles four motion-safe styles while retaining accessible text',()=>{
 const js=asset('kinetic-type-2026.js'),css=asset('kinetic-type-2026.css');
 for(const phase of ['editorial','sculptural','outline','signature']){
  assert.ok(js.includes("'"+phase+"'"),phase);
  assert.ok(css.includes('data-type-phase="'+phase+'"'),phase);
 }
 assert.ok(js.includes("readable.textContent=original"));
 assert.ok(js.includes("data-motion==='full'"));
});
test('reviews use identical cloned groups and keep honest empty state',()=>{
 const js=asset('review-experience.js'),css=asset('review-experience.css');
 assert.ok(js.includes("const second=first.cloneNode(true)"));
 assert.ok(js.includes("track.replaceChildren(first,second)"));
 assert.ok(js.includes("ResizeObserver"));
 assert.ok(js.includes("track.dataset.manualPause"));
 assert.ok(js.includes("No invented testimonials"));
 assert.ok(css.includes('translate3d(-50%,0,0)'));
});
test('all conversation surfaces load a shared theme',()=>{
 const css=asset('conversation-redesign-2026.css');
 for(const agent of ['support','client','creator'])assert.ok(css.includes('data-vz-chat="'+agent+'"'));
 assert.ok(css.includes('.expert-modal'));
 assert.ok(shell.includes('conversation-redesign-2026.css'));
 assert.ok(shell.includes('scarf-auto-v6')||shell.includes('scarf-autoplay-v5'));
 assert.ok(shell.includes('motion-recovery-v3.css'));
 assert.ok(shell.includes('ai-universe-v3.css'));
 assert.ok(asset('review-experience.js').includes('vz-reviews-spotlight-invites'));
 assert.ok(asset('platform.js').includes("id:'madherchod'"));
});
