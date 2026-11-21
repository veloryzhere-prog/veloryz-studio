'use strict';
/* VELORYZ Creator V3. Original design concepts with credited external references. */
(function(){
 const KEY='veloryz.creator.v3';
 const steps=['Discover','Inspiration','Capabilities','Investment','Send brief'];
 const categories=['Business','Portfolio','Ecommerce','Agency','SaaS / platform','Restaurant','Editorial','Education','Community','Custom App'];
 const raw=[
 ['studio','The Practice','Business','Minimal',4,'Content management|SEO foundations','A polished home for an independent business.','Clear from the first glance.'],
 ['edit','The Edit','Ecommerce','Editorial',6,'Product catalogue|Payment integration|Content management','An expressive shop with easy product browsing.','A different kind of store.'],
 ['works','Selected Works','Portfolio','Editorial',4,'Motion direction|Content management','A portfolio for considered creative work.','The work speaks.'],
 ['collective','The Collective','Agency','Bold',6,'Content management|Motion direction','A confident studio site with personality.','Leave an impression.'],
 ['saas','Launchpad','SaaS / platform','Minimal',8,'Member accounts|Admin dashboard|Analytics dashboard','A clean starting point for a software product.','Software for humans.'],
 ['gather','Gather','Restaurant','Editorial',4,'Booking workflow|Content management','A restaurant with atmosphere and easy enquiries.','A seat at the table.'],
 ['personal','Independent','Portfolio','Bold',4,'Motion direction|Content management','A distinctive space for creators.','Make it yours.'],
 ['book','The Appointment','Business','Minimal',6,'Booking workflow|Email notifications','A welcoming service-booking journey.','Easy from the start.'],
 ['journal','Paper & Ink','Editorial','Editorial',8,'Blog & publishing|Search & filters','Stories, categories and a publishing workflow.','Good stories live here.'],
 ['together','Common Ground','Community','Immersive',8,'Member accounts|Email notifications','A member-focused shared experience.','Find your people.'],
 ['learn','Open Classroom','Education','Minimal',8,'Member accounts|Admin dashboard','Learning materials and student experiences.','A better way to learn.'],
 ['product','New Territory','Custom App','Immersive',8,'API integrations|Member accounts|Admin dashboard','A custom application with workflows and integrations.','A new possibility.']
 ];
 const presets=raw.map(([id,name,category,style,pages,features,description,headline])=>({id,name,category,style,pages,features:features.split('|'),description,headline}));
 const refs=[
 ['Velia','Portfolio','Minimal','Framer','https://www.framer.com/marketplace/templates/velia/'],
 ['RECTO','Portfolio','Editorial','Framer','https://www.framer.com/marketplace/templates/recto/'],
 ['Handoff UX','Portfolio','Minimal','Framer','https://www.framer.com/marketplace/templates/handoff-ux/'],
 ['Pretty','SaaS / platform','Bold','Framer','https://www.framer.com/marketplace/templates/pretty/'],
 ['Vale','SaaS / platform','Minimal','Framer','https://www.framer.com/marketplace/templates/vale/'],
 ['Scalable','SaaS / platform','Minimal','Framer','https://www.framer.com/marketplace/templates/scalable/'],
 ['Convert','SaaS / platform','Bold','Framer','https://www.framer.com/marketplace/templates/convert/'],
 ['Format','Portfolio','Editorial','Webflow','https://webflow.com/templates/html/format-portfolio-website-template'],
 ['Layout','Portfolio','Minimal','Webflow','https://webflow.com/templates/html/layout-website-template'],
 ['Backfield','Portfolio','Immersive','Webflow','https://webflow.com/made-in-webflow/website/backfield-free-portfolio-template'],
 ['Firstlight','Restaurant','Editorial','Framer','https://www.framer.com/marketplace/templates/firstlight/'],
 ['Novanta','Restaurant','Bold','Framer','https://www.framer.com/marketplace/templates/novanta/'],
 ['Ascent','Restaurant','Minimal','Webflow','https://webflow.com/templates/html/ascent-restaurant-website-template'],
 ['Cyzen','Agency','Bold','Framer','https://www.framer.com/marketplace/templates/cyzen/'],
 ['Creativ Axis','Agency','Bold','Framer','https://www.framer.com/marketplace/templates/creativ-axis/'],
 ['Neutra','Agency','Minimal','Framer','https://www.framer.com/marketplace/templates/neutra/'],
 ['Mainboard Lite','Agency','Minimal','Framer','https://www.framer.com/marketplace/templates/mainboard-lite/'],
 ['E-commerce','Ecommerce','Editorial','Framer','https://www.framer.com/marketplace/templates/e-commerce/'],
 ['Sample Ecommerce','Ecommerce','Minimal','Framer','https://www.framer.com/community/marketplace/templates/sample-ecommerce-template/'],
 ['Format Starter','Business','Minimal','Webflow','https://webflow.com/templates/html/portfolio-starter-website-template']
 ].map(([name,category,style,source,url])=>({name,category,style,source,url}));
 const styles=[
 ['Editorial','Stories, space & expressive typography','Every detail tells a story.'],
 ['Minimal','A quiet and confident product presence','Less, but better.'],
 ['Bold','Confident, graphic and expressive','Make an impression.'],
 ['Immersive','Depth, motion and atmosphere','Feel something new.']
 ];
 const info={
 'Content management':['Content','Update text and media without editing code.',false],
 'SEO foundations':['Content','Metadata, structured content and crawlable pages.',false],
 'Blog & publishing':['Content','Manage articles, authors and publishing.',false],
 'Search & filters':['Experience','Help people find relevant content quickly.',false],
 'Motion direction':['Experience','Subtle animation with reduced-motion support.',false],
 'Multilingual support':['Experience','Multiple languages and localized content.',true],
 'Booking workflow':['Operations','Design appointment requests and availability rules.',true],
 'Email notifications':['Operations','Transactional messages and verified delivery.',true],
 'Admin dashboard':['Operations','Manage data with private owner controls.',true],
 'Product catalogue':['Commerce','Products, categories, filters and variants.',true],
 'Payment integration':['Commerce','Payment-provider integration and checkout.',true],
 'Inventory management':['Commerce','Inventory records, stock and workflows.',true],
 'Member accounts':['Apps & platforms','Secure accounts, roles and private journeys.',true],
 'Analytics dashboard':['Apps & platforms','Useful reports and data sources.',true],
 'API integrations':['Apps & platforms','Connect external software and APIs.',true],
 'AI adviser':['Apps & platforms','Knowledge-based AI assistance and fallback.',true]
 };
 const questions={
 'Member accounts':['Account experience',['Private client portal','Customer dashboard','Multi-role accounts','Community']],
 'Payment integration':['Payment flow',['One-time checkout','Subscription','Milestone invoices','Not sure']],
 'Booking workflow':['Booking type',['Calls','Service appointments','Classes','Not sure']],
 'AI adviser':['AI use case',['Answer questions','Search documents','Customer support','Internal workflows']],
 'API integrations':['Integration',['CRM','Google services','Payment services','Custom API']],
 'Product catalogue':['Catalogue size',['Under 25 products','25–100 products','100+','Not sure']],
 'Admin dashboard':['Management users',['Owner only','Small team','Multiple roles','Not sure']],
 'Multilingual support':['Languages',['Two','Three or four','Five+','Not sure']]
 };
 const initial=()=>({category:'Business',template:'studio',style:'Minimal',palette:'Warm ivory',pages:4,features:['Content management','SEO foundations'],answers:{},assets:[],timeline:'Within 2–3 months',budget:55000,priority:'Balanced quality and speed',goal:'',name:'',email:'',phone:'',company:'',notes:'',consent:false,reference:'',external:'',requestId:''});
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clean=s=>String(s??'').replace(/[<>\x00-\x1f]/g,' ').trim();
 const money=n=>'₹'+Math.round(Number(n)||0).toLocaleString('en-IN');
 let saved;try{saved=JSON.parse(sessionStorage.getItem(KEY));}catch{}
 let data={...initial(),...(saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{})},step=0,filter='All',search='',busy=false,result=null,error='';
 data.features=Array.isArray(data.features)?data.features.filter(n=>info[n]):[];
 data.answers=data.answers&&typeof data.answers==='object'?data.answers:{};
 function sync(){
  data.pages=VeloryzPlanner.pages.includes(Number(data.pages))?Number(data.pages):4;
  data.budget=Math.max(20000,Math.min(300000,Math.round(Number(data.budget||55000)/5000)*5000));
  projectBrief=VeloryzPlanner.normalize({...projectBrief,purpose:data.category,pages:String(data.pages),style:data.style,features:data.features,budget:data.budget,timeline:data.timeline,goal:data.goal,assets:data.assets});
  window.VeloryzProjectEmail=data.email;
  try{sessionStorage.setItem(KEY,JSON.stringify(data));sessionStorage.setItem('veloryz.planner.v1',JSON.stringify(projectBrief));}catch{}
 }
 const estimate=()=>{sync();return VeloryzPlanner.estimate(projectBrief,null,[])};
 const review=()=>data.features.filter(n=>info[n]?.[2]).length;
 const preset=()=>presets.find(p=>p.id===data.template);
 function preview(item,small=false){
  const style=(item.style||'Minimal').toLowerCase();
  return '<div class="v3-preview v3-'+style+(small?' v3-small':'')+'"><div class="v3-browser-top"><b>'+escape(item.name)+'</b><span>ABOUT &nbsp; WORK &nbsp; ↗</span></div><div class="v3-browser-hero"><small>'+escape(item.category.toUpperCase())+' / A NEW PERSPECTIVE</small><strong>'+escape(item.headline||item.name)+'</strong><i aria-hidden="true"></i><span>EXPLORE THE EXPERIENCE ↗</span></div><div class="v3-browser-foot"><b></b><b></b><b></b></div></div>';
 }
 function side(){
  const e=estimate();return '<aside class="v3-summary"><div class="v3-summary-top"><span>YOUR PROJECT / LIVE</span><i>● SAVED</i></div>'+preview({...preset(),name:preset()?.name||'Your Vision',style:data.style,category:data.category,headline:preset()?.headline||'Build something meaningful.'},true)+
  '<h2>Every detail<br><em>takes shape.</em></h2><div class="v3-summary-details">'+[['Category',data.category],['Style',data.style],['Pages / screens',data.pages],['Features',data.features.length]].map(r=>'<div><span>'+escape(r[0])+'</span><strong>'+escape(r[1])+'</strong></div>').join('')+'</div>'+
  '<div class="v3-price"><span>ILLUSTRATIVE PLANNING RANGE</span><strong>'+money(e.low)+' <small>—</small> '+money(e.high)+'</strong><p>Preliminary allowance; final scope and quotation require studio review.</p></div><div class="v3-summary-budget"><span>YOUR COMFORTABLE BUDGET</span><strong>'+money(data.budget)+'</strong></div>'+
  (review()?'<p class="v3-review-flag">✳ '+review()+' selected capabilities require tailored scoping.</p>':'')+
  '<button class="v3-export" type="button" data-v3-act="pdf">↓ Download proposal PDF</button><button class="v3-side-review" type="button" data-v3-step="4">Review your project ↗</button><details><summary>Estimate assumptions</summary><p>Base plus page and feature allowances, with a rounded 25% contingency. Hosting, licenses, taxes and provider costs are excluded. This is not a contract or approved quote.</p></details></aside>';
 }
 function hero(){return '<div class="v3-hero"><div class="container v3-hero-grid"><div><span class="v3-eyebrow">✳ &nbsp; VELORYZ STUDIO / PROJECT CREATOR</span><h1>Something great<br>starts <em>here.</em></h1><p>Explore an idea, pick a design direction and shape a thoughtful project plan. Simple to start. Beautifully considered at every step.</p><div class="v3-hero-points"><span>01 / EXPLORE</span><span>02 / MAKE IT YOURS</span><span>03 / SEND YOUR BRIEF</span></div></div><div class="v3-hero-art" aria-hidden="true">'+preview({name:'VELORYZ',category:'Agency',style:'Immersive',headline:'Design that moves.'})+'<span>✳ &nbsp; THE ART OF BEGINNING</span></div></div></div>';}
 function toolbar(){return '<div class="v3-steps" aria-label="Project creation progress">'+steps.map((t,i)=>'<button type="button" data-v3-step="'+i+'" class="'+(step===i?'active':i<step?'done':'')+'" '+(step===i?'aria-current="step"':'')+'><span>0'+(i+1)+'</span><strong>'+t+'</strong></button>').join('')+'</div><div class="v3-progress"><i style="width:'+((step+1)*20)+'%"></i></div>';}
 function categoryButtons(){return '<div class="v3-categories">'+categories.map((c,i)=>'<button type="button" data-v3-category="'+escape(c)+'" class="'+(data.category===c?'selected':'')+'" aria-pressed="'+(data.category===c)+'"><span>'+['▣','◇','▧','✳','⌘','◌','≡','▥','◎','↗'][i]+'</span><strong>'+escape(c)+'</strong></button>').join('')+'</div>';}
 function presetCards(items){return items.map(p=>'<article class="v3-template">'+preview(p)+'<div><span>'+escape(p.category.toUpperCase())+' / VELORYZ CONCEPT</span><h3>'+escape(p.name)+'</h3><p>'+escape(p.description)+'</p><button type="button" data-v3-template="'+p.id+'">'+(data.template===p.id?'✓ Selected':'Use this starter ↗')+'</button></div></article>').join('');}
 function stage0(){return '<header class="v3-stage-head"><span>01 / YOUR VISION</span><h2>What are we <em>building?</em></h2><p>Start with your project category, then pick a fully editable starting point—or build from scratch.</p></header>'+categoryButtons()+
 '<div class="v3-section-head"><div><span>MAKE IT YOUR OWN</span><h3>Your starting point</h3></div><button data-v3-act="library">Explore full library ↗</button></div><div class="v3-chosen">'+(preset()?preview(preset(),true):'<div class="v3-empty-symbol">✳</div>')+'<div><span>CURRENT DIRECTION</span><strong>'+escape(preset()?.name||'Fresh canvas')+'</strong><p>'+escape(preset()?.description||'A custom project with no template attached.')+'</p></div><button data-v3-act="fresh">Start fresh ↗</button></div>'+
 '<div class="v3-pages"><div><strong>How many core pages or screens?</strong><p>An early estimate. App complexity is scoped separately.</p></div><div>'+VeloryzPlanner.pages.map(n=>'<button data-v3-pages="'+n+'" class="'+(data.pages===n?'selected':'')+'">'+n+'</button>').join('')+'</div></div>';}
 function gallery(){
  const rows=presets.filter(p=>(filter==='All'||p.category===filter)&&(!search||[p.name,p.category,p.description].join(' ').toLowerCase().includes(search.toLowerCase())));
  const ext=refs.filter(r=>(filter==='All'||r.category===filter)&&(!search||[r.name,r.category,r.source].join(' ').toLowerCase().includes(search.toLowerCase())));
  return '<div class="v3-gallery"><div class="v3-gallery-controls"><label><span class="sr-only">Search starter ideas</span><input data-v3-search value="'+escape(search)+'" type="search" placeholder="Search templates, styles, categories…" autocomplete="off"></label><div class="v3-filter-list">'+['All',...categories].map(c=>'<button data-v3-filter="'+escape(c)+'" class="'+(filter===c?'active':'')+'">'+escape(c)+'</button>').join('')+'</div></div>'+
  '<div id="v3-gallery-results"><div class="v3-template-grid">'+(rows.length?presetCards(rows):'<p class="v3-no-results">No concepts match. Try another category.</p>')+'</div><div class="v3-source-heading"><div><span>CURATED FROM THE INTERNET</span><h3>Real-world design inspiration.</h3><p>Original creators on Framer and Webflow. Preview the genuine marketplace listing; a source reference does not include a third-party template license.</p></div><b>'+ext.length+' REFERENCES</b></div><div class="v3-reference-grid">'+ext.map(r=>'<article>'+preview({...r,headline:r.name+' / '+r.category},true)+'<div><span>'+escape(r.source)+' / '+escape(r.category)+'</span><strong>'+escape(r.name)+'</strong><div><a href="'+escape(r.url)+'" target="_blank" rel="noopener noreferrer">View original ↗</a><button data-v3-source="'+escape(r.name)+'">Use as reference +</button></div></div></article>').join('')+'</div></div></div>';
 }
 function looks(){return '<div class="v3-section-head v3-style-head"><div><span>THE VISUAL LANGUAGE</span><h3>How should it feel?</h3><p>Select a design mood. These previews are VELORYZ originals.</p></div></div><div class="v3-style-grid">'+styles.map(([name,desc,headline])=>'<button data-v3-style="'+name+'" class="'+(data.style===name?'selected':'')+'">'+preview({name,category:data.category,style:name,headline},true)+'<span>'+name.toUpperCase()+'</span><strong>'+desc+'</strong><small>'+(data.style===name?'✓ Selected':'Explore this direction ↗')+'</small></button>').join('')+'</div><div class="v3-palette"><div><strong>Choose a palette</strong><p>An early preference, not a finalized brand kit.</p></div><div>'+[['Warm ivory','#e9d8c3','#b96750'],['Forest & stone','#39584f','#dadbd3'],['Midnight plum','#30203a','#e59bb9'],['Cool monochrome','#1c2730','#c0ced5']].map(row=>'<button data-v3-palette="'+row[0]+'" class="'+(data.palette===row[0]?'selected':'')+'"><i style="background:'+row[1]+'"></i><i style="background:'+row[2]+'"></i>'+row[0]+'</button>').join('')+'</div></div><label class="v3-field"><span>Any other website you like? <small>Optional</small></span><input type="url" data-v3-value="reference" value="'+escape(data.reference)+'" placeholder="https://example.com"></label>';}
 function stage1(){return '<header class="v3-stage-head"><span>02 / THE INSPIRATION LIBRARY</span><h2>Find your <em>direction.</em></h2><p>Discover twelve original VELORYZ starters and twenty external template references. Pick one or simply use them as visual inspiration.</p></header>'+gallery()+looks();}
 function group(name){
  return '<div class="v3-feature-group"><h3>'+name+'</h3><div>'+Object.entries(info).filter(([key,v])=>v[0]===name).map(([key,v])=>'<label class="v3-feature '+(data.features.includes(key)?'checked':'')+'"><input type="checkbox" data-v3-feature="'+escape(key)+'" '+(data.features.includes(key)?'checked':'')+'><span>✓</span><div><strong>'+escape(key)+'</strong><p>'+escape(v[1])+'</p></div><small>'+(v[2]?'SCOPING REVIEW':'PLANNING ALLOWANCE')+'</small></label>').join('')+'</div></div>';
 }
 function stage2(){
  const questionHtml=Object.entries(questions).filter(([f])=>data.features.includes(f)).map(([f,x])=>'<label class="v3-field"><span>'+escape(x[0])+' <small>'+escape(f)+'</small></span><select data-v3-question="'+escape(f)+'"><option value="">Decide later</option>'+x[1].map(v=>'<option '+(data.answers[f]===v?'selected':'')+'>'+escape(v)+'</option>').join('')+'</select></label>').join('');
  return '<header class="v3-stage-head"><span>03 / APP & WEBSITE CAPABILITIES</span><h2>Beautiful, and<br><em>built to work.</em></h2><p>Choose what your project needs. Conditional questions appear only for the relevant capabilities. Advanced work requires a custom quote.</p></header>'+
  '<div class="v3-feature-count">'+data.features.length+' SELECTED FEATURES <span>'+review()+' REQUIRE A CLOSER REVIEW</span></div>'+[...new Set(Object.values(info).map(x=>x[0]))].map(group).join('')+
  (questionHtml?'<div class="v3-feature-questions"><h3>A few useful details</h3><p>Only the selected capabilities ask follow-up questions.</p><div>'+questionHtml+'</div></div>':'')+
  '<div class="v3-assets"><h3>What materials are ready?</h3><div>'+VeloryzPlanner.assets.map(a=>'<label><input data-v3-asset="'+escape(a)+'" type="checkbox" '+(data.assets.includes(a)?'checked':'')+'>'+escape(a)+'</label>').join('')+'</div></div>';
 }
 function stage3(){
  const e=estimate();return '<header class="v3-stage-head"><span>04 / BUDGET & SCHEDULE</span><h2>Make it <em>realistic.</em></h2><p>Explore how choices influence the estimate. Set a comfortable budget while keeping costs and assumptions clear.</p></header>'+
  '<div class="v3-estimate-card"><span>ILLUSTRATIVE PROJECT RANGE</span><strong>'+money(e.low)+' — '+money(e.high)+'</strong><p>Base '+money(e.base)+' · extra pages '+money(e.additionalPages)+' · features '+money(e.featureAllowance)+' · contingency '+money(e.contingency)+'. Final pricing needs written studio review.</p></div>'+
  '<div class="v3-budget-control"><div><strong>Your preferred budget</strong><output id="v3-budget-output">'+money(data.budget)+'</output></div><input type="range" data-v3-budget min="20000" max="300000" step="5000" value="'+data.budget+'"><div class="v3-budget-axis"><span>₹20,000</span><span>₹1,60,000</span><span>₹3,00,000</span></div><p id="v3-budget-explain">'+(data.budget<e.low?'Your budget is below the preliminary scope. Reduce optional pages or features, or discuss phasing.':'Your preferred budget is recorded. The studio will confirm the final quote.')+'</p></div>'+
  '<div class="v3-scope-actions"><h3>Adjust without guesswork.</h3><button data-v3-act="reduce" '+(data.pages<=4?'disabled':'')+'>− Fewer pages</button><button data-v3-step="2">Refine features ↗</button></div><div class="v3-time"><h3>Preferred timeline</h3><div>'+VeloryzPlanner.timelines.map(t=>'<button data-v3-time="'+escape(t)+'" class="'+(data.timeline===t?'selected':'')+'">'+escape(t)+'</button>').join('')+'</div><p>Timing is a preference, not a confirmed schedule.</p></div>'+
  '<div class="v3-priority"><h3>What matters most?</h3><div>'+['Balanced quality and speed','Launch sooner','Premium craft and detail','Keep first release lean'].map(t=>'<button data-v3-priority="'+escape(t)+'" class="'+(data.priority===t?'selected':'')+'">'+escape(t)+'</button>').join('')+'</div></div>';
 }
 function stage4(){
  const e=estimate();return '<header class="v3-stage-head"><span>05 / YOUR PERSONAL PROJECT OUTLINE</span><h2>From idea<br>to <em>possibility.</em></h2><p>Keep your proposal, review the details and send your project request to the studio. An invitation is issued only after owner approval.</p></header>'+
  '<div class="v3-review-grid">'+[['Project category',data.category],['Starter',preset()?.name||data.external||'Custom'],['Visual direction',data.style+' · '+data.palette],['Pages / screens',data.pages],['Capabilities',data.features.join(', ')||'Core website'],['Budget preference',money(data.budget)],['Planning range',money(e.low)+' — '+money(e.high)],['Timeline',data.timeline]].map(x=>'<div><span>'+escape(x[0])+'</span><strong>'+escape(x[1])+'</strong></div>').join('')+'</div>'+
  '<div class="v3-roadmap"><h3>A clear way forward.</h3><div>'+[['01','Discover'],['02','Confirm scope'],['03','Design'],['04','Develop & test'],['05','Handover']].map(x=>'<div><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('')+'</div><p>These phases are illustrative. Actual dates and deliverables are agreed in writing.</p></div>'+
  '<div class="v3-proposal-cta"><div><span>READY FOR YOUR NEXT CONVERSATION</span><h3>Your proposal is ready to download.</h3><p>A three-page planning PDF, available even if you do not submit the brief.</p></div><button data-v3-act="pdf">↓ Download proposal</button></div>'+
  '<form id="v3-submit-form" novalidate><div class="v3-form-intro"><span>SEND YOUR PROJECT</span><h3>Who should we contact?</h3><p>Your email is required for this request and any later admin-issued invitation.</p></div><div class="v3-form-grid">'+
  [['name','Your name *','text','name',100],['email','Your email *','email','email',180],['phone','Phone (optional)','tel','tel',20],['company','Company (optional)','text','organization',200]].map(x=>'<label class="v3-field"><span>'+x[1]+'</span><input name="'+x[0]+'" data-v3-value="'+x[0]+'" type="'+x[2]+'" autocomplete="'+x[3]+'" maxlength="'+x[4]+'" value="'+escape(data[x[0]])+'" '+(['name','email'].includes(x[0])?'required':'')+'></label>').join('')+
  '<label class="v3-field v3-wide"><span>What should your project achieve? *</span><textarea name="goal" data-v3-value="goal" minlength="10" maxlength="1000" rows="4" required placeholder="Who is it for? What problem should it solve?">'+escape(data.goal)+'</textarea></label><label class="v3-field v3-wide"><span>Anything else to share?</span><textarea name="notes" data-v3-value="notes" maxlength="400" rows="3" placeholder="Additional needs or context">'+escape(data.notes)+'</textarea></label></div>'+
  '<label class="v3-consent"><input type="checkbox" data-v3-consent required '+(data.consent?'checked':'')+'><span>I agree to share this information with VELORYZ Studio for enquiry review. I understand this is not a confirmed booking, contract or automatic client invitation.</span></label>'+
  '<p class="v3-error" role="alert" '+(error?'':'hidden')+'>'+escape(error)+'</p><button class="v3-submit-button" type="submit" '+(busy?'disabled':'')+'>'+(busy?'Sending…':'Submit project request ↗')+'</button><small>Contact details stay in the studio enquiry inbox. Invitations are created by the owner only.</small></form>';
 }
 function success(){return '<section class="v3-success"><span>✳ &nbsp; REQUEST RECEIVED</span><h2>Your idea is on its way.</h2><p>The studio will review your scope, contact you to discuss priorities and prepare a formal quotation before work begins.</p><div><small>YOUR REFERENCE</small><strong>'+escape(result.reference)+'</strong></div><p>Client-portal invitations are not automatic. If the owner creates a project workspace, a separate private code will be issued to your email.</p><button data-v3-act="pdf">Download proposal ↓</button><button data-v3-act="restart">Start another project ↗</button></section>';}
 function content(){return result?success():[stage0,stage1,stage2,stage3,stage4][step]();}
 function full(){return '<div class="v3-root">'+hero()+'<section class="v3-app container" data-v3-root><div class="v3-intro"><div><span>WELCOME TO THE VELORYZ CREATOR</span><h2>Build a better brief.</h2></div><strong>◌ &nbsp; DRAFT SAVED IN THIS TAB</strong></div>'+toolbar()+'<div class="v3-layout"><div class="v3-work"><div id="v3-stage">'+content()+'</div>'+(result?'':'<div class="v3-controls"><button data-v3-act="back" '+(step===0?'disabled':'')+'>← Previous</button><span>STEP '+(step+1)+' / 5</span><button data-v3-act="next" '+(step===4?'disabled':'')+'>Continue ↗</button></div>')+'</div><div id="v3-sidebar">'+side()+'</div></div><div class="v3-end"><span>VELORYZ STUDIO / AN INTENTIONAL BEGINNING</span><button data-v3-act="clear">Clear draft ↗</button></div></section></div>';}
 function update(){const el=document.querySelector('.v3-root');if(el){const y=window.scrollY;el.outerHTML=full();window.scrollTo({top:y,behavior:'instant'});}}
 function jump(i){step=Math.max(0,Math.min(4,Number(i)||0));error='';update();document.querySelector('[data-v3-root]')?.scrollIntoView({block:'start',behavior:'auto'});}
 function setPreset(id){const p=presets.find(x=>x.id===id);if(!p)return;data={...data,category:p.category,template:p.id,style:p.style,pages:p.pages,features:[...p.features],external:'',goal:data.goal||p.description};chosenDesign=null;sync();jump(2);}
 function briefTextV3(){
  const e=estimate();return [
   'PROJECT CREATOR V3','Project: '+clean(data.category),'Template: '+clean(preset()?.name||'Custom'),'Goal: '+clean(data.goal),
   data.external?'External inspiration: '+clean(data.external):'',
   data.reference?'Reference URL: '+clean(data.reference):'',
   'Visual style: '+clean(data.style)+' / '+clean(data.palette),
   'Pages / screens: '+data.pages,
   'Features: '+(data.features.join(', ')||'Core website'),
   ...Object.entries(data.answers).filter(([k])=>data.features.includes(k)).map(([k,v])=>clean(k)+': '+clean(v)),
   'Materials: '+(data.assets.join(', ')||'To confirm'),'Budget preference: '+money(data.budget),
   'Indicative range: '+money(e.low)+' - '+money(e.high),
   'Timeline: '+clean(data.timeline),'Priority: '+clean(data.priority),
   data.notes?'Notes: '+clean(data.notes):'',
   'Quote and launch date subject to written studio approval.'
  ].filter(Boolean).join('\n').slice(0,1990);
 }
 function download(){
  try{
   if(!window.VeloryzProposal)throw Error('Proposal builder unavailable');
   sync();window.VeloryzProposal.download({brief:projectBrief,estimate:estimate(),reference:{name:preset()?.name||data.external||'Original direction'},creator:{category:data.category,palette:data.palette,priority:data.priority,features:data.features,answers:data.answers,source:data.external}});
  }catch(e){console.error(e);alert('Could not generate the proposal. Please try again.');}
 }
 async function submit(form){
  if(busy)return;
  for(const k of ['name','email','goal']){const input=form.elements.namedItem(k);if(!input||!input.checkValidity()){error=k==='goal'?'Describe your project goal in at least 10 characters.':'Check the '+k+' field.';const box=form.querySelector('.v3-error');box.textContent=error;box.hidden=false;input?.focus();return;}}
  if(!data.consent){error='Please accept the consent checkbox.';const box=form.querySelector('.v3-error');box.textContent=error;box.hidden=false;form.querySelector('[data-v3-consent]').focus();return;}
  const payload={requestId:data.requestId||(data.requestId=crypto.randomUUID()),kind:'project',name:clean(data.name),email:data.email.trim().toLowerCase(),phone:clean(data.phone),company:clean(data.company),message:briefTextV3(),budget:money(data.budget)+' preferred',website:'',consent:true};sync();
  busy=true;const b=form.querySelector('[type=submit]');b.disabled=true;b.textContent='Sending securely…';const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),18000);
  try{
   const res=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
   const out=await res.json().catch(()=>({error:'Could not read the response.'}));
   if(!res.ok)throw Error(out.error||'Unable to submit your project.');
   result=out;data.requestId='';try{sessionStorage.removeItem(KEY);}catch{}update();document.querySelector('.v3-success')?.scrollIntoView({block:'start',behavior:'auto'});
  }catch(e){error=e.name==='AbortError'?'Request timed out. You can safely retry.':e.message;const box=form.querySelector('.v3-error');box.textContent=error;box.hidden=false;b.disabled=false;b.textContent='Submit project request ↗';}
  finally{clearTimeout(timer);busy=false;}
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-v3-act],[data-v3-step],[data-v3-category],[data-v3-pages],[data-v3-template],[data-v3-style],[data-v3-palette],[data-v3-filter],[data-v3-source],[data-v3-time],[data-v3-priority]');
  if(!b||!document.querySelector('[data-v3-root]'))return;
  if(b.dataset.v3Step!==undefined)return jump(b.dataset.v3Step);
  if(b.dataset.v3Category){data.category=b.dataset.v3Category;data.template='';sync();return update();}
  if(b.dataset.v3Pages){data.pages=Number(b.dataset.v3Pages);sync();return update();}
  if(b.dataset.v3Template)return setPreset(b.dataset.v3Template);
  if(b.dataset.v3Style){data.style=b.dataset.v3Style;sync();return update();}
  if(b.dataset.v3Palette){data.palette=b.dataset.v3Palette;sync();return update();}
  if(b.dataset.v3Filter){filter=b.dataset.v3Filter;return update();}
  if(b.dataset.v3Source){const r=refs.find(x=>x.name===b.dataset.v3Source);if(r){data.external=r.name+' / '+r.url;data.category=r.category;data.template='';data.style=r.style;sync();jump(2);}return;}
  if(b.dataset.v3Time){data.timeline=b.dataset.v3Time;sync();return update();}
  if(b.dataset.v3Priority){data.priority=b.dataset.v3Priority;sync();return update();}
  const a=b.dataset.v3Act;
  if(a==='next')jump(step+1);
  if(a==='back')jump(step-1);
  if(a==='library')jump(1);
  if(a==='fresh'){data.template='';data.external='';sync();jump(1);}
  if(a==='pdf')download();
  if(a==='reduce'){const ps=VeloryzPlanner.pages;data.pages=ps[Math.max(0,ps.indexOf(data.pages)-1)];sync();update();}
  if(a==='restart'){result=null;data=initial();sync();jump(0);}
  if(a==='clear'&&confirm('Clear your current project draft?')){result=null;data=initial();sync();jump(0);}
 });
 document.addEventListener('input',e=>{
  if(!e.target.closest('[data-v3-root]'))return;
  if(e.target.hasAttribute('data-v3-search')){search=e.target.value;const results=document.getElementById('v3-gallery-results');if(results){const holder=document.createElement('div');holder.innerHTML=gallery();results.innerHTML=holder.querySelector('#v3-gallery-results').innerHTML;}return;}
  const key=e.target.dataset.v3Value;if(key&&key in data){data[key]=e.target.value.slice(0,key==='goal'?1000:400);sync();}
  if(e.target.hasAttribute('data-v3-budget')){data.budget=Number(e.target.value);sync();const o=document.getElementById('v3-budget-output');if(o)o.textContent=money(data.budget);const n=document.getElementById('v3-budget-explain');if(n)n.textContent=data.budget<estimate().low?'Budget below estimate. Consider a smaller initial scope.':'Budget preference recorded. A formal quote requires studio review.';const sidebar=document.getElementById('v3-sidebar');if(sidebar)sidebar.innerHTML=side();}
 });
 document.addEventListener('change',e=>{
  if(!e.target.closest('[data-v3-root]'))return;
  if(e.target.dataset.v3Feature){const k=e.target.dataset.v3Feature;data.features=e.target.checked?[...new Set([...data.features,k])]:data.features.filter(x=>x!==k);sync();const y=window.scrollY;update();window.scrollTo({top:y,behavior:'instant'});}
  if(e.target.dataset.v3Question){data.answers[e.target.dataset.v3Question]=e.target.value;sync();}
  if(e.target.dataset.v3Asset){const k=e.target.dataset.v3Asset;data.assets=e.target.checked?[...new Set([...data.assets,k])]:data.assets.filter(x=>x!==k);sync();}
  if(e.target.hasAttribute('data-v3-consent')){data.consent=e.target.checked;sync();}
 });
 document.addEventListener('submit',e=>{if(e.target.id!=='v3-submit-form')return;e.preventDefault();for(const k of ['name','email','phone','company','goal','notes']){const el=e.target.elements.namedItem(k);if(el)data[k]=el.value.trim();}sync();submit(e.target);});
 createPage=function(){sync();return full();};
 window.VeloryzCreatorV3={get:()=>({...data}),templates:presets,external:refs,format:briefTextV3,estimate};
})();
