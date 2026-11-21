'use strict';
/* VELORYZ Project Creator V4 — isolated, one-question-per-screen experience.
   Original templates and public marketplace references, no copied proprietary assets. */
(function(){
 const KEY='veloryz.creator.v4';
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
 ['Format Starter','Business','Minimal','Webflow','https://webflow.com/templates/html/portfolio-starter-website-template'],
 ['Locally','Community','Minimal','Framer','https://www.framer.com/marketplace/templates/locally/'],
 ['Educrest','Education','Minimal','Framer','https://www.framer.com/marketplace/templates/educrest/'],
 ['Coursebook','Education','Editorial','Framer','https://www.framer.com/marketplace/templates/coursebook/'],
 ['Sightline Lite','Custom App','Minimal','Framer','https://www.framer.com/marketplace/templates/sightline-lite/'],
 ['Cubicles','Business','Minimal','Framer','https://www.framer.com/community/marketplace/templates/cubicles-business-and-consulting-website/'],
 ['Flowly Tasks','Custom App','Bold','Framer','https://www.framer.com/marketplace/templates/flowly-tasks/']
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

 const oldKey='veloryz.creator.v3';
 const budgetOptions=[25000,50000,100000,200000,300000];
 const palettes=[
  ['Warm white','#ffffff','#eee6df','#9a7169'],
  ['Soft sage','#f6f9f5','#c3d8cd','#36564e'],
  ['Muted plum','#f9f6fa','#d0c0d2','#58425d'],
  ['Monochrome','#ffffff','#d5d6d5','#242827']
 ];
 const groupCopy={
  'Content':['What should you be able to update?','Select any content tools your project needs.'],
  'Experience':['How should visitors explore it?','These features help people find, read and enjoy your work.'],
  'Commerce':['Will you sell anything online?','Select the store capabilities you are considering.'],
  'Operations':['Should it handle enquiries or internal work?','Useful tools for bookings, admin and communication.'],
  'Apps & platforms':['Does your project need app features?','Accounts, dashboards and integrations can be scoped later.']
 };
 const categorySummary={
  'Business':'Present services, attract customers and build trust.',
  'Portfolio':'Showcase your work and tell your story.',
  'Ecommerce':'Sell products with a beautiful buying experience.',
  'Agency':'Introduce your team, projects and creative work.',
  'SaaS / platform':'Build a digital product with user journeys.',
  'Restaurant':'Share your menu, experience and bookings.',
  'Editorial':'Publish articles, ideas and stories.',
  'Education':'Create learning journeys and resources.',
  'Community':'Bring members together in one place.',
  'Custom App':'A custom idea with its own workflows.'
 };
 const featureGroups={
  'Content':['Business','Portfolio','Ecommerce','Agency','SaaS / platform','Restaurant','Editorial','Education','Community','Custom App'],
  'Experience':['Business','Portfolio','Ecommerce','Agency','SaaS / platform','Restaurant','Editorial','Education','Community','Custom App'],
  'Commerce':['Ecommerce','SaaS / platform','Custom App'],
  'Operations':['Business','Agency','Restaurant','Ecommerce','Education','SaaS / platform','Custom App','Community'],
  'Apps & platforms':['SaaS / platform','Custom App','Education','Community','Ecommerce']
 };
 const str=s=>String(s??'');
 let state;try{state=JSON.parse(sessionStorage.getItem(KEY));}catch{}
 if(!state){try{state=JSON.parse(sessionStorage.getItem(oldKey));}catch{}}
 const data={...initial(),...(state&&typeof state==='object'&&!Array.isArray(state)?state:{})};
 data.features=Array.isArray(data.features)?[...new Set(data.features.filter(n=>info[n]))]:[];
 data.answers=data.answers&&typeof data.answers==='object'&&!Array.isArray(data.answers)?data.answers:{};
 data.assets=Array.isArray(data.assets)?data.assets.filter(a=>VeloryzPlanner.assets.includes(a)):[];
 data.pages=VeloryzPlanner.pages.includes(Number(data.pages))?Number(data.pages):4;
 data.budget=Math.min(300000,Math.max(20000,Math.round(Number(data.budget||55000)/5000)*5000));
 if(!categories.includes(data.category))data.category='Business';
 if(!styles.some(([s])=>s===data.style))data.style='Minimal';
 let stageFromURL;
 try{stageFromURL=new URL(location.href).searchParams.get('question');}catch{stageFromURL=null;}
 let active=stageFromURL||'welcome',busy=false,finished=null,error='',search='',categoryFilter='All',galleryTab='studio',refChoice='',inlineNotice='',jumpToken=0;
 const lightEscape=v=>escape(str(v).slice(0,1200));
 function sync(){
  projectBrief=VeloryzPlanner.normalize({...projectBrief,purpose:data.category,pages:String(data.pages),style:data.style,features:data.features,budget:data.budget,timeline:data.timeline,goal:data.goal,assets:data.assets});
  window.VeloryzProjectEmail=str(data.email).trim().toLowerCase();
  try{if(!finished){sessionStorage.setItem(KEY,JSON.stringify(data));sessionStorage.setItem('veloryz.planner.v1',JSON.stringify(projectBrief));}}catch{}
 }
 function estimate(){
  sync();
  const pricing=typeof studioCMS!=='undefined'?studioCMS?.site?.creatorPricing:undefined;
  return VeloryzPlanner.estimate(projectBrief,null,[],pricing);
 }
 function preset(){return presets.find(p=>p.id===data.template)||null;}
 function isApp(){return ['SaaS / platform','Custom App','Community','Education'].includes(data.category);}
 function flow(){
  const base=['discover','template','style','palette','reference','pages','goal'];
  for(const group of Object.keys(groupCopy)){
   if(featureGroups[group].includes(data.category))base.push('features-'+group.toLowerCase().replace(/[^a-z]+/g,'-'));
  }
  for(const name of Object.keys(questions)){
   if(data.features.includes(name))base.push('detail-'+encodeURIComponent(name));
  }
  return [...base,'assets','budget','timeline','priority','name','email','review'];
 }
 function meta(id){
  if(id==='welcome')return ['Welcome','A new beginning'];
  if(id==='success')return ['Complete','Request received'];
  if(id.startsWith('features-'))return ['Capabilities','Feature choices'];
  if(id.startsWith('detail-'))return ['Capabilities','A little detail'];
  const map={discover:['Discover','Project type'],template:['Discover','Starting point'],style:['Design','Visual direction'],palette:['Design','Color mood'],reference:['Design','Your inspiration'],pages:['Scope','Pages and screens'],goal:['Scope','Your goal'],assets:['Capabilities','Materials ready'],budget:['Budget','Your investment'],timeline:['Timeline','Preferred launch'],priority:['Timeline','Project priorities'],name:['Your details','Your name'],email:['Your details','Your email'],review:['Proposal','Review and send']};
  return map[id]||['Discover','Project type'];
 }
 function at(){return Math.max(0,flow().indexOf(active));}
 function route(to,replace=false){
  if(busy)return;
  const id=to==='welcome'||to==='success'||flow().includes(to)?to:'discover';
  active=id;error='';inlineNotice='';if(id!=='welcome'&&id!=='success'){data.lastQuestion=id;sync();}
  const url=new URL(location.href);
  if(id==='welcome')url.searchParams.delete('question');
  else url.searchParams.set('question',id);
  try{history[replace?'replaceState':'pushState']({creatorStep:id},'',url.pathname+url.search+url.hash);}catch{}
  render();
  if(id!=='welcome'){
   const focus=document.querySelector('#v4-question-title');
   focus?.focus({preventScroll:true});
   const root=document.querySelector('.v4-root');
   if(root)window.scrollTo({top:0,behavior:'instant'});
  }
 }
 function move(delta){
  const sequence=flow(),idx=sequence.indexOf(active);
  if(idx<0){route(delta<0?'welcome':sequence[0]);return;}
  if(delta<0){route(idx===0?'welcome':sequence[idx-1]);return;}
  if(!validateStep(active))return;
  route(sequence[Math.min(idx+1,sequence.length-1)]);
 }
 function toast(message){
  inlineNotice=message;
  const root=document.querySelector('#v4-notice');
  if(root){root.textContent=message;root.hidden=false;}
 }
 function change(key,value){
  if(key==='category'){
   categoryFilter=value;galleryTab='studio';
   if(data.category!==value){data.category=value;data.template='';data.external='';data.features=[];data.answers={};}
  }else data[key]=value;
  data.requestId='';sync();
 }
 function pick(key,value,advance=true){
  change(key,value);
  if(advance)move(1);else render();
 }
 function validateStep(id){
  const show=message=>{error=message;const el=document.querySelector('#v4-error');if(el){el.hidden=false;el.textContent=message;}return false;};
  if(id==='goal'&&str(data.goal).trim().length<10)return show('Write at least 10 characters about what you want to achieve.');
  if(id==='name'&&str(data.name).trim().length<2)return show('Enter your name so we know who to contact.');
  if(id==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(data.email).trim()))return show('Enter a valid email address for your project updates.');
  if(id==='review'&&!data.consent)return show('Please confirm consent before sending this project request.');
  return true;
 }
 function cardSelect(label,sub,key,value,selected,extra=''){
  return '<button type="button" class="v4-choice '+(selected?'is-selected':'')+'" data-v4-pick="'+key+'" data-value="'+escape(value)+'" aria-pressed="'+String(selected)+'"><span class="v4-choice-visual" aria-hidden="true">'+extra+'</span><span class="v4-choice-copy"><strong>'+escape(label)+'</strong><small>'+escape(sub)+'</small></span><span class="v4-choice-check" aria-hidden="true">'+(selected?'✓':'↗')+'</span></button>';
 }
 function preview(name,style,category,large=false){
  return '<div class="v4-preview v4-preview-'+escape(style.toLowerCase())+(large?' is-large':'')+'" aria-hidden="true"><div class="v4-preview-top"><b>'+escape(name)+'</b><span>WORK &nbsp; ABOUT &nbsp; ↗</span></div><div class="v4-preview-content"><span>'+escape(category.toUpperCase())+'</span><strong>'+escape(name==='Selected Works'?'A collection of what matters.':name==='Launchpad'?'Better tools. Better days.':name==='The Edit'?'Find your point of view.':name==='The Collective'?'Ideas without limits.':name==='Gather'?'Good things happen here.':'Made with intention.')+'</strong><i></i><small>EXPLORE OUR WORLD ↗</small></div><div class="v4-preview-line"><i></i><i></i><i></i></div></div>';
 }
 function sectionTitle(kicker,title,description,optional=''){
  return '<div class="v4-question-heading"><div class="v4-kicker">'+kicker+(optional?'<span> · OPTIONAL</span>':'')+'</div><h1 id="v4-question-title" tabindex="-1">'+title+'</h1><p>'+description+'</p></div>';
 }
 function categoriesScreen(){
  return sectionTitle('LET’S BEGIN','What are you thinking of creating?','Choose the type of project that feels closest. You can change it later.')+
  '<div class="v4-category-grid">'+categories.map((name,i)=>cardSelect(name,categorySummary[name],'category',name,data.category===name,String(i+1).padStart(2,'0'))).join('')+'</div>';
 }
 function library(){
  const pList=presets.filter(p=>(categoryFilter==='All'||p.category===categoryFilter)&&(!search||[p.name,p.category,p.description].join(' ').toLowerCase().includes(search.toLowerCase())));
  const eList=refs.filter(p=>(categoryFilter==='All'||p.category===categoryFilter)&&(!search||[p.name,p.category,p.source].join(' ').toLowerCase().includes(search.toLowerCase())));
  const cards=galleryTab==='studio'?
   pList.map(p=>'<article class="v4-template-card '+(data.template===p.id?'is-selected':'')+'">'+preview(p.name,p.style,p.category)+
   '<div class="v4-template-info"><div><span>VELORYZ CONCEPT · '+escape(p.category)+'</span><span>'+escape(p.style)+'</span></div><h3>'+escape(p.name)+'</h3><p>'+escape(p.description)+'</p><button type="button" data-v4-template="'+escape(p.id)+'">'+(data.template===p.id?'✓ Selected':'Choose this direction →')+'</button></div></article>').join(''):
   eList.map(p=>'<article class="v4-template-card v4-external-card">'+preview(p.name,p.style,p.category)+
   '<div class="v4-template-info"><div><span>'+escape(p.source)+' · '+escape(p.category)+'</span><span>EXTERNAL</span></div><h3>'+escape(p.name)+'</h3><p>Original template reference. View the actual design and licensing on '+escape(p.source)+'.</p><div class="v4-reference-actions"><a href="'+escape(p.url)+'" target="_blank" rel="noopener noreferrer">View original ↗</a><button type="button" data-v4-external="'+escape(p.name)+'">Use as inspiration →</button></div></div></article>').join('');
  return '<div class="v4-library" id="v4-library-results"><div class="v4-library-grid">'+(cards||'<div class="v4-empty">No templates match these filters. Try another category.</div>')+'</div>'+
   '<p class="v4-credits">Marketplace concepts are credited external references. Choosing one as inspiration does not purchase a license or copy its source code.</p></div>';
 }
 function templateScreen(){
  return sectionTitle('01 / THE STARTING POINT','Would you like to start with inspiration?','Choose an original studio concept, browse credited marketplace references, or begin with a blank canvas.','OPTIONAL')+
   '<div class="v4-library-controls"><div class="v4-tab-switch" role="group" aria-label="Library source"><button type="button" data-v4-gallery="studio" aria-pressed="'+(galleryTab==='studio')+'" class="'+(galleryTab==='studio'?'active':'')+'">VELORYZ concepts <span>12</span></button><button type="button" data-v4-gallery="external" aria-pressed="'+(galleryTab==='external')+'" class="'+(galleryTab==='external'?'active':'')+'">Web inspiration <span>'+refs.length+'</span></button></div><label class="v4-search"><span class="sr-only">Search template names</span><input data-v4-search type="search" placeholder="Search templates" autocomplete="off" value="'+escape(search)+'"></label></div>'+
   '<div class="v4-filter-strip" role="group" aria-label="Template categories">'+['All',...categories].map(c=>'<button type="button" data-v4-filter="'+escape(c)+'" class="'+(categoryFilter===c?'active':'')+'" aria-pressed="'+(categoryFilter===c)+'">'+escape(c)+'</button>').join('')+'</div>'+
   '<div id="v4-gallery-holder">'+library()+'</div>'+
   '<button type="button" class="v4-skip-template" data-v4-action="blank">Start with a blank canvas <span>→</span></button>';
 }
 function styleScreen(){
  return sectionTitle('02 / YOUR VISUAL DIRECTION','What should it feel like?','Choose the mood you are drawn to. Every direction can be adapted to your brand.')+
  '<div class="v4-style-grid">'+styles.map(([style,description])=>'<button type="button" class="v4-style-card '+(data.style===style?'is-selected':'')+'" data-v4-pick="style" data-value="'+style+'" aria-pressed="'+(data.style===style)+'">'+preview(style,style,data.category,true)+'<span class="v4-style-label"><strong>'+style+'</strong><small>'+description+'</small><i>'+(data.style===style?'✓':'→')+'</i></span></button>').join('')+'</div>';
 }
 function paletteScreen(){
  return sectionTitle('02 / COLOR DIRECTION','Which palette feels right?','Think of this as a visual preference, not a finished brand identity.','OPTIONAL')+
  '<div class="v4-palette-grid">'+palettes.map(([name,...colors])=>'<button type="button" class="v4-palette-card '+(data.palette===name?'is-selected':'')+'" data-v4-pick="palette" data-value="'+name+'" aria-pressed="'+(data.palette===name)+'"><span class="v4-palette-sample"><i style="background:'+colors[0]+'"></i><i style="background:'+colors[1]+'"></i><i style="background:'+colors[2]+'"></i></span><span class="v4-palette-name">'+name+' <b>'+(data.palette===name?'✓':'→')+'</b></span></button>').join('')+'</div>'+
  '<button type="button" class="v4-link-action" data-v4-action="palette-open">I’m happy for VELORYZ to decide →</button>';
 }
 function referenceScreen(){
  return sectionTitle('02 / YOUR INSPIRATION','Any website you love?','Share a link to something you like. We’ll use it as a creative reference, never copy a third-party design or asset.','OPTIONAL')+
   '<label class="v4-simple-field"><span>INSPIRATION LINK</span><input id="v4-entry" type="url" data-v4-field="reference" maxlength="200" value="'+escape(data.reference)+'" placeholder="https://example.com"></label>'+
   '<p class="v4-small-note">You can leave this blank and continue. The original template rights remain with their creator.</p>';
 }
 function pagesScreen(){
  return sectionTitle('03 / THE SCOPE','How many pages or major screens?','Think homepage, about, services, contact—or app screens. We’ll clarify the final count together.')+
  '<div class="v4-number-grid">'+VeloryzPlanner.pages.map(n=>'<button type="button" data-v4-pick="pages" data-value="'+n+'" aria-pressed="'+(Number(data.pages)===n)+'" class="v4-number-card '+(Number(data.pages)===n?'is-selected':'')+'"><strong>'+n+'</strong><span>'+ (n===1?'Landing page':n===4?'Small website':n===6?'Growing business':n===8?'Larger experience':'Complex project')+'</span><i>→</i></button>').join('')+'</div>'+
  '<p class="v4-small-note">For apps, the total price also depends on user roles, data models, and integrations—not just screen count.</p>';
 }
 function goalScreen(){
  return sectionTitle('03 / THE BIG PICTURE','What should this project achieve?','Tell us the outcome you want. It can be a rough idea—we’ll help shape the details.')+
  '<label class="v4-input-area"><span class="sr-only">Project goal, required</span><textarea id="v4-text-goal" data-v4-field="goal" rows="5" minlength="10" maxlength="1000" placeholder="For example: I want a website that helps visitors understand our services and easily get in touch…">'+escape(data.goal)+'</textarea></label>'+
  '<div class="v4-input-bottom"><span>Describe your audience, the main problem, or what success looks like.</span><span id="v4-goal-length">'+str(data.goal).length+' / 1000</span></div>';
 }
 function featureScreen(id){
  const group=Object.keys(groupCopy).find(name=>'features-'+name.toLowerCase().replace(/[^a-z]+/g,'-')===id)||'Content';
  const [title,desc]=groupCopy[group];
  const options=Object.entries(info).filter(([name,v])=>v[0]===group);
  return sectionTitle('04 / THE FEATURES',title,desc,'OPTIONAL')+
   '<div class="v4-feature-choices">'+options.map(([name,item])=>'<label class="v4-feature-card '+(data.features.includes(name)?'is-selected':'')+'"><input type="checkbox" data-v4-feature="'+escape(name)+'" '+(data.features.includes(name)?'checked':'')+'><span class="v4-feature-check">'+(data.features.includes(name)?'✓':'+')+'</span><span><strong>'+escape(name)+'</strong><small>'+escape(item[1])+'</small></span><em>'+(item[2]?'REVIEW':'STANDARD')+'</em></label>').join('')+'</div>'+
   '<p class="v4-small-note">You can select multiple items. Advanced integrations will be individually reviewed by the studio.</p>';
 }
 function detailScreen(id){
  let feature;try{feature=decodeURIComponent(id.slice('detail-'.length));}catch{feature='';}
  const question=questions[feature];if(!question)return '';
  return sectionTitle('04 / A FEW DETAILS',question[0]+'?', 'Just one detail about '+feature.toLowerCase()+' helps us plan the right solution.','OPTIONAL')+
   '<div class="v4-detail-options">'+question[1].map(option=>cardSelect(option,'','answer:'+feature,option,data.answers[feature]===option,'')).join('')+'</div>'+
   '<button type="button" class="v4-link-action" data-v4-action="skip-detail">I’m not sure yet →</button>';
 }
 function assetsScreen(){
  return sectionTitle('04 / PROJECT MATERIALS','What do you already have?','Select any materials you can share. It’s fine to start from zero.','OPTIONAL')+
  '<div class="v4-feature-choices">'+VeloryzPlanner.assets.map(a=>'<label class="v4-feature-card '+(data.assets.includes(a)?'is-selected':'')+'"><input type="checkbox" data-v4-asset="'+escape(a)+'" '+(data.assets.includes(a)?'checked':'')+'><span class="v4-feature-check">'+(data.assets.includes(a)?'✓':'+')+'</span><span><strong>'+escape(a)+'</strong><small>'+(a==='Brand identity'?'Logos, typography or style guides':a==='Written content'?'Drafted copy, articles or service descriptions':a==='Images & media'?'Photos, graphics, video or other visuals':'An existing site or product to improve')+'</small></span></label>').join('')+'</div>'+
  '<p class="v4-small-note">Materials can also be provided later during studio discovery.</p>';
 }
 function teamMessage(topic='pricing'){
  const e=estimate(),parts=[
   'Hello VELORYZ team, I would like to discuss my '+data.category+' project.',
   'Reference: '+(finished?.reference||'Not yet submitted'),
   'Selected features: '+(data.features.join(', ')||'To discuss'),
   'My budget preference: '+money(data.budget),
   'Current planning estimate: '+money(e.low)+' – '+money(e.high),
   'Question: '+(topic==='pricing'?'Can we discuss pricing, staged delivery and any offers I might qualify for?':'I would like help with my project brief.')
  ];
  return 'https://wa.me/919955326740?text='+encodeURIComponent(parts.join('\n'));
 }
 function teamEmail(){
  const subject='VELORYZ project price review · '+data.category;
  const body='Hello VELORYZ team,\n\nCould you review pricing, possible phased delivery and any eligible current offers for my project?\n\n'+
   'Project: '+data.category+'\nBudget: '+money(data.budget)+'\nSelected features: '+data.features.join(', ')+
   '\nEstimate: '+money(estimate().low)+' – '+money(estimate().high)+
   '\n\nI understand that prices are preliminary until the studio confirms scope.';
  return 'mailto:veloryz.here@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 }
 function activeCreatorOffer(){
  const offers=typeof studioCMS!=='undefined'&&Array.isArray(studioCMS?.offers)?studioCMS.offers:[];
  const now=Date.now();
  return offers.find(o=>o?.enabled&&o.kind==='offer'&&(!o.startAt||Date.parse(o.startAt)<=now)&&(!o.endAt||Date.parse(o.endAt)>now)&&typeof o.title==='string');
 }
 function marketingInfo(){
  const offer=activeCreatorOffer();
  return '<section class="v4-price-flex"><span class="v4-price-flex-kicker">FLEXIBLE SCOPE · TEAM REVIEWED</span><h3>Let’s make the right first version.</h3>'+
   '<p>Our team can discuss a smaller first release, phased delivery, optional services, and any active promotions you qualify for. No discount is guaranteed or automatically applied.</p>'+
   (offer?'<div class="v4-eligible-offer"><strong>Current studio promotion</strong><span>'+escape(offer.title)+'</span><small>Ask the team to confirm eligibility, dates and terms. Not included in this estimate.</small></div>':'')+
   '<div class="v4-price-flex-actions"><a href="'+escape(teamMessage())+'" target="_blank" rel="noopener noreferrer">Message our team ↗</a><a href="'+escape(teamEmail())+'">Request a price review ✉</a></div></section>';
 }
 function budgetScreen(){
  const e=estimate(),below=data.budget<e.low;
  return sectionTitle('05 / THE INVESTMENT','What budget are you comfortable with?','This helps us recommend a realistic first release—not change the price to fit a number.')+
   '<div class="v4-money-panel"><div class="v4-money-top"><span>YOUR PREFERRED BUDGET</span><output id="v4-budget-output">'+money(data.budget)+'</output></div><input type="range" data-v4-budget min="20000" max="300000" step="5000" value="'+data.budget+'" aria-label="Preferred budget"><div class="v4-budget-scale"><span>₹20,000</span><span>₹3,00,000+</span></div><div class="v4-budget-chips">'+budgetOptions.map(n=>'<button type="button" data-v4-budget-set="'+n+'" class="'+(data.budget===n?'active':'')+'">'+money(n)+'</button>').join('')+'</div></div>'+
   '<div class="v4-budget-context"><div><span>EARLY PLANNING RANGE</span><strong>'+money(e.low)+' – '+money(e.high)+'</strong></div><p id="v4-budget-guidance">'+(below?'Your target is below the preliminary scope. Our team can discuss phasing, fewer screens or a leaner first release.':'Our team reviews the scope and provides an individual quote. Pricing may change with requirements, availability and delivery complexity.')+'</p></div>'+
  '<div class="v4-budget-disclaimer">✳ The estimate is not a final price. The team can consult on scope, package options and applicable active offers. Taxes, hosting and external service fees may be additional.</div>'+marketingInfo();
 }
 function timelineScreen(){
  return sectionTitle('05 / THE TIMELINE','When would you like to launch?','Choose your preferred window. We’ll confirm actual availability and dates after reviewing the project.')+
   '<div class="v4-detail-options">'+VeloryzPlanner.timelines.map((t,i)=>cardSelect(t,['No hard deadline','Accelerated timeline','Short focused build','Room to refine'][i],'timeline',t,data.timeline===t,String(i+1).padStart(2,'0'))).join('')+'</div>';
 }
 function priorityScreen(){
  return sectionTitle('05 / YOUR PRIORITIES','What matters most to you?','Your answer will help us make better scope and timeline recommendations.')+
   '<div class="v4-detail-options">'+['Balanced quality and speed','Launch sooner','Premium craft and detail','Keep first release lean'].map((choice,i)=>cardSelect(choice,'','priority',choice,data.priority===choice,String(i+1).padStart(2,'0'))).join('')+'</div>';
 }
 function fieldScreen(id){
  const name=id==='name',value=name?data.name:data.email;
  return sectionTitle('06 / ABOUT YOU',name?'What should we call you?':'Where can we reach you?',name?'Our project team will use this name when discussing your brief.':'This email is required for your enquiry. Once a private workspace is created, our team can issue an invitation code to the same address.')+
   '<label class="v4-simple-field"><span>'+ (name?'YOUR NAME':'EMAIL ADDRESS')+' <i>*</i></span><input id="v4-entry" type="'+(name?'text':'email')+'" data-v4-field="'+id+'" value="'+escape(value)+'" '+(name?'autocomplete="name" maxlength="100"':'autocomplete="email" maxlength="180"')+' required placeholder="'+(name?'Your full name':'you@example.com')+'"></label>'+
   '<p class="v4-small-note">'+(name?'Only a couple of details left.':'Your project reference appears immediately after submission. An invitation or activation code is separate and is sent only when the team creates your private workspace.')+'</p>';
 }
 function brief(){
  const e=estimate(),rows=[
   ['Project',data.category],['Starting point',preset()?.name||data.external||'From scratch'],['Visual direction',data.style+' · '+data.palette],['Pages or screens',String(data.pages)],['Selected features',data.features.join(', ')||'Core experience'],['Budget preference',money(data.budget)],['Planning range',money(e.low)+' – '+money(e.high)],['Preferred timeline',data.timeline],['Contact',data.name+' · '+data.email]
  ];
  return rows.map(([title,value])=>'<div class="v4-review-row"><span>'+escape(title)+'</span><strong>'+escape(value)+'</strong></div>').join('');
 }
 function reviewScreen(){
  return sectionTitle('07 / YOUR PROJECT PLAN','Everything looks good?','Review your project, save the planning proposal, or send your brief to the VELORYZ team for a personal quotation.')+
   '<div class="v4-review-layout"><div class="v4-review-sheet"><div class="v4-review-brand"><span>VELORYZ / STUDIO</span><b>YOUR PROJECT OUTLINE</b></div><div class="v4-review-title">An idea with<br><em>direction.</em></div>'+brief()+
   '<div class="v4-review-goal"><span>YOUR MAIN GOAL</span><p>'+escape(data.goal)+'</p></div></div>'+
   '<div class="v4-review-side"><div class="v4-review-cost"><span>TEAM-REVIEWED PLANNING RANGE</span><strong>'+money(estimate().low)+' – '+money(estimate().high)+'</strong><p>Our team can discuss scope, pricing, relevant packages and qualified promotions. This is not a binding quote.</p></div><button type="button" class="v4-export" data-v4-action="pdf">↓ Download your proposal PDF</button><a class="v4-review-team-link" href="'+escape(teamMessage())+'" target="_blank" rel="noopener noreferrer">Discuss this price with the team ↗</a><p>We will confirm final pricing and any offers after reviewing your request.</p></div></div>'+
   '<label class="v4-consent"><input id="v4-consent" type="checkbox" data-v4-consent '+(data.consent?'checked':'')+'><span>I agree to share this project brief and my contact details with VELORYZ Studio for review. I understand that submitting does not create a client account or accept a quotation.</span></label>';
 }
 function view(id){
  if(id==='discover')return categoriesScreen();
  if(id==='template')return templateScreen();
  if(id==='style')return styleScreen();
  if(id==='palette')return paletteScreen();
  if(id==='reference')return referenceScreen();
  if(id==='pages')return pagesScreen();
  if(id==='goal')return goalScreen();
  if(id==='assets')return assetsScreen();
  if(id.startsWith('features-'))return featureScreen(id);
  if(id.startsWith('detail-'))return detailScreen(id);
  if(id==='budget')return budgetScreen();
  if(id==='timeline')return timelineScreen();
  if(id==='priority')return priorityScreen();
  if(id==='name'||id==='email')return fieldScreen(id);
  if(id==='review')return reviewScreen();
  return '';
 }
 function welcomeScreen(){
  return '<div class="v4-welcome"><div class="v4-welcome-copy"><span class="v4-welcome-tag"><i></i> VELORYZ STUDIO / THE PROJECT CREATOR</span><h1>Let’s make<br>something <em>great.</em></h1><p>Tell us what you have in mind. One thoughtful question at a time, we’ll shape a clear brief and a proposal you can keep.</p><button type="button" class="v4-primary v4-start" data-v4-action="start">Start a project <span>→</span></button>'+
  (sessionStorage.getItem(KEY)?'<button class="v4-resume" type="button" data-v4-action="resume">Continue your saved brief ↗</button>':'')+
  '<div class="v4-welcome-meta"><span>NO SIGN-UP REQUIRED</span><span>PROJECT PLAN & ESTIMATE</span><span>OWNER-REVIEWED REQUEST</span></div></div>'+
  '<div class="v4-welcome-art" aria-hidden="true"><div class="v4-intro-paper"><div><span>VELORYZ / YOUR IDEA</span><span>01 — DISCOVER</span></div><h2>A good project starts with the right questions.</h2><div class="v4-intro-line"></div><div class="v4-intro-row"><i></i><span>01</span><b>Discover</b></div><div class="v4-intro-row"><i></i><span>02</span><b>Define</b></div><div class="v4-intro-row"><i></i><span>03</span><b>Make it real</b></div></div></div></div>';
 }
 function successScreen(){
  const code=escape(finished?.reference||'—'),email=escape(data.email||'your email');
  return '<section class="v4-success v4-success-enhanced"><div class="v4-success-check">✓</div><span class="v4-kicker">PROJECT REQUEST CONFIRMED</span>'+
   '<h1 id="v4-question-title" tabindex="-1">Project submitted<br><em>successfully.</em></h1>'+
   '<p>Thank you. The VELORYZ team has received your project brief and will review the details before sharing the next steps and a tailored quotation.</p>'+
   '<div class="v4-reference"><span>YOUR PROJECT REFERENCE · SAVE THIS</span><strong>'+code+'</strong><button type="button" data-v4-action="copy">Copy reference</button></div>'+
   '<div class="v4-success-handoff"><span class="v4-handoff-kicker">NEXT STEPS / YOUR PRIVATE PROJECT ROOM</span><div class="v4-handoff-steps">'+
   [['01','Request saved','Use your reference code when contacting the team. It is not a login password.'],['02','Check your email','Watch '+email+' and its spam folder for updates over the next 12 hours. Response times vary; this is not a guaranteed delivery deadline.'],['03','Receive your private invitation','After the team accepts the project and creates your workspace, a separate one-time invitation or activation code may be sent to this email. It is not generated on this screen.'],['04','Activate your client portal','Open veloryz.online/client/, paste the invitation code into the portal, and access your private project messages, milestones and files.']].map(([n,title,desc])=>'<div class="v4-handoff-step"><span>'+n+'</span><div><strong>'+title+'</strong><p>'+desc+'</p></div></div>').join('')+'</div></div>'+
   '<div class="v4-code-clarity"><strong>Reference code vs invitation code</strong><p>The reference above confirms submission. A separate secret invitation code is created by our team only after your project workspace is approved. We cannot promise it will arrive within 12 hours.</p></div>'+
   '<div class="v4-success-buttons"><a class="v4-primary" href="/client/">Open client portal ↗</a><a class="v4-secondary" href="'+escape(teamMessage('project'))+'" target="_blank" rel="noopener noreferrer">Message the team ↗</a><button class="v4-secondary" type="button" data-v4-action="pdf">Download proposal ↓</button><button class="v4-secondary" type="button" data-v4-action="restart">Start another project →</button></div>'+
   '<p class="v4-small-note">No payment has been taken, and no portal invitation has been issued by this submission.</p></section>';
 }
 function header(){
  const flowList=flow(),total=flowList.length,number=active==='success'?total:at()+1,group=meta(active);
  return '<header class="v4-topbar"><a class="v4-logo" href="/" aria-label="VELORYZ Studio home"><img src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" width="134" height="40" alt="VELORYZ" decoding="async"><span>/ STUDIO</span></a>'+
   (active==='welcome'?'<span class="v4-top-center">A THOUGHTFUL BEGINNING</span>':'<div class="v4-top-progress"><span>'+escape(group[0])+'</span><span>'+number+' / '+total+'</span></div>')+
   '<a class="v4-exit" href="/">Exit <span aria-hidden="true">↗</span></a></header>'+
   (active==='welcome'?'':'<div class="v4-progress-track" role="progressbar" aria-label="Project creator progress" aria-valuenow="'+number+'" aria-valuemin="0" aria-valuemax="'+total+'"><i style="width:'+Math.round(number/total*100)+'%"></i></div>');
 }
 function app(){
  const welcome=active==='welcome',success=active==='success';
  const index=at()+1,total=flow().length;
  return '<div class="v4-root">'+header()+
   (welcome?welcomeScreen():success?successScreen():
     '<section class="v4-question-view"><div class="v4-question-wrap"><div class="v4-side-number" aria-hidden="true">'+String(index).padStart(2,'0')+' / '+String(total).padStart(2,'0')+'</div>'+
      '<div class="v4-question-inner" id="v4-question-body">'+view(active)+'<p id="v4-error" class="v4-error" role="alert" '+(error?'':'hidden')+'>'+escape(error)+'</p><p id="v4-notice" class="v4-notice" role="status" '+(inlineNotice?'':'hidden')+'>'+escape(inlineNotice)+'</p></div></div></section>'+
     '<footer class="v4-bottom"><button type="button" class="v4-back" data-v4-action="back">← Back</button><span class="v4-shortcut">'+(active==='review'?'ONE FINAL STEP': 'PRESS ENTER TO CONTINUE')+'</span>'+
     (active==='review'?'<button type="button" class="v4-primary" data-v4-action="submit" '+(busy?'disabled':'')+'>'+(busy?'Sending…':'Send my project →')+'</button>':
      '<button type="button" class="v4-primary" data-v4-action="next">Continue <span>→</span></button>')+'</footer>')+
   '<div id="v4-ai-slot"></div></div>';
 }
 function render(){
  const target=document.querySelector('.v4-root');
  if(target){target.outerHTML=app();if(typeof document.dispatchEvent==='function'&&typeof CustomEvent==='function')document.dispatchEvent(new CustomEvent('veloryz:creator-render'));}
 }
 function updateBudget(){
  const text=document.getElementById('v4-budget-output');if(text)text.textContent=money(data.budget);
  const context=document.getElementById('v4-budget-guidance');const e=estimate();
  if(context)context.textContent=data.budget<e.low?'Your preference is below the planning range. Ask our team about phasing or a smaller first release.':'Your preference is saved. The team can discuss scope and any current offers before preparing a final quote.';
 }
 function refreshLibrary(){
  const node=document.getElementById('v4-gallery-holder');
  if(node)node.innerHTML=library();
 }
 function payloadText(){
  const e=estimate();
  const content=[
   'PROJECT CREATOR V4',
   'Project: '+clean(data.category),
   'Template: '+clean(preset()?.name||'Custom'),
   data.external?'External inspiration: '+clean(data.external):'',
   'Visual style: '+clean(data.style)+' / '+clean(data.palette),
   data.reference?'Reference URL: '+clean(data.reference):'',
   'Pages / screens: '+data.pages,
   'Features: '+(data.features.join(', ')||'Core experience'),
   ...Object.entries(data.answers).filter(([key])=>data.features.includes(key)).map(([key,value])=>clean(key)+': '+clean(value)),
   'Materials: '+(data.assets.join(', ')||'To be discussed'),
   'Budget preference: '+money(data.budget),
   'Indicative range: '+money(e.low)+' - '+money(e.high),
   'Timeline: '+clean(data.timeline),'Priority: '+clean(data.priority),
   'Goal: '+clean(data.goal),
   'Review: '+(data.features.filter(n=>info[n]?.[2]).length?'Complex capabilities need technical scoping':'Studio review required'),
   'Pricing: Team consultation and eligible promotions may be discussed; no offer applied automatically.',
   'Draft only. Official price and timeline subject to written approval.'
  ].filter(Boolean).join('\n');
  return content.slice(0,2000);
 }
 function proposal(){
  try{
   const e=estimate();
   if(!window.VeloryzProposal)throw Error('Proposal generator unavailable');
   window.VeloryzProposal.download({brief:projectBrief,estimate:e,reference:{name:preset()?.name||data.external||'Custom concept'},creator:{category:data.category,palette:data.palette,priority:data.priority,features:data.features,answers:data.answers,source:data.external}});
  }catch(err){console.error('Could not export proposal:',err);toast('Could not generate the PDF. Please try again.');}
 }
 async function submit(){
  if(busy||finished)return;
  for(const step of ['goal','name','email','review']){
   if(!validateStep(step)){if(step!==active){const message=error;route(step);error=message;render();}return;}
  }
  busy=true;error='';render();
  if(!data.requestId)data.requestId=crypto.randomUUID();
  sync();
  const payload={kind:'project',requestId:data.requestId,name:clean(data.name),email:str(data.email).trim().toLowerCase(),phone:'',company:'',budget:money(data.budget)+' preferred',message:payloadText(),consent:true,website:''};
  const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),18000);
  try{
   const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
   const out=await response.json().catch(()=>({error:'The studio could not respond. Please try again.'}));
   if(!response.ok)throw Error(out.error||'Could not submit your project.');
   finished={reference:out.reference};data.requestId='';busy=false;
   try{sessionStorage.removeItem(KEY);sessionStorage.removeItem(oldKey);sessionStorage.removeItem('veloryz.planner.v1');}catch{}
   route('success');
  }catch(err){
   busy=false;error=err.name==='AbortError'?'The request timed out. You can safely retry.':err.message;
   render();
  }finally{clearTimeout(timeout);}
 }
 function handlePick(key,val){
  if(key.startsWith('answer:')){data.answers[key.slice(7)]=val;data.requestId='';sync();move(1);return;}
  if(key==='pages')return pick('pages',Number(val));
  pick(key,val);
 }
 function handleAction(action){
  if(action==='start')return route('discover');
  if(action==='resume')return route(flow().includes(data.lastQuestion)?data.lastQuestion:'discover');
  if(action==='back')return move(-1);
  if(action==='next')return move(1);
  if(action==='blank'){change('template','');change('external','');return move(1);}
  if(action==='palette-open')return pick('palette','Studio decides');
  if(action==='skip-detail')return move(1);
  if(action==='pdf')return proposal();
  if(action==='submit')return submit();
  if(action==='restart'){
   const fresh=initial();Object.assign(data,fresh,{answers:{},features:[],assets:[],requestId:''});
   finished=null;sync();return route('welcome');
  }
  if(action==='copy'){const reference=finished?.reference;if(reference&&navigator.clipboard?.writeText)navigator.clipboard.writeText(reference).then(()=>toast('Copied.')).catch(()=>toast('Please select and copy the reference.'));return;}
 }
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-v4-action],[data-v4-pick],[data-v4-template],[data-v4-external],[data-v4-gallery],[data-v4-filter],[data-v4-budget-set]');
  if(!b||!document.querySelector('.v4-root'))return;
  if(b.hasAttribute('data-v4-action')){handleAction(b.dataset.v4Action);return;}
  if(b.hasAttribute('data-v4-pick')){handlePick(b.dataset.v4Pick,b.dataset.value);return;}
  if(b.hasAttribute('data-v4-template')){
   const selected=presets.find(p=>p.id===b.dataset.v4Template);
   if(!selected)return;
   data.template=selected.id;data.external='';data.category=selected.category;data.style=selected.style;data.pages=selected.pages;data.features=selected.features.slice();data.requestId='';sync();return move(1);
  }
  if(b.hasAttribute('data-v4-external')){
   const ref=refs.find(r=>r.name===b.dataset.v4External);if(!ref)return;
   data.template='';data.external=ref.name+' ('+ref.source+'): '+ref.url;
   data.category=ref.category;data.style=ref.style;data.requestId='';sync();return move(1);
  }
  if(b.hasAttribute('data-v4-gallery')){galleryTab=b.dataset.v4Gallery;render();return;}
  if(b.hasAttribute('data-v4-filter')){categoryFilter=b.dataset.v4Filter;refreshLibrary();const strip=document.querySelector('.v4-filter-strip');if(strip){strip.querySelectorAll('button').forEach(el=>{const yes=el.dataset.v4Filter===categoryFilter;el.classList.toggle('active',yes);el.setAttribute('aria-pressed',String(yes));});}return;}
  if(b.hasAttribute('data-v4-budget-set')){
   change('budget',Number(b.dataset.v4BudgetSet));render();return;
  }
 });
 document.addEventListener('input',event=>{
  const b=event.target;if(!b.closest('.v4-root'))return;
  if(b.hasAttribute('data-v4-search')){search=b.value;refreshLibrary();return;}
  if(b.hasAttribute('data-v4-field')){
   const field=b.dataset.v4Field;data[field]=b.value.slice(0,field==='goal'?1000:200);
   data.requestId='';sync();error='';
   if(field==='goal'){const el=document.getElementById('v4-goal-length');if(el)el.textContent=b.value.length+' / 1000';}
   const err=document.getElementById('v4-error');if(err)err.hidden=true;
  }
  if(b.hasAttribute('data-v4-budget')){change('budget',Number(b.value));updateBudget();}
 });
 document.addEventListener('change',event=>{
  const b=event.target;if(!b.closest('.v4-root'))return;
  if(b.hasAttribute('data-v4-feature')){
   const name=b.dataset.v4Feature,has=b.checked;
   data.features=has?[...new Set([...data.features,name])]:data.features.filter(n=>n!==name);
   data.requestId='';sync();
   const card=b.closest('.v4-feature-card');if(card){card.classList.toggle('is-selected',has);const indicator=card.querySelector('.v4-feature-check');if(indicator)indicator.textContent=has?'✓':'+';}
  }
  if(b.hasAttribute('data-v4-asset')){
   const name=b.dataset.v4Asset,has=b.checked;
   data.assets=has?[...new Set([...data.assets,name])]:data.assets.filter(x=>x!==name);
   data.requestId='';sync();
   const card=b.closest('.v4-feature-card');if(card){card.classList.toggle('is-selected',has);const indicator=card.querySelector('.v4-feature-check');if(indicator)indicator.textContent=has?'✓':'+';}
  }
  if(b.hasAttribute('data-v4-consent')){change('consent',b.checked);}
 });
 document.addEventListener('keydown',event=>{
  if(!document.querySelector('.v4-root')||busy||active==='welcome'||active==='success')return;
  if(event.key==='Enter'&&!event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&event.target.tagName!=='TEXTAREA'&&event.target.tagName!=='BUTTON'&&event.target.tagName!=='A'&&!event.target.hasAttribute('data-v4-search')){
   event.preventDefault();if(active==='review')submit();else move(1);
  }
  if(event.key==='Escape'&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA')move(-1);
 });
 window.addEventListener('popstate',()=>{
  if(!document.querySelector('.v4-root'))return;
  let candidate='welcome';try{candidate=new URL(location.href).searchParams.get('question')||'welcome';}catch{}
  active=candidate==='welcome'||(candidate==='success'&&finished)||flow().includes(candidate)?candidate:'welcome';
  render();
 });
 // Persist on first use, but do not create a ghost draft on a clean welcome screen.
 if(active!=='welcome'&&active!=='success'){data.lastQuestion=active;sync();}
 createPage=function(){
  const fromURL=new URL(location.href).searchParams.get('question')||'welcome';
  active=fromURL==='welcome'||(fromURL==='success'&&finished)||flow().includes(fromURL)?fromURL:'welcome';
  if(typeof document.dispatchEvent==='function'&&typeof CustomEvent==='function')setTimeout(()=>document.dispatchEvent(new CustomEvent('veloryz:creator-render')),0);
  return app();
 };
 window.VeloryzCreatorV4={get:()=>JSON.parse(JSON.stringify(data)),flow,templateCount:presets.length,referenceCount:refs.length,estimate,payloadText,go:route,stage:()=>active};
})();
