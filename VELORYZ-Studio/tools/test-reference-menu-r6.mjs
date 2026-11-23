/* VELORYZ active reference homepage / MENU morph R6 contract tests.
 * Real file + script assertions, independent of the deprecated classic homepage.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('lib/claude-reference-shell.ts');
const html=JSON.parse(source.slice(source.indexOf('export default ')+15).trim().replace(/;$/,''));
const style=read('public/reference-menu-morph-r6.css');
const enhancement=read('public/reference-site-upgrade.js');
const security=read('lib/response-security.ts');
const handler=read('lib/page-handler.ts');
assert.ok(handler.includes('let html=claudeReferenceShell.replace'),'Live root must use reference shell');
for(const marker of [
  'id="mb" class="mbtn vz-menu-morph"',
  'aria-label="Open menu"',
  'aria-expanded="false"',
  'aria-controls="mn"',
  'class="vz-menu-label-menu"',
  'class="vz-menu-label-close"',
  'class="vz-menu-glyph"',
  'id="mn" role="navigation"',
  'aria-hidden="true" inert',
  'data-vz-menu-version="reference-r6"',
  'class="vz-menu-primary"',
  'class="vz-menu-utility"',
  'class="vz-menu-bottom"',
  '/reference-site-upgrade.js?v=20261123-reference-menu-r6'
])assert.ok(html.includes(marker),'Live menu markup missing: '+marker);
const block=html.slice(html.indexOf('<div id="mn"'),html.indexOf('</div></div><div id="curt"')+12);
assert.equal((block.match(/<a\s/g)||[]).length,14,'All 14 existing primary destinations must remain');
for(const url of ['#home','#services','#work','#design','#pricing','#studio','#reviews','/create/','/client/','/docs/','/help/assistant/','/report-bug/']){
  assert.ok(block.includes('href="'+url+'"'),'Navigation destination missing: '+url);
}
assert.ok(!html.includes("this.textContent=o?'Close':'Menu'"),'Menu click must not destroy its icon and labels');
assert.ok(!html.includes("$('#mb').textContent='Menu'"),'Hash route must not erase menu glyph markup');
for(const marker of [
  '#mb.vz-menu-morph',
  '.vz-menu-label-close',
  '.vz-menu-glyph i:first-child',
  '.vz-menu-glyph i:last-child',
  '#mn[data-vz-menu-version="reference-r6"]',
  'clip-path: circle(0px',
  'clip-path: circle(150vmax',
  '.vz-menu-primary a',
  '.vz-menu-utility a',
  '.vz-menu-stagger',
  'prefers-reduced-motion',
  'data-motion="paused"',
  ':focus-visible'
])assert.ok(style.includes(marker.replace('.vz-menu-stagger','--vz-menu-stagger')),'R6 CSS missing feature: '+marker);
assert.equal((style.match(/\{/g)||[]).length,(style.match(/\}/g)||[]).length,'CSS brace balance');
assert.ok(security.includes("referenceMenu=!privatePage&&status===200&&html.includes('<body class="),'Menu styles must be public reference only');
assert.ok(security.includes('reference-menu-morph-r6.css?v=20261123-reference-menu-r6'),'R6 styles must be injected');
assert.ok(security.indexOf('reference-elegance-r5.css')<security.indexOf('reference-menu-morph-r6.css'),'R6 cascade should override R5 menu styles');
for(const marker of [
  "menu.style.setProperty('--vz-menu-origin-x'",
  "menu.style.setProperty('--vz-menu-origin-y'",
  "button.setAttribute('aria-expanded',String(open))",
  "button.setAttribute('aria-label',open?'Close menu':'Open menu')",
  "menu.inert=!open",
  "event.key!=='Escape'",
  "button.focus({preventScroll:true})"
])assert.ok(enhancement.includes(marker),'Menu controller missing: '+marker);
assert.doesNotThrow(()=>new vm.Script(enhancement),'Reference enhancement script parses');
const inline=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
assert.doesNotThrow(()=>new vm.Script(inline),'Reference inline menu/router script parses');
console.log('PASS: reference menu R6, original circular reveal, dual label morph, 14 destinations, keyboard/ARIA and public-only loading.');
