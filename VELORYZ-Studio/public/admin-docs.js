/* R51.10 — owner documentation console, renderer-aligned source and existing CMS overrides. */
(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=p=>String(p||'').replace(/\/index\.html$/,'').replace(/\.html$/,'').replace(/\/+$/,'')||'/';
const editKey=p=>norm(p);
function effective(source,edit={}){
 return {...source,title:edit.title||source.title,summary:edit.summary||source.summary,markdown:edit.markdown||source.markdown,status:edit.status||source.status,visible:edit.visible!==false};
}
function select(items,edits,q,category,filter){
 q=q.trim().toLowerCase();
 return items.filter(a=>{const change=edits[editKey(a.path)],v=effective(a,change);return (category==='all'||a.category===category)&&(!q||[v.title,v.summary,a.id,a.path,a.category].some(x=>String(x||'').toLowerCase().includes(q)))&&(filter==='all'||filter==='edited'&&!!change||filter==='hidden'&&!v.visible||filter==='review'&&v.status==='draft'||filter==='source'&&!change);});
}
function draftIssues(a){
 const out=[];
 if(!String(a.title||'').trim())out.push('Missing title');
 if(!String(a.summary||'').trim())out.push('Missing summary');
 if(!String(a.markdown||'').trim())out.push('Missing body');
 if(String(a.title||'').length>160)out.push('Title exceeds 160 characters');
 if(String(a.summary||'').length>900)out.push('Summary exceeds 900 characters');
 if(String(a.markdown||'').length>25000)out.push('Body exceeds 25,000 characters');
 return out;
}
function linkTargets(markdown,origin){
 const publicPath=/^\/(?:docs|help\/studio)(?:\/[a-z0-9-]+)*(?:\.html|\/)?$/i;
 const common=new Set(['/','/create','/book','/contact','/support','/help/assistant','/report-bug','/design','/designs','/pricing','/work','/studio','/motion','/motion-hub','/journey','/process','/services','/developers','/privacy','/cookies','/terms','/privacy/choices','/payments','/sitemap','/sitemap.xml','/trust','/reviews','/roadmap','/legal/design-notices','/veloryz','/velori','/teamjob']);
 const local=new Set(),other=new Set();
 let fenced=false;
 for(const line of String(markdown||'').split(/\r?\n/)){
  if(/^\s*(?:~~~|\x60\x60\x60)/.test(line)){fenced=!fenced;continue;}if(fenced)continue;
  for(const m of line.matchAll(/\[[^\]\n]+\]\(([^\s)]+)\)/g)){
   const value=m[1];if(value.startsWith('#')){other.add(value);continue;}
   try{const u=new URL(value,origin);
    if(u.origin===origin&&(value.startsWith('/')&&!value.startsWith('//')||value.startsWith('https://'))&&!u.username&&!u.password&&!value.includes('\\')&&(publicPath.test(u.pathname)||common.has(norm(u.pathname))))local.add(u.pathname);
    else other.add(value);
   }catch{other.add(value);}
  }
 }
 return {local:[...local],other:[...other]};
}
let items=null,collections=[],limit=180,pending=false,error='',selected='',source=null,sourceError='',sourcePending=false,epoch=0,owner=null,query='',category='all',filter='all',page=0,diagnostic=null,checking=false,published=null,publishedError='',publishedBusy=false;
const PAGE=12;
const settings=()=>workspace?.state?.site?.documentation||{};
const edits=()=>settings().edits||{};
const getJSON=async url=>{const r=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Request returned HTTP '+r.status+'.');return r.json();};
function resetOwner(){
 if(owner===workspace)return;
 owner=workspace;items=null;collections=[];pending=false;error='';selected='';source=null;sourceError='';sourcePending=false;epoch++;diagnostic=null;checking=false;published=null;publishedError='';publishedBusy=false;
}
async function load(){
 if(pending)return;pending=true;error='';const session=owner;
 try{
  if(preview)throw Error('Article source access requires the deployed owner workspace.');
  const data=await getJSON('/admin/docs-source');
  if(!Array.isArray(data.items)||!data.items.every(a=>a&&typeof a.path==='string'&&typeof a.title==='string'&&typeof a.canonical==='string')||new Set(data.items.map(a=>a.path)).size!==data.items.length)throw Error('Invalid article source inventory.');
  if(session!==owner)return;items=data.items;collections=Array.isArray(data.collections)?data.collections:[];limit=Number(data.overrideLimit)||180;
 }catch(e){if(session===owner)error=e.message;}finally{if(session===owner){pending=false;mount();}}
}
async function openArticle(path){
 if(!items?.some(a=>a.path===path))return;
 selected=path;source=null;sourceError='';sourcePending=true;diagnostic=null;checking=false;const seq=++epoch,session=owner;mountEditor();
 try{const data=await getJSON('/admin/docs-source?path='+encodeURIComponent(path));if(seq!==epoch||session!==owner)return;if(data.path!==path||typeof data.markdown!=='string')throw Error('Invalid article source response.');source=data;}
 catch(e){if(seq===epoch&&session===owner)sourceError=e.message;}finally{if(seq===epoch&&session===owner){sourcePending=false;mountEditor();}}
}
function statMarkup(){
 if(!items)return '';
 const changes=edits(),visible=items.filter(a=>changes[a.path]?.visible!==false).length,review=items.filter(a=>effective(a,changes[a.path]).status==='draft').length,known=new Set(items.map(a=>a.path)),unmapped=Object.keys(changes).filter(p=>!known.has(p)).length;
 return '<div class="dk-stats">'+[['Editable articles',items.length],['Visible in draft',visible],['Editorial review',review],['Saved or unsaved overrides',Object.keys(changes).length+' / '+limit]].map(([l,v])=>'<div><small>'+esc(l)+'</small><strong>'+esc(v)+'</strong></div>').join('')+'</div>'+(unmapped?'<p class="dk-warn">'+unmapped+' existing override(s) are outside this editable inventory, including possible collection pages. They are preserved, not silently removed.</p>':'');
}
function inventory(){
 if(error)return '<p role="alert">'+esc(error)+'</p><button type="button" class="admin-button secondary" data-dk-retry>Retry inventory</button>';
 if(!items)return '<p role="status">Loading renderer-aligned article inventory…</p>';
 const matched=select(items,edits(),query,category,filter),pages=Math.max(1,Math.ceil(matched.length/PAGE));page=Math.min(page,pages-1);
 return '<p role="status">'+matched.length+' matching articles · Page '+(page+1)+' of '+pages+'</p><div class="dk-list">'+matched.slice(page*PAGE,(page+1)*PAGE).map(a=>{
  const change=edits()[a.path],v=effective(a,change);
  return '<article class="dk-row"><div><small>'+esc(a.category)+' · '+esc(a.renderer)+'</small><h3>'+esc(v.title)+'</h3><code>'+esc(a.canonical)+'</code><p>'+esc(v.visible?'Visible in draft':'Hidden in draft')+' · '+esc(v.status==='draft'?'Editorial review':v.status==='reviewed'?'Marked reviewed':'Guide')+' · '+(change?'Override':'Source')+'</p></div><button type="button" class="admin-button secondary" data-dk-open="'+esc(a.path)+'" aria-label="Edit '+esc(v.title)+'">Edit article ↗</button></article>';
 }).join('')+'</div>'+(matched.length?'':'<p>No articles match these filters.</p>')+'<div class="dk-actions"><button type="button" class="admin-button secondary" data-dk-page="-1" '+(!page?'disabled':'')+'>Previous</button><button type="button" class="admin-button secondary" data-dk-page="1" '+(page>=pages-1?'disabled':'')+'>Next</button></div>';
}
function quality(){
 if(!source)return '';
 const a=effective(source,edits()[selected]),warnings=draftIssues(a),links=linkTargets(a.markdown,location.origin),words=String(a.markdown||'').trim().split(/\s+/).filter(Boolean).length;
 return '<p class="dk-muted">'+words+' whitespace-delimited words · '+String(a.markdown||'').length+' characters · '+links.local.length+' distinct eligible same-site link paths · '+links.other.length+' external, fragment or unsupported targets (not fetched).</p>'+(warnings.length?'<p class="dk-warn">'+esc(warnings.join(' · '))+'</p>':'<p>Basic field checks passed. This is not a factual, accessibility or legal review.</p>');
}
function editor(){
 if(sourcePending)return '<p role="status">Loading article source…</p>';
 if(sourceError)return '<p role="alert">'+esc(sourceError)+'</p><button type="button" class="admin-button secondary" data-dk-open="'+esc(selected)+'">Retry article</button>';
 if(!source)return '<p>Select an article from the directory to edit its draft.</p>';
 const a=effective(source,edits()[selected]),override=edits()[selected],value=k=>esc(a[k]||'');
 return '<div class="dk-editor-head"><div><small>'+esc(source.renderer)+' · '+esc(source.category)+'</small><h3>'+esc(a.title)+'</h3><code>'+esc(source.canonical)+'</code></div><a class="admin-button secondary" href="'+esc(source.canonical)+'" target="_blank" rel="noopener noreferrer">Published English ↗</a></div>'+
 '<div class="docs-cms-editor-grid"><div class="admin-field full"><label for="dk-title">Article title</label><input id="dk-title" data-dk-field="title" maxlength="160" value="'+value('title')+'"></div><div class="admin-field full"><label for="dk-summary">Search summary</label><textarea id="dk-summary" data-dk-field="summary" maxlength="900" rows="3">'+value('summary')+'</textarea></div><div class="admin-field full"><label for="dk-body">English article Markdown</label><textarea id="dk-body" data-dk-field="markdown" maxlength="25000" rows="18">'+value('markdown')+'</textarea><small>Blank title, summary or body falls back to source content. Hindi navigation is not a translated article body.</small></div><div class="admin-field"><label for="dk-review">Editorial status</label><select id="dk-review" data-dk-field="status">'+[['guide','Operational guide'],['draft','Under editorial review'],['reviewed','Marked reviewed by studio']].map(([v,l])=>'<option value="'+v+'" '+(a.status===v?'selected':'')+'>'+l+'</option>').join('')+'</select></div><label class="docs-cms-visibility"><input type="checkbox" data-dk-field="visible" '+(a.visible?'checked':'')+'> Publicly visible after publishing</label></div><p class="dk-muted">Editorial status is a review label, not a visibility or AI-retrieval switch. Changes use the whole website draft, not a separate publication queue.</p><div class="dk-actions"><button type="button" class="admin-button secondary" data-dk-reset '+(!override?'disabled':'')+'>Restore renderer source</button><button type="button" class="admin-button secondary" data-dk-preview>Read text preview</button><button type="button" class="admin-button secondary" data-dk-check '+(checking?'disabled':'')+'>Check internal links</button></div><div id="dk-quality">'+quality()+'</div><div id="dk-check-result" aria-live="polite">'+checkMarkup()+'</div>';
}
function checkMarkup(){
 if(checking)return '<p>Checking up to eight same-origin public paths…</p>';
 if(!diagnostic)return '<p class="dk-muted">No link check run for this article. Checks report HTTP responses only, not content correctness.</p>';
 return '<p>'+diagnostic.checked+' of '+diagnostic.total+' eligible link paths checked. '+diagnostic.skipped+' external, fragment or unsupported targets were not fetched.</p><div class="dk-list">'+diagnostic.rows.map(x=>'<p><code>'+esc(x.path)+'</code> — '+esc(x.result)+'</p>').join('')+'</div>';
}
async function checkLinks(){
 if(!source||checking)return;
 const a=effective(source,edits()[selected]),targets=linkTargets(a.markdown,location.origin),paths=targets.local.slice(0,8),seq=epoch,session=owner;checking=true;mountEditor();
 const rows=[];
 for(let i=0;i<paths.length;i+=3){
  if(seq!==epoch||session!==owner)return;
  rows.push(...await Promise.all(paths.slice(i,i+3).map(async path=>{
   try{const r=await fetch(path,{method:'GET',credentials:'omit',redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(10000)});const type=r.headers.get('content-type')||'';if(r.body)await r.body.cancel().catch(()=>{});return {path,result:r.type==='opaqueredirect'?'Redirect — not followed':r.ok?'HTTP '+r.status+' · '+(type||'type not reported'):'HTTP '+r.status};}
   catch{return {path,result:'Unavailable / timed out'};}
  })));
 }
 if(seq!==epoch||session!==owner)return;checking=false;diagnostic={checked:rows.length,total:targets.local.length,skipped:targets.other.length,rows};mountEditor();
}
function publishedMarkup(){
 if(publishedBusy)return '<p role="status">Checking public CMS revision…</p>';
 if(publishedError)return '<p role="alert">'+esc(publishedError)+'</p>';
 if(!published)return '<p>Not checked. Compare the loaded draft overrides with the public CMS response.</p>';
 const draft=edits(),pub=published.edits,keys=new Set([...Object.keys(draft),...Object.keys(pub)]),delta=[...keys].filter(k=>JSON.stringify(draft[k]||null)!==JSON.stringify(pub[k]||null)).length;
 return '<p>Public revision '+esc(published.version)+' · '+Object.keys(pub).length+' published overrides · '+delta+' differing draft keys.</p><p class="dk-muted">Checked '+esc(new Date(published.at).toLocaleString('en-IN'))+'. API comparison only; does not certify article rendering or AI retrieval.</p>';
}
async function checkPublished(){
 if(preview||publishedBusy)return;publishedBusy=true;publishedError='';const session=owner;refreshPublished();
 try{const d=await getJSON('/api/site');if(session!==owner)return;if(!d.state?.site?.documentation||!Number.isFinite(Number(d.version)))throw Error('Incomplete public CMS response.');published={version:d.version,edits:d.state.site.documentation.edits||{},at:Date.now()};}
 catch(e){if(session===owner){published=null;publishedError=e.message;}}finally{if(session===owner){publishedBusy=false;refreshPublished();}}
}
function refreshPublished(){const el=document.getElementById('dk-published');if(el)el.innerHTML=publishedMarkup();}
function mountEditor(){const el=document.getElementById('dk-editor');if(el)el.innerHTML=editor();}
function refreshList(){const el=document.getElementById('dk-inventory');if(el)el.innerHTML=inventory();const stat=document.getElementById('dk-stats');if(stat)stat.innerHTML=statMarkup();refreshPublished();}
function panel(){
 const categories=[...new Set((items||[]).map(a=>a.category))].sort(),opts=(values,active)=>values.map(([v,l])=>'<option value="'+esc(v)+'" '+(v===active?'selected':'')+'>'+esc(l)+'</option>').join('');
 return '<div id="dk-panel"><div id="dk-stats">'+statMarkup()+'</div><section class="form-card"><div class="form-card-header"><div><h2>Article directory</h2><p>Source inventory follows the deployed knowledge renderer. Collection landing pages are code-controlled here.</p></div></div><div class="admin-form-grid"><div class="admin-field full"><label for="dk-search">Search by title, ID, summary or route</label><input id="dk-search" type="search" value="'+esc(query)+'"></div><div class="admin-field"><label for="dk-category">Category</label><select id="dk-category">'+opts([['all','All categories'],...categories.map(v=>[v,v])],category)+'</select></div><div class="admin-field"><label for="dk-filter">Editorial filter</label><select id="dk-filter">'+opts([['all','All articles'],['edited','With draft override'],['hidden','Hidden in draft'],['review','Under editorial review'],['source','Unmodified source']],filter)+'</select></div></div><div id="dk-inventory">'+inventory()+'</div></section><section class="form-card docs-cms-panel"><div class="form-card-header"><div><h2>Article editor</h2><p>Edits remain in the existing versioned website draft. Save and publish using the workspace controls.</p></div></div><div id="dk-editor">'+editor()+'</div></section><section class="form-card"><div class="form-card-header"><div><h2>Knowledge publication & AI sources</h2><p>Compare the live public CMS and inspect actual AI retrieval in the AI Intelligence Center.</p></div></div><div class="dk-actions"><button type="button" class="admin-button secondary" data-dk-published '+(preview?'disabled':'')+'>Check published CMS</button><a class="admin-button secondary" href="#/ai-control">AI Intelligence Center ↗</a><a class="admin-button secondary" href="/help/assistant/" target="_blank" rel="noopener noreferrer">Public Help AI ↗</a></div><div id="dk-published" aria-live="polite">'+publishedMarkup()+'</div><p>Published knowledge retrieval uses its existing source matcher. Editing a draft does not retrain models or automatically reindex independent providers. Legacy sources may coexist with newer articles.</p><div class="dk-actions">'+collections.map(c=>'<a href="'+esc(c.canonical)+'" target="_blank" rel="noopener noreferrer">'+esc(c.path)+' ↗</a>').join('')+'</div></section></div>';
}
function mount(){const el=document.getElementById('dk-panel');if(el&&section==='documentation')el.outerHTML=panel();}
window.documentationPage=function(){
 resetOwner();if(!items&&!pending&&!error)queueMicrotask(()=>{if(section==='documentation'&&!items&&!pending&&!error)load();});
 return heading('Knowledge operations','Documentation & knowledge center','Manage article drafts, editorial review, internal link diagnostics and source visibility.','<a class="admin-button secondary" href="/docs/index.html" target="_blank" rel="noopener noreferrer">Open public knowledge ↗</a>')+
 '<div class="notice-bar">Public content only. Do not enter client records, credentials, private project details or secrets into documentation. Publishing applies the entire saved website draft.</div>'+
 '<section class="form-card"><div class="form-card-header"><div><h2>Legacy navigation settings</h2><p>These CMS fields are consumed by the older site shell; the current knowledge collections and editorial homepage have their own source-controlled navigation.</p></div></div><label class="toggle"><input type="checkbox" data-bind="site.documentation.enabled" '+(settings().enabled!==false?'checked':'')+'> Enable documentation navigation in supported shell</label><div class="admin-form-grid">'+field('Navigation label','site.documentation.navLabel',{max:35,required:true})+field('Documentation heading','site.documentation.heading',{max:125,required:true})+field('Introduction','site.documentation.introduction',{textarea:true,max:800,full:true,required:true})+'</div></section>'+panel();
};
function update(el){
 if(!source||!['title','summary','markdown','status','visible'].includes(el.dataset.dkField))return;
 const docs=settings(),current=edits()[selected];
 if(!current&&Object.keys(edits()).length>=limit){toast('The existing CMS override limit has been reached. Restore an unused override first.');mountEditor();return;}
 if(!docs.edits)docs.edits={};
 const base=current||{title:source.title,summary:source.summary,markdown:source.markdown,status:source.status,visible:true};
 base[el.dataset.dkField]=el.type==='checkbox'?el.checked:el.value;docs.edits[selected]=base;
 if(el.dataset.dkField==='markdown'){epoch++;diagnostic=null;checking=false;const box=document.getElementById('dk-check-result');if(box)box.innerHTML=checkMarkup();const check=document.querySelector('[data-dk-check]');if(check)check.disabled=false;}
 markDirty();const q=document.getElementById('dk-quality');if(q)q.innerHTML=quality();refreshList();const reset=document.querySelector('[data-dk-reset]');if(reset)reset.disabled=false;
}
document.addEventListener('input',e=>{const t=e.target;if(t.id==='dk-search'){query=t.value;page=0;refreshList();}else if(t.matches('[data-dk-field]')&&!['checkbox','select-one'].includes(t.type))update(t);});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='dk-category'){category=t.value;page=0;refreshList();}else if(t.id==='dk-filter'){filter=t.value;page=0;refreshList();}else if(t.matches('[data-dk-field]')&&['checkbox','select-one'].includes(t.type))update(t);});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-dk-open]');if(b){openArticle(b.dataset.dkOpen);return;}
 const pg=e.target.closest('[data-dk-page]');if(pg){page=Math.max(0,page+Number(pg.dataset.dkPage));refreshList();return;}
 if(e.target.closest('[data-dk-retry]')){error='';load();mount();return;}
 if(e.target.closest('[data-dk-reset]')&&source&&window.confirm('Remove this article override from the current website draft and restore renderer source?')){delete settings().edits[selected];epoch++;diagnostic=null;checking=false;markDirty();mountEditor();refreshList();return;}
 if(e.target.closest('[data-dk-preview]')&&source){const a=effective(source,edits()[selected]);showModal('Draft text preview',a.title,'<p>'+esc(a.summary)+'</p><pre class="dk-text-preview">'+esc(a.markdown)+'</pre><p>Plain-text preview; not the exact public renderer.</p>','<button type="button" class="admin-button secondary" data-action="close-modal">Close</button>');return;}
 if(e.target.closest('[data-dk-check]'))checkLinks();
 if(e.target.closest('[data-dk-published]'))checkPublished();
});
})();
