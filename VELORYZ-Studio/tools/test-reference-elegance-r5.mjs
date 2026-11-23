/* Contract for the ACTIVE '/' homepage, not the dormant ?classic=1 route. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const handler=read('lib/page-handler.ts');
const shell=read('lib/claude-reference-shell.ts');
const css=read('public/reference-elegance-r5.css');
const heroJS=read('public/reference-hero-immersive.js');
const security=read('lib/response-security.ts');
const shared=read('public/button-feedback.js');
const menu=read('public/reference-site-upgrade.js');
const silk=read('public/veloryz-silk-2026.js');
const html=JSON.parse(shell.slice(shell.indexOf('export default ')+15).trim().replace(/;$/,''));
assert.ok(handler.includes("if(path==='/'&&new URL(request.url).searchParams.get('classic')!=='1')"),'Live homepage is reference shell; classic is explicitly opt-in');
assert.ok(handler.includes('let html=claudeReferenceShell.replace'), 'Active handler must use reference shell');
for(const token of [
 'class="vz-reference-site"','id="tp"','vz-editorial-r5','id="bigV"',
 'data-logo-source="official-glb"','src="/assets/brand/veloryz-mark.svg"',
 'src="/assets/brand/official/Main-Dark-Ink-Transparent.webp"',
 'class="vz-hero-edition"','class="vz-hero-practices"',
 'class="btn fill mag vz-hero-cta-main"',
 'class="btn mag vz-hero-cta-alt"','class="btn mag vz-hero-cta-link"',
 'id="mb"','id="mn"','class="vz-3d-controls"'
])assert.ok(html.includes(token),'Live markup missing: '+token);
assert.ok(security.includes("silk-ui-20261123-r5"),'Public response must identify R5');
assert.ok(security.includes('reference-elegance-r5.css?v=20261123-editorial-r5'),'Live R5 sheet must load after Silk');
assert.ok(security.indexOf('veloryz-ui-2026.css')<security.indexOf('reference-elegance-r5.css'),'R5 must win final cascade');
for(const token of ['.vz-hero-edition','.vz-hero-practices','#mn a::before','#mb:active',
 '#heroTxt .lead',':is(.orb,#vz-hero-particles,#vz-hero-pointer-field)',
 ':focus-visible','prefers-reduced-motion','data-motion="paused"','max-width:570px'])
 assert.ok(css.includes(token),'Editorial feature or a11y safeguard missing: '+token);
assert.ok(!css.includes('radial-gradient('),'R5 must not introduce the disliked dark-centred halo dots');
assert.ok(css.includes('linear-gradient('),'Editorial surface should be built from subtle planes');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Editorial CSS braces balance');
assert.ok(heroJS.includes("if(hero.classList.contains('vz-editorial-r5'))"),'Particle canvas must not be created on R5');
assert.ok(heroJS.includes("Main-Dark-Ink-Transparent.png"),'Image failure fallback remains working');
assert.ok(menu.includes("button.setAttribute('aria-expanded',String(open))"),'Menu must report expanded state');
assert.ok(menu.includes("menu.querySelector('a')?.focus"),'Menu focus entry must be retained');
assert.ok(shared.includes("(!media?.matches||level==='full')"),'Explicit Full must override OS reduced motion for button feedback');
assert.ok(silk.includes('[data-vz-fx="1"]'),'Silk must not double-drive a button managed by feedback layer');
assert.ok(silk.includes("version: 'silk-2026.4'"),'Expected shared motion runtime release');
assert.doesNotThrow(()=>new vm.Script(heroJS),'Hero script must parse');
assert.doesNotThrow(()=>new vm.Script(shared),'Button feedback script must parse');
assert.doesNotThrow(()=>new vm.Script(silk),'Shared Silk script must parse');
console.log('PASS: real homepage R5 editorial markup, original V, no halo canvas, button/menu feedback, responsive and reduced motion, runtime release.');
