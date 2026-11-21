/* VELORYZ Living Knowledge — original responsive documentation, support and site-map experience. */
(function installLivingKnowledge(){
  'use strict';
  const previousDocs=window.VeloryzDocs, previousMap=window.VeloryzSiteMap;
  if(!previousDocs || !previousMap)return;
  const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=p=>('/'+String(p||'').split('/').filter(Boolean).join('/')+'/').replace('//','/');
  const slug=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const rootPage=()=>norm(location.pathname);
  let index=null,service=null,loading=null,loadError='';
  let mapFilter='all',mapSearch='',zoom=1,activeNode='studio';
  let palette=null,searchFilter='all',searchTerm='';
  let sidebarOpen=false;
  const staticPages=[
    ['/', 'Home','Explore','VELORYZ Studio homepage'],
    ['/work/','Selected work','Explore','Original work and concepts'],
    ['/services/','Services','Explore','Design, development and technology'],
    ['/studio/','The Studio','Explore','Meet the creative technology studio'],
    ['/teamjob/','People','Explore','Studio team profiles'],
    ['/design/','Design library','Explore','Visual design references'],
    ['/motion/','Motion playground','Explore','Interactive motion studies'],
    ['/velori/','VELORI product','Explore','Product ecosystem'],
    ['/process/','Our process','Explore','Delivery method and standards'],
    ['/journey/','Project journey','Explore','From brief to launch'],
    ['/create/','Create a project','Projects','Start your project brief'],
    ['/pricing/','Pricing and scope','Projects','Indicative project pricing'],
    ['/book/','Book a call','Projects','Request a discovery conversation'],
    ['/contact/','Contact the Studio','Projects','Reach the team'],
    ['/client/','Client portal','Projects','Private collaboration'],
    ['/payments/','Payments','Projects','Project payment guidance'],
    ['/developers/','Developer resources','Projects','APIs and integrations'],
    ['/veloryz/','Platform','Projects','The VELORYZ platform'],
    ['/concepts/aurel/','AUREL Atelier','Concepts','Creative concept study'],
    ['/concepts/orbit/','ORBIT','Concepts','Workspace concept study'],
    ['/concepts/forme/','FORME Objects','Concepts','Product concept study'],
    ['/docs/','All documentation','Knowledge','Complete searchable index'],
    ['/docs/studio/','Studio documentation','Knowledge','Deep technical and operating guides'],
    ['/help/studio/','Help Centre','Knowledge','Answers and support'],
    ['/sitemap/','Interactive site map','Knowledge','The entire public website'],
    ['/sitemap.xml','XML sitemap','Knowledge','Crawler index']
  ];
  function published(){
    try{return typeof studioCMS!=='undefined'&&studioCMS?.site?.documentation?.edits||{}}catch{return {}}
  }
  function library(){
    const changes=published();
    const full=(index?.articles||[]).map(a=>{
      const ch=changes[a.path.replace(/\/+$/,'')]||{};
      return {id:a.id,path:a.path,title:ch.title||a.title,summary:ch.summary||a.summary,
        category:a.category,kind:a.id.startsWith('H-')?'help':'studio',visible:ch.visible!==false};
    }).filter(a=>a.visible);
    const original=(service?.documents||[]).map(a=>{
      const ch=changes['/docs/'+a.id]||{};
      return {id:a.id,path:'/docs/'+a.id+'/',title:ch.title||a.label,summary:ch.summary||a.description,
        category:a.category,kind:'guides',visible:ch.visible!==false};
    }).filter(a=>a.visible);
    return [...full,...original];
  }
  function fetchIndex(){
    if(loading)return loading;
    if(index&&service)return Promise.resolve();
    loading=Promise.all([
      fetch('/studio-docs-index.json?v=20261121-handbook-2',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Knowledge index unavailable');return r.json()}),
      fetch('/docs-library.json?v=20261121-docs-library-v2',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Service reference index unavailable');return r.json()})
    ]).then(([a,b])=>{
      if(!Array.isArray(a.articles)||a.articles.length!==141||!Array.isArray(b.documents))throw Error('Incomplete documentation registry');
      index=a;service=b;loadError='';
    }).catch(e=>{loadError=e.message;}).finally(()=>{
      loading=null;
      const path=rootPage();
      if(['/docs/','/docs/studio/','/help/studio/','/sitemap/'].includes(path))refreshCurrent();
      renderFooterLinks();
    });
  }
  const icon=(name,cls='')=>{
    const shapes={
      search:'<circle cx="11" cy="11" r="6.8"/><path d="m16 16 5 5"/>',
      book:'<path d="M12 7c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1ZM12 7v14"/>',
      help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 0 1 5.3.7c0 2.2-2.8 2.5-2.8 4.3M12 17.5h.01"/>',
      layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
      compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2.2 5-4.8 1.7 2.2-5L15 9Z"/>',
      code:'<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-15-2 20"/>',
      spark:'<path d="m12 2 2.1 7.9L22 12l-7.9 2.1L12 22l-2.1-7.9L2 12l7.9-2.1L12 2Z"/>',
      shield:'<path d="m12 2 8 4v5c0 5.5-3.2 8.5-8 11-4.8-2.5-8-5.5-8-11V6l8-4Zm-3 9 2 2 4-4"/>',
      arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
      map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
      external:'<path d="M8 4H4v16h16v-7M12 4h8v8M20 4 9 15"/>',
      keyboard:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M6 9h1m3 0h1m3 0h1m3 0h1M7 14h10"/>',
      life:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6m5.6 5.6 3.6 3.6m0-12.8-3.6 3.6m-5.6 5.6-3.6 3.6"/>',
      grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      chevron:'<path d="m9 6 6 6-6 6"/>',
      menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
      close:'<path d="M5 5 19 19M19 5 5 19"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      minus:'<path d="M5 12h14"/>',
      home:'<path d="m3 10 9-7 9 7v10H3V10Zm6 10v-7h6v7"/>'
    };
    return '<svg class="'+E(cls)+'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[name]||shapes.book)+'</svg>';
  };
  const originalLogo=()=>'<img class="kb-official-logo" src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" alt="VELORYZ Studio" decoding="async" width="880" height="263">';
  const sourceAsset=(family,name,cls='')=>'<img class="kb-source-asset '+E(cls)+'" src="/assets/future-assets/'+family+'/'+name+'.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" width="120" height="120">';
  const arrow=()=>icon('arrow','kb-arrow');
  const searchTrigger=(compact=false)=>'<button type="button" class="kb-search-trigger'+(compact?' kb-search-compact':'')+'" data-kb-search aria-haspopup="dialog">'+icon('search')+'<span>Search documentation, questions, resources...</span><kbd>⌘ K</kbd></button>';
  const trail=items=>'<nav class="kb-trail" aria-label="Breadcrumb">'+items.map((a,i)=>i===items.length-1?'<span aria-current="page">'+E(a[0])+'</span>':'<a href="'+E(a[1])+'">'+E(a[0])+'</a>').join('<span class="kb-trail-divider">/</span>')+'</nav>';
  function art(kind){
    const inside={
      help:'<path d="M28 64Q28 36 56 36H166Q194 36 194 64V124Q194 152 166 152H93L62 176V152H56Q28 152 28 124Z"/><path d="M55 73H164M55 94H138M55 114H153"/><path class="kb-orbit-piece" d="M225 74H287Q315 74 315 102V159Q315 187 286 187H264L245 204V187H225Q201 187 201 161V102Q201 74 225 74Z"/><path d="m236 128 17 16 29-31"/>',
      studio:'<rect x="27" y="36" width="289" height="162" rx="12"/><path d="M27 69H316M48 52H60M73 52H85M99 52H111"/><path class="kb-orbit-piece" d="M52 90H142V170H52Z"/><path d="M164 100H292M164 123H267M164 146H281M164 168H227"/><path d="M126 199v17h94v-17"/>',
      map:'<rect x="39" y="86" width="93" height="71" rx="8"/><rect x="210" y="28" width="98" height="70" rx="8"/><rect x="205" y="155" width="102" height="57" rx="8"/><circle cx="169" cy="119" r="20"/><path class="kb-orbit-piece" d="M132 118h17m31-12 30-32m-31 57 27 48M58 111h53m-53 17h39M229 53h58m-58 16h45m-47 105h58M227 190h42"/>'
    };
    return '<svg class="kb-vector kb-vector-'+kind+'" viewBox="0 0 344 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="273" cy="68" r="65" fill="#d9f1ff" opacity=".4"/><path d="M24 212H326" stroke="#d6e4f0" stroke-width="2"/><g stroke="#148bd6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+(inside[kind]||inside.studio)+'</g></svg>';
  }
  const cards=arr=>arr.map(a=>'<a class="kb-entry" href="'+E(a.path)+'"><span class="kb-entry-icon">'+icon(a.kind==='help'?'help':a.kind==='guides'?'book':'layers')+'</span><span class="kb-entry-copy"><strong>'+E(a.title)+'</strong><span>'+E(a.summary)+'</span></span>'+icon('chevron','kb-entry-end')+'</a>').join('');
  const categories=items=>[...new Set(items.map(a=>a.category))];
  function sidebar(type,items){
    const selection=type==='studio'?'/docs/studio/':type==='help'?'/help/studio/':'/docs/';
    const cats=type==='studio'?categories(items.filter(x=>x.kind==='studio')).slice(0,11):[];
    return '<aside class="kb-sidebar" aria-label="Documentation navigation"><div class="kb-sidebar-brand"><a href="/" class="kb-official-brand" aria-label="VELORYZ Studio homepage">'+originalLogo()+'</a><span><strong>STUDIO / DOCUMENTATION</strong><small>Living Knowledge System</small></span></div>'+
      searchTrigger(true)+
      '<div class="kb-sidebar-caption">DISCOVER</div><nav class="kb-sidebar-nav">'+
      [['/docs/','Documentation','book'],['/help/studio/','Help Centre','help'],['/docs/studio/','Studio docs','layers'],['/sitemap/','Site map','map']].map(x=>'<a href="'+x[0]+'"'+(selection===x[0]?' class="is-active" aria-current="page"':'')+'>'+icon(x[2])+'<span>'+x[1]+'</span>'+icon('chevron','kb-nav-chevron')+'</a>').join('')+'</nav>'+
      (cats.length?'<div class="kb-sidebar-caption">STUDIO REFERENCE</div><nav class="kb-sidebar-nav kb-chapters">'+cats.map((x,i)=>'<a href="#kb-cat-'+slug(x)+'"><span class="kb-cat-number">'+String(i+1).padStart(2,'0')+'</span><span>'+E(x)+'</span></a>').join('')+'</nav>':'')+
      '<div class="kb-sidebar-caption">STUDIO LINKS</div><nav class="kb-sidebar-nav"><a href="/create/">'+icon('plus')+'<span>Start a project</span></a><a href="/contact/">'+icon('life')+'<span>Contact support</span></a><a href="/sitemap.xml">'+icon('map')+'<span>XML sitemap</span></a></nav>'+
      '<div class="kb-sidebar-help"><span>STILL NEED A HAND?</span><strong>We’re here to make it clearer.</strong><a href="/contact/">Talk to the team '+arrow()+'</a></div></aside>';
  }
  function cardFeature(type,title,description,href,label,count){
    return '<a class="kb-feature kb-feature-'+type+'" href="'+href+'"><div class="kb-feature-top"><span>'+icon(type==='help'?'help':type==='map'?'map':'layers')+' '+E(label)+'</span><span>'+String(count)+' resources</span></div>'+art(type)+sourceAsset(type==='help'?'help':type==='map'?'sitemap':'documentation',type==='help'?'help-beacon':type==='map'?'route-draw':'page-unfold','kb-feature-supplied-asset')+
      '<div class="kb-feature-body"><h3>'+E(title)+'</h3><p>'+E(description)+'</p><span class="kb-feature-action">Explore collection '+arrow()+'</span></div></a>';
  }
  function docsHome(items){
    const help=items.filter(x=>x.kind==='help'),studio=items.filter(x=>x.kind==='studio'),guides=items.filter(x=>x.kind==='guides');
    const picks=['D-004','D-079','D-086','D-094','D-107','H-003','H-014','H-016'].map(id=>items.find(a=>a.id===id)).filter(Boolean);
    const cat=categories(studio).filter(x=>x!=='Product overview and onboarding').slice(0,6);
    return '<div id="docs-app" class="kb-v4 kb-home"><div class="kb-grid-shell">'+sidebar('all',items)+'<main class="kb-main">'+trail([['Knowledge base','/docs/'],['Overview']])+
      '<section class="kb-intro kb-figma-intro">'+sourceAsset('ambient','aurora-drift','kb-intro-art')+sourceAsset('ambient','orbital-halo','kb-intro-art-two')+'<div class="kb-eyebrow"><span class="kb-live-dot"></span> THE VELORYZ KNOWLEDGE SYSTEM <span class="kb-sparkline">✳</span></div><h1>Find your way.<br><em>Make something remarkable.</em></h1><p>The home for everything VELORYZ Studio. Clear answers, deep references, and every route connected—beautifully and intentionally.</p>'+searchTrigger()+
      '<div class="kb-intro-stats"><span><b>'+items.length+'</b> articles</span><span><b>'+categories(studio).length+'</b> reference topics</span><span><b>01</b> connected system</span></div></section>'+
      '<section class="kb-section"><div class="kb-section-heading"><div><span class="kb-kicker">START HERE / 001</span><h2>Choose your way in.</h2></div><p>One connected knowledge experience, three clear paths.</p></div>'+
      '<div class="kb-feature-grid">'+cardFeature('help','Help Centre','Find answers, solve problems, and get support.', '/help/studio/','SUPPORT',help.length)+
      cardFeature('studio','Studio documentation','Explore the platform, processes, creative systems, and technical references.','/docs/studio/','REFERENCE',studio.length)+
      cardFeature('map','All documentation','Discover every guide, documentation category, and connected destination.','#kb-library','DIRECTORY',items.length)+'</div></section>'+
      '<section class="kb-section kb-section-compact"><div class="kb-section-heading"><div><span class="kb-kicker">STARTING POINTS / 002</span><h2>Good places to begin.</h2></div><a class="kb-text-link" href="/docs/studio/">View all topics '+arrow()+'</a></div><div class="kb-topic-grid">'+cat.map((c,i)=>{const a=studio.find(x=>x.category===c);return '<a class="kb-topic" href="'+E(a.path)+'"><span>'+icon(['layers','grid','spark','shield','code','compass'][i%6])+'</span><strong>'+E(c)+'</strong><small>'+String(studio.filter(x=>x.category===c).length)+' articles</small>'+arrow()+'</a>'}).join('')+'</div></section>'+
      '<section class="kb-section" id="kb-library"><div class="kb-section-heading"><div><span class="kb-kicker">DOCUMENTATION / 003</span><h2>Popular paths.</h2></div><button class="kb-inline-search" data-kb-search>'+icon('search')+' Search all resources</button></div><div class="kb-entry-list">'+cards(picks)+'</div><div class="kb-directory-actions"><a href="/docs/studio/">Studio reference '+arrow()+'</a><a href="/help/studio/">Help Centre '+arrow()+'</a><a href="/sitemap/">Site map '+arrow()+'</a></div></section>'+
      '<section class="kb-support"><div><span class="kb-kicker">YOU’RE NOT ALONE</span><h2>Need a little direction?</h2><p>Tell the Studio team what you’re working on. We’ll point you towards the right next step.</p></div><a href="/contact/">Contact the Studio '+arrow()+'</a></section></main></div></div>';
  }
  function helpHome(items){
    const help=items.filter(x=>x.kind==='help'&&x.id!=='H-001');
    const pick=[['H-002','Getting started','compass'],['H-003','Your first project','plus'],['H-006','Responsive design','grid'],['H-007','Project AI','spark'],['H-010','Preview & publishing','book'],['H-013','Billing & plans','shield'],['H-014','Troubleshooting','help'],['H-016','Contact support','life']].map(([id,title,ico])=>({article:help.find(x=>x.id===id),title,ico})).filter(x=>x.article);
    const faq=[['How do I get started?','Begin with the project creator to describe your goals and requirements. The team will guide the next step.','/help/studio/getting-started/'],['Can I publish a website instantly?','A submitted brief is not a published website. Releases are handled through the reviewed Studio delivery process.','/help/studio/publish/'],['Where can I request help with a project?','Use the Studio contact page and include your project reference and the action you need help with.','/help/studio/contact/'],['Where do I find the full product reference?','The Studio documentation collection covers projects, creative systems, publishing, and technical topics.','/docs/studio/']];
    return '<div id="docs-app" class="kb-v4 kb-help"><div class="kb-help-hero"><div class="kb-help-nav">'+trail([['Knowledge base','/docs/'],['Help Centre']])+'<a href="/docs/studio/">Studio documentation '+arrow()+'</a></div><div class="kb-help-content"><div class="kb-eyebrow">VELORYZ / HELP CENTRE</div><h1>How can we<br><em>help you?</em></h1><p>Answers that move you forward. From your first project to troubleshooting and everything in between.</p>'+searchTrigger()+'<div class="kb-help-chips"><span>POPULAR SEARCHES</span>'+[['Create a project','H-003'],['Publishing','H-010'],['Contact support','H-016']].map(([name,id])=>{const a=help.find(x=>x.id===id);return '<a href="'+(a?a.path:'/contact/')+'">'+E(name)+' ↗</a>'}).join('')+'</div></div>'+
      '<div class="kb-help-art" aria-hidden="true"><div class="kb-help-orbit kb-help-orbit-one"></div><div class="kb-help-orbit kb-help-orbit-two"></div><div class="kb-help-bubble kb-help-bubble-a">'+icon('help')+'</div><div class="kb-help-bubble kb-help-bubble-b">'+icon('spark')+'</div><div class="kb-help-bubble kb-help-bubble-c">'+icon('book')+'</div></div></div>'+
      '<div class="kb-help-body"><section class="kb-section"><div class="kb-section-heading"><div><span class="kb-kicker">QUICK FIND / 001</span><h2>What would you like to do?</h2></div><span class="kb-counter">'+help.length+' help articles</span></div><div class="kb-help-topics">'+pick.map(({article:a,title,ico},i)=>'<a class="kb-help-topic kb-help-topic-'+(i%4)+'" href="'+E(a.path)+'"><span class="kb-help-topic-icon">'+icon(ico)+'</span><h3>'+E(title)+'</h3><p>'+E(a.summary)+'</p><span class="kb-help-topic-cta">View guide '+arrow()+'</span></a>').join('')+'</div></section>'+
      '<section class="kb-section kb-help-faq"><div class="kb-section-heading"><div><span class="kb-kicker">FREQUENT QUESTIONS / 002</span><h2>Answers, without the searching.</h2></div><a href="/help/studio/faq/" class="kb-text-link">All help articles '+arrow()+'</a></div><div class="kb-faq-list">'+faq.map(([q,a,url],i)=>'<details class="kb-faq"'+(i===0?' open':'')+'><summary>'+E(q)+'<span>'+icon('plus')+'</span></summary><div class="kb-faq-answer">'+E(a)+' <a href="'+url+'">Read the full guide '+arrow()+'</a></div></details>').join('')+'</div></section>'+
      '<section class="kb-help-contact"><div class="kb-help-contact-copy"><span class="kb-kicker">PERSON-TO-PERSON SUPPORT</span><h2>Still have a question?</h2><p>Some things are easier to talk through. Tell us about your project or what’s not working.</p><div><a href="/contact/" class="kb-primary-action">Contact the team '+arrow()+'</a><a href="mailto:veloryz.here@gmail.com" class="kb-secondary-action">Email us '+icon('external')+'</a></div></div><div class="kb-help-contact-art">'+art('help')+'</div></section><div class="kb-help-endlinks"><a href="/docs/">All documentation ↗</a><a href="/sitemap/">Site map ↗</a><a href="/docs/studio/">Studio docs ↗</a></div></div></div>';
  }
  function studioHome(items){
    const studio=items.filter(x=>x.kind==='studio'&&x.id!=='D-001'),groups=categories(studio);
    const fast=['D-004','D-015','D-032','D-050','D-057','D-078'].map(id=>studio.find(a=>a.id===id)).filter(Boolean);
    return '<div id="docs-app" class="kb-v4 kb-studio"><div class="kb-grid-shell">'+sidebar('studio',items)+'<main class="kb-main">'+trail([['Knowledge base','/docs/'],['Studio documentation']])+
      '<section class="kb-intro kb-studio-intro"><div class="kb-eyebrow"><span class="kb-live-dot"></span> VELORYZ / STUDIO REFERENCE</div><h1>Explore the Studio.<br><em>Understand every detail.</em></h1><p>Practical, structured guides for creative systems, digital experiences, project operations and technical delivery. Clear instructions, linked to the actual Studio workflow.</p>'+searchTrigger()+'<div class="kb-intro-stats"><span><b>'+studio.length+'</b> references</span><span><b>'+groups.length+'</b> topics</span><span><b>01</b> connected platform</span></div></section>'+
      '<section class="kb-section"><div class="kb-section-heading"><div><span class="kb-kicker">ORIENTATION / 001</span><h2>Good starting points.</h2></div><a href="/help/studio/" class="kb-text-link">Need help? '+arrow()+'</a></div><div class="kb-starter-grid">'+fast.map((a,i)=>'<a class="kb-starter" href="'+E(a.path)+'"><span class="kb-starter-icon">'+icon(['compass','grid','spark','layers','code','shield'][i])+'</span><span class="kb-starter-no">'+String(i+1).padStart(2,'0')+'</span><h3>'+E(a.title)+'</h3><p>'+E(a.summary)+'</p><span>Open guide '+arrow()+'</span></a>').join('')+'</div></section>'+
      '<section class="kb-section" id="kb-studio-directory"><div class="kb-section-heading"><div><span class="kb-kicker">REFERENCE LIBRARY / 002</span><h2>Browse by topic.</h2></div><span class="kb-counter">'+studio.length+' articles across '+groups.length+' areas</span></div><div class="kb-studio-directory">'+groups.map((g,i)=>{const chunk=studio.filter(x=>x.category===g);return '<section id="kb-cat-'+slug(g)+'" class="kb-studio-category"><div class="kb-studio-category-heading"><span>'+String(i+1).padStart(2,'0')+'</span><div><h3>'+E(g)+'</h3><small>'+chunk.length+' articles</small></div></div><div class="kb-entry-list">'+cards(chunk)+'</div></section>'}).join('')+'</div></section><section class="kb-support"><div><span class="kb-kicker">NEED AN ANSWER?</span><h2>We can help you find it.</h2><p>Browse the Help Centre or contact the team about a specific project.</p></div><a href="/help/studio/">Explore Help Centre '+arrow()+'</a></section></main></div></div>';
  }
  function siteEntries(){
    const pub=library().map(a=>({...a,group:a.kind==='help'?'Help Centre':a.kind==='studio'?'Studio docs · '+a.category:'Service guides',type:a.kind}));
    const site=staticPages.map(([path,title,group,summary])=>({path,title,summary,group,type:'site'}));
    const seen=new Set();return [...site,...pub].filter(a=>{const p=a.path.replace(/\/+$/,'')||'/';if(seen.has(p))return false;seen.add(p);return true});
  }
  const networks=[
    {id:'studio',title:'VELORYZ Studio',sub:'Work, services and the team',href:'/studio/',kind:'site',count:'SITE'},
    {id:'help',title:'Help Centre',sub:'Common questions and support',href:'/help/studio/',kind:'help',count:'20'},
    {id:'docs',title:'Documentation',sub:'Guides and product references',href:'/docs/studio/',kind:'studio',count:'121'},
    {id:'pages',title:'Explore the site',sub:'Projects, design and contact',href:'/work/',kind:'site',count:'26'}
  ];
  function sitemapHero(){
    return '<div class="kb-map-top">'+trail([['Knowledge base','/docs/'],['Site map']])+
      '<div class="kb-map-heading"><span class="kb-eyebrow">THE LIVING BLUEPRINT / SITE MAP</span><h1>Every page.<br><em>Beautifully connected.</em></h1><p>Explore the whole Studio as a living network—or browse the complete directory below. Every node leads somewhere real.</p></div>'+
      '<div class="kb-map-tabs" aria-label="Site map filters">'+[['all','All destinations'],['site','Studio site'],['help','Help Centre'],['studio','Studio docs'],['guides','Service guides']].map(([id,name])=>'<button type="button" data-kb-map-filter="'+id+'" aria-pressed="'+(id===mapFilter?'true':'false')+'">'+name+'</button>').join('')+'</div></div>';
  }
  function sitemapNetwork(){
    const on=networks.find(x=>x.id===activeNode)||networks[0];
    return '<section class="kb-map-visual" aria-label="Interactive site network"><div class="kb-map-panel-title"><span><span class="kb-live-dot"></span> CONNECTED NAVIGATION</span><div class="kb-map-controls"><button type="button" data-kb-map-zoom="-1" aria-label="Zoom out">'+icon('minus')+'</button><button type="button" data-kb-map-fit aria-label="Reset zoom">Fit</button><button type="button" data-kb-map-zoom="1" aria-label="Zoom in">'+icon('plus')+'</button></div></div>'+
      '<div class="kb-network" id="kb-network"><div class="kb-network-inner" id="kb-network-inner" style="transform:scale('+zoom+')"><svg class="kb-network-lines" viewBox="0 0 1000 460" aria-hidden="true" preserveAspectRatio="none"><path d="M490 230C360 230 320 130 190 110"/><path d="M510 230C640 230 690 130 820 110"/><path d="M490 250C365 250 325 359 190 360"/><path d="M510 250C640 250 690 360 820 360"/></svg>'+
      '<div class="kb-hub"><div class="kb-hub-orbit"></div><span class="kb-hub-name">VELORYZ</span><small>KNOWLEDGE SYSTEM</small></div>'+
      networks.map((n,i)=>'<button class="kb-map-node kb-map-node-'+n.id+(n.id===activeNode?' is-selected':'')+'" type="button" data-kb-map-node="'+n.id+'" aria-pressed="'+(n.id===activeNode?'true':'false')+'"><span class="kb-map-node-icon">'+icon(n.id==='help'?'help':n.id==='docs'?'book':n.id==='pages'?'compass':'layers')+'</span><span><strong>'+E(n.title)+'</strong><small>'+E(n.count)+' / '+E(n.sub)+'</small></span></button>').join('')+'</div></div>'+
      '<div class="kb-map-preview" id="kb-map-preview" aria-live="polite"><div><span class="kb-kicker">SELECTED DESTINATION</span><h3>'+E(on.title)+'</h3><p>'+E(on.sub)+'</p></div><a href="'+E(on.href)+'">Open destination '+arrow()+'</a></div></section>';
  }
  function sitemapDirectory(){
    const entries=siteEntries(),q=mapSearch.trim().toLowerCase();
    const current=entries.filter(x=>(mapFilter==='all'||x.type===mapFilter)&&(!q||[x.title,x.summary,x.group,x.path].join(' ').toLowerCase().includes(q)));
    const grouped=new Map();
    for(const entry of current){if(!grouped.has(entry.group))grouped.set(entry.group,[]);grouped.get(entry.group).push(entry)}
    return '<div class="kb-map-directory-head"><div><span class="kb-kicker">FULL DIRECTORY / '+entries.length+' DESTINATIONS</span><h2>Find a destination.</h2><p>Real pages, structured by their place in the Studio ecosystem.</p></div><label class="kb-map-search">'+icon('search')+'<input type="search" id="kb-map-search" placeholder="Filter pages, articles, and topics…" value="'+E(mapSearch)+'" autocomplete="off"><span class="kb-map-count" id="kb-map-count">'+current.length+' results</span></label></div><div id="kb-map-results" class="kb-map-results">'+(current.length?[...grouped].map(([g,list],i)=>'<details class="kb-map-group"'+(i<3||q?' open':'')+'><summary><span>'+icon('layers')+'<strong>'+E(g)+'</strong></span><small>'+list.length+' pages</small>'+icon('chevron')+'</summary><div class="kb-map-links">'+list.map(a=>'<a href="'+E(a.path)+'"><span>'+E(a.title)+'</span><small>'+E(a.summary)+'</small>'+icon('arrow')+'</a>').join('')+'</div></details>').join(''):'<div class="kb-empty">No matching destinations. Try another term or category.</div>')+'</div>';
  }
  function siteMap(){
    return '<div id="site-map-app" class="kb-v4 kb-map">'+sitemapHero()+'<div class="kb-map-wrap">'+sitemapNetwork()+'<section class="kb-map-directory" id="kb-map-directory">'+sitemapDirectory()+'</section><div class="kb-map-bottom"><a href="/docs/">All documentation '+arrow()+'</a><a href="/sitemap.xml">Machine-readable XML sitemap '+arrow()+'</a><a href="/contact/">Report a broken link '+arrow()+'</a></div></div></div>';
  }
  function errorPanel(kind){
    return '<div id="'+(kind==='map'?'site-map-app':'docs-app')+'" class="kb-v4 kb-loading"><div class="kb-loading-inner"><span class="kb-eyebrow">VELORYZ / KNOWLEDGE</span><h1>'+(loadError?'Knowledge temporarily unavailable':'Opening the knowledge system…')+'</h1><p>'+E(loadError||'Connecting the documentation index and page directory.')+'</p>'+(loadError?'<button type="button" data-kb-retry>Retry loading</button>':'')+'</div></div>';
  }
  function docsRender(){
    const p=rootPage();
    if(!['/docs/','/docs/studio/','/help/studio/'].includes(p))return previousDocs.render();
    if(!index||!service){fetchIndex();return errorPanel('docs')}
    const items=library();
    if(p==='/docs/')return docsHome(items);
    return p==='/help/studio/'?helpHome(items):studioHome(items);
  }
  function mapRender(){
    if(!index||!service){fetchIndex();return errorPanel('map')}
    return siteMap();
  }
  function refreshCurrent(){
    const p=rootPage();
    if(p==='/sitemap/'){const n=document.getElementById('site-map-app');if(n)n.outerHTML=mapRender();}
    else if(['/docs/','/docs/studio/','/help/studio/'].includes(p)){const n=document.getElementById('docs-app');if(n)n.outerHTML=docsRender();}
  }
  function renderFooterLinks(){
    const box=document.getElementById('footer-knowledge-links');
    if(!box||!index||!service)return;
    const items=library();
    const chunks=[
      ['Help Centre',items.filter(a=>a.kind==='help')],
      ['Studio documentation',items.filter(a=>a.kind==='studio')],
      ['Studio service guides',items.filter(a=>a.kind==='guides')]
    ];
    box.innerHTML=chunks.map(([title,entries])=>
      '<section class="footer-index-section"><h3>'+E(title)+' <span>'+entries.length+' articles</span></h3><div class="footer-index-grid">'+
      entries.map(a=>'<a href="'+E(a.path)+'">'+E(a.title)+'</a>').join('')+'</div></section>').join('');
  }
  document.addEventListener('toggle',ev=>{
    if(ev.target?.id!=='footer-knowledge-index'||!ev.target.open)return;
    const promise=fetchIndex();
    if(promise&&typeof promise.then==='function')promise.then(renderFooterLinks);
    else renderFooterLinks();
  },true);
  window.VeloryzDocs={...previousDocs,render:docsRender,refresh:refreshCurrent};
  window.VeloryzSiteMap={...previousMap,render:mapRender,refresh:refreshCurrent};
  function ensurePalette(){
    if(palette&&palette.isConnected)return palette;
    palette=document.createElement('dialog');palette.id='kb-command';palette.className='kb-command';
    palette.setAttribute('aria-label','Search VELORYZ knowledge');
    palette.innerHTML='<div class="kb-command-head">'+icon('search')+'<input type="search" id="kb-command-input" placeholder="Search everything in VELORYZ…" aria-label="Search documentation and support" autocomplete="off"><button type="button" data-kb-close aria-label="Close search">'+icon('close')+'</button></div>'+
      '<div class="kb-command-filter" role="group" aria-label="Search area">'+[['all','All'],['help','Help'],['studio','Studio docs'],['guides','Guides']].map(([id,l])=>'<button type="button" data-kb-palette-filter="'+id+'" aria-pressed="'+(id==='all'?'true':'false')+'">'+l+'</button>').join('')+'</div><div class="kb-command-results" id="kb-command-results"></div><div class="kb-command-foot"><span>↑ ↓ navigate · Enter open</span><span>Esc close · Search across '+(library().length||'all')+' articles</span></div>';
    document.body.appendChild(palette);
    palette.addEventListener('click',ev=>{if(ev.target===palette)palette.close()});
    return palette;
  }
  function paletteResults(){
    if(!palette||!palette.isConnected)return;
    const matches=library().filter(a=>(searchFilter==='all'||a.kind===searchFilter)&&(!searchTerm||[a.title,a.category,a.summary].join(' ').toLowerCase().includes(searchTerm.toLowerCase()))).slice(0,12);
    const out=palette.querySelector('#kb-command-results');
    out.innerHTML=matches.length?'<div class="kb-command-small">'+(searchTerm?'SEARCH RESULTS':'SUGGESTED ARTICLES')+'</div>'+matches.map((a,i)=>'<a class="kb-command-result" href="'+E(a.path)+'" data-kb-palette-result><span class="kb-command-result-icon">'+icon(a.kind==='help'?'help':a.kind==='guides'?'book':'layers')+'</span><span><strong>'+E(a.title)+'</strong><small>'+E(a.category)+'</small></span>'+(i===0?'<kbd>↵</kbd>':icon('arrow'))+'</a>').join(''):'<div class="kb-command-empty">No matches. Try another term or browse the <a href="/sitemap/">site map</a>.</div>';
  }
  function openPalette(){
    if(!index||!service)fetchIndex();
    const d=ensurePalette();searchTerm='';searchFilter='all';d.querySelector('#kb-command-input').value='';
    d.querySelectorAll('[data-kb-palette-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kbPaletteFilter==='all')));
    paletteResults();
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
    d.querySelector('#kb-command-input').focus();
  }
  function syncNetwork(){
    const inner=document.getElementById('kb-network-inner');if(inner)inner.style.transform='scale('+zoom+')';
    document.querySelectorAll('[data-kb-map-node]').forEach(b=>{
      const active=b.dataset.kbMapNode===activeNode;
      b.classList.toggle('is-selected',active);
      b.setAttribute('aria-pressed',String(active));
    });
    const preview=document.getElementById('kb-map-preview');const node=networks.find(x=>x.id===activeNode);
    if(preview&&node)preview.innerHTML='<div><span class="kb-kicker">SELECTED DESTINATION</span><h3>'+E(node.title)+'</h3><p>'+E(node.sub)+'</p></div><a href="'+E(node.href)+'">Open destination '+arrow()+'</a>';
  }
  function updateMapDirectory(){
    const area=document.getElementById('kb-map-directory');if(area)area.innerHTML=sitemapDirectory();
    const query=area?.querySelector('#kb-map-search');if(query&&document.activeElement?.id==='kb-map-search'){query.focus();query.setSelectionRange(mapSearch.length,mapSearch.length)}
  }
  document.addEventListener('click',ev=>{
    const button=ev.target.closest?.('[data-kb-search]');if(button){ev.preventDefault();openPalette();return}
    const close=ev.target.closest?.('[data-kb-close]');if(close&&palette){palette.close();return}
    const filter=ev.target.closest?.('[data-kb-palette-filter]');
    if(filter){searchFilter=filter.dataset.kbPaletteFilter;palette.querySelectorAll('[data-kb-palette-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));paletteResults();return}
    const chosen=ev.target.closest?.('[data-kb-map-node]');
    if(chosen){activeNode=chosen.dataset.kbMapNode;syncNetwork();return}
    const zoomBtn=ev.target.closest?.('[data-kb-map-zoom]');
    if(zoomBtn){zoom=Math.min(1.5,Math.max(.75,zoom+Number(zoomBtn.dataset.kbMapZoom)*.15));syncNetwork();return}
    const fit=ev.target.closest?.('[data-kb-map-fit]');
    if(fit){zoom=1;syncNetwork();return}
    const mapBtn=ev.target.closest?.('[data-kb-map-filter]');
    if(mapBtn){mapFilter=mapBtn.dataset.kbMapFilter;document.querySelectorAll('[data-kb-map-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===mapBtn)));updateMapDirectory();return}
    const result=ev.target.closest?.('[data-kb-palette-result]');
    if(result&&palette?.open)palette.close();
    const retry=ev.target.closest?.('[data-kb-retry]');if(retry){loadError='';index=null;service=null;fetchIndex();return}
  });
  document.addEventListener('input',ev=>{
    if(ev.target.id==='kb-command-input'){searchTerm=ev.target.value.slice(0,150);paletteResults()}
    if(ev.target.id==='kb-map-search'){
      mapSearch=ev.target.value.slice(0,160);
      const holder=document.getElementById('kb-map-results');if(!holder)return;
      const all=siteEntries().filter(a=>(mapFilter==='all'||a.type===mapFilter)&&(!mapSearch.trim()||[a.title,a.summary,a.group,a.path].join(' ').toLowerCase().includes(mapSearch.toLowerCase())));
      const groups=new Map();for(const a of all){if(!groups.has(a.group))groups.set(a.group,[]);groups.get(a.group).push(a)}
      holder.innerHTML=all.length?[...groups].map(([g,list])=>'<details class="kb-map-group" open><summary><span>'+icon('layers')+'<strong>'+E(g)+'</strong></span><small>'+list.length+' pages</small>'+icon('chevron')+'</summary><div class="kb-map-links">'+list.map(a=>'<a href="'+E(a.path)+'"><span>'+E(a.title)+'</span><small>'+E(a.summary)+'</small>'+icon('arrow')+'</a>').join('')+'</div></details>').join(''):'<div class="kb-empty">No matching destinations.</div>';
      const num=document.getElementById('kb-map-count');if(num)num.textContent=all.length+' results';
    }
  });
  document.addEventListener('keydown',ev=>{
    const inField=ev.target.matches?.('input,textarea,[contenteditable],select');
    if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='k'){
      if(['/docs/','/docs/studio/','/help/studio/','/sitemap/'].includes(rootPage())||rootPage().startsWith('/docs/')||rootPage().startsWith('/help/studio/')){
        ev.preventDefault();openPalette();
      }
    }else if(ev.key==='/'&&!inField&&!ev.ctrlKey&&!ev.metaKey&&(['/docs/','/docs/studio/','/help/studio/','/sitemap/'].includes(rootPage()))){ev.preventDefault();openPalette()}
    else if(ev.key==='Enter'&&palette?.open&&ev.target.id==='kb-command-input'){
      const a=palette.querySelector('[data-kb-palette-result]');if(a){ev.preventDefault();palette.close();a.click()}
    }
  });
  document.addEventListener('studio:route',()=>{if(palette?.open)palette.close();renderFooterLinks();});

  let readerScrollFrame=0,readingObserver=null;
  function syncReaderProgress(){
    const host=document.querySelector('#docs-app.studio-docs-shell');
    const prose=host?.querySelector('.studio-docs-prose');
    if(!prose)return;
    const rect=prose.getBoundingClientRect();
    const usable=Math.max(1,rect.height-innerHeight*.52);
    const progress=Math.max(0,Math.min(100,Math.round((innerHeight*.42-rect.top)/usable*100)));
    const progressBar=host.querySelector('.kb-reader-progress');
    if(progressBar){progressBar.style.width=progress+'%';progressBar.setAttribute('aria-valuenow',String(progress));}
    const headings=Array.from(prose.querySelectorAll('h2[id],h3[id]'));
    let current=headings[0]?.id||'';
    for(const h of headings){if(h.getBoundingClientRect().top<innerHeight*.32)current=h.id;else break;}
    host.querySelectorAll('.studio-docs-right nav a[href^="#"]').forEach(a=>{
      const active=a.getAttribute('href')==='#'+current;
      a.classList.toggle('kb-toc-active',active);
      if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
    });
  }
  function enhanceReader(){
    const host=document.querySelector('#docs-app.studio-docs-shell.studio-docs-reader');
    if(!host||host.dataset.kbReaderEnhanced==='yes')return;
    const article=host.querySelector('.studio-docs-article');
    const hero=host.querySelector('.studio-docs-article-hero');
    if(!article||!hero)return;
    host.dataset.kbReaderEnhanced='yes';
    const progress=document.createElement('div');
    progress.className='kb-reader-progress';
    progress.setAttribute('role','progressbar');
    progress.setAttribute('aria-label','Article reading progress');
    progress.setAttribute('aria-valuemin','0');
    progress.setAttribute('aria-valuemax','100');
    progress.setAttribute('aria-valuenow','0');
    host.prepend(progress);
    const controls=document.createElement('div');
    controls.className='kb-reader-tools';
    controls.innerHTML='<button type="button" class="kb-reader-search" data-kb-search>'+icon('search')+' Search in knowledge <kbd>⌘ K</kbd></button><button type="button" class="kb-rail-toggle" data-kb-rail-toggle aria-expanded="true">'+icon('menu')+' Toggle sidebar</button>';
    article.insertBefore(controls,hero);
    const notes=document.createElement('aside');notes.className='kb-article-feedback';
    const pageTitle=article.querySelector('h1')?.textContent?.trim()||'VELORYZ guide';
    const subject=encodeURIComponent('VELORYZ documentation feedback: '+pageTitle);
    const body=encodeURIComponent('Article: '+location.href+'\n\nSuggested improvement or issue:\n');
    notes.innerHTML='<div><span class="kb-kicker">HELP IMPROVE THIS GUIDE</span><h3>Was this information useful?</h3><p>Your corrections help keep the knowledge system clear and accurate.</p></div><div><a href="mailto:veloryz.here@gmail.com?subject='+subject+'&body='+body+'">Suggest an improvement '+icon('arrow')+'</a><a href="/help/studio/contact/">Need more help? '+icon('life')+'</a></div>';
    article.appendChild(notes);
    syncReaderProgress();
  }
  document.addEventListener('click',ev=>{
    const toggle=ev.target.closest?.('[data-kb-rail-toggle]');
    if(toggle){const host=document.querySelector('#docs-app.studio-docs-shell.studio-docs-reader');if(host){const collapsed=host.classList.toggle('kb-reader-rail-collapsed');toggle.setAttribute('aria-expanded',String(!collapsed));}}
  });
  window.addEventListener('scroll',()=>{
    if(readerScrollFrame)return;
    readerScrollFrame=requestAnimationFrame(()=>{readerScrollFrame=0;syncReaderProgress()});
  },{passive:true});
  window.addEventListener('resize',syncReaderProgress,{passive:true});
  document.addEventListener('studio:route',()=>{enhanceReader();syncReaderProgress()});
  if(typeof MutationObserver==='function'){
    readingObserver=new MutationObserver(()=>enhanceReader());
    const main=document.getElementById('main');
    if(main)readingObserver.observe(main,{childList:true,subtree:true});
  }
  enhanceReader();
  window.VeloryzKnowledgeV4={render:docsRender,siteMap:mapRender,search:openPalette,getArticles:library};
})();
