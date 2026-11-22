'use strict';
/* VELORYZ Documentation Hub: uses actual source Markdown, rendered as escaped HTML. */
(function(){
 const defaults={heading:'Clear answers. Better projects.',introduction:'Browse the studio’s real guides to project creation, pricing, your client portal, copyright planning and technical delivery.',navLabel:'Documentation'};
 let library=null,studioCatalog=null,loading=null,error='',term='',group='All',visibleCount=24;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const serviceDocs=()=>library?.documents||[];
 const productDocs=()=>{
  const edits=typeof studioCMS!=='undefined'?studioCMS?.site?.documentation?.edits||{}:{};
  return (studioCatalog?.articles||[]).map(a=>{
   const override=edits[a.path.replace(/\/$/,'')]||{};
   return {id:a.id,label:override.title||a.title,description:override.summary||a.summary,category:a.category,markdown:override.markdown||a.markdown||'',path:docHtmlPath(a.path),kind:a.id.startsWith('H-')?'Help Centre':'Studio documentation',visible:override.visible!==false};
  }).filter(a=>a.visible);
 };
 const docs=()=>[...serviceDocs(),...productDocs()];
 const docHtmlPath=p=>{const base=String(p||'').replace(/\/+$/,'');return base==='/docs'||base==='/docs/studio'||base==='/help/studio'?base+'/index.html':base.startsWith('/docs/')||base.startsWith('/help/studio/')?base+'.html':p;};
 const url=id=>docHtmlPath(docs().find(x=>x.id===id)?.path||'/docs/'+id+'/');
 const config=()=>({...defaults,...(typeof studioCMS!=='undefined'?studioCMS?.site?.documentation||{}:{})});
 const slug=()=>{const value=location.pathname.match(/^\/docs\/([a-z0-9-]+)(?:\.html|\/)?$/)?.[1]||'';return value==='index'?'':value;};
 function href(value){
  const str=String(value||'').trim(),m=str.match(/(?:^|\/)([\w-]+\.md)(#[a-z0-9_-]+)?$/i);
  if(m){const d=docs().find(x=>x.filename===m[1]);if(d)return url(d.id)+(m[2]||'');}
  return /^https:\/\//i.test(str)||/^\/(?!\/)[a-z0-9/_-]+(?:\.[a-z0-9]+)?\/?(?:#[a-z0-9_-]+)?$/i.test(str)||/^#[a-z0-9_-]+$/i.test(str)?str:'#';
 }
 function inline(raw){
  const tokens=[],tick=String.fromCharCode(96),re=new RegExp(tick+'([^'+tick+'\\n]+)'+tick,'g');
  let s=String(raw).replace(re,(_,x)=>{let k=tokens.push('<code>'+esc(x)+'</code>');return '\uE000'+(k-1)+'\uE001';});
  s=s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,name,to)=>{
   const dest=href(to),external=/^https?:\/\//.test(dest);
   let n=tokens.push('<a href="'+esc(dest)+'"'+(external?' rel="noopener noreferrer" target="_blank"':'')+'>'+esc(name)+'</a>');
   return '\uE000'+(n-1)+'\uE001';
  });
  return esc(s).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>').replace(/\uE000(\d+)\uE001/g,(_,i)=>tokens[Number(i)]||'');
 }
 function markdown(markdown){
  const lines=String(markdown||'').replace(/\r/g,'').split('\n'),html=[];let i=0;
  const boundary=s=>/^(?:#{1,6}\s|>\s?|[-*+]\s|\d+[.)]\s|\|.+\||---+\s*$)/.test(s.trim());
  while(i<lines.length){
   const line=lines[i].trim();if(!line){i++;continue;}
   const fence=String.fromCharCode(96,96,96);
   if(line.startsWith(fence)||line.startsWith('~~~')){
    const marker=line.slice(0,3),code=[];i++;
    while(i<lines.length&&!lines[i].trim().startsWith(marker))code.push(lines[i++]);
    i++;html.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');continue;
   }
   const h=line.match(/^(#{1,6})\s+(.+)$/);
   if(h){const level=Math.min(h[1].length+1,6),id=h[2].toLowerCase().replace(/[^a-z0-9 -]/g,'').trim().replace(/\s+/g,'-');html.push('<h'+level+' id="'+esc(id)+'">'+inline(h[2])+'</h'+level+'>');i++;continue;}
   if(/^[-*_]{3,}$/.test(line)){html.push('<hr>');i++;continue;}
   if(line.startsWith('>')){const out=[];while(i<lines.length&&lines[i].trim().startsWith('>'))out.push(lines[i++].trim().replace(/^>\s?/,''));html.push('<blockquote>'+out.map(inline).join('<br>')+'</blockquote>');continue;}
   const tableRow=s=>s.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(x=>x.trim());
   if(line.includes('|')&&i+1<lines.length&&/^\|?\s*:?-{3,}/.test(lines[i+1].trim())){
    const titles=tableRow(line),rows=[];i+=2;
    while(i<lines.length&&lines[i].trim().includes('|'))rows.push(tableRow(lines[i++]));
    html.push('<div class="docs-table-scroll"><table><thead><tr>'+titles.map(x=>'<th>'+inline(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+titles.map((_,j)=>'<td>'+inline(r[j]||'')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');continue;
   }
   if(/^([-*+]\s|\d+[.)]\s)/.test(line)){
    const ordered=/^\d+[.)]\s/.test(line),out=[];
    while(i<lines.length){
     const m=lines[i].trim().match(ordered?/^\d+[.)]\s+(.+)$/:/^[-*+]\s+(.+)$/);
     if(!m)break;out.push('<li>'+inline(m[1])+'</li>');i++;
    }
    html.push('<'+(ordered?'ol':'ul')+'>'+out.join('')+'</'+(ordered?'ol':'ul')+'>');continue;
   }
   const paragraph=[line];i++;
   while(i<lines.length&&lines[i].trim()&&!boundary(lines[i]))paragraph.push(lines[i++].trim());
   html.push('<p>'+inline(paragraph.join(' '))+'</p>');
  }
  return html.join('\n');
 }
 async function ensure(){
  if((library&&studioCatalog)||loading)return loading;
  loading=Promise.all([
   fetch('/docs-library.json?v=20261121-docs-library-v2',{cache:'no-cache'}).then(async r=>{
    if(!r.ok)throw Error('Studio service guides are unavailable.');
    const value=await r.json();
    if(!Array.isArray(value.documents)||value.documents.length<10)throw Error('The service guide index is incomplete.');
    const ids=new Set();
    for(const d of value.documents){if(!/^[a-z0-9-]{2,40}$/.test(d.id)||typeof d.markdown!=='string'||ids.has(d.id))throw Error('Invalid service guide source.');ids.add(d.id);}
    const edits=typeof studioCMS!=='undefined'?studioCMS?.site?.documentation?.edits||{}:{};
    value.documents=value.documents.filter(d=>{
      const edit=edits['/docs/'+d.id];if(edit?.visible===false)return false;
      if(edit){if(edit.title)d.label=edit.title;if(edit.summary)d.description=edit.summary;if(edit.markdown)d.markdown=edit.markdown;}
      return true;
    });
    return value;
   }),
   fetch('/studio-docs-index.json?v=20261121-handbook-2',{cache:'no-cache'}).then(async r=>{
    if(!r.ok)throw Error('Studio product manual is unavailable.');
    const value=await r.json();
    if(!Array.isArray(value.articles)||value.articles.length!==141)throw Error('The product manual registry is incomplete.');
    return value;
   })
  ]).then(([source,catalog])=>{library=source;studioCatalog=catalog;error='';return source;})
   .catch(e=>{error=e.message;return null;})
   .finally(()=>{loading=null;if(location.pathname.startsWith('/docs/')&&document.getElementById('docs-app'))refresh();});
  return loading;
 }
 function filtered(){
  const q=term.toLowerCase().trim();
  return docs().filter(d=>(group==='All'||d.category===group)&&(!q||[d.label,d.description,d.category,d.markdown.slice(0,1300)].join(' ').toLowerCase().includes(q)));
 }
 function cards(){
  const all=filtered(),list=all.slice(0,visibleCount);
  return '<div class="docs-card-grid">'+(list.length?list.map(d=>
   '<a class="docs-item" href="'+url(d.id)+'"><span class="docs-item-top">'+esc(d.category)+' <span aria-hidden="true">↗</span></span><strong>'+esc(d.label)+'</strong><p>'+esc(d.description)+'</p><span class="docs-read">Read guide →</span></a>').join(''):
   '<div class="docs-empty"><h3>No matching articles.</h3><p>Try a different search or category.</p><button type="button" data-doc-reset>Clear filters</button></div>')+'</div>'+
   (all.length>visibleCount?'<button type="button" class="docs-load-more" data-doc-more>Show more guides <span>'+visibleCount+' of '+all.length+'</span></button>':'')+
   '<p class="docs-results-count" aria-live="polite">Showing '+list.length+' of '+all.length+' guides</p>';
 }
 function cardArt(kind){
  const open='<svg class="docs-choice-art docs-choice-art-'+kind+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" role="img" aria-label="'+(kind==='help'?'Helpful conversation':kind==='studio'?'Website design and development':'Connected documentation pages')+'"><g fill="none" stroke="#078fea" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">';
  const body=kind==='help'
   ?'<path class="docs-ink-path" d="M25 58Q25 33 50 33H183Q210 33 210 59V121Q210 148 184 148H98L67 172V148H50Q25 148 25 122Z"/><path d="M52 75H175M52 93H145M52 111H165"/><path class="docs-ink-path docs-float" d="M232 82H318Q338 82 338 104V159Q338 182 314 182H284L259 201V182H232Q213 182 213 162V102Q213 82 232 82Z"/><path d="M249 132L268 149L305 112"/><circle cx="299" cy="46" r="17"/><path d="M290 46H308M299 37V55"/>'
   :kind==='studio'
   ?'<rect x="30" y="33" width="280" height="154" rx="10"/><path d="M30 63H310M54 47H70M86 47H102M118 47H134M61 88H152V158H61Z"/><path class="docs-ink-path" d="M175 91H275M175 109H251M175 131H284M175 148H227"/><path class="docs-float" d="M303 138L340 120L329 166L311 158L303 177Z"/><path d="M120 187L115 208M223 187L230 208M97 208H252"/><circle cx="104" cy="123" r="15"/><path d="M92 151L114 151"/>'
   :'<rect x="30" y="52" width="110" height="134" rx="5"/><path d="M52 77H121M52 96H115M52 115H100M52 149H120M52 166H88"/><rect class="docs-float" x="163" y="22" width="160" height="122" rx="5"/><path d="M184 45H305M184 66H294M184 86H271M184 108H304"/><path class="docs-ink-path" d="M181 169H310M181 187H281M151 101L164 94M144 151L164 159M117 32L164 27"/><circle cx="326" cy="184" r="24"/><path d="M315 184L323 192L337 176"/>';
  return open+body+'</g><path class="docs-cloud" fill="#dceefd" d="M18 199H346V216H18Z" opacity=".55"/></svg>';
 }
 function hub(){
  const site=config(),groups=['All',...[...new Set(docs().map(d=>d.category))]];
  const choices=[
   {kind:'help',num:'20',title:'Help Centre',tag:'SUPPORT & ANSWERS',body:'Practical guidance for first-time visitors, project enquiries, account access and troubleshooting.',href:'/help/studio/',link:'Explore Help Centre'},
   {kind:'studio',num:'121',title:'Studio documentation',tag:'DEEP PRODUCT MANUAL',body:'Step-by-step references for Studio workflows, delivery, AI, CMS, security, design systems and governance.',href:'/docs/studio/',link:'Open Studio docs'},
   {kind:'all',num:String(docs().length),title:'All documentation',tag:'EVERY REFERENCE',body:'A single searchable index of every published guide, including service guides, Help Centre and Studio manuals.',href:'#documentation-directory',link:'Browse every article'}
  ];
  return '<div class="docs-shell docs-superhub"><section class="docs-superhero"><div class="docs-superhero-eyebrow">VELORYZ / THE KNOWLEDGE SYSTEM</div><h1>Everything you need.<br><em>Nothing left to guess.</em></h1><p>An organised, searchable library for creating with VELORYZ, collaborating with the Studio team and shipping with confidence.</p><div class="docs-superhero-stat"><span><strong>'+docs().length+'</strong> public references</span><span>Three places to start</span><span>Search every topic below</span></div></section>'+
   '<section class="docs-choice-section" aria-label="Choose your documentation destination"><div class="docs-choice-grid">'+choices.map((c,i)=>
    '<a class="docs-choice docs-choice-'+c.kind+'" href="'+c.href+'"><div class="docs-choice-top"><span>'+c.tag+'</span><strong>0'+(i+1)+'</strong></div>'+cardArt(c.kind)+'<div class="docs-choice-count">'+c.num+' <span>ARTICLES</span></div><h2>'+c.title+'</h2><p>'+c.body+'</p><span class="docs-choice-link">'+c.link+' <span aria-hidden="true">↗</span></span></a>').join('')+'</div></section>'+
   '<section class="docs-content" id="documentation-directory"><div class="docs-search-heading"><div><span>THE COMPLETE LIBRARY</span><h2>Find an answer. Keep moving.</h2><p class="docs-dir-intro">'+docs().length+' articles · Help Centre, Studio documentation and practical Studio service references.</p></div><label class="docs-search"><span class="sr-only">Search all documentation</span><input type="search" id="docs-search" value="'+esc(term)+'" placeholder="Search all articles, topics or questions..." autocomplete="off"></label></div>'+
   '<div class="docs-category-row" role="group" aria-label="Documentation topics">'+groups.map(c=>'<button type="button" data-doc-category="'+esc(c)+'" aria-pressed="'+(group===c)+'" class="'+(group===c?'active':'')+'">'+esc(c)+'</button>').join('')+'</div><div id="docs-results">'+cards()+'</div></section>'+
   '<section class="docs-related-paths"><h2>Need another way in?</h2><div><a href="/sitemap/">Human-readable site map ↗</a><a href="/sitemap.xml">XML sitemap ↗</a><a href="/contact/">Contact the Studio ↗</a></div></section></div>';
 }
 function article(id){
  const doc=serviceDocs().find(d=>d.id===id);
  if(!doc)return '<div class="docs-shell docs-not-found"><h1>Guide not found.</h1><a href="/docs/">← Back to all documentation</a></div>';
  const index=serviceDocs().indexOf(doc),prev=serviceDocs()[index-1],next=serviceDocs()[index+1];
  return '<div class="docs-shell docs-reader"><div class="docs-breadcrumbs"><a href="/docs/">Documentation</a><span>/</span><span>'+esc(doc.label)+'</span></div>'+
   '<div class="docs-reader-grid"><aside class="docs-sidebar"><div class="docs-sidebar-label">STUDIO GUIDES</div><nav aria-label="Documentation chapters">'+serviceDocs().map(d=>
   '<a href="'+url(d.id)+'" class="'+(d.id===id?'active':'')+'" '+(d.id===id?'aria-current="page"':'')+'>'+esc(d.label)+'</a>').join('')+'</nav><a class="docs-back-all" href="/docs/">← All documentation</a></aside>'+
   '<article class="docs-article"><header class="docs-article-head"><span>'+esc(doc.category)+' / KNOWLEDGE BASE</span><h1>'+esc(doc.label)+'</h1><p>'+esc(doc.description)+'</p><div class="docs-meta"><span>VELORYZ source documentation</span><button type="button" data-doc-print>Print / Save PDF ↗</button></div></header>'+
   '<div class="docs-prose">'+markdown(doc.markdown)+'</div><footer class="docs-article-footer"><p>Source-controlled reference. Technical, copyright and privacy plans do not by themselves certify compliance or transfer rights.</p>'+
   '<div class="docs-next-prev">'+(prev?'<a href="'+url(prev.id)+'"><small>PREVIOUS</small><strong>← '+esc(prev.label)+'</strong></a>':'<span></span>')+(next?'<a href="'+url(next.id)+'"><small>NEXT</small><strong>'+esc(next.label)+' →</strong></a>':'<span></span>')+'</div></footer></article></div></div>';
 }
 function render(){
  if((!library||!studioCatalog)&&!error)ensure();
  if(!library||!studioCatalog)return '<div id="docs-app" class="docs-shell"><div class="docs-loading" role="status"><span>VELORYZ / DOCUMENTATION</span><h1>'+(error?'Documentation unavailable.':'Loading documentation…')+'</h1><p>'+esc(error||'Preparing the full guides and references.')+'</p>'+(error?'<button type="button" data-doc-retry>Retry</button>':'')+'</div></div>';
  return '<div id="docs-app">'+(slug()?article(slug()):hub())+'</div>';
 }
 function refresh(){const root=document.getElementById('docs-app');if(root)root.outerHTML=render();}
 document.addEventListener('input',e=>{
  if(e.target.id==='docs-search'){term=e.target.value.slice(0,140);visibleCount=24;const results=document.getElementById('docs-results');if(results)results.innerHTML=cards();}
 });
 document.addEventListener('click',e=>{
  const cat=e.target.closest('[data-doc-category]');
  if(cat){group=cat.dataset.docCategory;visibleCount=24;document.querySelectorAll('[data-doc-category]').forEach(b=>{const yes=b.dataset.docCategory===group;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});const results=document.getElementById('docs-results');if(results)results.innerHTML=cards();return;}
  if(e.target.closest('[data-doc-reset]')){group='All';term='';visibleCount=24;refresh();}
  if(e.target.closest('[data-doc-more]')){visibleCount+=24;const results=document.getElementById('docs-results');if(results)results.innerHTML=cards();}
  if(e.target.closest('[data-doc-retry]')){error='';loading=null;refresh();}
  if(e.target.closest('[data-doc-print]'))window.print();
 });
 window.VeloryzDocs={render,refresh,list:()=>docs().map(d=>({id:d.id,title:d.label,category:d.category}))};
})();
