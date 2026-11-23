/* Read-only source contract for production QC corrections.
 * This checks actual '/' reference markup; browser screenshots are created by
 * qc-capture-live.mjs in the public visual QC GitHub workflow.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('lib/claude-reference-shell.ts');
const html=JSON.parse(source.slice(source.indexOf('export default ')+15).trim().replace(/;$/,''));
const css=read('public/reference-qc-layout-r7.css');
const response=read('lib/response-security.ts');
const probe=read('tools/qc-capture-live.mjs');
const workflow=read('../.github/workflows/veloryz-public-visual-qc.yml');
assert.ok(html.includes('vz-editorial-r5')&&html.includes('vz-menu-morph'),'QC targets the real public reference homepage');
assert.ok(html.includes('data-logo-source="official-glb"'),'Real V logo must remain');
assert.ok(html.includes('class="vz-3d-controls"'),'Real V controller must remain');
for(const marker of [
 'body.vz-reference-site .vz-material-hero #heroTxt',
 'body.vz-reference-site .vz-material-hero .vz-3d-controls',
 'body.vz-reference-site .vz-material-hero .vz-3d-control-buttons button',
 '@media (min-width:921px)',
 '@media (max-width:920px)',
 '@media (max-width:540px)',
 '@media (max-width:360px)',
 'min-height:44px',
 '.vz-header-create'
])assert.ok(css.includes(marker),'Expected viewport/control fix missing: '+marker);
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'CSS curly braces balanced');
assert.ok(!css.includes('radial-gradient('),'QC must not add prohibited small circle visual decorations');
assert.ok(response.includes("referenceMenu=!privatePage&&status===200"),'Admin/client isolation preserved');
assert.ok(response.includes('const qcAssets=referenceMenu'),'QC CSS must target reference homepage only');
assert.ok(response.includes('/reference-qc-layout-r7.css?v=20261123-layout-qc-r7'),'QC CSS cache-busted');
assert.ok(response.includes("X-VELORYZ-QC-Release"),'R7 detectable on actual live host');
assert.ok(response.includes('silkUiAssets+editorialAssets+menuAssets+qcAssets'),'QC CSS has final precedence');
for(const marker of [
  "name:'desktop',width:1440,height:900",
  "name:'tablet',width:768,height:1024",
  "name:'mobile',width:390,height:844",
  "name:'small-mobile',width:320,height:700",
  "name:'home',path:'/'",
  "name:'help-ai',path:'/help/assistant/'",
  "name:'client-login',path:'/client/'",
  "row.issues.push('Horizontal overflow:",
  "row.issues.push('Header brand overlaps",
  "row.issues.push('Headline intersects 3D",
  "row.issues.push('Escape failed",
  "qc-report.md",
  "qc-results.json",
  "fullPage:false"
])assert.ok(probe.includes(marker.replace("fullPage:false","animations:'disabled'")),'QC capture missing: '+marker);
assert.ok(workflow.includes('uses: actions/upload-artifact@v4'),'Screenshots must be accessible as an artifact');
assert.ok(workflow.includes('run: node tools/test-reference-qc-r7.mjs'),'Run contract before browser installation');
assert.ok(workflow.includes('QC_SITE_URL: https://veloryz.online'),'Capture the actual public origin');
console.log('PASS: live-reference R7 layout guardrails, existing assets, private isolation and screenshot capture contract');
