'use strict';
/* VELORYZ Project Creator V4 — isolated, one-question-per-screen experience.
   Original templates and public marketplace references, no copied proprietary assets. */
(function(){
 const KEY='veloryz.creator.v4';
 const steps=['Discover','Business','Design','Features','Scope','Investment','Send'];
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
 ['Immersive','Depth, motion and atmosphere','Feel something new.'],
 ['Luxury','Elegant spacing and refined detail','Considered at every scale.'],
 ['Futuristic','Technical, modern and experimental','A view of what comes next.'],
 ['Playful','Colourful, energetic and human','Make room for delight.'],
 ['Cinematic','Large imagery and immersive transitions','Build a world around the story.'],
 ['Motion First','Animation becomes part of the identity','Movement with a purpose.'],
 ['Brutalist','Raw typography and unconventional structure','Clear, direct and unexpected.']
 ];
 const pageOptions=['Home','About','Services','Projects / Work','Portfolio','Products','Shop','Pricing','Contact','Blog','Careers','Team','Testimonials','FAQ','Documentation','Support','Dashboard','Login','Signup','Profile'];
 const motionLevels=[
  ['01','Calm','Subtle fades and transitions.'],
  ['02','Refined','Smooth interaction and elegant motion.'],
  ['03','Expressive','Scroll-based motion and animated layouts.'],
  ['04','Immersive','Advanced transitions, 3D and interactive scenes.'],
  ['05','Experimental','A highly creative, motion-driven experience.']
 ];
 const technologyOptions=['Existing domain','Existing hosting','Existing backend','Existing database','Existing API','Authentication','Payment provider','Analytics','CMS','Third-party integrations'];
 const info={
 'Content management':['Content','Update text and media without editing code.',false],
 'SEO foundations':['Content','Metadata, structured content and crawlable pages.',false],
 'Blog & publishing':['Content','Manage articles, authors and publishing.',false],
 'Search & filters':['Experience','Help people find relevant content quickly.',false],
 'Motion direction':['Experience','Subtle animation with reduced-motion support.',false],
 'Multilingual support':['Experience','Multiple languages and localized content.',true],
 'Booking workflow':['Operations','Design appointment requests and availability rules.',true],
 'Email notifications':['Operations','Transactional messages and verified delivery.',true],
 'Admin dashboard':['Operations','Manage project data through secure team controls.',true],
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
 'Admin dashboard':['Management users',['Team admin only','Small team','Multiple roles','Not sure']],
 'Multilingual support':['Languages',['Two','Three or four','Five+','Not sure']]
 };
 const initial=()=>({category:'Business',template:'studio',style:'Minimal',palette:'Warm ivory',pages:4,pageNames:['Home','About','Services','Contact'],features:['Content management','SEO foundations'],answers:{},assets:[],technologies:[],motion:'02 · Refined',timeline:'Within 2–3 months',budget:55000,priority:'Balanced quality and speed',goal:'',businessName:'',industry:'',businessStage:'',businessDescription:'',audience:'',name:'',email:'',phone:'',company:'',preferredContact:'Email',notes:'',consent:false,reference:'',referenceLikes:[],external:'',requestId:'',promoRequested:false,briefMode:'detailed',referenceId:'',referenceRights:'',extraReferences:'',materialLink:''});
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clean=s=>String(s??'').replace(/[<>\x00-\x1f]/g,' ').trim();
 const money=n=>'₹'+Math.round(Number(n)||0).toLocaleString('en-IN');
 const emit=(name,detail)=>{if(typeof CustomEvent==='function'&&typeof document.dispatchEvent==='function')document.dispatchEvent(new CustomEvent(name,{detail}));};

 const oldKey='veloryz.creator.v3';
 const budgetOptions=()=>data.external?[6000,12000,20000,35000,50000]:isApp()?[100000,250000,500000,1000000,1500000]:data.category==='Ecommerce'?[50000,100000,250000,500000,1000000]:[25000,50000,100000,200000,300000];
 const minBudget=()=>data.external?6000:20000;
 const maxBudget=()=>isApp()?1500000:data.category==='Ecommerce'?1000000:300000;
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
 const data={...initial(),...(state&&typeof state==='object'&&!Array.isArray(state)?Object.fromEntries(Object.keys(initial()).filter(k=>Object.hasOwn(state,k)).map(k=>[k,state[k]]).concat(typeof state.lastQuestion==='string'?[['lastQuestion',state.lastQuestion]]:[])):{} )};
 data.briefMode=data.briefMode==='quick'?'quick':'detailed';
 const safeURL=value=>{try{const u=new URL(String(value).trim());return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&u.href.length<=350?u.href:'';}catch{return '';}};
 const extraLinks=value=>[...new Set(String(value||'').split(/\r?\n/).map(safeURL).filter(Boolean))].slice(0,3);
 data.extraReferences=extraLinks(data.extraReferences).join('\n');data.materialLink=safeURL(data.materialLink);
 data.features=Array.isArray(data.features)?[...new Set(data.features.filter(n=>info[n]))]:[];
 data.answers=data.answers&&typeof data.answers==='object'&&!Array.isArray(data.answers)?data.answers:{};
 data.assets=Array.isArray(data.assets)?data.assets.filter(a=>VeloryzPlanner.assets.includes(a)):[];
 data.pageNames=Array.isArray(data.pageNames)?[...new Set(data.pageNames.filter(a=>pageOptions.includes(a)))]:[];
 data.technologies=Array.isArray(data.technologies)?[...new Set(data.technologies.filter(a=>technologyOptions.includes(a)))]:[];
 data.referenceLikes=Array.isArray(data.referenceLikes)?[...new Set(data.referenceLikes)]:[];
 data.pages=VeloryzPlanner.pages.includes(Number(data.pages))?Number(data.pages):4;
 data.budget=Math.min(1500000,Math.max(6000,Math.round(Number(data.budget||55000)/1000)*1000));
 if(!categories.includes(data.category))data.category='Business';
 if(!styles.some(([s])=>s===data.style))data.style='Minimal';
 let stageFromURL;
 try{stageFromURL=new URL(location.href).searchParams.get('question');}catch{stageFromURL=null;}
 let active=stageFromURL||'welcome',busy=false,finished=null,error='',search='',categoryFilter='All',galleryTab='studio',refChoice='',inlineNotice='',jumpToken=0,reviewVisited=active==='review';
 let storeTemplate='';
 try{storeTemplate=new URL(location.href).searchParams.get('template')||''}catch{}
 const fromStore=presets.find(p=>p.id===storeTemplate);
 if(fromStore){
  Object.assign(data,{template:fromStore.id,category:fromStore.category,style:fromStore.style,pages:fromStore.pages,features:fromStore.features.slice(),external:'',requestId:''});
  if(!stageFromURL)active='template';
 }
 const lightEscape=v=>escape(str(v).slice(0,1200));
 function sync(){
  projectBrief=VeloryzPlanner.normalize({...projectBrief,purpose:data.category,pages:String(data.pages),style:data.style,features:data.features,budget:data.budget,timeline:data.timeline,goal:data.goal,assets:data.assets});
  window.VeloryzProjectEmail=str(data.email).trim().toLowerCase();
  try{if(!finished){sessionStorage.setItem(KEY,JSON.stringify(data));sessionStorage.setItem('veloryz.planner.v1',JSON.stringify(projectBrief));}}catch{}
 }
 function estimate(){
  sync();
  const pricing=typeof studioCMS!=='undefined'?studioCMS?.site?.creatorPricing:undefined;
  const selected=externalDesigns().find(p=>p.id===data.referenceId);
  // Marketplace amounts are reference-specific starting service estimates, never URL prices.
  const trusted=selected&&data.referenceRights!=='independent'&&categoryForExternal(selected)===data.category?selected:null;
  return VeloryzPlanner.estimate(projectBrief,trusted,[],pricing);
 }
 function preset(){return presets.find(p=>p.id===data.template)||null;}
 function isApp(){return ['SaaS / platform','Custom App','Community','Education'].includes(data.category);}
 function flow(){
  const base=['discover','template','style','palette','reference','pages','goal'];
  if(data.briefMode==='quick')return ['discover','template','pages','goal','features-content','budget','timeline','name','email','review'];
  for(const group of Object.keys(groupCopy)){
   if(featureGroups[group].includes(data.category))base.push('features-'+group.toLowerCase().replace(/[^a-z]+/g,'-'));
  }
  for(const name of Object.keys(questions)){
   if(data.features.includes(name))base.push('detail-'+encodeURIComponent(name));
  }
  return [...base,'assets','business','motion','technology','budget','timeline','priority','name','email','review'];
 }
 function meta(id){
  if(id==='welcome')return ['Welcome','A new beginning'];
  if(id==='success')return ['Complete','Request received'];
  if(id.startsWith('features-'))return ['Capabilities','Feature choices'];
  if(id.startsWith('detail-'))return ['Capabilities','A little detail'];
  const map={discover:['Discover','Project type'],template:['Discover','Starting point'],style:['Design','Visual direction'],palette:['Design','Color mood'],reference:['Design','Your inspiration'],pages:['Scope','Pages and screens'],goal:['Scope','Your goal'],assets:['Features','Materials ready'],business:['Business','Business context'],motion:['Design','Motion and interaction'],technology:['Scope','Technical context'],budget:['Investment','Your budget'],timeline:['Investment','Preferred launch'],priority:['Scope','Project priorities'],name:['Send','Your name'],email:['Send','Contact details'],review:['Send','Review and send']};
  return map[id]||['Discover','Project type'];
 }
 function at(){return Math.max(0,flow().indexOf(active));}
 function route(to,replace=false){
  if(busy)return;
  const id=to==='welcome'||to==='success'||flow().includes(to)?to:'discover';
  active=id;error='';inlineNotice='';if(id==='review')reviewVisited=true;if(id!=='welcome'&&id!=='success'){data.lastQuestion=id;sync();}
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
   if(data.category!==value){data.category=value;data.template='';data.external='';data.referenceId='';data.referenceRights='';data.features=[];data.answers={};data.budget=Math.min(data.budget,maxBudget());}
  }else data[key]=value;
  data.requestId='';sync();
 }
 function pick(key,value,advance=true){
  change(key,value);
  if(advance)move(1);else render();
 }
 function validateStep(id){
  const show=message=>{error=message;const el=document.querySelector('#v4-error');if(el){el.hidden=false;el.textContent=message;}emit('veloryz:creator-state',{state:'error'});return false;};
  if(id==='reference'&&((data.reference&&!safeURL(data.reference))||str(data.extraReferences).split(/\r?\n/).filter(x=>x.trim()).length>3||str(data.extraReferences).split(/\r?\n/).some(x=>x.trim()&&!safeURL(x))))return show('Use valid HTTP or HTTPS links, up to three additional references.');
  if(id==='assets'&&data.materialLink&&!safeURL(data.materialLink))return show('Enter a valid HTTP or HTTPS link to materials, or leave it empty.');
  if(id==='goal'&&str(data.goal).trim().length<10)return show('Write at least 10 characters about what you want to achieve.');
  if(id==='name'&&str(data.name).trim().length<2)return show('Enter your name so we know who to contact.');
  if(id==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(data.email).trim()))return show('Enter a valid email address for your project updates.');
  if(id==='email'&&data.phone&&(!/^\+?[0-9 ()-]{8,20}$/.test(str(data.phone).trim())||!/^\d{8,15}$/.test(str(data.phone).replace(/\D/g,''))))return show('Use a valid phone number with country code, or leave it blank.');
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
  return sectionTitle('LET’S BEGIN','What would you like to build?','Choose the closest match to your idea. You can change it later.')+
  '<div class="v4-category-grid">'+categories.map((name,i)=>cardSelect(name,categorySummary[name],'category',name,data.category===name,String(i+1).padStart(2,'0'))).join('')+'</div>';
 }
 function externalDesigns(){
  return (window.VeloryzExternalDesignLibrary?.entries()||[]).filter(p=>p?.enabled!==false);
 }
 function categoryForExternal(p){
  const x=String(p?.category||'').toLowerCase();
  if(/ecommerce|commerce|grocery|delivery|food|b2b|marketplace|shop/.test(x))return 'Ecommerce';
  if(/saas|fintech|dashboard|project management|tasks|kanban/.test(x))return 'SaaS / platform';
  if(x.includes('social')||x.includes('community'))return 'Community';
  if(x.includes('portfolio')||x.includes('creative'))return 'Portfolio';
  if(/agency|motion|components/.test(x))return 'Agency';
  if(/editorial|publish|blog|magazine/.test(x))return 'Editorial';
  if(/education|learning|lms/.test(x))return 'Education';
  return 'Business';
 }
 function chooseExternal(p){
  data.template='';
  data.external='VELORYZ Studio design: '+p.name+' ('+p.id+')';
  data.referenceId=p.id;data.referenceRights=p.rights==='restricted'||/NO LICENSE|CC BY-NC|RESTRICTED|PROPRIETARY|COMMONS CLAUSE/i.test(p.license||'')?'independent':'review';
  data.reference=new URL('/design/'+p.id+'/',location.origin).href;
  if(!str(data.goal).trim())data.budget=Math.min(50000,Math.max(6000,Math.round(Number(p.price||6000)/1000)*1000));
  data.category=categoryForExternal(p);
  data.style=/motion|agency|portfolio/i.test(p.category)?'Immersive':/ecommerce|editorial/i.test(p.category)?'Editorial':/social|community|gaming/i.test(p.category)?'Bold':'Minimal';
  // Preserve the user's requested features, but clear template-specific source assumptions.
  data.requestId='';sync();
 }
 function library(){
  const items=externalDesigns().filter(p=>(categoryFilter==='All'||p.category===categoryFilter)&&(!search||[p.name,p.category,p.description,p.author].join(' ').toLowerCase().includes(search.toLowerCase()))).slice(0,30);
  const cards=items.map(p=>'<article class="v4-template-card v4-external-card">'+
   '<a class="v4-template-live-art" href="/design/'+encodeURIComponent(p.id)+'/" aria-label="View original source for '+escape(p.name)+'">'+
   (p.previewImage||p.image||p.originalTemplateId?'<img class="v4-veloryz-realshot" src="'+escape(p.previewImage||p.image||'/template-covers/'+p.originalTemplateId+'.svg')+'" alt="Design preview for '+escape(p.name)+'" loading="lazy" decoding="async">':'<span class="v4-source-unavailable">Preview available in studio</span>')+
   '<span>Explore design in VELORYZ ↗</span></a>'+
   '<div class="v4-template-info"><div><span>'+escape(p.category)+'</span><span>VELORYZ DESIGN COLLECTION</span></div><h3>'+escape(p.name)+'</h3><p>'+escape(p.description)+'</p><p class="v4-source-price">Studio service from '+money(p.price||6000)+'</p>'+
   '<div class="v4-reference-actions"><a href="/design/'+encodeURIComponent(p.id)+'/">Explore studio preview ↗</a><button type="button" data-v4-external="'+escape(p.id)+'">Create with VELORYZ →</button></div>'+
   '<small>Discover a visual direction and create a tailored project with VELORYZ Studio.</small></div></article>').join('');
  return '<div class="v4-library" id="v4-library-results"><div class="v4-library-grid">'+(cards||'<div class="v4-empty">No designs match this filter. Try another category.</div>')+'</div>'+
   '<p class="v4-credits">Browse the collection, explore a design and bring your idea to life with the studio.</p></div>';
 }
 function templateScreen(){
  const all=externalDesigns(),types=['All',...new Set(all.map(p=>p.category))];
  return sectionTitle('01 / THE STARTING POINT','Choose an authentic source design.','Explore immersive websites, visual experiences and ready-to-customize directions for your next project.','OPTIONAL')+
   '<section class="v4-studio-concepts" aria-labelledby="v4-studio-concepts-title"><div class="v4-library-subhead"><span>VELORYZ DESIGN DIRECTIONS</span><h2 id="v4-studio-concepts-title">Begin with an original Studio concept.</h2></div><div class="v4-library-grid">'+presets.filter(item=>item.category===data.category).map(item=>'<article class="v4-template-card '+(data.template===item.id?'is-selected':'')+'">'+preview(item.name,item.style,item.category)+'<div class="v4-template-info"><div><span>'+escape(item.style)+'</span><span>ORIGINAL DIRECTION</span></div><h3>'+escape(item.name)+'</h3><p>'+escape(item.description)+'</p><button type="button" data-v4-template="'+escape(item.id)+'">Use this direction →</button></div></article>').join('')+'</div></section>'+
   '<div class="v4-library-subhead v4-web-inspiration"><span>Web inspiration</span><h2>Explore the VELORYZ Design Library.</h2><p>Use published work as a visual reference only. Your final project remains original.</p></div>'+
   '<div class="v4-library-controls"><div class="v4-tab-switch"><a href="/design/" class="v4-market-link">Open full Design Library · '+all.length+' references ↗</a></div><label class="v4-search"><span class="sr-only">Search external websites</span><input data-v4-search type="search" placeholder="Search real designs" autocomplete="off" value="'+escape(search)+'"></label></div>'+
   '<div class="v4-filter-strip" role="group" aria-label="Design reference categories">'+types.map(n=>'<button type="button" data-v4-filter="'+escape(n)+'" class="'+(categoryFilter===n?'active':'')+'" aria-pressed="'+(categoryFilter===n)+'">'+escape(n)+'</button>').join('')+'</div>'+
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
  const likes=['Layout','Typography','Motion','Colours','Navigation','3D','Images','Simplicity','Interaction','Overall feeling'];
  return sectionTitle('02 / YOUR INSPIRATION','Show us what inspires you.','Share a link and tell us what caught your attention. References guide the conversation; VELORYZ always creates an original solution.','OPTIONAL')+
   '<label class="v4-simple-field"><span>INSPIRATION LINK</span><input id="v4-entry" type="url" data-v4-field="reference" maxlength="200" value="'+escape(data.reference)+'" placeholder="https://example.com"></label>'+
   '<div class="v4-reference-likes" aria-label="What do you like about this reference?">'+likes.map(item=>'<label class="'+(data.referenceLikes.includes(item)?'is-selected':'')+'"><input type="checkbox" data-v4-list="referenceLikes" value="'+escape(item)+'" '+(data.referenceLikes.includes(item)?'checked':'')+'><span>'+escape(item)+'</span></label>').join('')+'</div>'+
   '<label class="v4-simple-field"><span>ADDITIONAL REFERENCES (UP TO THREE)</span><textarea data-v4-field="extraReferences" maxlength="1050" rows="3" placeholder="One public HTTP or HTTPS link per line">'+escape(data.extraReferences)+'</textarea></label><p class="v4-small-note">Inspiration only. Third-party rights remain with their creators and no design or asset will be copied.</p>';
 }
 function pagesScreen(){
  return sectionTitle('03 / THE SCOPE','How many pages or major screens?','Think homepage, about, services, contact—or app screens. We’ll clarify the final count together.')+
  '<div class="v4-number-grid">'+VeloryzPlanner.pages.map(n=>'<button type="button" data-v4-pick="pages" data-value="'+n+'" aria-pressed="'+(Number(data.pages)===n)+'" class="v4-number-card '+(Number(data.pages)===n?'is-selected':'')+'"><strong>'+n+'</strong><span>'+ (n===1?'Landing page':n===4?'Small website':n===6?'Growing business':n===8?'Larger experience':'Complex project')+'</span><i>→</i></button>').join('')+'</div>'+
  '<div class="v4-page-builder"><div><span>SUGGESTED PAGES</span><strong>'+data.pageNames.length+' selected</strong></div><div>'+pageOptions.map(page=>'<label class="'+(data.pageNames.includes(page)?'is-selected':'')+'"><input type="checkbox" data-v4-list="pageNames" value="'+escape(page)+'" '+(data.pageNames.includes(page)?'checked':'')+'><span>'+escape(page)+'</span></label>').join('')+'</div></div>'+
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
  '<label class="v4-simple-field"><span>OPTIONAL MATERIALS LINK</span><input type="url" data-v4-field="materialLink" maxlength="350" value="'+escape(data.materialLink)+'" placeholder="https://…"></label><p class="v4-small-note">Share a link only if you have permission. Do not share passwords, private keys or confidential files here. Private uploads are arranged during studio discovery.</p>';
 }
 function businessScreen(){
  const stages=['Idea stage','Starting now','Recently launched','Growing business','Established business','Rebranding','Expanding digitally'];
  return sectionTitle('04 / THE BUSINESS','Tell us about the business.','A little context helps the Studio make design and technology decisions around real customers.','OPTIONAL')+
   '<div class="v4-field-grid"><label class="v4-field"><span>BUSINESS / BRAND NAME</span><input data-v4-field="businessName" value="'+escape(data.businessName)+'" maxlength="120" placeholder="Your brand name"></label><label class="v4-field"><span>INDUSTRY</span><input data-v4-field="industry" value="'+escape(data.industry)+'" maxlength="120" placeholder="Technology, fashion, education…"></label><label class="v4-field v4-field-wide"><span>WHAT DOES THE BUSINESS DO?</span><textarea data-v4-field="businessDescription" maxlength="700" rows="4" placeholder="What you offer, who you serve and why the business exists.">'+escape(data.businessDescription)+'</textarea></label><label class="v4-field v4-field-wide"><span>TARGET AUDIENCE</span><input data-v4-field="audience" value="'+escape(data.audience)+'" maxlength="240" placeholder="Location, age range, customer type, B2B or B2C"></label></div>'+
   '<div class="v4-chip-field"><span>BUSINESS STAGE</span><div>'+stages.map(stage=>'<button type="button" data-v4-choice-field="businessStage" data-value="'+escape(stage)+'" class="'+(data.businessStage===stage?'is-selected':'')+'" aria-pressed="'+(data.businessStage===stage)+'">'+escape(stage)+'</button>').join('')+'</div></div>';
 }
 function motionScreen(){
  return sectionTitle('05 / MOTION & INTERACTION','How alive should the experience feel?','Every movement should communicate state, hierarchy or progression.')+
   '<div class="v4-motion-scale">'+motionLevels.map(([number,title,description])=>'<button type="button" class="'+(data.motion===number+' · '+title?'is-selected':'')+'" data-v4-choice-field="motion" data-value="'+escape(number+' · '+title)+'" aria-pressed="'+(data.motion===number+' · '+title)+'"><span>'+number+'</span><strong>'+title+'</strong><small>'+description+'</small></button>').join('')+'</div>'+
   '<p class="v4-access-note"><strong>Reduced-motion accessibility is always supported.</strong> Motion preferences never remove essential information or controls.</p>';
 }
 function technologyScreen(){
  return sectionTitle('05 / TECHNOLOGY','Anything technical we should know?','Select any existing systems or requirements the Studio should account for.','OPTIONAL')+
   '<div class="v4-technology-grid">'+technologyOptions.map(item=>'<label class="'+(data.technologies.includes(item)?'is-selected':'')+'"><input type="checkbox" data-v4-list="technologies" value="'+escape(item)+'" '+(data.technologies.includes(item)?'checked':'')+'><span>'+escape(item)+'</span></label>').join('')+'</div>'+
   '<label class="v4-field v4-tech-notes"><span>TECHNICAL NOTES</span><textarea data-v4-field="technicalNotes" maxlength="500" rows="4" placeholder="Providers, APIs, constraints or anything else we should know.">'+escape(data.technicalNotes||'')+'</textarea></label>';
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
  const promotion=typeof studioCMS!=='undefined'?studioCMS?.site?.creatorPricing?.promotion:null;
  const expiry=promotion?.expiresAt?new Date(promotion.expiresAt+'T23:59:59').getTime():0;
  if(promotion?.enabled&&(!expiry||expiry>Date.now())&&promotion.title&&promotion.details)
   return {title:promotion.title,details:promotion.details,code:promotion.code||'',percent:promotion.percent||0,expiresAt:promotion.expiresAt||''};
  return null;
 }
 function marketingInfo(){
  const offer=activeCreatorOffer();
  return '<section class="v4-price-flex"><span class="v4-price-flex-kicker">FLEXIBLE SCOPE · TEAM REVIEWED</span><h3>Let’s make the right first version.</h3>'+
   '<p>Our team can discuss a smaller first release, phased delivery, optional services, and any active promotions you qualify for. No discount is guaranteed or automatically applied.</p>'+
   (offer?'<div class="v4-eligible-offer"><strong>Current studio promotion</strong><span>'+escape(offer.title)+'</span><p>'+escape(offer.details)+'</p>'+(offer.code?'<code>'+escape(offer.code)+'</code>':'')+(offer.percent?'<small>'+offer.percent+'% advertised · eligibility confirmed by the studio</small>':'')+(offer.expiresAt?'<small>Ends '+escape(offer.expiresAt)+'</small>':'')+'<label class="v4-promo-request"><input type="checkbox" data-v4-promo-request '+(data.promoRequested?'checked':'')+'> Ask our team to consider this offer for my project.</label><small>Discount is never automatically applied to the planning estimate.</small></div>':'')+
   '<div class="v4-price-flex-actions"><a href="'+escape(teamMessage())+'" target="_blank" rel="noopener noreferrer">Message our team ↗</a><a href="'+escape(teamEmail())+'">Request a price review ✉</a></div></section>';
 }
 function budgetScreen(){
  const e=estimate(),below=data.budget<e.low;
  return sectionTitle('05 / THE INVESTMENT','What budget are you comfortable with?','This helps us recommend a realistic first release—not change the price to fit a number.')+
   '<div class="v4-money-panel"><div class="v4-money-top"><span>YOUR PREFERRED BUDGET</span><output id="v4-budget-output">'+money(data.budget)+'</output></div><input type="range" data-v4-budget min="'+minBudget()+'" max="'+maxBudget()+'" step="1000" value="'+data.budget+'" aria-label="Preferred budget"><div class="v4-budget-scale"><span>'+money(minBudget())+'</span><span>'+money(maxBudget())+'+</span></div><div class="v4-budget-chips">'+budgetOptions().map(n=>'<button type="button" data-v4-budget-set="'+n+'" class="'+(data.budget===n?'active':'')+'">'+money(n)+'</button>').join('')+'</div></div>'+
   '<div class="v4-budget-context"><div><span>EARLY PLANNING RANGE</span><strong>'+money(e.low)+' – '+money(e.high)+'</strong></div><p id="v4-budget-guidance">'+(below?'Your target is below the preliminary scope. Our team can discuss phasing, fewer screens or a leaner first release.':'Our team reviews the scope and provides an individual quote. Pricing may change with requirements, availability and delivery complexity.')+'</p></div>'+
  '<dl class="v48-estimate-breakdown"><div><dt>Starting scope</dt><dd>'+money(e.base)+'</dd></div><div><dt>Additional pages</dt><dd>'+money(e.additionalPages)+'</dd></div><div><dt>Selected capabilities</dt><dd>'+money(e.featureAllowance)+'</dd></div><div><dt>Planning contingency</dt><dd>'+money(e.contingency)+'</dd></div></dl><div class="v4-budget-disclaimer">✳ The estimate is not a final price. The team can consult on scope, package options and applicable active offers. Taxes, hosting and external service fees may be additional.</div>'+marketingInfo();
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
  return sectionTitle('06 / ABOUT YOU',name?'What should we call you?':'Where should we send your project proposal?',name?'Our project team will use this name when discussing your brief.':'Add the best contact details for the Studio’s project review.')+
   '<label class="v4-simple-field"><span>'+ (name?'YOUR NAME':'EMAIL ADDRESS')+' <i>*</i></span><input id="v4-entry" type="'+(name?'text':'email')+'" data-v4-field="'+id+'" value="'+escape(value)+'" '+(name?'autocomplete="name" maxlength="100"':'autocomplete="email" maxlength="180"')+' required placeholder="'+(name?'Your full name':'you@example.com')+'"></label>'+
   (!name?'<div class="v4-contact-grid"><label class="v4-field"><span>BUSINESS NAME</span><input data-v4-field="company" value="'+escape(data.company)+'" maxlength="120" autocomplete="organization" placeholder="Optional"></label><label class="v4-field"><span>PHONE / WHATSAPP</span><input data-v4-field="phone" value="'+escape(data.phone)+'" maxlength="40" autocomplete="tel" placeholder="+91…"></label></div><div class="v4-chip-field"><span>PREFERRED CONTACT</span><div>'+['Email','WhatsApp','Phone'].map(item=>'<button type="button" data-v4-choice-field="preferredContact" data-value="'+item+'" class="'+(data.preferredContact===item?'is-selected':'')+'" aria-pressed="'+(data.preferredContact===item)+'">'+item+'</button>').join('')+'</div></div><label class="v4-field v4-tech-notes"><span>OPTIONAL NOTES</span><textarea data-v4-field="notes" maxlength="500" rows="3" placeholder="Anything else the Studio should know before reviewing your project.">'+escape(data.notes)+'</textarea></label>':'')+
   '<p class="v4-small-note">'+(name?'Only a couple of details left.':'Your project reference appears immediately after submission. An invitation or activation code is separate and is sent only when the team creates your private workspace.')+'</p>';
 }
 function brief(){
  const e=estimate(),rows=[
   ['Project',data.category,'discover'],
   ['Starting point',preset()?.name||data.external||'From scratch','template'],
   ...(data.referenceId?[['Source rights',data.referenceRights==='independent'?'Independent design only; reuse not offered':'Source and asset rights pending review','template']]:[]),
   ['Brief mode',data.briefMode==='quick'?'Quick brief · remaining details scoped with team':'Detailed brief','welcome'],
   ['Visual direction',data.style+' · '+data.palette,'style'],
   ['Pages or screens',String(data.pages)+(data.pageNames.length?' · '+data.pageNames.join(', '):''),'pages'],
   ['Selected features',data.features.join(', ')||'Core experience','features-content'],
   ['Business',data.businessName||data.company||'To be discussed','business'],
   ['Motion level',data.motion,'motion'],
   ['Technology',data.technologies.join(', ')||'No existing requirements noted','technology'],
   ['Budget preference',money(data.budget),'budget'],
   ...(data.promoRequested&&activeCreatorOffer()?[['Offer to review',activeCreatorOffer().title+' · team approval required','budget']]:[]),
   ['Planning range',money(e.low)+' – '+money(e.high),'budget'],
   ['Preferred timeline',data.timeline,'timeline'],
   ['Contact',data.name+' · '+data.email,'email']
  ];
  return rows.map(([title,value,target])=>'<div class="v4-review-row"><span>'+escape(title)+'</span><strong>'+escape(value)+'</strong><button type="button" data-v4-edit="'+escape(target)+'" aria-label="Edit '+escape(title)+'">Edit ↗</button></div>').join('');
 }
 function reviewScreen(){
  return sectionTitle('07 / YOUR PROJECT PLAN','Everything looks good?','Review your project, save the planning proposal, or send your brief to the VELORYZ team for a personal quotation.')+
   '<div class="v4-review-layout"><div class="v4-review-sheet"><div class="v4-review-brand"><span>VELORYZ / STUDIO</span><b>YOUR PROJECT OUTLINE</b></div><div class="v4-review-title">An idea with<br><em>direction.</em></div>'+brief()+
   '<div class="v4-review-goal"><span>YOUR MAIN GOAL</span><p>'+escape(data.goal)+'</p></div></div>'+
   '<div class="v4-review-side"><div class="v48-draft-actions"><button type="button" data-v4-action="export-draft">Save editable brief file ↓</button><small>Excludes contact fields and consent. Project text may still contain information you entered.</small></div><div class="v4-review-cost"><span>INDICATIVE PLANNING RANGE</span><strong>'+money(estimate().low)+' – '+money(estimate().high)+'</strong><p>Our team can discuss scope, pricing, relevant packages and qualified promotions. This is not a binding quote.</p></div><button type="button" class="v4-export" data-v4-action="pdf">↓ Download your proposal PDF</button><a class="v4-review-team-link" href="'+escape(teamMessage())+'" target="_blank" rel="noopener noreferrer">Discuss this price with the team ↗</a><p>We will confirm final pricing and any offers after reviewing your request.</p></div></div>'+
   '<aside class="v4-acceptance-journey" aria-label="Your next steps after submitting a VELORYZ project request"><span>THE HANDOFF / WHAT HAPPENS NEXT</span><div><article><strong>01</strong><p><b>Project brief received</b>The full request and your reference appear in the private admin inbox.</p></article><article><strong>02</strong><p><b>Team review and acceptance</b>The VELORYZ team checks scope and decides whether to accept the work.</p></article><article><strong>03</strong><p><b>Detailed project PDF</b>Once accepted, your one-page order summary is prepared. The team separately sends its detailed acceptance email and PDF.</p></article><article><strong>04</strong><p><b>Private portal invitation</b>The team separately sends a secure, one-time activation code from Client Management after your project has been accepted.</p></article><article><strong>05</strong><p><b>Track every milestone</b>Use the Client Portal for progress, approvals, deliverables and messages.</p></article></div></aside>'+ 
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
  if(id==='business')return businessScreen();
  if(id==='motion')return motionScreen();
  if(id==='technology')return technologyScreen();
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
  const groups=[['Discover','Choose a project type and starting direction.'],['Design','Define the look, palette and references.'],['Scope','Select pages, features and technical requirements.'],['Plan','Set a budget, timeline and priorities.'],['Review','Share your completed brief with the studio.']];
  let saved=false;try{saved=!!sessionStorage.getItem(KEY)}catch{}
  return '<section class="v4-welcome v2-create-welcome"><div class="v4-welcome-copy"><span class="v4-welcome-tag">VELORYZ / CREATE</span><h1>Make your next<br>idea real.</h1><p>Build a clear project brief, explore design directions and understand your investment before speaking with our team.</p><div class="v2-create-start-actions"><button type="button" class="v4-primary v4-start" data-v4-action="start">Start your project <span aria-hidden="true">→</span></button><button type="button" class="v4-secondary" data-v4-action="quick-start">Quick brief ↗</button>'+(saved?'<button type="button" class="v4-resume" data-v4-action="resume">Resume your draft ↗</button>':'')+'</div><div class="v48-draft-actions"><label>Import saved brief <input type="file" data-v48-import accept="application/json,.json"></label><small>Ten essential questions in quick mode. Detailed mode includes visual and technical choices.</small></div><p class="v4-r20-session-note">No account required. Your draft stays in this browser session until you submit.</p><div class="v2-create-return"><h2>Already working with us?</h2><a href="/client/">Open your client workspace ↗</a><a href="/support/">Get support ↗</a></div></div><aside class="v2-create-overview"><span class="v4-kicker">THE PROCESS</span><h2>From idea to brief.</h2><ol>'+groups.map(([title,desc],i)=>'<li><span>'+String(i+1).padStart(2,'0')+'</span><div><strong>'+title+'</strong><p>'+desc+'</p></div></li>').join('')+'</ol><div class="v2-create-note">Your estimate is indicative. Our team confirms final scope and pricing in writing.</div></aside></section>';
 }
 function successScreen(){
  const code=escape(finished?.reference||'—'),email=escape(data.email||'your email');
  return '<section class="v4-success v4-success-enhanced"><div class="v4-success-check">✓</div><span class="v4-kicker">PROJECT REQUEST CONFIRMED</span>'+
   '<h1 id="v4-question-title" tabindex="-1">Your project has<br><em>entered the Studio.</em><span class="sr-only"> Project submitted successfully.</span></h1>'+
   '<p>The VELORYZ team now has the project brief you created. We’ll review the scope, references and requirements before discussing the next step.</p>'+
   '<div class="v4-reference"><span>YOUR PROJECT REFERENCE · SAVE THIS</span><strong>'+code+'</strong><button type="button" data-v4-action="copy">Copy reference</button></div>'+
   '<div class="v4-success-handoff"><span class="v4-handoff-kicker">NEXT STEPS / YOUR PRIVATE PROJECT ROOM</span><div class="v4-handoff-steps">'+
   [['01','Request saved','Use your reference code when contacting the team. It is not a login password.'],['02','Check your email','Watch '+email+' and its spam folder over the next 12 hours for updates. This is a check-in window, not a guaranteed response time.'],['03','Acceptance, PDF and invitation','After the team accepts your request, the detailed order summary and one-page PDF are prepared. The studio then emails the summary and, in a separate owner-approved step, sends your private activation code.'],['04','Activate your client portal','Open veloryz.online/client/, paste the invitation code into the portal, and access your private project messages, milestones and files.']].map(([n,title,desc])=>'<div class="v4-handoff-step"><span>'+n+'</span><div><strong>'+title+'</strong><p>'+desc+'</p></div></div>').join('')+'</div></div>'+
   '<div class="v4-code-clarity"><strong>Reference code vs private invitation code</strong><p>The reference above confirms submission. The one-time access code is created only when the studio owner clicks Send Client Invitation in Client Management. Acceptance itself does not issue an access code or send an email. Your reference is never a portal password.</p></div>'+
   '<div class="v4-success-buttons"><a class="v4-primary" href="/client/">Track your project ↗</a><a class="v4-secondary" href="'+escape(teamMessage('project'))+'" target="_blank" rel="noopener noreferrer">Message the team ↗</a><button class="v4-secondary" type="button" data-v4-action="pdf">Download proposal ↓</button><button class="v4-secondary" type="button" data-v4-action="restart">Start another project →</button></div>'+
   '<p class="v4-small-note">No payment has been taken, and no portal invitation has been issued by this submission.</p></section>';
 }
 function header(){
  const steps=flow(),total=steps.length,number=active==='success'?total:at()+1;
  const isStep=active!=='welcome'&&active!=='success',group=meta(active);
  const next=active==='review'?'submit':'next';
  const label=active==='review'?'Send my project →':'Continue →';
  return '<header class="v4-topbar"><a class="v4-logo" href="/" aria-label="VELORYZ Studio home"><img src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" width="134" height="40" alt="VELORYZ" decoding="async"><span>/ STUDIO</span></a>'+
   (isStep?'<div class="v4-top-progress"><span>'+escape(group[0])+'</span><span>'+number+' / '+total+'</span></div>':'<span class="v4-top-center">A CREATIVE BEGINNING / PROJECT BRIEF</span>')+
   '<nav class="v4-top-actions" aria-label="Project navigation">'+
   '<a class="v4-client-shortcut" href="/client/" aria-label="Track an existing project in the Client Portal">Track project ↗</a>'+ 
    '<a class="v4-help-docs" href="/docs/">Help & guides ↗</a>'+
   (isStep?'<button type="button" class="v4-top-back" data-v4-action="back">← Back</button>'+
    (reviewVisited&&active!=='review'?'<button type="button" class="v4-top-review" data-v4-action="review">Review ↗</button>':'')+
    '<button type="button" class="v4-primary v4-top-next" data-v4-action="'+next+'" '+(busy?'disabled aria-busy="true"':'')+'>'+(busy?'Sending…':label)+'</button>':
    '<a class="v4-exit" href="/">Exit <span aria-hidden="true">↗</span></a>')+
   '</nav></header>'+
   (isStep?'<div class="v4-progress-track" role="progressbar" aria-label="Project creator progress" aria-valuenow="'+number+'" aria-valuemin="0" aria-valuemax="'+total+'"><i style="width:'+Math.round(number/total*100)+'%"></i></div>':'');
 }
 function app(){
  const welcome=active==='welcome',success=active==='success',index=at()+1,total=flow().length;
  return '<div class="v4-root v2-create" data-v2-stage="'+escape(active)+'">'+header()+
   (welcome?welcomeScreen():success?successScreen():
     '<section class="v4-question-view"><div class="v4-question-wrap"><aside id="v4-ai-slot" aria-label="Project AI workspace"></aside>'+
      '<div class="v4-question-inner" id="v4-question-body"><div class="v2-step-caption">'+escape(meta(active)[0])+' <span>Question '+index+' of '+total+'</span></div>'+view(active)+
      '<p id="v4-error" class="v4-error" role="alert" '+(error?'':'hidden')+'>'+escape(error)+'</p>'+
      '<p id="v4-notice" class="v4-notice" role="status" '+(inlineNotice?'':'hidden')+'>'+escape(inlineNotice)+'</p></div></div></section>')+
   ((welcome||success)?'<div id="v4-ai-slot" class="v2-ai-landing-slot"></div>':'')+'</div>';
 }
 function render(){
  const target=document.querySelector('.v4-root');
  if(target){target.outerHTML=app();emit('veloryz:creator-render');}
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
   'PROJECT CREATOR V5',
   'Brief mode: '+data.briefMode,
   'Goal: '+clean(data.goal),
   data.referenceRights?'Source rights: '+(data.referenceRights==='independent'?'Independent design only; reuse not offered':'Verification pending'):'',
   'Project: '+clean(data.category),
   'Template: '+clean(preset()?.name||'Custom'),
   data.external?'External inspiration: '+clean(data.external):'',
   'Visual style: '+clean(data.style)+' / '+clean(data.palette),
   data.reference?'Reference URL: '+clean(safeURL(data.reference)):'',
   ...extraLinks(data.extraReferences).map(url=>'Additional reference: '+clean(url)),
   data.materialLink?'Materials link: '+clean(safeURL(data.materialLink)):'',
   data.referenceLikes.length?'Reference qualities: '+data.referenceLikes.join(', '):'',
   'Business: '+clean(data.businessName||data.company||'To be discussed'),
   data.industry?'Industry: '+clean(data.industry):'',
   data.businessStage?'Business stage: '+clean(data.businessStage):'',
   data.businessDescription?'Business description: '+clean(data.businessDescription):'',
   data.audience?'Audience: '+clean(data.audience):'',
   'Pages / screens: '+data.pages+(data.pageNames.length?' ('+data.pageNames.join(', ')+')':''),
   'Features: '+(data.features.join(', ')||'Core experience'),
   ...Object.entries(data.answers).filter(([key])=>data.features.includes(key)).map(([key,value])=>clean(key)+': '+clean(value)),
   'Materials: '+(data.assets.join(', ')||'To be discussed'),
   'Motion: '+clean(data.motion),
   'Technology: '+(data.technologies.join(', ')||'No existing requirements noted'),
   data.technicalNotes?'Technical notes: '+clean(data.technicalNotes):'',
   'Budget preference: '+money(data.budget),
   'Indicative range: '+money(e.low)+' - '+money(e.high),
   'Timeline: '+clean(data.timeline),'Priority: '+clean(data.priority),
   'Review: '+(data.features.filter(n=>info[n]?.[2]).length?'Complex capabilities need technical scoping':'Studio review required'),
   'Pricing: Team consultation and eligible promotions may be discussed; no offer applied automatically.',
   data.promoRequested&&activeCreatorOffer()?'Promotion to review: '+clean(activeCreatorOffer().title)+' ('+clean(activeCreatorOffer().code||'no code')+') - eligibility pending team approval.':'',
   'Draft only. Official price and timeline subject to written approval.'
  ].filter(Boolean).join('\n');
  return content.slice(0,2000);
 }
 const portableKeys=['category','template','style','palette','pages','pageNames','features','answers','assets','technologies','motion','timeline','budget','priority','goal','reference','referenceLikes','referenceId','extraReferences','materialLink','briefMode'];
 function exportDraft(){
  const draft=Object.fromEntries(portableKeys.map(k=>[k,data[k]]));
  const blob=new Blob([JSON.stringify({format:'veloryz-project-brief',version:1,draft},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='veloryz-project-brief.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 async function importDraft(file){
  try{
   if(file.size>32768)throw Error('Choose a brief file smaller than 32 KB.');
   const obj=JSON.parse(await file.text()),raw=obj.draft;
   if(obj.format!=='veloryz-project-brief'||obj.version!==1||!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Choose a VELORYZ editable brief file.');
   const fresh=initial(),allowed={...fresh};
   for(const k of portableKeys){if(typeof fresh[k]==='string'&&typeof raw[k]==='string')allowed[k]=raw[k].slice(0,k==='extraReferences'?1050:k==='goal'?1000:350);}
   allowed.category=categories.includes(allowed.category)?allowed.category:fresh.category;
   allowed.style=styles.some(([s])=>s===allowed.style)?allowed.style:fresh.style;
   allowed.template=presets.some(p=>p.id===allowed.template)?allowed.template:'';
   allowed.pages=VeloryzPlanner.pages.includes(Number(raw.pages))?Number(raw.pages):4;
   allowed.budget=Math.max(6000,Math.min(1500000,Math.round(Number(raw.budget)||55000)));
   for(const [k,list]of Object.entries({features:Object.keys(info),pageNames:pageOptions,assets:VeloryzPlanner.assets,technologies:technologyOptions,referenceLikes:['Layout','Typography','Motion','Colours','Navigation','3D','Images','Simplicity','Interaction','Overall feeling']}))allowed[k]=Array.isArray(raw[k])?[...new Set(raw[k].filter(v=>list.includes(v)))]:[];
   allowed.answers=Object.fromEntries(Object.entries(raw.answers&&typeof raw.answers==='object'?raw.answers:{}).filter(([k,v])=>allowed.features.includes(k)&&questions[k]?.[1].includes(v)));
   allowed.reference=safeURL(allowed.reference);allowed.extraReferences=extraLinks(allowed.extraReferences).join('\n');allowed.materialLink=safeURL(allowed.materialLink);
   allowed.briefMode=allowed.briefMode==='quick'?'quick':'detailed';
   const ref=externalDesigns().find(x=>x.id===allowed.referenceId);
   allowed.referenceId=ref?.id||'';allowed.referenceRights=ref?(ref.rights==='restricted'||/NO LICENSE|CC BY-NC|RESTRICTED|PROPRIETARY|COMMONS CLAUSE/i.test(ref.license||'')?'independent':'review'):'';
   allowed.external=ref?'VELORYZ Studio design: '+ref.name+' ('+ref.id+')':'';
   Object.assign(data,allowed,{consent:false,requestId:'',lastQuestion:'goal'});finished=null;reviewVisited=false;sync();route('goal');toast('Brief imported. Review your contact details and consent before sending.');
  }catch(err){toast(err.message||'Could not import the brief.');const host=document.querySelector('.v48-draft-actions small');if(host)host.textContent=err.message;}
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
  for(const step of ['goal','name','email','review',...(data.briefMode==='detailed'?['reference','assets']:[])]){
   if(!validateStep(step)){if(step!==active){const message=error;route(step);error=message;render();}return;}
  }
  busy=true;error='';render();
  if(!data.requestId)data.requestId=crypto.randomUUID();
  sync();
  const payload={kind:'project',requestId:data.requestId,name:clean(data.name),email:str(data.email).trim().toLowerCase(),phone:clean(data.phone),company:clean(data.company||data.businessName),budget:money(data.budget)+' preferred',message:payloadText(),consent:true,website:''};
  const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),18000);
  try{
   const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
   const out=await response.json().catch(()=>({error:'The studio could not respond. Please try again.'}));
   if(!response.ok||out.ok!==true||typeof out.reference!=='string'||!/^VZ-[A-Z0-9-]{6,40}$/i.test(out.reference))throw Error(out.error||'The Studio did not confirm a project reference. Please retry safely.');
   finished={reference:out.reference};data.requestId='';busy=false;
   try{sessionStorage.removeItem(KEY);sessionStorage.removeItem(oldKey);sessionStorage.removeItem('veloryz.planner.v1');}catch{}
   route('success');
   emit('veloryz:creator-state',{state:'success'});
  }catch(err){
   busy=false;error=err.name==='AbortError'?'The request timed out. You can safely retry.':err.message;
   render();
   emit('veloryz:creator-state',{state:'error'});
  }finally{clearTimeout(timeout);}
 }
 function handlePick(key,val){
  if(key.startsWith('answer:')){data.answers[key.slice(7)]=val;data.requestId='';sync();move(1);return;}
  if(key==='pages')return pick('pages',Number(val));
  pick(key,val);
 }
 function handleAction(action){
  if(action==='start'||action==='quick-start'){data.briefMode=action==='quick-start'?'quick':'detailed';data.requestId='';return route('discover');}
  if(action==='export-draft')return exportDraft();
  if(action==='resume')return route(flow().includes(data.lastQuestion)?data.lastQuestion:'discover');
  if(action==='back')return move(-1);
  if(action==='next')return move(1);
  if(action==='review')return route('review');
  if(action==='blank'){change('template','');change('external','');change('referenceId','');change('referenceRights','');return move(1);}
  if(action==='palette-open')return pick('palette','Studio decides');
  if(action==='skip-detail')return move(1);
  if(action==='pdf')return proposal();
  if(action==='submit')return submit();
  if(action==='restart'){
   const fresh=initial();Object.assign(data,fresh,{answers:{},features:[],assets:[],requestId:''});
   finished=null;reviewVisited=false;sync();return route('welcome');
  }
  if(action==='copy'){const reference=finished?.reference;if(reference&&navigator.clipboard?.writeText)navigator.clipboard.writeText(reference).then(()=>toast('Copied.')).catch(()=>toast('Please select and copy the reference.'));return;}
 }
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-v4-action],[data-v4-pick],[data-v4-template],[data-v4-external],[data-v4-gallery],[data-v4-filter],[data-v4-budget-set],[data-v4-edit],[data-v4-choice-field]');
  if(!b||!b.closest('.v4-root'))return;
  event.preventDefault();event.stopImmediatePropagation();
  if(b.hasAttribute('data-v4-action')){handleAction(b.dataset.v4Action);return;}
  if(b.hasAttribute('data-v4-edit')){route(b.dataset.v4Edit);return;}
  if(b.hasAttribute('data-v4-choice-field')){change(b.dataset.v4ChoiceField,b.dataset.value);render();return;}
  if(b.hasAttribute('data-v4-pick')){handlePick(b.dataset.v4Pick,b.dataset.value);return;}
  if(b.hasAttribute('data-v4-template')){
   const selected=presets.find(p=>p.id===b.dataset.v4Template);
   if(!selected)return;
   data.template=selected.id;data.external='';data.referenceId='';data.referenceRights='';data.category=selected.category;data.style=selected.style;data.pages=selected.pages;data.features=selected.features.slice();data.requestId='';sync();return move(1);
  }
  if(b.hasAttribute('data-v4-external')){
   const ref=externalDesigns().find(r=>r.id===b.dataset.v4External);if(!ref)return;
   if(ref.originalTemplateId){
    const original=presets.find(p=>p.id===ref.originalTemplateId);
    if(original){
     Object.assign(data,{template:original.id,category:original.category,style:original.style,pages:original.pages,features:original.features.slice(),external:'',reference:'',requestId:''});
     sync();return move(1);
    }
   }
   chooseExternal(ref);return move(1);
  }
  if(b.hasAttribute('data-v4-gallery')){galleryTab='studio';render();return;}
  if(b.hasAttribute('data-v4-filter')){categoryFilter=b.dataset.v4Filter;refreshLibrary();const strip=document.querySelector('.v4-filter-strip');if(strip){strip.querySelectorAll('button').forEach(el=>{const yes=el.dataset.v4Filter===categoryFilter;el.classList.toggle('active',yes);el.setAttribute('aria-pressed',String(yes));});}return;}
  if(b.hasAttribute('data-v4-budget-set')){
   change('budget',Number(b.dataset.v4BudgetSet));render();return;
  }
 },true);
 document.addEventListener('input',event=>{
  const b=event.target;if(!b.closest('.v4-root'))return;
  if(b.hasAttribute('data-v4-search')){search=b.value;refreshLibrary();return;}
  if(b.hasAttribute('data-v4-field')){
   const field=b.dataset.v4Field;
   const limits={goal:1000,businessDescription:700,technicalNotes:500,notes:500,audience:240,extraReferences:1050,materialLink:350,phone:20};
   data[field]=b.value.slice(0,limits[field]||200);
   data.requestId='';sync();error='';
   if(field==='goal'){const el=document.getElementById('v4-goal-length');if(el)el.textContent=b.value.length+' / 1000';}
   const err=document.getElementById('v4-error');if(err)err.hidden=true;
  }
  if(b.hasAttribute('data-v4-budget')){change('budget',Number(b.value));updateBudget();}
 });
 document.addEventListener('change',event=>{
  const b=event.target;if(!b.closest('.v4-root'))return;
  if(b.hasAttribute('data-v48-import')){const file=b.files?.[0];if(file)importDraft(file);return;}
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
  if(b.hasAttribute('data-v4-promo-request')){change('promoRequested',b.checked);}
  if(b.hasAttribute('data-v4-consent')){change('consent',b.checked);}
  if(b.hasAttribute('data-v4-list')){
   const field=b.dataset.v4List,current=Array.isArray(data[field])?data[field]:[];
   data[field]=b.checked?[...new Set([...current,b.value])]:current.filter(item=>item!==b.value);
   if(field==='pageNames'&&data[field].length){
    const count=data[field].length;data.pages=VeloryzPlanner.pages.reduce((best,n)=>Math.abs(n-count)<Math.abs(best-count)?n:best,VeloryzPlanner.pages[0]);
   }
   data.requestId='';sync();render();
  }
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
 function creatorPage(){
  const params=new URL(location.href).searchParams,selected=params.get('template');
  const requestedReference=params.get('reference');
  const selectedReference=externalDesigns().find(p=>p.id===requestedReference);
  if(selectedReference&&data.external!=='VELORYZ Studio design: '+selectedReference.name+' ('+selectedReference.id+')'){chooseExternal(selectedReference);categoryFilter='All';}

  const chosen=presets.find(p=>p.id===selected);
  if(chosen&&data.template!==chosen.id){
   Object.assign(data,{template:chosen.id,category:chosen.category,style:chosen.style,pages:chosen.pages,features:chosen.features.slice(),external:'',requestId:''});sync();
  }
  const fromURL=params.get('question')||((chosen||selectedReference)?'template':'welcome');
  active=fromURL==='welcome'||(fromURL==='success'&&finished)||flow().includes(fromURL)?fromURL:'welcome';
  setTimeout(()=>emit('veloryz:creator-render'),0);
  return app();
 }
 window.createPage=creatorPage;
 try{createPage=creatorPage;}catch{}
 window.VeloryzCreatorV5=window.VeloryzCreatorV4={version:5,get:()=>JSON.parse(JSON.stringify(data)),flow,templateCount:presets.length,referenceCount:refs.length,estimate,payloadText,go:route,stage:()=>active,renderPage:creatorPage};
})();

