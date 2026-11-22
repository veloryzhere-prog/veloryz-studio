/* VELORYZ Studio Control — detailed native admin regression checks */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import defaults from '../lib/defaults.json' with {type:'json'};
const read=x=>fs.readFileSync(new URL('../'+x,import.meta.url),'utf8');
const shell=read('lib/admin-shell.ts');
const core=read('public/admin.js');
const helper=read('public/admin-detail.js');
const styles=read('public/admin-detail.css');
const title='Studio Control — VELORYZ';
assert.match(shell,/Studio Control/);
assert.ok(shell.includes('/admin-detail.js')&&shell.includes('/admin-detail.css'),'Owner shell must load new detailed admin layers.');
assert.ok(shell.indexOf('/admin-detail.js')<shell.indexOf('/admin.js'),'Admin detail module must be ready before the native admin router.');
assert.doesNotThrow(()=>new vm.Script(core),'Existing protected admin app must still parse.');
assert.doesNotThrow(()=>new vm.Script(helper),'Admin details JS must parse.');
assert.ok(core.includes('function passwordUnlock')||shell.includes('owner-login.js'),'Owner authentication must remain.');
assert.match(core,/data-action="nav-search"/,'Search trigger must be visible in owner toolbar.');
assert.match(core,/function aiMindsetPage\(\)/,'AI Mindset must be an actual admin route.');
assert.match(core,/aiMindsetPage/,'AI Mindset must be routed by main admin renderer.');
assert.match(core,/site\.'\+id\+'Brief'/,'AI Mindset must edit existing published adviser fields, not inert controls.');
assert.match(core,/window\.VeloryzAdminDetail\?\.operations/,'Command center must include real operating counters.');
assert.match(core,/window\.VeloryzAdminDetail\?\.overview/,'Dashboard must include a source-backed publication checklist.');

assert.match(core,/let enquiryItems=\[\],enquiryTotal=0,[^;]*enquiryLoaded=false/,'Admin must declare the singular enquiryLoaded state.');
assert.match(core,/sidebar\(section,navigation,workspace,icon,E,\{enquiriesLoaded:typeof enquiryLoaded!=='undefined'&&enquiryLoaded,/,'Pass existing admin state defensively and avoid ReferenceErrors.');
assert.doesNotMatch(core,/\{enquiriesLoaded,enquiryTotal,/,'Never pass undeclared enquiriesLoaded shorthand: this used to crash Studio Control.');
assert.match(core,/function safeRender\(\)/,'Recover the owner console from isolated rendering exceptions.');
assert.match(core,/typeof clientPortalAdmin==='function'/,'Do not eagerly evaluate optional client management globals.');
assert.match(core,/typeof knowledgeAiAdmin==='function'/,'Do not blank dashboard when standalone knowledge agent module fails to load.');
assert.match(core,/enquiriesLoaded:typeof enquiryLoaded/,'Sidebar must avoid undefined state variables.');

assert.match(core,/window\.VeloryzAdminDetail\?\.mediaHeader/,'Media Library must show actual data and filters.');
assert.match(core,/if\(action==='reload-media'\)/,'Refresh action must reload stored media.');
assert.match(core,/preload="none" muted aria-label="Preview/,'Video assets need on-demand browser playback previews.');
assert.match(core,/event\.ctrlKey\|\|event\.metaKey/,'Admin console finder must support keyboard shortcuts.');
assert.match(core,/saveDraft\(\)/,'Existing protected draft update remains.');
assert.match(core,/async function publish\(\)/,'Existing protected publication remains.');
assert.match(core,/function healthPage\(\)/,'Read-only System Diagnostics must have a real admin page.');
assert.match(core,/async function runAdminDiagnostics\(\)/,'Diagnostics must call real deployed endpoints.');
assert.match(core,/api\('\/api\/health'\)/,'Diagnostics must check the real backend health route.');
assert.match(core,/\/assets\/frame-cut\/reveal\.mp4/,'Check the already-in-repository logo movie.');
assert.match(core,/\/assets\/brand\/intro\/veloryz-cinematic-full\.mp4/,'Check optional custom motion asset.');
assert.match(core,/api\('\/api\/admin\/media'/,'Real owner media API remains.');
assert.match(core,/if\(action==='enquiry-save'\)/,'Private project-request actions remain.');
assert.match(core,/if\(action==='confirm-action'\|\|action==='confirm-publish'\)/,'Existing confirmation dialogs remain.');
assert.match(styles,/@media\(max-width:650px\)/,'Mobile admin layouts must be accounted for.');
assert.match(styles,/prefers-reduced-motion/,'Reduced-motion accessibility must be honored.');
assert.equal((styles.match(/\{/g)||[]).length,(styles.match(/\}/g)||[]).length,'Stylesheet block braces must balance.');
assert.ok(!/http:\/\/[^\s"']+\.js/.test(shell),'Admin resources must stay same-origin.');
const listeners={};
const sandbox={
 window:{},
 document:{addEventListener(type,fn){listeners[type]=fn;},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},
 console,requestAnimationFrame:(cb)=>cb(),location:{hash:'#/overview'}
};
vm.runInNewContext(helper,sandbox,{timeout:2000});
const detail=sandbox.window.VeloryzAdminDetail;
assert.ok(detail&&detail.sidebar&&detail.openSearch&&detail.insights&&detail.operations&&detail.overview&&detail.mediaHeader);
const routes=['overview','reviews','ai-control','command','projects','enquiries','client-portal','catalogue','platform','payments','content','documentation','knowledge-ai','ai-mindset','offers','branding' ,'media','history','health','settings'];
const labels={
 overview:'Overview',reviews:'Community Reviews','ai-control':'AI Control Centre',command:'Command center',projects:'Projects & work',enquiries:'Project console',
 'client-portal':'Client management',catalogue:'Design catalogue',platform:'Platform pages',
 payments:'Payment requests',content:'Site content',documentation:'Documentation','knowledge-ai':'AI Management',
 'ai-mindset':'AI Mindset',offers:'Broadcasts & ads',branding:'Brand & logos',media:'Media library',history:'Version history',health:'System diagnostics',settings:'Studio settings'
};
const nav=routes.map(id=>[id,labels[id],'grid']);
const workspace={state:structuredClone(defaults),dirty:false,hasDraft:false,publishedVersion:5};
const E=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const icon=()=>'<svg aria-hidden="true"></svg>';
const sidebar=detail.sidebar('media',nav,workspace,icon,E,{mediaLoaded:true,mediaCount:7,enquiriesLoaded:true,enquiryTotal:3,clientsLoaded:true,clientCount:2});
for(const route of routes)assert.ok(sidebar.includes('href="#/'+route+'"'),'Missing accessible admin destination '+route);
assert.match(sidebar,/aria-current="page"/);
assert.match(sidebar,/Filter administration consoles/);
assert.match(sidebar,/v5/,'Published version must be sourced from current state.');
assert.ok(!sidebar.includes('PRIVATE_DO_NOT_SHARE'),'Owner panel must not inject client secrets into sidebar.');
for(const route of routes){
 const insight=detail.insights(route,workspace,nav,E);
 assert.ok(insight.includes('How this console works'),'Guide missing for '+route);
 assert.ok(insight.includes('ad-console-link'),'Related real admin routes missing for '+route);
}
const operations=detail.operations(workspace,icon,E);
assert.ok(operations.includes('Portfolio projects')&&operations.includes('Active campaigns')&&operations.includes('Featured projects'));
assert.ok(operations.includes('href="#/ai-control"')&&operations.includes('href="#/reviews"'));
assert.match(shell,/admin-community\.js/);
assert.match(shell,/admin-ai-control\.js/);
assert.match(core,/adminReviewPage/);
assert.match(core,/aiControlPage/);
assert.ok(detail.overview(workspace,icon,E).includes('Essential checks'));
const media=detail.mediaHeader([{mime:'image/png',size:1048576},{mime:'video/mp4',size:2097152}],true,E);
assert.ok(media.includes('Stored assets')&&media.includes('3.0 MB'));
assert.ok(media.includes('id="ad-media-query"')&&media.includes('id="ad-media-type"'));
assert.ok(media.includes('Refresh library'));
let shown=null;
detail.openSearch((...args)=>{shown=args;},nav,E);
assert.ok(shown&&shown[0]==='Go to a console');
assert.ok(shown[2].includes('data-ad-destination="ai-mindset"'));
assert.ok(shown[2].includes('data-ad-palette-search'));
assert.ok(!shown[2].includes('api/admin/'),'Search list must expose only UI routes, not secret API paths.');
console.log('PASS: all 20 consoles, dedicated five-persona AI Mindset, native project/media actions, command search, owner privacy, grounded metrics, mobile and reduced-motion styles.');
