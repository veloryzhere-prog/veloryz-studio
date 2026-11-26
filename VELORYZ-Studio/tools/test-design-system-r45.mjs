/* R45 design-system regression: semantic token integrity, contrast and scope. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('public/veloryz-design-system-r45.css');
const tokens=Object.fromEntries([...css.matchAll(/--vz-ds-([a-z0-9-]+):([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
assert(Object.keys(tokens).length>=30,'Design token foundation incomplete');
const luminance=hex=>{
 const rgb=hex.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const ratio=(a,b)=>{let x=luminance(tokens[a]),y=luminance(tokens[b]);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for(const [fg,bg] of [['ink','paper'],['muted','paper'],['text','surface'],['surface','accent'],['success','success-soft'],['danger','danger-soft'],['muted','soft']]){
 const r=ratio(fg,bg);assert(r>=4.5,fg+' / '+bg+' fails normal-text contrast: '+r.toFixed(2));console.log(fg+' / '+bg+': '+r.toFixed(2)+':1');
}
assert(ratio('control-line','surface')>=3,'Control boundary must contrast with surface');
assert(ratio('focus','surface')>=3,'Focus ring must contrast with surface');
for(const p of ['public/v2-layout-repair.css','public/v2-workspaces.css','public/knowledge-v8.css','public/admin.css','public/client-portal.css','public/veloryz-open-library.css','public/veloryz-design-system-r45.css']){
 const s=read(p);assert.equal((s.match(/\{/g)||[]).length,(s.match(/\}/g)||[]).length,'Unbalanced stylesheet: '+p);
 for(const m of s.matchAll(/var\(--vz-ds-([a-z0-9-]+)/g))assert(m[1] in tokens,'Undefined shared token '+m[1]+' in '+p);
}
for(const p of ['lib/response-security.ts','lib/knowledge-v8.ts','lib/founder-page.ts','app/motion-hub/route.ts'])assert(read(p).includes('/veloryz-design-system-r45.css?v=20261126-r45'),'Missing design system on '+p);
assert(css.includes(':focus-visible')&&css.includes('forced-colors:active')&&css.includes('44px'),'Focus, high contrast and touch size contract');
assert(css.includes('max-width:390px')&&css.includes('max-width:780px'),'Small-screen component rules required');
assert(!/\biframe\s*\{|\bcanvas\s*\{|animation\s*:/i.test(css),'Do not reset source preview or motion rendering');
const shell=read('lib/claude-reference-shell.ts');
const home=JSON.parse(shell.slice(shell.indexOf('export default ')+15).trim().replace(/;$/,''));
assert(home.includes('data-logo-source="official-glb"'),'Original V remains in homepage');
console.log('PASS: R45 design tokens, contrast, first-party route integration and component contracts.');