/* R28 — Reference-style live brief panel for the real V4 project wizard.
   Reads the EXISTING creator state and estimate; never writes or sends project data. */
(()=>{
'use strict';
const money=n=>Number.isFinite(Number(n))?'₹'+Math.round(Number(n)).toLocaleString('en-IN'):'To be discussed';
const str=(v,max=110)=>{const s=String(v??'').trim();return s.length>max?s.slice(0,max-1).trim()+'…':s||'—';};
const el=(tag,klass,text)=>{
 const node=document.createElement(tag);if(klass)node.className=klass;
 if(text!==undefined)node.textContent=String(text);return node;
};
const getApi=()=>window.VeloryzCreatorV4;
function update(){
 const panel=document.getElementById('vz-creator-live'),api=getApi();
 if(!panel||!api)return;
 const data=api.get(),flow=api.flow(),stage=api.stage(),idx=flow.indexOf(stage);
 const percent=idx<0?0:Math.max(0,Math.min(100,Math.round(((idx+1)/Math.max(1,flow.length))*100)));
 const estimate=api.estimate();
 const progress=panel.querySelector('#vz-live-ring-progress');
 if(progress)progress.style.width=percent+'%';
 const percentNode=panel.querySelector('#vz-live-percent');
 if(percentNode)percentNode.textContent=percent+'%';
 const stageNode=panel.querySelector('#vz-live-step');
 if(stageNode)stageNode.textContent=idx<0?'PROJECT / OVERVIEW':'STEP '+String(idx+1).padStart(2,'0')+' / '+String(flow.length).padStart(2,'0');
 const label=panel.querySelector('#vz-live-estimate');
 if(label)label.textContent=estimate&&Number.isFinite(estimate.low)&&Number.isFinite(estimate.high)
  ?money(estimate.low)+' – '+money(estimate.high):'Scope under review';
 const fields=[
  ['Project',data.category],['Business',data.businessName||data.company],['Industry',data.industry],
  ['Style',data.style],['Palette',data.palette],['Motion',data.motion],
  ['Pages / screens',Array.isArray(data.pageNames)&&data.pageNames.length?data.pages+' · '+data.pageNames.join(', '):data.pages],
  ['Features',Array.isArray(data.features)?data.features.join(', '):''],
  ['Technology',Array.isArray(data.technologies)?data.technologies.join(', '):''],
  ['Design reference',data.template||data.external||data.reference],['Timeline',data.timeline],
  ['Budget preference',Number(data.budget)>0?money(data.budget):''],['Goal',data.goal]
 ];
 const rows=panel.querySelector('#vz-live-brief-rows');if(!rows)return;
 const selected=fields.filter(([,v])=>v!==null&&v!==undefined&&String(v).trim());
 rows.replaceChildren(...selected.map(([name,value])=>{
  const wrapper=el('div','vz-live-brief-row'),dt=el('dt','',name),dd=el('dd','',str(value,90));wrapper.append(dt,dd);return wrapper;
 }));
 if(!rows.children.length){const empty=el('p','vz-live-brief-empty','Choose a project type to start building your brief.');rows.append(empty);}
}
function mount(){
 const root=document.querySelector('.v4-root'),wrap=root?.querySelector('.v4-question-wrap'),api=getApi();
 if(!root||!wrap||!api)return;
 if(wrap.querySelector('#vz-creator-live')){update();return;}
 const aside=el('aside','vz-creator-live');aside.id='vz-creator-live';aside.setAttribute('aria-label','Live project brief preview');
 const header=el('div','vz-live-header');
 const title=el('h3','', 'Live brief');
 const toggle=el('button','vz-live-toggle','Show ↑');toggle.type='button';toggle.setAttribute('aria-label','Expand or collapse live brief');toggle.setAttribute('aria-expanded','false');
 header.append(title,toggle);
 const info=el('div','vz-live-progress-summary');
 info.innerHTML='<div class="vz-live-linear" aria-hidden="true"><div id="vz-live-ring-progress"></div></div>';
 const ringText=el('div','vz-live-linear-text');
 ringText.append(el('strong','', '0%'),el('span','', 'PROJECT / OVERVIEW'));
 ringText.querySelector('strong').id='vz-live-percent';
 ringText.querySelector('span').id='vz-live-step';
 info.prepend(ringText);
 const rows=el('dl','vz-live-brief-rows');rows.id='vz-live-brief-rows';
 const estimateLabel=el('p','vz-live-estimate-label','Indicative estimate / not a final quote');
 const estimate=el('strong','vz-live-estimate','—');estimate.id='vz-live-estimate';
 const note=el('p','vz-live-note','Your answers are part of this draft. The real project reference is issued by the studio system only after successful submission.');
 aside.append(header,info,rows,estimateLabel,estimate,note);
 wrap.append(aside);
 toggle.addEventListener('click',()=>{
  const open=aside.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded',String(open));
  toggle.textContent=open?'Hide ↓':'Show ↑';
 });
 update();
}
function later(){queueMicrotask(()=>{mount();update();});}
document.addEventListener('veloryz:creator-render',later);
document.addEventListener('input',e=>{if(e.target.closest('.v4-root'))later();});
document.addEventListener('change',e=>{if(e.target.closest('.v4-root'))later();});
document.addEventListener('click',e=>{if(e.target.closest('.v4-root'))later();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later,{once:true});else later();
})();
