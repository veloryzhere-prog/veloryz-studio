/* VELORYZ Studio Control / Command Center 2.0
 * Additive interface only: reuses the authenticated CMS, private APIs and existing save/publish lifecycle.
 */
(function () {
  'use strict';
  const navGroups = [
    {title:'WORKSPACE', links:[['command','Command center','grid'],['overview','Studio overview','grid'],['enquiries','Enquiry inbox','content'],['client-portal','Client workspaces','work'],['payments','Payment requests','offer']]},
    {title:'STUDIO INTELLIGENCE', links:[['ai-minds','AI character minds','brand'],['knowledge-ai','AI agent console','settings'],['platform','AI & platform settings','settings']]},
    {title:'CREATIVE CONTROL', links:[['projects','Projects & showcases','work'],['catalogue','Design library','brand'],['media','Media studio','media'],['offers','Ads & announcements','offer'],['content','Pages & copy','content'],['branding','Brand assets','brand'],['documentation','Documentation CMS','content']]},
    {title:'OPERATIONS', links:[['settings','Site settings','settings'],['history','Version history','history']]}
  ];
  const characters = [
    {id:'aryan',name:'ARYAN',role:'Flagship adviser',focus:'Decisions, creative direction and escalation',line:'Confident / decisive / composed',color:'peach'},
    {id:'happy',name:'Happy',role:'First-contact guide',focus:'Welcoming visitors and answering general questions',line:'Warm / energetic / conversational',color:'mint'},
    {id:'nikhil',name:'Nikhil',role:'Analytical adviser',focus:'Practical strategy, requirements and next steps',line:'Precise / thoughtful / useful',color:'blue'},
    {id:'milky',name:'Milky',role:'Creative adviser',focus:'Visual identity, design inspiration and storytelling',line:'Imaginative / expressive / considerate',color:'rose'},
    {id:'ritik',name:'Ritik',role:'Technical adviser',focus:'Web technology, integrations and feasibility',line:'Clear / technical / solution-led',color:'lavender'}
  ];
  let mindId='aryan', mediaMode='all', mediaQuery='', lastJumpFocus=null;
  const htmlSafe=value=>E(value==null?'':value);
  const fmtBytes=n=>n>=1024*1024*1024?(n/1024/1024/1024).toFixed(1)+' GB':(n/1024/1024).toFixed(1)+' MB';
  function linkTo(id){return '#/'+id;}
  function stat(figure,label,detail,url){
    return '<a class="sc-stat" href="'+url+'"><span class="sc-stat-label">'+label+' <span aria-hidden="true">↗</span></span><strong>'+figure+'</strong><small>'+detail+'</small></a>';
  }
  function tile(href,symbol,label,description,tag){
    return '<a class="sc-tool" href="'+href+'"><span class="sc-tool-icon" aria-hidden="true">'+symbol+'</span><span class="sc-tool-copy"><strong>'+label+'</strong><small>'+description+'</small></span><span class="sc-tool-tag">'+tag+'</span><span class="sc-tool-arrow" aria-hidden="true">↗</span></a>';
  }
  function sidebar(){
    const current=section;
    let groups=navGroups.map(group=>{
      const links=group.links.map(([id,label,ico])=>
        '<a href="'+linkTo(id)+'" class="'+(current===id?'active':'')+'" '+(current===id?'aria-current="page"':'')+'>'+
        '<span class="sc-nav-icon">'+icon(ico)+'</span><span>'+label+'</span>'+
        (id==='projects'?'<small class="sc-nav-count">'+(workspace.state.projects||[]).length+'</small>':'')+
        (current===id?'<span class="sc-active-dot" aria-hidden="true"></span>':'')+'</a>'
      ).join('');
      return '<div class="sc-nav-group"><div class="sc-nav-heading">'+group.title+'</div><nav class="admin-nav" aria-label="'+group.title.toLowerCase()+'">'+links+'</nav></div>';
    }).join('');
    return '<aside class="sidebar sc-sidebar"><a href="#/command" class="admin-brand sc-brand" aria-label="Veloryz Studio Control home"><span class="sc-brand-symbol">V</span><span><strong>VELORYZ<span class="sc-brand-suffix"> / CONTROL</span></strong><small>THE STUDIO OS</small></span></a>'+
      '<button type="button" class="sc-sidebar-search" data-sc-jump><span aria-hidden="true">⌕</span> Search every console <kbd>Ctrl K</kbd></button>'+
      '<div class="sc-nav-scroll">'+groups+'</div>'+
      '<div class="sidebar-bottom sc-sidebar-bottom"><div class="sc-live-note"><span class="sc-led"></span><span>OWNER WORKSPACE<br><small>Private administration</small></span></div>'+
      '<div class="sidebar-user"><div class="avatar">'+htmlSafe(String(workspace.user?.name||'Studio owner').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase())+'</div><div><strong>'+htmlSafe(workspace.user?.name||'Studio owner')+'</strong><span>Administrator</span></div><button data-platform="lock" aria-label="Lock workspace and sign out" class="icon-button">'+icon('logout')+'</button></div></div></aside><div class="admin-mobile-overlay" data-action="close-menu"></div>';
  }
  function command(){
    const s=workspace.state, activeOffers=(s.offers||[]).filter(active).length;
    const featured=(s.projects||[]).filter(x=>x.featured&&x.published).length;
    const needsDraft=!!(workspace.dirty||workspace.hasDraft);
    return '<section class="sc-welcome"><div class="sc-welcome-copy"><span class="sc-kicker"><span class="sc-led"></span> VELORYZ CONTROL / HOME</span>'+
      '<h1>Your studio.<br><em>In your control.</em></h1><p>One focused workspace for your website, intelligent assistants, creative media and every client conversation.</p>'+
      '<div class="sc-welcome-actions"><a href="#/ai-minds" class="admin-button">Open AI mind studio ↗</a><a href="#/media" class="admin-button secondary">Explore media library</a></div></div>'+
      '<div class="sc-welcome-visual" aria-hidden="true"><span class="sc-orbit sc-orbit-one"></span><span class="sc-orbit sc-orbit-two"></span><span class="sc-orbit sc-orbit-three"></span><span class="sc-core">V</span><span class="sc-visual-caption">CREATE / CONTROL / EVOLVE</span></div></section>'+
      '<div class="sc-status-ribbon"><div><span class="sc-status-indicator '+(needsDraft?'is-pending':'')+'"></span><strong>'+(workspace.dirty?'Unsaved edits in this session':workspace.hasDraft?'A saved draft is awaiting publication':'Published content is up to date')+'</strong><small>Site edits use the Save draft → Preview → Publish workflow.</small></div><div><a href="/admin/preview" target="_blank" rel="noopener" class="sc-text-action">Preview ↗</a><button class="admin-button secondary" data-action="save">Save draft</button><button class="admin-button" data-action="publish">Publish site ↗</button></div></div>'+
      '<div class="sc-stat-grid">'+stat(String((s.projects||[]).length).padStart(2,'0'),'Portfolio projects',featured+' currently featured','#/projects')+
      stat('09','AI personalities & agents','5 advisers / 4 role assistants','#/ai-minds')+
      stat(String(activeOffers).padStart(2,'0'),'Live broadcasts','Enabled and within schedule','#/offers')+
      stat('v'+workspace.publishedVersion,'Site version','Published CMS revision','#/history')+'</div>'+
      '<div class="sc-section-heading"><div><span class="sc-kicker">ONE SPACE, ALL THE CONTROLS</span><h2>Choose your workspace</h2><p>Each console has a separate purpose, with changes connected to the existing studio platform.</p></div><button type="button" class="sc-all-shortcuts" data-sc-jump>Jump to anything <span>↗</span></button></div>'+
      '<div class="sc-tool-grid">'+
      tile('#/ai-minds','✳','AI Mind Studio','Individual briefs and character behaviour for the five advisers.','PERSONAS')+
      tile('#/knowledge-ai','◈','AI Agent Console','Provider, model, instructions, encrypted keys and live tests.','4 AGENTS')+
      tile('#/media','▣','Media Studio','Upload, browse and reuse images and project films.','ASSETS')+
      tile('#/content','◫','Website CMS','Homepage, services, people and editorial content.','PAGES')+
      tile('#/offers','✦','Campaign Control','Announcements, popups, advertisements and schedules.','CAMPAIGNS')+
      tile('#/client-portal','◎','Client Operations','Project progress, deliverables, approvals and messages.','WORKFLOW')+
      tile('#/branding','◇','Brand Identity','Wordmarks, favicons and separate brand image slots.','ASSETS')+
      tile('#/documentation','≡','Knowledge & Docs','Documentation pages, routing and publication controls.','CMS')+
      '</div>'+
      '<div class="sc-two-column"><section class="sc-panel sc-panel-actions"><div class="sc-panel-head"><div><span class="sc-kicker">COMMON ACTIONS</span><h2>Quick launch</h2></div></div>'+
      '<div class="sc-action-list"><button type="button" data-action="new-project"><span>+</span> New showcase project <b>↗</b></button>'+
      '<button type="button" data-action="new-offer" data-kind="announcement" data-placement="popup"><span>✦</span> Create announcement <b>↗</b></button>'+
      '<button type="button" data-action="upload"><span>↥</span> Upload image or film <b>↗</b></button>'+
      '<a href="#/enquiries"><span>✉</span> View customer enquiries <b>↗</b></a></div></section>'+
      '<section class="sc-panel sc-panel-release"><div class="sc-panel-head"><div><span class="sc-kicker">DEPLOYMENT WORKFLOW</span><h2>Make changes safely</h2></div></div>'+
      '<div class="sc-release-track"><div><i>01</i><strong>Edit</strong><small>Make changes in a console.</small></div><div><i>02</i><strong>Save</strong><small>Store changes as an owner draft.</small></div><div><i>03</i><strong>Preview</strong><small>Review before visitors see them.</small></div><div><i>04</i><strong>Publish</strong><small>Update the public website.</small></div></div>'+
      '<p>AI provider credentials and client records are private operational settings, not website draft content.</p></section></div>';
  }
  function minds(){
    const c=characters.find(x=>x.id===mindId)||characters[0];
    const tab=characters.map(x=>'<button type="button" role="tab" aria-selected="'+(c.id===x.id)+'" class="sc-persona '+(c.id===x.id?'selected':'')+'" data-sc-mind="'+x.id+'"><img src="/assets/ai-avatars/'+x.id+'.webp" alt="" loading="lazy"><span><strong>'+x.name+'</strong><small>'+x.role+'</small></span><span class="sc-persona-arrow" aria-hidden="true">↗</span></button>').join('');
    const prompt=String(getPath(workspace.state,'site.'+c.id+'Brief')||'');
    return heading('Studio intelligence / personalities','AI Mind Studio','Choose a character, refine its creative specialty and save a new public-site draft. Each personality has its own brief.')+
      '<section class="sc-mind-intro"><div><span class="sc-kicker">TWO SYSTEMS. ONE STUDIO.</span><h2>Character minds + independent service agents.</h2><p>The five visitor advisers use the main AI provider with different character briefs. Help Centre, Contact Support, Client Portal and Project Creator have separate protected provider and instruction settings.</p></div><a href="#/knowledge-ai" class="admin-button secondary">Manage service agents ↗</a></section>'+
      '<div class="sc-mind-layout"><section class="sc-mind-roster"><div class="sc-inner-head"><span>01 / CHARACTER ROSTER</span><strong>5 DISTINCT ADVISERS</strong></div><div class="sc-personas" role="tablist" aria-label="Choose AI personality">'+tab+'</div><div class="sc-roster-foot"><span class="sc-led"></span> Settings are saved with the studio draft.</div></section>'+
      '<section class="sc-mind-editor"><div class="sc-selected-mind"><div class="sc-selected-avatar sc-tone-'+c.color+'"><img src="/assets/ai-avatars/'+c.id+'.webp" alt="'+c.name+' avatar"></div>'+
      '<div><span class="sc-kicker">02 / SELECTED INTELLIGENCE</span><h2>'+c.name+' <span>↗</span></h2><p>'+c.role+' · '+c.focus+'</p><small>'+c.line+'</small></div></div>'+
      '<div class="sc-mind-facts"><div><small>PROFILE ROLE</small><strong>'+c.role+'</strong></div><div><small>VISITOR CHANNEL</small><strong>Public studio chat</strong></div><div><small>CONFIGURATION</small><strong>Published character brief</strong></div></div>'+
      '<div class="sc-mind-field"><h3>Personality & mindset instructions</h3><p>Guide how this adviser speaks and which studio topics it specialises in. This is one per-character brief, not a separate AI model or private memory.</p>'+
      field(c.name+' behaviour brief','site.'+c.id+'Brief',{textarea:true,full:true,max:500,help:'Up to 500 characters. Save the draft and publish to apply this to the public adviser.'})+
      '<div class="sc-mind-limits"><span>'+prompt.length+' / 500 characters currently saved in this draft</span><span>Owner edited</span></div></div>'+
      '<div class="sc-mind-actions"><button class="admin-button" type="button" data-action="save">Save character draft</button><a href="#/platform" class="admin-button secondary">Provider & model settings ↗</a><button class="admin-button secondary" type="button" data-sc-test-ai>Test provider</button></div><div id="sc-mind-test" class="sc-diagnostic-output" role="status" aria-live="polite"></div></section></div>'+
      '<section class="sc-mind-footer"><div><span class="sc-kicker">03 / INDEPENDENT ASSISTANTS</span><h2>Role-based intelligence, separately configured.</h2><p>Help, support, client guidance and project planning each have their own settings, access and provider checks.</p></div><a href="#/knowledge-ai">Open the full AI agent console ↗</a></section>';
  }
  function media(){
    const images=mediaItems.filter(x=>String(x.mime||'').startsWith('image/'));
    const videos=mediaItems.filter(x=>String(x.mime||'').startsWith('video/'));
    const size=mediaItems.reduce((n,x)=>n+Number(x.size||0),0);
    const modes=[['all','All assets',mediaItems.length],['image','Images',images.length],['video','Videos',videos.length]];
    const tiles=mediaItems.map(item=>{
      const kind=String(item.mime||'').split('/')[0];
      return '<div class="sc-media-item" data-sc-media-card data-kind="'+htmlSafe(kind)+'" data-name="'+htmlSafe(String(item.filename||'').toLowerCase())+'">'+mediaCard(item)+'</div>';
    }).join('');
    return heading('Creative control / library','Media Studio','A dedicated place to manage your image assets, brand files, campaign artwork and project films.')+
      '<section class="sc-media-overview"><div><span class="sc-kicker">ASSET CONTROL</span><h2>One library.<br>Every visual.</h2><p>Upload once, choose the asset inside projects, campaigns, brand settings or your studio pages.</p>'+
      '<div class="sc-media-hero-actions"><button class="admin-button" data-action="upload">+ Upload media</button><button class="admin-button secondary" type="button" data-sc-diagnostics>Check storage connection</button></div></div>'+
      '<div class="sc-media-art" aria-hidden="true"><span class="sc-media-shape a"></span><span class="sc-media-shape b"></span><span class="sc-media-shape c"></span><span class="sc-media-art-label">MEDIA / STUDIO</span></div></section>'+
      '<div class="sc-media-stats">'+stat(String(mediaItems.length).padStart(2,'0'),'Library items','Images + videos','#/media')+
      stat(String(images.length).padStart(2,'0'),'Images','PNG / JPG / WebP / GIF / AVIF','#/media')+
      stat(String(videos.length).padStart(2,'0'),'Project films','MP4 / WebM','#/media')+
      stat(fmtBytes(size),'Stored in library','Current visible asset total','#/media')+'</div>'+
      '<div class="sc-upload-drop" id="sc-media-drop" tabindex="0" role="button" aria-label="Drop an image or video here, or press Enter to choose a file"><span class="sc-drop-symbol">↥</span><div><strong>Drop images and films here</strong><p>Or use the Upload media button. Images up to 8 MB; videos up to 25 MB.</p></div><button type="button" class="admin-button secondary" data-action="upload">Choose files</button></div>'+
      '<div id="sc-media-diagnostics" class="sc-diagnostic-output" aria-live="polite" role="status"></div><div id="upload-state"></div>'+
      '<div class="sc-media-toolbar"><div><span class="sc-kicker">ASSET LIBRARY</span><h2>Browse your uploads</h2></div><label class="sc-media-search"><span aria-hidden="true">⌕</span><input type="search" data-sc-media-search value="'+htmlSafe(mediaQuery)+'" placeholder="Search filenames…" aria-label="Search media files"></label></div>'+
      '<div class="sc-media-tabs" role="group" aria-label="Filter media by file type">'+modes.map(([id,label,count])=>'<button type="button" data-sc-media-mode="'+id+'" aria-pressed="'+(mediaMode===id)+'" class="'+(mediaMode===id?'active':'')+'">'+label+' <span>'+count+'</span></button>').join('')+'</div>'+
      (!mediaLoaded?'<section class="sc-media-empty">Loading your private library…</section>':mediaItems.length?'<div class="sc-media-grid">'+tiles+'</div><p class="sc-media-empty" id="sc-media-no-results" hidden>No files match this filter.</p>':
      '<section class="sc-media-empty"><strong>Start with your first upload.</strong><p>Uploaded images and videos will be reusable throughout your studio.</p><button class="admin-button" data-action="upload">Upload your first file</button></section>')+
      '<p class="sc-media-footnote">Archiving hides an asset from new selections; already-published links may still reference it. Storage status depends on server configuration and cannot be confirmed from browser controls alone.</p>';
  }
  function applyMediaFilter(){
    const input=document.querySelector('[data-sc-media-search]');
    if(input)mediaQuery=input.value.trim().toLowerCase();
    let shown=0;
    document.querySelectorAll('[data-sc-media-card]').forEach(node=>{
      const visible=(mediaMode==='all'||node.dataset.kind===mediaMode)&&(!mediaQuery||node.dataset.name.includes(mediaQuery));
      node.hidden=!visible;if(visible)shown++;
    });
    const empty=document.getElementById('sc-media-no-results');if(empty)empty.hidden=shown!==0;
    document.querySelectorAll('[data-sc-media-mode]').forEach(node=>{
      node.classList.toggle('active',node.dataset.scMediaMode===mediaMode);
      node.setAttribute('aria-pressed',String(node.dataset.scMediaMode===mediaMode));
    });
  }
  function closeJump(){
    const node=document.getElementById('sc-jump');if(node)node.remove();
    lastJumpFocus?.focus?.();lastJumpFocus=null;
  }
  function openJump(){
    if(document.getElementById('sc-jump'))return closeJump();
    lastJumpFocus=document.activeElement;
    const entries=navigation.map(([id,label])=>'<a href="#/'+id+'" data-sc-jump-item data-keywords="'+htmlSafe((id+' '+label).toLowerCase())+'"><span>'+htmlSafe(label)+'</span><small>/'+id+'</small><b>↗</b></a>').join('');
    const panel=document.createElement('div');
    panel.id='sc-jump';panel.className='sc-jump-backdrop';
    panel.innerHTML='<div class="sc-jump-dialog" role="dialog" aria-modal="true" aria-labelledby="sc-jump-title"><label id="sc-jump-title" for="sc-jump-query">Jump to any console</label><div class="sc-jump-input"><span>⌕</span><input id="sc-jump-query" autocomplete="off" placeholder="Search pages, AI, media, campaigns…" aria-label="Search admin consoles"><kbd>ESC</kbd></div><div class="sc-jump-results">'+entries+'</div></div>';
    document.body.append(panel);panel.querySelector('input').focus();
  }
  document.addEventListener('click',async event=>{
    const mind=event.target.closest('[data-sc-mind]');
    if(mind){mindId=mind.dataset.scMind;render();return;}
    if(event.target.closest('[data-sc-jump]')){openJump();return;}
    if(event.target.id==='sc-jump'){closeJump();return;}
    if(event.target.closest('[data-sc-jump-item]')){closeJump();return;}
    const mode=event.target.closest('[data-sc-media-mode]');
    if(mode){mediaMode=mode.dataset.scMediaMode;applyMediaFilter();return;}
    const test=event.target.closest('[data-sc-test-ai]');
    if(test){const out=document.getElementById('sc-mind-test');test.disabled=true;if(out)out.textContent='Testing the selected main AI provider…';try{if(preview)throw Error('Live provider checks require the deployed owner workspace.');const result=await api('/api/admin/ai/check',{method:'POST',body:'{}'});if(out)out.textContent=(result.status==='live'?'Provider connection verified. ':'Provider not ready. ')+(result.message||'')+' This checks the shared provider, not a specific character response.';}catch(err){if(out)out.textContent='Connection check failed: '+err.message;}finally{test.disabled=false;}return;}
    const diag=event.target.closest('[data-sc-diagnostics]');
    if(diag){const out=document.getElementById('sc-media-diagnostics');diag.disabled=true;if(out)out.textContent='Reading configured media storage…';try{if(preview)throw Error('Diagnostics require the deployed owner workspace.');const result=await api('/api/admin/connections');if(out)out.textContent='Configured backend: '+(result.database||'Not reported')+'. Media storage mode: '+(result.storage||'Not reported')+'. This does not verify upload permissions or bucket health.';}catch(err){if(out)out.textContent='Unable to read storage configuration: '+err.message;}finally{diag.disabled=false;}return;}
  });
  document.addEventListener('input',event=>{
    if(event.target.matches('[data-sc-media-search]'))applyMediaFilter();
    if(event.target.id==='sc-jump-query'){
      const query=event.target.value.trim().toLowerCase();let first=null;
      document.querySelectorAll('[data-sc-jump-item]').forEach(node=>{
        node.hidden=!node.dataset.keywords.includes(query);if(!node.hidden&&!first)first=node;
      });
    }
  });
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openJump();return;}
    if(event.key==='Escape'&&document.getElementById('sc-jump')){event.preventDefault();closeJump();return;}
    if(event.key==='Enter'&&event.target.id==='sc-jump-query'){
      const first=[...document.querySelectorAll('[data-sc-jump-item]')].find(node=>!node.hidden);
      if(first){event.preventDefault();first.click();}
    }
    if((event.key==='Enter'||event.key===' ')&&event.target.id==='sc-media-drop'){event.preventDefault();event.target.querySelector('[data-action="upload"]')?.click();}
  });
  document.addEventListener('dragover',event=>{
    const zone=event.target.closest?.('#sc-media-drop');if(!zone)return;
    event.preventDefault();zone.classList.add('is-dragging');
  });
  document.addEventListener('dragleave',event=>{
    const zone=event.target.closest?.('#sc-media-drop');if(!zone)return;
    if(!zone.contains(event.relatedTarget))zone.classList.remove('is-dragging');
  });
  document.addEventListener('drop',event=>{
    const zone=event.target.closest?.('#sc-media-drop');if(!zone)return;
    event.preventDefault();zone.classList.remove('is-dragging');
    const files=[...(event.dataTransfer?.files||[])];
    if(files.length>1)toast('Please upload one asset at a time.');
    if(files[0])uploadFile(files[0]);
  });
  window.AdminCommandV2={sidebar,command,minds,media,applyMediaFilter};
})();