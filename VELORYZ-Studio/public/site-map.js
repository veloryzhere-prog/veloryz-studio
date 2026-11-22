'use strict';
/* VELORYZ: accessible human sitemap, sourced from published docs registries. */
(function(){
 const sitePages=[
  {path:'/',label:'Home',group:'Explore VELORYZ',description:'The Studio and its work'},
  {path:'/work/',label:'Selected work',group:'Explore VELORYZ',description:'Projects and design studies'},
  {path:'/services/',label:'Services',group:'Explore VELORYZ',description:'Design, development and creative delivery'},
  {path:'/studio/',label:'About the Studio',group:'Explore VELORYZ',description:'Our approach and collective'},
  {path:'/teamjob/',label:'People',group:'Explore VELORYZ',description:'Team and professional profiles'},
  {path:'/velori/',label:'VELORI',group:'Explore VELORYZ',description:'VELORYZ product'},
  {path:'/design/',label:'Design library',group:'Explore VELORYZ',description:'Design inspiration and references'},
  {path:'/motion/',label:'Motion playground',group:'Explore VELORYZ',description:'Interactive creative motion'},
  {path:'/process/',label:'Delivery standards',group:'Explore VELORYZ',description:'How work is planned and reviewed'},
  {path:'/journey/',label:'Project journey',group:'Explore VELORYZ',description:'The delivery process'},
  {path:'/create/',label:'Create a project',group:'Work with the Studio',description:'Start a guided project brief'},
  {path:'/pricing/',label:'Pricing & scope',group:'Work with the Studio',description:'Indicative project pricing and assumptions'},
  {path:'/book/',label:'Book a discovery call',group:'Work with the Studio',description:'Request a consultation'},
  {path:'/contact/',label:'Contact',group:'Work with the Studio',description:'Get in touch with the team'},
  {path:'/client/',label:'Client portal',group:'Work with the Studio',description:'Private project collaboration'},
  {path:'/payments/',label:'Project payments',group:'Work with the Studio',description:'Payment options and guidance'},
  {path:'/developers/',label:'Developer resources',group:'Work with the Studio',description:'Integrations, APIs and technical delivery'},
  {path:'/veloryz/',label:'VELORYZ platform',group:'Work with the Studio',description:'Platform overview'},
  {path:'/concepts/aurel/',label:'AUREL Atelier concept',group:'Concept showcases',description:'Clearly labelled design concept'},
  {path:'/concepts/orbit/',label:'ORBIT concept',group:'Concept showcases',description:'Clearly labelled design concept'},
  {path:'/concepts/forme/',label:'FORME Objects concept',group:'Concept showcases',description:'Clearly labelled design concept'},
  {path:'/docs/index.html',label:'All documentation',group:'Documentation destinations',description:'Search every public reference'},
  {path:'/docs/studio/index.html',label:'Studio documentation',group:'Documentation destinations',description:'121 product and operations articles'},
  {path:'/help/studio/index.html',label:'Help Centre',group:'Documentation destinations',description:'20 help topics'},
  {path:'/sitemap/',label:'HTML site map',group:'Documentation destinations',description:'Human-readable public page index'},
  {path:'/roadmap.html',label:'Project roadmap',group:'Work with the Studio',description:'Quality and delivery checkpoints'},
  {path:'/reviews.html',label:'Community reviews',group:'Explore VELORYZ',description:'Moderated genuine feedback'},
  {path:'/sitemap.xml',label:'XML sitemap',group:'Documentation destinations',description:'Machine-readable index for search crawlers'}
 ];
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const normalize=p=>String(p).replace(/\/index\.html$/,'').replace(/\.html$/,'').replace(/\/+$/,'')||'/';
 const docHtmlPath=p=>{const v=normalize(p);return v==='/docs'||v==='/docs/studio'||v==='/help/studio'?v+'/index.html':v.startsWith('/docs/')||v.startsWith('/help/studio/')?v+'.html':p;};
 let catalog=null,service=null,loading=null,error='',search='';
 function edits(){try{return typeof studioCMS!=='undefined'?studioCMS?.site?.documentation?.edits||{}:{}}catch{return {}}}
 function load(){
  if(loading||(catalog&&service))return loading;
  loading=Promise.all([
   fetch('/studio-docs-index.json?v=20261121-handbook-2',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Product guide index is unavailable.');return r.json()}),
   fetch('/docs-library.json?v=20261121-docs-library-v2',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Service guide index is unavailable.');return r.json()})
  ]).then(([c,s])=>{
   if(!Array.isArray(c.articles)||c.articles.length!==141||!Array.isArray(s.documents))throw Error('Invalid site-map source.');
   catalog=c;service=s;error='';
  }).catch(e=>{error=e.message}).finally(()=>{loading=null;refresh()});
  return loading;
 }
 function entries(){
  const changes=edits();
  const products=(catalog?.articles||[]).map(a=>{
    const e=changes[normalize(a.path)]||{};
    return {path:docHtmlPath(a.path),label:e.title||a.title,group:a.id.startsWith('H-')?'Help Centre · '+a.category:'Studio docs · '+a.category,description:e.summary||a.summary,visible:e.visible!==false};
  }).filter(x=>x.visible);
  const guides=(service?.documents||[]).map(a=>{
   const e=changes['/docs/'+a.id]||{};
   return {path:'/docs/'+a.id+'.html',label:e.title||a.label,group:'Service guides · '+a.category,description:e.summary||a.description,visible:e.visible!==false};
  }).filter(x=>x.visible);
  return [...sitePages,...products,...guides];
 }
 function scene(){
  return '<svg class="vzmap-scene" viewBox="0 0 420 235" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="#0d8de6" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path class="vzmap-link vzmap-delay-1" d="M209 111L93 53M209 111L340 53M209 111L93 183M209 111L341 183"/><path class="vzmap-link vzmap-delay-2" d="M93 53L93 183M340 53L341 183"/><rect x="168" y="76" width="84" height="70" rx="8" fill="#e3f2ff"/><path d="M183 94H237M183 108H230M183 122H211"/><rect class="vzmap-node" x="52" y="21" width="82" height="60" rx="6" fill="#fff"/><path d="M68 41H116M68 53H103"/><rect class="vzmap-node vzmap-delay-1" x="297" y="21" width="82" height="60" rx="6" fill="#fff"/><path d="M313 41H361M313 53H348"/><rect class="vzmap-node vzmap-delay-2" x="52" y="154" width="82" height="60" rx="6" fill="#fff"/><path d="M68 174H116M68 186H103"/><rect class="vzmap-node vzmap-delay-3" x="299" y="154" width="82" height="60" rx="6" fill="#fff"/><path d="M315 174H363M315 186H350"/><circle cx="209" cy="111" r="5" fill="#078ee8"/></g></svg>';
 }
 function cards(items){
  const grouped=new Map();
  for(const a of items){if(!grouped.has(a.group))grouped.set(a.group,[]);grouped.get(a.group).push(a)}
  return [...grouped].map(([name,list])=>
   '<section class="vzmap-group" id="map-'+key(name)+'"><div class="vzmap-group-head"><h2>'+esc(name)+'</h2><span>'+list.length+' '+(list.length===1?'page':'pages')+'</span></div><ul>'+list.map(a=>
    '<li><a href="'+esc(a.path)+'"><strong>'+esc(a.label)+'</strong><span>'+esc(a.description||'Explore this page')+'</span><b aria-hidden="true">↗</b></a></li>').join('')+'</ul></section>').join('');
 }
 function render(){
  if(!catalog&&!error)load();
  if(!catalog||!service)return '<div id="site-map-app" class="vzmap vzmap-loading"><h1>Site map</h1><p>'+esc(error||'Preparing the full website directory…')+'</p>'+(error?'<button type="button" data-vzmap-retry>Retry</button>':'')+'</div>';
  const all=entries(),q=search.trim().toLowerCase(),found=q?all.filter(a=>[a.label,a.group,a.description,a.path].join(' ').toLowerCase().includes(q)):all;
  const groups=[...new Set(all.map(a=>a.group))];
  return '<div id="site-map-app" class="vzmap"><header class="vzmap-hero"><div class="vzmap-title"><span>VELORYZ / SITE DIRECTORY</span><h1>Every path.<br><em>One clear map.</em></h1><p>Explore the complete public website, Help Centre, project documentation and practical Studio references. This page follows the same publication and visibility rules as the documentation library.</p><div class="vzmap-summary"><strong>'+all.length+'</strong> public destinations <a href="/sitemap.xml">View XML sitemap ↗</a></div></div>'+scene()+'</header>'+
   '<div class="vzmap-main"><div class="vzmap-actions"><label for="vzmap-search">Search the entire website</label><input type="search" id="vzmap-search" placeholder="Find pages, guides, services or topics..." value="'+esc(search)+'" autocomplete="off"><span id="vzmap-count" aria-live="polite">'+found.length+' results</span></div>'+
   '<nav class="vzmap-quick" aria-label="Jump to a section">'+groups.map(x=>'<a href="#map-'+key(x)+'">'+esc(x)+'</a>').join('')+'</nav>'+
   '<div id="vzmap-results">'+(found.length?cards(found):'<p class="vzmap-none">No pages match this search. Try a shorter term.</p>')+'</div>'+
   '<footer class="vzmap-footer"><p>Missing a route or found an outdated article? <a href="/contact/">Tell the Studio team ↗</a></p><a href="/docs/">Back to all documentation ↗</a></footer></div></div>';
 }
 function refresh(){const el=document.getElementById('site-map-app');if(el)el.outerHTML=render()}
 document.addEventListener('input',e=>{
  if(e.target?.id!=='vzmap-search')return;
  search=e.target.value.slice(0,160);
  const all=entries(),q=search.trim().toLowerCase(),found=q?all.filter(a=>[a.label,a.group,a.description,a.path].join(' ').toLowerCase().includes(q)):all;
  const results=document.getElementById('vzmap-results');if(results)results.innerHTML=found.length?cards(found):'<p class="vzmap-none">No matching pages. Try another search.</p>';
  const count=document.getElementById('vzmap-count');if(count)count.textContent=found.length+' results';
 });
 document.addEventListener('click',e=>{if(e.target?.closest?.('[data-vzmap-retry]')){error='';load()}});
 window.VeloryzSiteMap={render,refresh,entries};
})();
