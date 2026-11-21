/* Studio product documentation and Help Centre extension. */
(function initStudioDocs(){
  'use strict';
  const prior=window.VeloryzDocs;
  if(!prior||!prior.render)return;
  let catalog=null,loading=null,error='',search='',category='All';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalized=p=>String(p||'/').replace(/\/+$/,'')||'/';
  const isStudio=()=>/^\/(?:docs|help)\/studio(?:\/.*)?$/.test(normalized(location.pathname));
  const isHelp=()=>normalized(location.pathname).startsWith('/help/studio');
  const root=()=>isHelp()?'/help/studio/':'/docs/studio/';
  const overrides=()=>{
    const s=typeof studioCMS!=='undefined'?studioCMS?.site?.documentation:null;
    return s&&typeof s.edits==='object'&&!Array.isArray(s.edits)?s.edits:{};
  };
  function entries(){
    return (catalog?.articles||[]).map(a=>{
      const change=overrides()[normalized(a.path)]||{};
      return {...a,...change,path:a.path,
        title:change.title||a.title,summary:change.summary||a.summary,
        markdown:change.markdown||a.markdown,
        status:change.status||a.status,
        visible:change.visible!==false};
    }).filter(a=>a.visible);
  }
  function load(){
    if(catalog||loading)return;
    loading=fetch('/studio-docs-catalog.json?v=20261121-blueprint',{cache:'no-cache'})
      .then(r=>{if(!r.ok)throw Error('Could not load the Studio documentation index.');return r.json();})
      .then(data=>{if(!Array.isArray(data.articles)||data.articles.length<141)throw Error('Studio documentation registry is incomplete.');catalog=data;error='';})
      .catch(e=>{error=e.message})
      .finally(()=>{loading=null;refresh();});
  }
  const contentLink=(label,to)=>{
    const safe=/^\/(?:docs|help)\/[a-z0-9/_-]+\/?$/.test(to)||/^https:\/\//.test(to)||/^#[a-z0-9_-]+$/.test(to);
    return safe?'<a href="'+esc(to)+'"'+(/^https:\/\//.test(to)?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(label)+'</a>':esc(label);
  };
  function inline(t){
    return esc(t).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,l,to)=>contentLink(l,to))
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/`([^`]+)`/g,'<code>$1</code>');
  }
  function md(raw){
    let out='',kind='',list='';
    function close(){if(kind){out+='</'+kind+'>';kind='';}}
    for(const rawLine of String(raw||'').split(/\r?\n/)){
      const line=rawLine.trim();
      if(!line){close();continue;}
      const head=line.match(/^(#{1,4})\s+(.+)$/);
      if(head){close();const lev=Math.min(4,head[1].length+1);out+='<h'+lev+'>'+inline(head[2])+'</h'+lev+'>';continue;}
      const bullet=line.match(/^[-*]\s+(.+)$/),num=line.match(/^\d+\.\s+(.+)$/);
      if(bullet||num){const target=bullet?'ul':'ol';if(kind!==target){close();kind=target;out+='<'+kind+'>';}out+='<li>'+inline((bullet||num)[1])+'</li>';continue;}
      if(line.startsWith('> ')){close();out+='<blockquote>'+inline(line.slice(2))+'</blockquote>';continue;}
      close();out+='<p>'+inline(line)+'</p>';
    }
    close();return out;
  }
  function cards(items){
    if(!items.length)return '<p class="studio-docs-empty">No matching documentation. Try another search or category.</p>';
    return '<div class="studio-docs-cards">'+items.map(d=>
      '<a class="studio-docs-card" href="'+esc(d.path)+'"><small>'+esc(d.category)+'</small><h3>'+esc(d.title)+'</h3><p>'+esc(d.summary)+'</p><span>Read guide ↗</span></a>').join('')+'</div>';
  }
  function index(){
    const help=isHelp(),items=entries().filter(a=>help?a.id.startsWith('H-'):a.id.startsWith('D-'));
    const groups=['All',...new Set(items.map(x=>x.category))];
    const filtered=items.filter(a=>(category==='All'||a.category===category)&&(!search||[a.title,a.summary,a.category].join(' ').toLowerCase().includes(search.toLowerCase())));
    return '<div id="docs-app" class="studio-docs-shell"><div class="studio-docs-hero"><div class="studio-docs-kicker">VELORYZ STUDIO / '+(help?'HELP CENTRE':'PRODUCT DOCUMENTATION')+'</div><h1>'+(help?'How can we help?':'Studio documentation.')+'</h1><p>'+(help?'Quick answers, onboarding and troubleshooting for VELORYZ Studio.':'Browse the complete Studio documentation map, from first project to publishing, governance and developer reference.')+'</p><div class="studio-docs-switch"><a class="'+(!help?'active':'')+'" href="/docs/studio/">Product docs</a><a class="'+(help?'active':'')+'" href="/help/studio/">Help Centre</a><a href="/docs/">Studio service guides</a></div></div>'+
      '<section class="studio-docs-content"><div class="studio-docs-tools"><label for="studio-doc-search">Search documentation</label><input id="studio-doc-search" type="search" placeholder="Search '+(help?'help topics':'articles and categories')+'..." value="'+esc(search)+'" autocomplete="off"><p>'+filtered.length+' of '+items.length+' reference pages</p></div>'+
      '<div class="studio-docs-cats" role="group" aria-label="Filter by topic">'+groups.map(c=>'<button type="button" data-studio-doc-category="'+esc(c)+'" aria-pressed="'+(c===category?'true':'false')+'" class="'+(c===category?'active':'')+'">'+esc(c)+'</button>').join('')+'</div><div id="studio-doc-results">'+cards(filtered)+'</div></section>'+
      '<div class="studio-docs-disclaimer">These routes include documentation specifications from the Studio blueprint. Pages labelled as blueprint references describe planned coverage, not confirmation that a feature is available.</div></div>';
  }
  function article(path){
    const list=entries(),item=list.find(x=>normalized(x.path)===path);
    if(!item)return '<div id="docs-app" class="studio-docs-shell studio-docs-missing"><h1>Documentation not found.</h1><p>The article is unavailable or has been hidden by the team.</p><a href="'+root()+'">Return to documentation</a></div>';
    const same=list.filter(x=>x.category===item.category),pos=same.findIndex(x=>x.id===item.id),prev=same[pos-1],next=same[pos+1];
    return '<div id="docs-app" class="studio-docs-shell studio-docs-reader"><nav class="studio-docs-breadcrumb" aria-label="Breadcrumb"><a href="'+root()+'">'+(isHelp()?'Help Centre':'Documentation')+'</a><span>/</span><span>'+esc(item.category)+'</span></nav><div class="studio-docs-grid"><aside class="studio-docs-sidebar"><div class="studio-docs-side-title">IN THIS CATEGORY</div><nav aria-label="Documentation chapters">'+same.map(d=>'<a href="'+esc(d.path)+'" '+(d.id===item.id?'aria-current="page" class="active"':'')+'>'+esc(d.title)+'</a>').join('')+'</nav><a href="'+root()+'">← All topics</a></aside><article class="studio-docs-article"><div class="studio-docs-kicker">'+esc(item.category)+' / '+(item.status==='reviewed'?'REVIEWED GUIDE':'BLUEPRINT REFERENCE')+'</div><h1>'+esc(item.title)+'</h1><p class="studio-docs-lede">'+esc(item.summary)+'</p><div class="studio-docs-prose">'+md(item.markdown)+'</div><div class="studio-docs-disclaimer">'+(item.status==='reviewed'?'Reviewed by the VELORYZ Studio documentation team.':'This page is an implementation reference from the uploaded blueprint. Check feature availability before following any unverified workflow.')+'</div><div class="studio-docs-prevnext">'+(prev?'<a href="'+esc(prev.path)+'">← '+esc(prev.title)+'</a>':'<span></span>')+(next?'<a href="'+esc(next.path)+'">'+esc(next.title)+' →</a>':'<span></span>')+'</div></article></div></div>';
  }
  function render(){
    if(!isStudio())return prior.render();
    if(!catalog&&!error)load();
    if(!catalog)return '<div id="docs-app" class="studio-docs-shell studio-docs-loading"><h1>'+(error?'Documentation unavailable':'Loading Studio documentation…')+'</h1><p>'+esc(error||'Preparing the category index and guides.')+'</p>'+(error?'<button type="button" data-studio-doc-retry>Retry</button>':'')+'</div>';
    const path=normalized(location.pathname);
    if(path==='/docs/studio'||path==='/help/studio')return index();
    return article(path);
  }
  function refresh(){if(!isStudio())return;const container=document.getElementById('docs-app');if(container)container.outerHTML=render();}
  function updateList(){
    if(!catalog||!isStudio())return;
    const help=isHelp();const items=entries().filter(a=>help?a.id.startsWith('H-'):a.id.startsWith('D-'))
      .filter(a=>(category==='All'||a.category===category)&&(!search||[a.title,a.summary,a.category].join(' ').toLowerCase().includes(search.toLowerCase())));
    const list=document.getElementById('studio-doc-results');
    if(list)list.innerHTML=cards(items);
    const count=document.querySelector('.studio-docs-tools p');if(count)count.textContent=items.length+' of '+(help?20:121)+' reference pages';
  }
  document.addEventListener('input',ev=>{
    if(ev.target?.id==='studio-doc-search'){search=ev.target.value.slice(0,120);updateList();}
  });
  document.addEventListener('click',ev=>{
    const cat=ev.target?.closest?.('[data-studio-doc-category]');
    if(cat){category=cat.dataset.studioDocCategory;document.querySelectorAll('[data-studio-doc-category]').forEach(b=>{b.classList.toggle('active',b===cat);b.setAttribute('aria-pressed',String(b===cat))});updateList();}
    if(ev.target?.closest?.('[data-studio-doc-retry]')){error='';load();}
  });
  const baseRender=prior.render.bind(prior);
  window.VeloryzDocs={...prior,render,refresh,studioPages:()=>entries()};
})();
