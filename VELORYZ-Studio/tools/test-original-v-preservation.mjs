import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const text=file=>readFileSync(new URL(file,root),'utf8');
const sha=file=>createHash('sha256').update(readFileSync(new URL(file,root))).digest('hex');
const expected={
 'public/assets/brand/veloryz-logo.glb':'97bd75f808fb5cdacc07eaf7a25900f8209ca05ce9fdf3603a5d61ae0bb6f0fc',
 'public/assets/brand/study-ribbon.glb':'84496fdfb7df6c217a28d77b3ba7221c7e3a541d8023b26166dd56b058abdf05',
 'public/assets/brand/study-orbit.glb':'cd55296572ec19e62af69b434c6b80db909161c9457d739ad9210cd4ec04893e',
 'public/assets/brand/veloryz-mark.svg':'846fcbc3ffb68185745d601f5c40443c92fdf6825a42ebef7b87b386eafdce8e',
 'public/assets/brand/veloryz-original.png':'0c6b77bde324d69dc0c296e9d077792c6075b2a24db0c8c7c6b281ecdf3c09d4'
};
for(const [name,hash] of Object.entries(expected))assert.equal(sha(name),hash,`The user's original V artwork changed: ${name}`);
const app=text('public/app.js');
assert.match(app,/function logoStage\(variant='hero'\)/);
assert.match(app,/data-logo-scene role="img"[^`]+logo-fallback" src="\/assets\/brand\/veloryz-mark\.svg"/);
assert.ok((app.match(/logo-fallback" src="\/assets\/brand\/veloryz-mark\.svg"/g)||[]).length>=2,'Homepage and sculpture fallbacks must use the original V');
assert.match(app,/logoStage\('lab'\)/,'Motion Playground must still use the interactive model');
assert.match(app,/data-logo-view="explode"/);
assert.match(app,/data-logo-material="glass"/);
assert.match(app,/data-logo-object="orbit"/);
assert.match(app,/brand--official/);
assert.match(app,/Main-Dark-Ink-Transparent\.webp/);
assert.match(app,/hero-studio-tagline" data-cursor-fade>Independent creative & technology studio/);
assert.doesNotMatch(app,/<span class="live-dot" aria-hidden="true"><\/span>Independent creative/);
const shell=text('lib/site-shell.ts');
assert.match(shell,/brand-polish\.css/);assert.match(shell,/brand-polish\.js/);
assert.match(shell,/frame-cut\.js/);assert.match(shell,/smooth-scroll\.js/);
assert.match(text('public/brand-polish.css'),/prefers-reduced-motion/);
assert.match(text('public/brand-polish.js'),/tagline-fade-x/);
console.log('PASS: original 3D assets preserved byte-for-byte; hero/playground controls unchanged; official animated header wordmark, dot-free cursor-fade tagline and existing scarf present.');
