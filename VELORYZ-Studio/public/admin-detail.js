/* VELORYZ Studio Control — detailed administration experience.
 * Presentation helpers only. Existing owner authentication, CMS validation,
 * storage, drafts, publishing and private client APIs remain the source of truth. */
(()=>{
'use strict';
const GROUPS=[
 {title:'Operations',caption:'01 / KEEP THE STUDIO MOVING',items:['overview','reviews','command','enquiries','client-portal','payments']},
 {title:'Creative production',caption:'02 / MAKE & PUBLISH',items:['projects','catalogue','content','branding','media','offers']},
 {title:'Studio intelligence',caption:'03 / AI & KNOWLEDGE',items:['ai-control','ai-mindset','knowledge-ai','platform','documentation']},
 {title:'Governance',caption:'04 / SYSTEMS & HISTORY',items:['history','health','settings']}
];
const META={
 reviews:{group:'OPERATIONS',eyebrow:'COMMUNITY MODERATION',description:'See genuine visitor feedback in one place, review incoming submissions, and approve or hide individual reviews without leaving Studio Control.',steps:['Open Needs review to see pending feedback.','Approve to make a genuine review visible publicly, or reject spam and sensitive data.','Use View public reviews to verify only approved content appears; these actions are immediate and separate from CMS publishing.'],related:[['ai-control','AI Control Centre'],['content','Site content']]},
 'ai-control':{group:'INTELLIGENCE',eyebrow:'UNIFIED AI OPERATIONS',description:'Manage independent help agents, the five public adviser specialties, and global provider configuration in one connected interface.',steps:['Choose the Assistants, Advisers or Provider tab.','Save agent settings securely, or save and publish adviser CMS briefs as directed.','Run the live provider test to verify actual model responses.'],related:[['knowledge-ai','Separate agents'],['ai-mindset','Adviser briefs']]},
 overview:{group:'OPERATIONS',eyebrow:'STUDIO PULSE',description:'Monitor the published content and current creative workload, then jump into the relevant editor.',steps:['Review the current published revision and outstanding draft work.','Check which projects and campaigns are ready for visitors.','Open the relevant console, make changes and publish deliberately.'],related:[['command','Command center'],['enquiries','New requests']]},
 command:{group:'OPERATIONS',eyebrow:'CENTRAL CONTROL',description:'Manage homepage visibility, campaigns, AI adviser specialties and the publishing workflow from one desk.',steps:['Choose the section or action you want to manage.','Edit the current draft and use Save draft; this does not update the live site.','Review Preview draft and Publish site when ready.'],related:[['media','Media library'],['ai-mindset','AI Mindset']]},
 enquiries:{group:'OPERATIONS',eyebrow:'PROJECT REQUEST INBOX',description:'Review incoming project briefs, contact preferences and follow-up status in the owner-only console.',steps:['Open a request and review its details carefully.','Update the internal status or notes.','Contact the customer through your approved channel; changing the status does not send a message.'],related:[['client-portal','Client management'],['payments','Payments']]},
 'client-portal':{group:'OPERATIONS',eyebrow:'PRIVATE WORKSPACE CONTROL',description:'Manage client workspaces, milestones, approvals, deliverables and client invitations using protected APIs.',steps:['Create or select a client project workspace.','Keep phases, deadlines and private deliverables accurate.','Issue access only through the authorized Client Portal workflow; project references are not invitation codes.'],related:[['enquiries','Project console'],['payments','Payment requests']]},
 payments:{group:'OPERATIONS',eyebrow:'PAYMENT REQUESTS',description:'Review payment discussions and the requests received; only provider-confirmed records should be treated as paid.',steps:['Open a request and verify its actual record.','Use approved hosted payment links and the existing payment controls.','Never infer a successful charge from a draft, chat message or inquiry.'],related:[['client-portal','Client management'],['settings','Studio settings']]},
 projects:{group:'PRODUCTION',eyebrow:'PORTFOLIO WORKSPACE',description:'Manage portfolio entries, featured work, case studies, cover media, video and homepage order.',steps:['Create or edit a project with accurate text and owned media.','Decide whether the project is public and featured.','Save, preview and publish changes for visitors to see them.'],related:[['media','Select images & videos'],['catalogue','Design catalogue']]},
 catalogue:{group:'PRODUCTION',eyebrow:'DESIGN LIBRARY',description:'Manage design listings and published starting estimates without implying an unconfirmed fixed price.',steps:['Check that each design entry is complete and correctly licensed.','Confirm the starting price, scope and enabled visibility.','Preview the public design catalogue before publishing.'],related:[['media','Media library'],['projects','Studio projects']]},
 content:{group:'PRODUCTION',eyebrow:'WEBSITE EDITOR',description:'Edit the public homepage, studio story, services, team details and the footer letter.',steps:['Choose the content tab and edit the source fields.','Use Save draft and Preview draft to check the page.','Publish the content revision when approved.'],related:[['branding','Brand assets'],['documentation','Documentation']]},
 branding:{group:'PRODUCTION',eyebrow:'BRAND SYSTEM',description:'Manage official logo slots independently while preserving the original sculptural V asset when no replacement is selected.',steps:['Select a logo placement: header, footer, hero, product or favicon.','Choose an existing uploaded image or use the original.','Preview the result across screen sizes before publishing.'],related:[['media','Asset library'],['content','Page content']]},
 media:{group:'PRODUCTION',eyebrow:'ASSET LIBRARY',description:'Upload, inspect, copy and reuse images and short videos across projects, showcases, campaigns and branding.',steps:['Upload a supported file and confirm storage succeeded.','Open or copy its URL, or select it from a project or campaign field.','Save and publish the referencing content; uploaded media alone is not automatically shown on the public website.'],related:[['projects','Project visuals'],['branding','Logos & identity']]},
 offers:{group:'PRODUCTION',eyebrow:'CAMPAIGN CONTROL',description:'Create, schedule, pause and position announcements, sliding advertisements and pinned messages.',steps:['Choose announcement, advertisement or offer and select its placement.','Set media, links, schedule and visibility with a clear objective.','Save the draft and preview the actual placement before publishing.'],related:[['media','Campaign media'],['command','Homepage controls']]},
 'ai-mindset':{group:'INTELLIGENCE',eyebrow:'PERSONA MINDSET LAB',description:'Edit the five public adviser specialties, inspect each role and navigate to the separate provider and help-agent settings.',steps:['Choose an adviser and edit the visible specialty brief.','Save and publish the content so future model prompts use the new brief.','Use Provider connections for model settings and AI Management for the four separate help agents.'],related:[['knowledge-ai','Help AI management'],['platform','Provider connections']]},
 'knowledge-ai':{group:'INTELLIGENCE',eyebrow:'FOUR INDEPENDENT AGENTS',description:'Manage Help Centre, Support, Client Guide and Creator assistant settings separately, including providers and test responses.',steps:['Select the assistant role and inspect its current connection status.','Edit instructions, model or a new key in the protected form.','Save securely and run Test actual reply; offline references do not prove live model access.'],related:[['ai-mindset','Character advisers'],['documentation','Knowledge sources']]},
 platform:{group:'INTELLIGENCE',eyebrow:'MODELS & PLATFORM',description:'Maintain the studio-wide provider connection, real AI reply test and the public platform content.',steps:['Verify the studio provider and model settings.','Run the live connection test rather than assuming the key works.','Save credential changes securely; never put keys in published CMS content.'],related:[['ai-mindset','Persona specialties'],['knowledge-ai','Independent agents']]},
 documentation:{group:'INTELLIGENCE',eyebrow:'PUBLISHED KNOWLEDGE',description:'Manage public documentation navigation, article content and service help so visitors and source-grounded AI can find accurate answers.',steps:['Review public article accuracy and distinguish planned features from live features.','Edit documented content using the current CMS tools.','Save and publish to make editorial updates available publicly.'],related:[['knowledge-ai','AI Management'],['content','Site content']]},
 history:{group:'GOVERNANCE',eyebrow:'CHANGE HISTORY',description:'Review previously published site revisions and restore an earlier copy into a draft.',steps:['Review revision summaries and dates.','Restore to a draft only after checking the impact.','Preview and publish explicitly; restoring a draft does not instantly overwrite the live website.'],related:[['overview','Studio overview'],['command','Publish controls']]},
 health:{group:'GOVERNANCE',eyebrow:'LIVE DIAGNOSTICS',description:'Check real same-origin backend responses, media storage, configured AI provider and playable MP4 delivery without changing any data.',steps:['Run diagnostics to request current results from the protected website backend.','Distinguish a configured API key from a verified live model response.','Use results to investigate hosting or media problems; a successful source-code build is not proof of live deployment.'],related:[['media','Media library'],['platform','AI connections']]},
 settings:{group:'GOVERNANCE',eyebrow:'STUDIO CONFIGURATION',description:'Configure public contact details, consultation settings, branding accents and project-creation estimate assumptions.',steps:['Update the relevant setting and check validation hints.','Save your draft and preview the public-facing values.','Publish when approved. Code deployments and hosting updates are separate from CMS publishing.'],related:[['content','Public copy'],['history','Version history']]}
};
const navMap=arr=>new Map(arr.map(x=>[x[0],x]));
function sectionLinks(entries,nav,E){
 const map=navMap(nav);
 return entries.filter(([id])=>map.has(id)).map(([id,label])=>
  '<a href="#/'+E(id)+'" class="ad-console-link"><span>'+E(label)+'</span><span aria-hidden="true">↗</span></a>').join('');
}
function sidebar(section,navigation,workspace,icon,E,counts={}){
 const map=navMap(navigation);
 const version=Number(workspace?.publishedVersion||0);
 const freshness=workspace?.dirty?'Unsaved edits':workspace?.hasDraft?'Saved draft pending':'Published content in sync';
 const navigationGroups=GROUPS.map(g=>{
  const items=g.items.filter(id=>map.has(id));
  return '<section class="ad-nav-group" data-ad-nav-group><div class="ad-nav-group-label">'+E(g.caption)+'</div>'+
   '<nav class="admin-nav" aria-label="'+E(g.title)+'">'+items.map(id=>{
     const [key,label,ico]=map.get(id),active=section===id;
     const badge=id==='projects'?workspace.state.projects?.length:
        id==='enquiries'&&counts.enquiriesLoaded?counts.enquiryTotal:
        id==='media'&&counts.mediaLoaded?counts.mediaCount:
        id==='client-portal'&&counts.clientsLoaded?counts.clientCount:null;
     return '<a href="#/'+E(key)+'" data-ad-nav-item data-ad-search="'+E(label+' '+(META[key]?.description||''))+'" class="'+(active?'active':'')+'" '+(active?'aria-current="page"':'')+'>'+
       icon(ico)+'<span class="ad-nav-link-text">'+E(label)+'</span>'+(badge!==null&&badge!==undefined?'<span class="nav-count">'+E(String(badge))+'</span>':'')+
       (active?'<span class="ad-active-pip" aria-hidden="true"></span>':'')+'</a>';
   }).join('')+'</nav></section>';
 }).join('');
 return '<aside class="sidebar ad-sidebar" aria-label="Studio administration">'+
  '<a href="#/overview" class="admin-brand ad-brand"><img class="ad-brand-logo" src="/assets/brand/official/Main-Transparent.webp" alt="VELORYZ"><span class="ad-brand-caption">STUDIO / PRIVATE CONTROL</span></a>'+
  '<div class="ad-sidebar-search"><label for="ad-nav-search" class="ad-sr-only">Filter administration consoles</label>'+
   icon('search')+'<input id="ad-nav-search" data-ad-nav-input type="search" autocomplete="off" spellcheck="false" placeholder="Find a console…" aria-label="Find an admin console"><kbd>/</kbd></div>'+
  '<div class="ad-side-scroll">'+navigationGroups+'</div>'+
  '<div class="sidebar-bottom ad-sidebar-bottom"><div class="ad-sidebar-status" aria-label="Content publication status"><span class="ad-state-point '+(workspace.dirty?'is-dirty':workspace.hasDraft?'is-draft':'is-current')+'"></span><div><strong>'+E(freshness)+'</strong><small>Public revision v'+version+'</small></div><a href="#/history" aria-label="Open revision history">↗</a></div>'+
  '<div class="sidebar-user"><div class="avatar" aria-hidden="true">V</div><div><strong>Studio Control</strong><span>Authorized owner workspace</span></div><button data-platform="lock" aria-label="Lock workspace and sign out" class="icon-button">'+icon('logout')+'</button></div></div>'+
 '</aside><div class="admin-mobile-overlay" data-action="close-menu"></div>';
}
function insights(section,workspace,navigation,E){
 const m=META[section];if(!m)return '';
 const refs=sectionLinks(m.related,navigation,E);
 return '<section class="ad-section-insights" aria-label="About this workspace">'+
  '<div class="ad-insight-main"><span class="ad-insight-eyebrow">'+E(m.group)+' / '+E(m.eyebrow)+'</span>'+
    '<p>'+E(m.description)+'</p></div>'+
  '<div class="ad-insight-links">'+refs+'</div>'+
  '<details class="ad-howto"><summary>How this console works <span aria-hidden="true">＋</span></summary>'+
    '<ol>'+m.steps.map(x=>'<li>'+E(x)+'</li>').join('')+'</ol></details></section>';
}
function numericCard(value,label,caption,id,E){
 return '<a class="ad-stat" href="#/'+E(id)+'"><span class="ad-stat-label">'+E(label)+'</span><strong>'+E(String(value))+'</strong><small>'+E(caption)+'</small><span class="ad-stat-link" aria-hidden="true">↗</span></a>';
}
function operations(workspace,icon,E){
 const s=workspace.state||{},projects=s.projects||[],offers=s.offers||[],designs=s.catalogue||[];
 const featured=projects.filter(p=>p.published&&p.featured).length,now=Date.now();
 const running=offers.filter(o=>o.enabled&&(!o.startAt||Date.parse(o.startAt)<=now)&&(!o.endAt||Date.parse(o.endAt)>now)).length;
 const catalogue=designs.filter(x=>x.enabled).length;
 const stage=workspace.dirty?'Unsaved changes':workspace.hasDraft?'Draft saved · review required':'No pending draft';
 return '<section class="ad-command-overview" aria-label="Operations overview">'+
  '<div class="ad-command-title"><div><span class="ad-kicker">VELORYZ OPERATIONS / CURRENT WORKSPACE</span><h2>Everything at your command.</h2><p>Real figures from your current studio draft. Private requests, platform connections and customer payments remain in their own authenticated consoles.</p></div>'+
  '<div class="ad-command-revision"><span>PUBLIC CONTENT REVISION</span><strong>v'+E(String(workspace.publishedVersion||0))+'</strong><small>'+E(stage)+'</small></div></div>'+
  '<div class="ad-stat-grid">'+
   numericCard(projects.length,'Portfolio projects','All entries','projects',E)+
   numericCard(featured,'Featured projects','Public homepage selections','projects',E)+
   numericCard(running,'Active campaigns','Currently scheduled and enabled','offers',E)+
   numericCard(catalogue,'Enabled designs','Published draft catalogue entries','catalogue',E)+'</div>'+
  '<div class="ad-ops-actions"><a href="#/enquiries"><span>'+icon('content')+'</span><strong>Review requests</strong><small>Briefs & follow-ups</small><b>↗</b></a>'+
  '<a href="#/client-portal"><span>'+icon('work')+'</span><strong>Client operations</strong><small>Projects & milestones</small><b>↗</b></a>'+
  '<a href="#/ai-control"><span>'+icon('settings')+'</span><strong>AI Control Centre</strong><small>Manage five advisers + four assistants</small><b>↗</b></a>'+
  '<a href="#/media"><span>'+icon('media')+'</span><strong>Asset production</strong><small>Photos, logo files & films</small><b>↗</b></a></div></section>';
}
function overview(workspace,icon,E){
 const s=workspace.state||{},checks=[
  ['Studio identity',Boolean(s.site?.name&&s.site?.description),'content','Public heading and introduction'],
  ['Public projects',(s.projects||[]).some(p=>p.published),'projects','At least one public portfolio entry'],
  ['Visitor contact',Boolean(s.site?.email&&s.site?.phone),'settings','Published contact email and phone'],
  ['Project creator',true,'enquiries','Use the request console to review real submissions']
 ];
 const complete=checks.filter(x=>x[1]).length;
 return '<section class="ad-overview-checklist" aria-label="Studio publication checklist"><div class="ad-check-header"><div><span class="ad-kicker">PUBLIC SITE READINESS</span><h2>Make the important things easy to find.</h2><p>These checks reflect content fields in this workspace, not a live hosting or payment-system audit.</p></div><div class="ad-check-score"><strong>'+complete+' / '+checks.length+'</strong><span>Essential checks</span></div></div>'+
  '<div class="ad-check-grid">'+checks.map(([title,ok,path,description])=>
  '<a href="#/'+E(path)+'"><span class="ad-check-symbol '+(ok?'is-ready':'is-review')+'">'+(ok?'✓':'!')+'</span><div><strong>'+E(title)+'</strong><small>'+E(description)+'</small></div><span aria-hidden="true">↗</span></a>').join('')+'</div></section>';
}
function mediaHeader(items,loaded,E){
 const image=loaded?items.filter(m=>String(m.mime||'').startsWith('image/')).length:0;
 const video=loaded?items.filter(m=>String(m.mime||'').startsWith('video/')).length:0;
 const size=loaded?items.reduce((n,m)=>n+Math.max(0,Number(m.size)||0),0):0;
 const total=loaded?items.length:'—',mb=loaded?(size/1048576).toFixed(1)+' MB':'—';
 return '<section class="ad-media-console" aria-label="Media library controls">'+
  '<div class="ad-media-stat-row"><div><strong>'+E(String(total))+'</strong><span>Stored assets</span></div><div><strong>'+E(loaded?String(image):'—')+'</strong><span>Images</span></div>'+
  '<div><strong>'+E(loaded?String(video):'—')+'</strong><span>Videos</span></div><div><strong>'+E(mb)+'</strong><span>Reported total size</span></div></div>'+
  '<div class="ad-media-tools"><label class="ad-media-search"><span class="ad-sr-only">Search stored media by file name</span><input type="search" id="ad-media-query" placeholder="Search by file name…" autocomplete="off" aria-label="Search media files"></label>'+
  '<label class="ad-media-type"><span class="ad-sr-only">Media type</span><select id="ad-media-type" aria-label="Filter media type"><option value="all">All media</option><option value="image">Images</option><option value="video">Videos</option></select></label>'+
  '<button type="button" class="admin-button secondary" data-action="reload-media">Refresh library</button></div>'+
  '<p class="ad-media-info">Uploads are saved to media storage immediately. To display one publicly, assign it to a project, campaign or brand field, then save your draft and publish. Browser MP4/WebM playback depends on video encoding and hosting delivery.</p></section>';
}
function openSearch(showModal,navigation,E){
 const items=navigation.map(([id,label,ico])=>({id,label,summary:META[id]?.description||''}));
 showModal('Go to a console','Search existing VELORYZ administration workspaces, then jump directly into the real tool.', 
 '<div class="ad-search-dialog"><label for="ad-console-query">Find by name or task</label><input id="ad-console-query" data-ad-palette-search type="search" autocomplete="off" placeholder="Try media, invoice, AI, project, branding…" aria-label="Search admin tools">'+
 '<div class="ad-search-results" aria-label="Search results">'+items.map(x=>
  '<button type="button" data-ad-destination="'+E(x.id)+'" data-ad-palette-item data-ad-search="'+E(x.label+' '+x.summary)+'"><span><strong>'+E(x.label)+'</strong><small>'+E(x.summary)+'</small></span><span aria-hidden="true">↗</span></button>').join('')+'</div>'+
 '<p class="ad-search-empty" hidden>No matching console. Try a shorter search.</p><p class="ad-search-help">Tip: Ctrl/⌘ + K opens this panel from anywhere in Studio Control.</p></div>',
 '<button type="button" class="admin-button secondary" data-action="close-modal">Close</button>','medium');
 requestAnimationFrame(()=>document.getElementById('ad-console-query')?.focus({preventScroll:true}));
}
function filter(container,input,selector,emptySelector){
 if(!container||!input)return;
 const q=String(input.value||'').trim().toLocaleLowerCase();
 const rows=[...container.querySelectorAll(selector)];
 let shown=0;
 for(const row of rows){const match=String(row.dataset.adSearch||row.textContent||'').toLocaleLowerCase().includes(q);row.hidden=!match;if(match)shown++;}
 if(emptySelector){const empty=container.querySelector(emptySelector);if(empty)empty.hidden=shown!==0;}
 return shown;
}
function filterMedia(){
 const q=String(document.getElementById('ad-media-query')?.value||'').trim().toLowerCase();
 const type=document.getElementById('ad-media-type')?.value||'all';
 for(const card of document.querySelectorAll('.media-grid > .media-card,.media-grid > .media-picker-button')){
  const value=String(card.querySelector('.media-card-info strong')?.textContent||'').toLowerCase();
  const mediaType=card.querySelector('.media-card-info small')?.textContent?.toLowerCase()||'';
  card.hidden=Boolean(q&&!value.includes(q))||(type!=='all'&&!mediaType.startsWith(type));
 }
}
document.addEventListener('input',event=>{
 const target=event.target;
 if(target.matches('[data-ad-nav-input]')){
  const root=target.closest('.ad-sidebar');
  filter(root,target,'[data-ad-nav-item]');
  root?.querySelectorAll('[data-ad-nav-group]').forEach(g=>{g.hidden=![...g.querySelectorAll('[data-ad-nav-item]')].some(x=>!x.hidden);});
 }
 if(target.matches('[data-ad-palette-search]')){
  filter(target.closest('.ad-search-dialog'),target,'[data-ad-palette-item]','.ad-search-empty');
 }
 if(target.id==='ad-media-query')filterMedia();
});
document.addEventListener('change',event=>{if(event.target.id==='ad-media-type')filterMedia();});
document.addEventListener('click',event=>{
 const link=event.target.closest('[data-ad-destination]');
 if(!link)return;
 const dest=link.dataset.adDestination;if(!META[dest])return;
 if(document.querySelector('.admin-modal')&&typeof closeModal==='function')closeModal();
 location.hash='#/'+dest;
});
window.VeloryzAdminDetail={sidebar,insights,operations,overview,mediaHeader,openSearch,meta:META,groups:GROUPS};
})();
