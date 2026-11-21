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
    loading=fetch('/studio-docs-catalog.json?v=20261121-handbook-2',{cache:'no-cache'})
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
  function headingId(value){return 'doc-'+String(value).toLowerCase().replace(/<[^>]*>/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function md(raw){
    let out='',kind='',skippedTitle=false;
    function close(){if(kind){out+='</'+kind+'>';kind='';}}
    for(const rawLine of String(raw||'').split(/\r?\n/)){
      const line=rawLine.trim();
      if(!line){close();continue;}
      const head=line.match(/^(#{1,4})\s+(.+)$/);
      if(head){close();if(head[1].length===1&&!skippedTitle){skippedTitle=true;continue;}const lev=Math.min(4,Math.max(2,head[1].length));out+='<h'+lev+' id="'+headingId(head[2])+'">'+inline(head[2])+'</h'+lev+'>';continue;}
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
    return '<div id="docs-app" class="studio-docs-shell"><div class="studio-docs-hero"><div class="studio-docs-kicker">VELORYZ STUDIO / '+(help?'HELP CENTRE':'PRODUCT DOCUMENTATION')+'</div><h1>'+(help?'How can we help?':'Studio documentation.')+'</h1><p>'+(help?'Quick answers, onboarding and troubleshooting for VELORYZ Studio.':'Browse the complete Studio documentation map, from first project to publishing, governance and developer reference.')+'</p><div class="studio-docs-switch"><a class="'+(!help?'active':'')+'" href="/docs/studio/">Product docs</a><a class="'+(help?'active':'')+'" href="/help/studio/">Help Centre</a><a href="/docs/">All documentation</a></div></div>'+
      '<section class="studio-docs-content"><div class="studio-docs-tools"><label for="studio-doc-search">Search documentation</label><input id="studio-doc-search" type="search" placeholder="Search '+(help?'help topics':'articles and categories')+'..." value="'+esc(search)+'" autocomplete="off"><p>'+filtered.length+' of '+items.length+' guides</p></div>'+
      '<div class="studio-docs-cats" role="group" aria-label="Filter by topic">'+groups.map(c=>'<button type="button" data-studio-doc-category="'+esc(c)+'" aria-pressed="'+(c===category?'true':'false')+'" class="'+(c===category?'active':'')+'">'+esc(c)+'</button>').join('')+'</div><div id="studio-doc-results">'+cards(filtered)+'</div></section>'+
      '<div class="studio-docs-footlinks"><a href="/docs/">Explore all documentation ↗</a><a href="/sitemap/">Browse the site map ↗</a><a href="/contact/">Ask the Studio team ↗</a></div></div>';
  }
  function heroArt(item){
    const variant=item.id.startsWith('H-')?'help':item.category.toLowerCase().includes('motion')?'motion':item.category.toLowerCase().includes('design')?'design':'reference';
    const inner=variant==='help'
      ?'<path d="M36 67Q36 38 63 38H161Q190 38 190 67V121Q190 148 163 148H104L77 166V148H62Q36 148 36 122Z"/><path d="M60 71H164M60 89H146M60 107H154"/><path class="docs-art-float" d="M208 100H258Q278 100 278 119V159Q278 181 257 181H239L220 195V181H207Q191 181 191 162V119Q191 100 208 100Z"/><path d="M221 139L233 151L257 124"/>'
      :variant==='motion'
      ?'<circle cx="144" cy="108" r="73"/><circle cx="144" cy="108" r="45"/><path d="M144 35V19M144 197V181M71 108H55M233 108H217"/><path class="docs-art-float" d="M125 109L143 127L180 83"/><path d="M55 53H82M209 169H237"/>'
      :variant==='design'
      ?'<rect x="33" y="38" width="234" height="148" rx="9"/><path d="M33 67H267M50 51H62M71 51H83M92 51H104"/><path class="docs-art-float" d="M57 84H130V164H57Z"/><path d="M150 88H243M150 108H235M150 130H249M150 147H210"/><path d="M117 187V199H177V187"/>'
      :'<rect x="53" y="20" width="171" height="190" rx="8"/><path d="M76 53H192M76 75H195M76 97H176M76 119H192M76 142H155"/><path class="docs-art-float" d="M179 144L194 158L228 121"/><circle cx="203" cy="140" r="44"/>';
    return '<svg viewBox="0 0 300 230" class="docs-article-art" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><rect x="19" y="19" width="262" height="194" rx="12" fill="#ebf6ff"/><g fill="none" stroke="#008ee6" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">'+inner+'</g></svg>';
  }
  function article(path){
    const list=entries(),item=list.find(x=>normalized(x.path)===path);
    if(!item)return '<div id="docs-app" class="studio-docs-shell studio-docs-missing"><h1>Guide unavailable.</h1><p>This article cannot be found or is not published.</p><a href="'+root()+'">← Browse the guides</a></div>';
    const same=list.filter(x=>x.category===item.category),pos=same.findIndex(x=>x.id===item.id),prev=same[pos-1],next=same[pos+1];
    const headings=[...item.markdown.matchAll(/^##\s+([^\n]+)/gm)].map(m=>m[1].trim()),readTime=Math.max(2,Math.ceil(item.markdown.trim().split(/\s+/).length/220));
    const toc='<nav aria-label="On this page">'+headings.map(t=>'<a href="#'+headingId(t)+'">'+esc(t)+'</a>').join('')+'</nav>';
    const editorial=item.status==='reviewed'?'TEAM-REVIEWED GUIDE':item.status==='draft'?'EDITORIAL REVIEW':'STUDIO FIELD GUIDE';
    return '<div id="docs-app" class="studio-docs-shell studio-docs-reader"><nav class="studio-docs-breadcrumb" aria-label="Breadcrumb"><a href="/docs/">All documentation</a><span>/</span><a href="'+root()+'">'+(isHelp()?'Help Centre':'Studio docs')+'</a><span>/</span><span>'+esc(item.category)+'</span></nav>'+
      '<div class="studio-docs-grid"><aside class="studio-docs-sidebar"><div class="studio-docs-side-title">EXPLORE THIS TOPIC</div><nav aria-label="Documentation chapters">'+same.map(d=>'<a href="'+esc(d.path)+'" '+(d.id===item.id?'aria-current="page" class="active"':'')+'>'+esc(d.title)+'</a>').join('')+'</nav><div class="studio-docs-side-utils"><a href="/docs/">← All documentation</a><a href="/sitemap/">Site map ↗</a><a href="/contact/">Contact Studio ↗</a></div></aside>'+
      '<article class="studio-docs-article"><header class="studio-docs-article-hero"><div><div class="studio-docs-kicker">'+esc(item.category)+' / '+editorial+'</div><h1>'+esc(item.title)+'</h1><p class="studio-docs-lede">'+esc(item.summary)+'</p><div class="docs-article-meta"><span>'+esc(item.id)+'</span><span>'+readTime+' min read</span><span>Edition · Nov 2026</span></div><div class="docs-article-actions"><button type="button" data-studio-doc-print>Print / Save PDF ↗</button><button type="button" data-studio-doc-copy>Copy article link ↗</button></div></div>'+heroArt(item)+'</header>'+
      '<details class="docs-mobile-toc"><summary>On this page ('+headings.length+')</summary>'+toc+'</details><div class="studio-docs-prose">'+md(item.markdown)+'</div>'+
      '<div class="studio-docs-finish"><h2>Keep building with confidence.</h2><p>Information is written for actual Studio workflows; capabilities that require Studio staff or provider configuration are identified inside the relevant guide. Need a project-specific answer?</p><a href="/contact/">Talk to the Studio team ↗</a><a href="/docs/">Browse all documentation ↗</a></div>'+
      '<nav class="studio-docs-prevnext" aria-label="Adjacent documentation">'+(prev?'<a href="'+esc(prev.path)+'"><small>PREVIOUS GUIDE</small>← '+esc(prev.title)+'</a>':'<span></span>')+(next?'<a href="'+esc(next.path)+'"><small>NEXT GUIDE</small>'+esc(next.title)+' →</a>':'<span></span>')+'</nav></article>'+
      '<aside class="studio-docs-right"><div class="studio-docs-right-title">ON THIS PAGE</div>'+toc+'<div class="studio-docs-right-support"><a href="/sitemap/">Full site map ↗</a><a href="/help/studio/">Help Centre ↗</a></div></aside></div></div>';
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
    const count=document.querySelector('.studio-docs-tools p');if(count)count.textContent=items.length+' of '+(help?20:121)+' guides';
  }
  document.addEventListener('input',ev=>{
    if(ev.target?.id==='studio-doc-search'){search=ev.target.value.slice(0,120);updateList();}
  });
  document.addEventListener('click',ev=>{
    const cat=ev.target?.closest?.('[data-studio-doc-category]');
    if(cat){category=cat.dataset.studioDocCategory;document.querySelectorAll('[data-studio-doc-category]').forEach(b=>{b.classList.toggle('active',b===cat);b.setAttribute('aria-pressed',String(b===cat))});updateList();}
    if(ev.target?.closest?.('[data-studio-doc-retry]')){error='';load();}
    if(ev.target?.closest?.('[data-studio-doc-print]'))window.print();
    const copy=ev.target?.closest?.('[data-studio-doc-copy]');
    if(copy){const original=copy.textContent;navigator.clipboard?.writeText(location.href).then(()=>{copy.textContent='Article link copied ✓';setTimeout(()=>{if(copy.isConnected)copy.textContent=original},2200)}).catch(()=>{copy.textContent='Copy URL from address bar';setTimeout(()=>{if(copy.isConnected)copy.textContent=original},3000)});}
  });
  window.VeloryzDocs={...prior,render,refresh,studioPages:()=>entries()};
})();
