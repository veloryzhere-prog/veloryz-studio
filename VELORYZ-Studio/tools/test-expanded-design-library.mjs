import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const file=path=>readFileSync(resolve(root,path),'utf8');
const sources=JSON.parse(file('public/veloryz-open-designs.json'));
const original=sources.originals,external=sources.items,all=[...original,...external];
const assertContains=(source,fragment,label)=>assert.ok(source.includes(fragment),label||'Missing: '+fragment);

assert.equal(external.length,110,'All 110 source records must be present');
assert.equal(original.length,12,'All 12 original VELORYZ templates must be present');
assert.equal(new Set(all.map(p=>p.id)).size,all.length,'Every design needs its own unique path');
assert.equal(new Set(external.map(p=>p.category)).size,16,'Keep the full niche taxonomy');

for(const p of all){
 assert.match(p.id,/^[a-z0-9-]+$/,'Invalid design slug: '+p.id);
 assert.ok(p.name&&p.category&&p.description&&p.license&&p.author,p.id+' needs provenance metadata');
 assert.ok(['original','candidate','review','restricted'].includes(p.rights),p.id+' lacks review state');
 assert.ok(['catalogued','original'].includes(p.importStatus),p.id+' needs an honest import status');
 if(p.source)assert.match(p.source,/^https:\/\//,p.id+' must use HTTPS source link');
 if(p.rights==='original')assert.ok(p.originalTemplateId,'An original template requires a real source-build path');
 if(p.rights==='restricted')assert.notEqual(p.importStatus,'original','A restricted source cannot be presented as first-party code');
}
const listing=file('public/veloryz-open-library.js');
const detail=file('public/veloryz-design-preview.js');
const renderer=file('lib/design-detail-page.ts');
const handler=file('lib/page-handler.ts');
const shell=file('lib/site-shell.ts');
const creator=file('public/creator-v4.js');
const css=file('public/veloryz-design-preview.css');
const galleryCss=file('public/veloryz-open-library.css');

assertContains(listing,"window.designPage=render",'Design gallery must register with the SPA');
assertContains(listing,"'/design/'+encodeURIComponent(p.id)+'/'",'Gallery must open first-party details');
assertContains(listing,'previewType','Source preview metadata must survive client-side rendering');
assertContains(listing,"createUrl=p=>p.originalTemplateId",'Original products should lead to their source-template creator');
assertContains(listing,"['original','Original VELORYZ",'First-party products need an explicit filter');
assertContains(renderer,"findDesignPreview",'The server must resolve nested design URLs');
assertContains(renderer,"originalTemplateId",'Source-built original demos must have identifiers');
assertContains(handler,"const designMatch=path.match",'Direct navigation needs a real server route');
assertContains(handler,"renderDesignPreview(design)",'Render server HTML on direct navigation');
assertContains(handler,"serialise([...openDesigns.originals,...openDesigns.items])",'Direct creator links require a hydrated catalogue');
assertContains(detail,"'/template-previews/'+encodeURIComponent(p.originalTemplateId)",'Original demos must remain same origin');
assertContains(detail,"Made with",'The local preview must carry studio branding');
assertContains(creator,"window.createPage=creatorPage",'Creator global registration must avoid strict assignment');
assertContains(creator,"'/design/'+encodeURIComponent(p.id)+'/'",'Creator inspiration gallery must use local previews');
assertContains(shell,'/veloryz-open-library.js','Live app shell must include the new gallery');
assertContains(css,'prefers-reduced-motion','Preview must respect reduced-motion settings');
assertContains(galleryCss,'prefers-reduced-motion','Gallery must respect reduced-motion settings');
assert.ok(!/iframe[^>]+https?:\/\//i.test(renderer),'Never iframe untrusted upstream websites');
assert.ok(!/iframe[^>]+https?:\/\//i.test(detail),'Never iframe untrusted upstream websites');
const scripts=['public/veloryz-open-library.js','public/veloryz-design-preview.js','public/creator-v4.js'];
for(const path of scripts){
 const source=file(path);
 try{new Function(source)}catch(e){throw new Error(path+' has invalid browser JS: '+e.message)}
}
console.log('VELORYZ design library verified: 110 researched sources + 12 original templates, unique local routes, creator handoff, credits and reduced motion.');
