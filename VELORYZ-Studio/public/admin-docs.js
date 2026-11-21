/* Protected Studio Control editor for published documentation. */
(function initStudioDocsAdmin(){
 'use strict';
 const previous=window.documentationPage;
 if(typeof previous!=='function')return;
 let articles=null,pending=false,error='',selected='/docs/studio/overview/';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=path=>path.replace(/\/+$/,'');
 function settings(){return workspace?.state?.site?.documentation||{};}
 function lookup(path){return articles?.find(x=>key(x.path)===key(path));}
 function edits(){return settings().edits||{};}
 function fetchIndex(){
  if(pending||articles)return;
  pending=true;
  Promise.all([
   fetch('/studio-docs-catalog.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Product documentation index could not load.');return r.json();}),
   fetch('/docs-library.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Existing documentation index could not load.');return r.json();})
  ]).then(([plan,current])=>{
    const real=current.documents.map(d=>({id:d.id,path:'/docs/'+d.id+'/',title:d.label,category:'Existing studio service guides',summary:d.description,markdown:d.markdown,status:'reviewed'}));
    articles=[...real,...plan.articles];error='';
  }).catch(e=>{error=e.message;}).finally(()=>{pending=false;mount();});
 }
 function current(){
  const a=lookup(selected);
  if(!a)return null;
  const change=edits()[key(a.path)]||{};
  return {...a,...change};
 }
 function editorMarkup(){
  const a=current();if(!a)return '<div class="docs-cms-placeholder">Select a documentation page to edit.</div>';
  const status=a.status==='reviewed'?'reviewed':'blueprint';
  return '<div class="docs-cms-editor-grid">'+
    '<div class="admin-field full"><label for="docs-cms-title">Article title</label><input id="docs-cms-title" type="text" data-doc-cms-field="title" maxlength="160" value="'+esc(a.title)+'"></div>'+
    '<div class="admin-field full"><label for="docs-cms-summary">Description / search summary</label><textarea id="docs-cms-summary" data-doc-cms-field="summary" maxlength="900" rows="3">'+esc(a.summary)+'</textarea></div>'+
    '<div class="admin-field full"><label for="docs-cms-markdown">Article content (Markdown)</label><textarea id="docs-cms-markdown" data-doc-cms-field="markdown" maxlength="25000" rows="16" spellcheck="true">'+esc(a.markdown)+'</textarea><small>Use # headings, **bold**, numbered steps and /docs/studio/... links. HTML is not accepted.</small></div>'+
    '<div class="admin-field"><label for="docs-cms-review">Editorial status</label><select id="docs-cms-review" data-doc-cms-field="status"><option value="blueprint" '+(status==='blueprint'?'selected':'')+'>Blueprint / not yet verified</option><option value="reviewed" '+(status==='reviewed'?'selected':'')+'>Reviewed and verified</option></select></div>'+
    '<label class="docs-cms-visibility"><input type="checkbox" data-doc-cms-field="visible" '+(a.visible!==false?'checked':'')+'> Publicly visible</label>'+
    '</div><div class="docs-cms-actions"><button class="admin-button secondary" type="button" data-doc-cms-reset>Restore source content</button><a class="admin-button secondary" href="'+esc(a.path)+'" target="_blank" rel="noopener noreferrer">View public article ↗</a></div>';
 }
 function panel(){
  if(!articles&&!error)fetchIndex();
  const opts=articles?articles.map(a=>'<option value="'+esc(a.path)+'" '+(key(a.path)===key(selected)?'selected':'')+'>'+esc(a.id)+' · '+esc(a.title)+'</option>').join(''):'';
  return '<section class="form-card docs-cms-panel" id="docs-cms-extension"><div class="form-card-header"><div><h2>Article CMS · Studio documentation and Help Centre</h2><p>Edit article text and visibility without changing code. These edits participate in the existing Save draft → Preview → Publish workflow and version history.</p></div></div>'+
    (error?'<p class="docs-cms-error">'+esc(error)+'</p><button class="admin-button secondary" type="button" data-doc-cms-retry>Retry loading articles</button>':
    !articles?'<p>Loading 141 product/help pages and 11 existing studio guides…</p>':
    '<label class="admin-field full" for="docs-cms-select"><strong>Select a documentation page ('+articles.length+')</strong><select id="docs-cms-select">'+opts+'</select></label><p class="docs-cms-location">Public route: <code>'+esc(current()?.path||'')+'</code></p><div id="docs-cms-edit-area">'+editorMarkup()+'</div>')+'</section>';
 }
 function mount(){const el=document.getElementById('docs-cms-extension');if(el&&typeof section!=='undefined'&&section==='documentation')el.outerHTML=panel();}
 window.documentationPage=function(){return previous() + panel();};
 document.addEventListener('change',ev=>{
  const target=ev.target;
  if(target?.id==='docs-cms-select'){
   selected=target.value;const area=document.getElementById('docs-cms-edit-area');if(area)area.innerHTML=editorMarkup();
   const loc=document.querySelector('.docs-cms-location code');if(loc)loc.textContent=current()?.path||'';
   return;
  }
  if(target?.matches?.('[data-doc-cms-field]'))update(target);
 });
 document.addEventListener('input',ev=>{
  if(ev.target?.matches?.('[data-doc-cms-field]') && !['checkbox','select-one'].includes(ev.target.type))update(ev.target);
 });
 function update(el){
  const a=lookup(selected);if(!a||!workspace?.state)return;
  const field=el.dataset.docCmsField;
  if(!['title','summary','markdown','status','visible'].includes(field))return;
  const docs=settings();
  if(!docs.edits)docs.edits={};
  const p=key(a.path),change=docs.edits[p]||{title:a.title,summary:a.summary,markdown:a.markdown,status:a.status||'blueprint',visible:true};
  change[field]=el.type==='checkbox'?el.checked:el.value;
  docs.edits[p]=change;
  markDirty();
 }
 document.addEventListener('click',ev=>{
  if(ev.target?.closest?.('[data-doc-cms-retry]')){error='';articles=null;fetchIndex();}
  if(ev.target?.closest?.('[data-doc-cms-reset]')){
   const a=lookup(selected);if(!a)return;
   if(settings().edits)delete settings().edits[key(a.path)];
   markDirty();const area=document.getElementById('docs-cms-edit-area');if(area)area.innerHTML=editorMarkup();
  }
 });
})();
