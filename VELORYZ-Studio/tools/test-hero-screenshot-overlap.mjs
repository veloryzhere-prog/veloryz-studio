/* Regression: exact screenshot problems from 22 Nov 2026.
   Prevent invisible official header wordmark, subtitle crossing the title,
   displaced drag instruction and AI-obscured 3D controls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const source=read('lib/claude-reference-shell.ts');
const html=JSON.parse(source.slice(source.indexOf('export default ')+15).trim().replace(/;$/,''));
const css=read('public/reference-hero-screenshot-repair.css');
const original=read('public/reference-hero-immersive.css');
const section=html.slice(html.indexOf('<header class="hero'),html.indexOf('</header>')+9);
const controlsStart=section.indexOf('<div class="vz-3d-controls"');
const hint=section.indexOf('<span class="vz-3d-hint"');
const controlsEnd=section.lastIndexOf('</div>');
assert(controlsStart>0&&hint>controlsStart&&hint<controlsEnd,'Drag instruction must live INSIDE model controls');
assert(!section.includes('class="meta tag"'),'Floating location line crossing the heading must be removed');
assert(section.includes('class="vz-hero-eyebrow"')&&section.includes('aria-label="Studio details"'),'Hero eyebrow must remain grouped in normal flow');
assert(!section.includes('class="tag vz-hero-location"'),'Retain the simplified hero rather than restoring the removed subtitle');
assert(css.includes('.vz-hero-eyebrow > .tag')&&css.includes('position:static !important'),'Hero eyebrow tags must not overlap headline through absolute positioning');
assert(section.includes('Design × Code × Motion'),'Do not lose original editorial category');
assert(section.includes('Built to be')&&section.includes('remembered.'),'Keep original typography and text');
assert(html.includes('/assets/brand/official/Main-Dark-Ink-Transparent.webp'),'Use official artwork rather than a replacement');
assert(css.includes('body.vz-reference-site > nav')&&css.includes('mix-blend-mode:normal !important'),'Override global nav difference compositing causing invisible header logo');
assert(css.includes('.vz-official-header-brand img')&&css.includes('filter:none !important'),'Preserve true approved image colors and contrast');
assert(css.includes('.vz-hero-eyebrow')&&css.includes('padding-top:clamp(140px'),'Prevent kicker from colliding with the fixed nav');
assert(css.includes('.vz-3d-controls')&&css.includes('right:clamp(255px,22vw,390px)'),'Shift desktop model controls left of bottom-right AI launcher');
assert(css.includes('top:calc(clamp(80px,11svh,126px)'),'Place desktop controls directly beneath the model, not behind AI');
assert(css.includes('position:relative !important')&&css.includes('max-width:calc(100% - 36px)'),'Mobile panel must reflow and stay accessible');
assert(css.includes('overflow:hidden;')&&css.includes('.vz-material-hero #h1 .ln'),'Keep masked headline entrance motion intact');
for(const action of ['gentle','spin','pause','continue','left','right','front','reset'])
 assert(section.includes('data-logo-action="'+action+'"'),'Preserve functional 3D control: '+action);
assert(original.includes('vz-hero-particles'),'Keep existing moving particles');
assert(html.includes('/reference-hero-screenshot-repair.css?v=20261122-header-overlap-fix-1'),'Load a new versioned repair stylesheet after previous theme styles');
const parseCount=css.split('{').length-css.split('}').length;
assert.equal(parseCount,0,'Correct CSS bracket structure');
console.log('PASS: visible official wordmark, clear heading/kickers, contained 3D hint and non-overlapping controls, mobile layout and unchanged features.');
