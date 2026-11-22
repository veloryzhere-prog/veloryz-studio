'use strict';
let visualObserver=null,depthTarget=null,depthFrame=0;
const depthPointer=window.matchMedia('(hover: hover) and (pointer: fine)');
let studioCMS=null, studioVersion=-1, offerIndex=0, campaignTimer, campaignRotation;
let adIndex=0,adTimer=0,adPaused=false;
const displayedOffers=new Set();
const CONTACT={phone:'919955326740',display:'+91 99553 26740',email:'veloryz.here@gmail.com',website:'https://veloryz.online',product:'https://talk.veloryz.online'};
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const arrow='<span class="arrow" aria-hidden="true">↗</span>';
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const wa=message=>`https://wa.me/919955326740?text=${encodeURIComponent(message)}`;
const reduced=window.StudioMotion||window.matchMedia('(prefers-reduced-motion: reduce)');
let currentRoute=normalise(location.pathname), observer, modalReturnFocus, popupTimer;
let modalOpen=false, formCounter=0;
const modalStack=[];
function normalise(path){const pathname=String(path||'/').split(/[?#]/)[0];return '/'+pathname.split('/').filter(Boolean).join('/')+(pathname==='/'?'':'/');}
const routes={
  '/':{title:'VELORYZ Studio — Built to be remembered.',render:homePage},
  '/design/':{title:'Design Library — VELORYZ Studio',render:designPage},
  '/designs/':{title:'Design Library — VELORYZ Studio',render:designPage},
  '/docs/':{title:'Documentation & Guides — VELORYZ Studio',render:()=>window.VeloryzDocs?.render()||'<p>Documentation is loading.</p>'},
  '/help/assistant/':{title:'Help AI — VELORYZ Studio',render:()=>knowledgeChatPage('help')},
  '/support/':{title:'Contact Support AI — VELORYZ Studio',render:()=>knowledgeChatPage('support')},
  '/privacy/':{title:'Privacy policy — VELORYZ Studio',render:()=>window.VeloryzPrivacy?.render('privacy')||'<p>Privacy policy unavailable.</p>'},
  '/cookies/':{title:'Cookie and storage policy — VELORYZ Studio',render:()=>window.VeloryzPrivacy?.render('cookies')||'<p>Cookie policy unavailable.</p>'},
  '/terms/':{title:'Website terms — VELORYZ Studio',render:()=>window.VeloryzPrivacy?.render('terms')||'<p>Terms unavailable.</p>'},
  '/privacy/choices/':{title:'Your privacy choices — VELORYZ Studio',render:()=>window.VeloryzPrivacy?.render('choices')||'<p>Privacy controls unavailable.</p>'},
  '/sitemap/':{title:'Site map — VELORYZ Studio',render:()=>window.VeloryzSiteMap?.render()||'<p>Preparing the site map.</p>'},
  '/create/':{title:'Create a Project — VELORYZ Studio',render:createPage},
  '/book/':{title:'Book a Discovery Call — VELORYZ Studio',render:bookingPage},
  '/pricing/':{title:'Pricing & Scope — VELORYZ Studio',render:pricingPage},
  '/developers/':{title:'APIs & Integrations — VELORYZ Studio',render:developersPage},
  '/veloryz/':{title:'The VELORYZ Platform',render:veloryzPage},
  '/payments/':{title:'Project Payments — VELORYZ Studio',render:paymentsPage},
  '/journey/':{title:'From Idea to Experience — VELORYZ Studio',render:journeyPage},
  '/motion/':{title:'Motion Playground — VELORYZ Studio',render:motionLabPage},
  '/work/':{title:'Selected Work — VELORYZ Studio',render:workPage},
  '/process/':{title:'Our Process & Delivery Standards — VELORYZ Studio',render:deliveryPage},
  '/services/':{title:'Design & Development Services — VELORYZ Studio',render:servicesPage},
  '/studio/':{title:'The Studio, Aryan & Our Team — VELORYZ Studio',render:studioPage},
  '/velori/':{title:'VELORI — A VELORYZ Product',render:veloriPage},
  '/contact/':{title:'Let’s Build Together — Contact VELORYZ Studio',render:()=>contactPage()+needHelpBlock()},
 '/teamjob/':{title:'The People — VELORYZ Studio',render:teamDirectoryPage},
 '/concepts/aurel/':{title:'AUREL Atelier — VELORYZ Studio Concept',render:aurelConcept},
 '/concepts/orbit/':{title:'ORBIT — VELORYZ Studio Concept',render:orbitConcept},
 '/concepts/forme/':{title:'FORME — VELORYZ Studio Concept',render:formeConcept}
};
const services=[
  {name:'Websites & development',short:'A digital home with a point of view.',description:'Custom websites that balance a distinctive first impression with clear navigation, responsive layouts and a smooth experience. From a founder’s first website to a growing business platform, we shape the experience around what your visitors need to do.',tags:['Custom websites','React & frontend','Responsive development','Performance','Website redesign'],deliverables:'Page structure, responsive interface, development, quality checks and an agreed handover.'},
  {name:'UI/UX & product design',short:'Make the complex feel effortless.',description:'We turn ideas into user journeys, wireframes and polished interfaces. The focus is on useful decisions: what belongs on a screen, how people move through it and what makes the next step obvious.',tags:['User journeys','Wireframes','Interactive prototypes','Design systems','Mobile interfaces'],deliverables:'User flows, wireframes, polished screen designs and an organised component system.'},
  {name:'Brand identity & direction',short:'More than a logo. A recognisable world.',description:'Build a visual language that feels like your business. We bring typography, colour, composition and digital expression together so your identity stays consistent across websites, campaigns and social content.',tags:['Visual identity','Art direction','Brand guidelines','Digital assets'],deliverables:'An agreed identity direction, core visual assets and practical usage guidelines.'},
  {name:'Backend & platform support',short:'Good experiences need solid foundations.',description:'The systems behind the interface matter just as much. We help plan and develop backend workflows, integrations and management tools, then define a support scope that fits how your platform operates.',tags:['Backend development','API integrations','Admin tools','Database workflows','Maintenance'],deliverables:'An agreed technical scope, implemented workflows, integration checks and support documentation.'},
  {name:'Content & motion',short:'Stories that move people.',description:'Visual content and considered motion help your ideas travel. From social media creatives to edited video, we build a consistent visual presence with a clear message and a reason to keep watching.',tags:['Social creatives','Video editing','Motion graphics','Campaign visuals'],deliverables:'An agreed creative direction, platform-ready assets and edited exports.'}
];
const team=[
 {name:'Shivam Singh',initials:'SS',role:'Co-founder · Executive Developer & Task Manager',description:'Development execution, task planning and keeping the work moving from idea to implementation.'},
 {name:'Ayush Kumar',initials:'AK',role:'Co-founder · Prime Designer & Social Media Manager',description:'Design direction and a consistent visual presence across digital experiences and social media.'},
 {name:'Nikhil Singh',initials:'NS',role:'Accounts Manager · Happy',description:'Accounts coordination and the financial organisation behind the studio’s work.'},
 {name:'Tripti Singh',initials:'TS',role:'Marketing & Sales',description:'Business conversations, marketing and helping new collaborations find the right starting point.'},
 {name:'Vivek Kushwaha',initials:'VK',role:'Visual Designer & Video Editor',description:'Visual storytelling, creative assets and video editing that bring ideas into motion.'},
 {name:'Nitin Singh',initials:'NS',role:'Product Designer',description:'Product interfaces and thoughtful details that connect user needs with design decisions.'}
];
let projects=[{"id": "velori", "name": "VELORI", "category": "Digital product", "type": "product", "status": "In development", "year": "A VELORYZ Product", "description": "A social platform being built around people, self-expression and creative communities. An ongoing VELORYZ product bringing product thinking, interface design and platform development together.", "scope": ["Product strategy & user experience", "Social interface design", "Frontend and backend development", "Creator experience"], "approach": "Start with the people using the platform. Make discovery, expression and connection feel coherent, then build the systems that support them. The visual direction shown here is a studio presentation of the product.", "note": "An ongoing product in development. Interface visuals are illustrative; individual features and availability may change.", "published": true, "featured": true, "order": 0, "cover": "", "video": "", "website": ""}, {"id": "identity", "name": "The VELORYZ identity", "category": "Studio identity", "type": "brand", "status": "Studio exploration", "year": "Ongoing", "description": "Our own identity is a canvas for the ideas we bring to client work: precision, expression and the space to do something different. A restrained wordmark, sculptural V and warm accents build a recognisable studio language.", "scope": ["Visual direction", "Typography & colour", "Motion language", "Digital brand system"], "approach": "Let the essentials carry the identity. Use strong type, generous white space and a sculptural mark, then add movement with purpose.", "note": "An in-house studio identity exploration created for this website.", "published": true, "featured": true, "order": 1, "cover": "", "video": "", "website": ""}];
function brand(slot='header'){
 const site=studioCMS?.site;
 const logo=studioCMS?.branding?.[slot==='footer'?'footerLogo':'headerLogo'];
 const label=esc(site?.name||'VELORYZ');
 // Change only the header wordmark; preserve the footer layout and all interactive V artwork.
 if(slot==='header'&&!logo)return `<a class="brand brand--official" href="/" aria-label="${label} Studio home"><img class="brand-official-wordmark" src="/assets/brand/official/Main-Dark-Ink-Transparent.webp" width="880" height="263" alt="${label}" decoding="async"></a>`;
 return `<a class="brand" href="/" aria-label="${label} Studio home"><img src="${esc(logo||'/assets/brand/veloryz-mark.svg')}" alt="" class="veloryz-brand-icon"><span class="brand-name">${label}<small>${esc(site?.tagline||'Independent Studio')}</small></span></a>`;
}
function needHelpBlock(){
 return '<section class="vz-need-help container"><div><span class="kb-eyebrow">WE ARE HERE TO HELP</span><h2>Need help?</h2><p>Have a question, need support, or want the team to review your project? The AI guide can help you find the next step, and our team remains available for direct contact.</p></div><div class="vz-need-help-actions"><a href="/support/">Chat with Support AI ↗</a><a href="/contact/">Contact the team ↗</a></div></section>';
}
function knowledgeChatPage(agent){
 const requested=new URLSearchParams(location.search).get('agent');
 if(agent==='help'&&['help','support','client','creator'].includes(requested))agent=requested;
 const title=agent==='support'?'Contact Support':agent==='client'?'Client Portal Guide':agent==='creator'?'Project Planner':'Help Centre AI',back=agent==='support'?'/contact/':agent==='client'?'/client/':agent==='creator'?'/create/':'/help/studio/';
 return '<div class="vz-chat-page"><header class="vz-chat-page-head"><div><span class="kb-eyebrow">VELORYZ / ASSISTANTS</span><h1>'+title+'</h1></div><a href="'+back+'">← Back to '+(agent==='support'?'Contact':'Help Centre')+'</a></header>'+
 (window.VeloryzSupportChat?.render(agent)||'<p>The Studio assistant is loading. You can still <a href="/contact/">contact the team</a>.</p>')+
 '<div class="vz-need-help"><div><span class="kb-eyebrow">HUMAN SUPPORT WHEN YOU NEED IT</span><h2>Need help?</h2><p>For project-specific decisions, privacy questions or urgent requests, contact the Studio team directly.</p></div><div class="vz-need-help-actions"><a href="/contact/">Contact the team ↗</a><a href="/docs/">Browse all documentation ↗</a></div></div></div>';
}
function header(){
 const docsConfig=studioCMS?.site?.documentation;
 const docsLinks=[['/docs/','Docs']];
 const links=[['/work/','Work'],['/design/','Designs'],...docsLinks,['/services/','Services'],['/studio/','Studio'],['/motion/','Playground'],['/teamjob/','People'],['/velori/','VELORI'],['/client/','Client Portal']];
 $('#header').innerHTML=`${brand()}<nav class="desktop-nav" aria-label="Main navigation">${links.map(([url,name])=>`<a href="${url}" ${url.startsWith('https://')?'target="_blank" rel="noopener noreferrer"':''} ${(currentRoute===url||(url==='/docs/'&&(currentRoute.startsWith('/docs/')||currentRoute.startsWith('/help/studio/')||currentRoute.startsWith('/sitemap/'))))?'class="active" aria-current="page"':''}>${name}</a>`).join('')}</nav><div class="header-end"><button class="header-motion" data-motion-control aria-label="Motion settings"><span class="motion-wave" aria-hidden="true"><i></i><i></i><i></i></span></button><span class="header-status"><span class="status-dot"></span>Let’s build together</span><a href="/create/" class="button small">Start a project ${arrow}</a><button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 8h14M5 16h14"/></svg></button></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation">${links.map(([url,name])=>`<a href="${url}" ${url.startsWith('https://')?'target="_blank" rel="noopener noreferrer"':''} ${(currentRoute===url||(url==='/docs/'&&(currentRoute.startsWith('/docs/')||currentRoute.startsWith('/help/studio/')||currentRoute.startsWith('/sitemap/'))))?'aria-current="page"':''}>${name}</a>`).join('')}<a href="/create/" class="button">Start a project ${arrow}</a></nav>`;
}
function footer(){
 const sections=[
  {label:'Explore',links:[['/','Home'],['/work/','Selected work'],['/services/','Services'],['/design/','Design library'],['/motion/','Motion playground'],['/studio/','The Studio'],['/teamjob/','People'],['/velori/','VELORI']]},
  {label:'Build with us',links:[['/create/','Create a project'],['/pricing/','Pricing & scope'],['/book/','Book a call'],['/client/','Client portal'],['/payments/','Project payments'],['/process/','Our process'],['/journey/','Project journey'],['/contact/','Contact us']]},
  {label:'Knowledge',links:[['/docs/','All documentation'],['/help/assistant/','Help AI'],['/support/','Contact Support AI'],['https://veloryz.online/docs','Useful Links'],['/help/studio/','Help Centre'],['/docs/studio/','Studio documentation'],['/docs/overview/','Getting started'],['/docs/architecture/','Architecture'],['/docs/project-ai/','Project AI'],['/docs/quality/','Testing & accessibility'],['/sitemap/','Visual site map']]},
  {label:'Reference & policies',links:[['/privacy/','Privacy policy'],['/cookies/','Cookie policy'],['/terms/','Website terms'],['#privacy-choice-control','Privacy choices'],['/docs/privacy/','Privacy & security'],['/docs/copyright/','Copyright & licensing'],['/docs/pricing/','Pricing guide'],['/docs/client-portal/','Client portal guide'],['/docs/troubleshooting/','Troubleshooting'],['/docs/communications/','Communications'],['/sitemap.xml','XML sitemap'],['/developers/','Developer reference']]},
  {label:'More to explore',links:[['/veloryz/','VELORYZ platform'],['/concepts/aurel/','AUREL concept'],['/concepts/orbit/','ORBIT concept'],['/concepts/forme/','FORME concept'],['/docs/studio/seo/indexing/','SEO and indexing'],['/docs/studio/admin/docs-cms/','Documentation CMS'],['/help/studio/faq/','Frequently asked questions'],['/help/studio/contact/','Contact support']]}
 ];
 const grouped=sections.map(group=>`<div class="footer-dir-group"><span class="label">${group.label}</span>${group.links.map(([href,name])=>`<a href="${href}">${name}</a>`).join('')}</div>`).join('');
 $('#footer').innerHTML=`<div class="footer container footer-living"><section class="vz-footer-help"><div><span class="kb-eyebrow">VELORYZ / HERE TO HELP</span><h2>Need help?</h2><p>Find an answer in the Help Centre, chat with our support assistant, or speak to the Studio team directly.</p></div><div class="vz-footer-help-actions"><a href="/help/assistant/">Chat with Help AI ↗</a><a href="/support/">Contact Support AI ↗</a><a href="/contact/">Talk to the team ↗</a></div></section><div class="footer-top footer-directory-top"><div class="footer-intro footer-living-intro">${brand('footer')}<p>Study Smarter.<br>Build Better.</p><div class="footer-knowledge-copy">Every page is connected.<br>Every interaction has purpose.</div><a class="footer-knowledge-cta" href="/docs/">Explore the knowledge system ${arrow}</a></div><div class="footer-links footer-directory">${grouped}<div class="footer-dir-group footer-dir-contact"><span class="label">Connect</span><a href="mailto:${CONTACT.email}">${CONTACT.email}</a><a href="${wa('Hi VELORYZ Studio! I would like to discuss a project.')}" target="_blank" rel="noopener noreferrer">WhatsApp ${arrow}</a><a href="tel:+${CONTACT.phone}">Call the Studio ${arrow}</a><button data-book>Request a consultation</button><button data-motion-control>Motion settings ↗</button></div></div></div><details class="footer-knowledge-index" id="footer-knowledge-index"><summary><span><strong>Complete knowledge index</strong><small>All 152 Help Centre, Studio and service-guide pages</small></span><span class="footer-index-action">Browse every article +</span></summary><div id="footer-knowledge-links" class="footer-knowledge-links"><p>Open to explore the full reference directory.</p></div></details><div class="footer-word" aria-hidden="true">VELORYZ<span class="footer-scan"></span></div>${mailbox()}<div class="footer-bottom"><span>© 2026 VELORYZ Studio</span><span class="footer-bottom-links"><a href="/docs/">Docs</a><a href="/help/studio/">Help</a><a href="/sitemap/">Site map</a><button data-legal="privacy">Privacy</button><button data-legal="terms">Terms</button></span><span class="rights">Designed & built by the VELORYZ Studio team.</span></div></div>`;
}
function motionGlyph(){return '<div class="motion-glyph" aria-hidden="true"><span class="glyph-ring"></span><span class="glyph-ring two"></span><span class="glyph-ring three"></span><span class="glyph-center"></span><span class="glyph-point"></span></div>';}
function heroMotionGraphic(){return `<div class="hero-motion-graphic motion-scene" aria-hidden="true"><svg class="hero-orbital" viewBox="0 0 400 400"><circle cx="200" cy="200" r="167"/><circle class="dash" cx="200" cy="200" r="145"/><circle class="orbit-node" cx="200" cy="33" r="4"/><circle class="orbit-node" cx="55" cy="200" r="3"/></svg><span class="motion-fragment fragment-design"><small>01 / DESIGN</small><strong>A clearer vision.</strong><span class="mini-layout"><i></i><i></i><i></i></span></span><span class="motion-fragment fragment-build"><small>02 / BUILD</small><strong>Built with care.</strong><span class="mini-code">&lt;idea&gt;<br>&nbsp;make it matter<i></i><br>&lt;/idea&gt;</span></span><span class="motion-fragment fragment-motion"><span class="motion-mini-wave"><i></i><i></i><i></i><i></i><i></i></span><span><small>03 / MOTION</small><strong>A little more life.</strong></span></span><span class="hero-motion-caption">DESIGN × CODE × A LITTLE DIFFERENT THINKING</span></div>`;}
const studioArtwork={
 hero:{alt:'A sculptural folded V in brushed silver and porcelain, with a terracotta sphere'},
 velori:{alt:'Detailed VELORI concept with silver phones, a social feed and floating glass conversation cards',label:'VELORI',detail:'YOUR WORLD. YOUR PEOPLE.'},
 identity:{alt:'VELORYZ identity study with embossed stationery, textured paper and a chrome sculpture',label:'VELORYZ',detail:'A STUDY IN IDENTITY'},
 aurel:{alt:'AUREL architectural concept: a detailed limestone villa, courtyard and reflecting pool',label:'AUREL',detail:'SPACES. MATERIALS. FEELING.'},
 orbit:{alt:'ORBIT concept: a silver laptop dashboard beside a glass sphere and sculptural metal orbits',label:'ORBIT',detail:'YOUR IDEAS, ALIGNED.'},
 forme:{alt:'FORME objects: a ceramic loop vase, warm glowing table lamp and oak lounge chair',label:'FORME',detail:'THOUGHTFUL OBJECTS.'},
 vase:{alt:'The Arc Vase, a textured sand ceramic loop vase'},
 lamp:{alt:'The Halo Lamp, an ivory dome with a brushed bronze stem'},
 chair:{alt:'The Loop Chair, sculpted oak with a woven linen seat'}
};
function renderPicture(key,alt='',eager=false){
 const portrait=['vase','lamp','chair'].includes(key);
 return `<picture class="render-picture"><source media="(max-width: 600px)" srcset="/assets/renders/${key}-3d-sm.webp"><img src="/assets/renders/${key}-3d.webp" alt="${esc(alt||studioArtwork[key]?.alt||'Studio visual study')}" width="${portrait?1122:1440}" height="${portrait?1402:960}" loading="${eager?'eager':'lazy'}" decoding="async" ${eager?'fetchpriority="high"':''}></picture>`;
}
function sculpture(){return `${heroMotionGraphic()}<div class="sculpture studio-render" data-depth><div class="depth-plane"><div class="render-drift">${renderPicture('hero','',true)}</div></div><span class="studio-render-orbit" aria-hidden="true"></span><span class="render-pearl pearl-silver" aria-hidden="true"></span><span class="render-pearl pearl-clay" aria-hidden="true"></span></div>`;}
function renderFeature(key,extra='',alt=''){return `<div class="render-feature render-${key} ${extra}" data-depth><div class="depth-plane"><div class="render-drift">${renderPicture(key,alt)}</div></div><span class="render-glint" aria-hidden="true"></span></div>`;}
function projectArt(id){

 const p=projects.find(p=>p.id===id);
 if(p?.cover)return `<div class="project-art media-project" data-depth><div class="depth-plane"><img src="${esc(p.cover)}" alt="${esc(p.name)} project preview" loading="lazy" decoding="async"></div><span class="project-arrow" aria-hidden="true">↗</span>${p.video?'<span class="video-project-badge">▶ Project film</span>':''}</div>`;
 if(p?.video)return `<div class="project-art media-project"><video class="ambient-video" muted playsinline loop preload="none" aria-label="${esc(p.name)} film preview"><source src="${esc(p.video)}"></video><span class="project-arrow" aria-hidden="true">↗</span><span class="video-project-badge">▶ Project film</span></div>`;
 if(id==='identity')return `<div class="project-art identity-motion-art"><img src="/assets/brand/veloryz-mark.svg" alt="" width="680" height="620"><span class="identity-caption">VELORYZ / A STUDY IN MOTION</span><span class="project-arrow" aria-hidden="true">↗</span></div>`;
 const art=studioArtwork[id];
 if(art&&id!=='hero')return `<div class="project-art render-art render-${id}" data-depth><div class="depth-plane"><div class="render-drift">${renderPicture(id)}</div></div><span class="render-cover-wash" aria-hidden="true"></span><div class="render-cover-label"><strong>${esc(art.label)}</strong><span>${esc(art.detail)}</span></div><span class="render-cover-bottom">${esc(p?.category||'Studio exploration')}</span><span class="render-glint" aria-hidden="true"></span><span class="project-arrow" aria-hidden="true">↗</span></div>`;
 return `<div class="project-art custom-project-art" data-depth><span>${esc(p?.name?.slice(0,2)||'V.')}.</span><p>${esc(p?.category||'Studio project')}</p><span class="project-arrow" aria-hidden="true">↗</span></div>`;
}

function projectCard(project,large=false){return `<button class="project-link reveal ${large?'project-large':''}" data-case="${esc(project.id)}" aria-label="Explore ${esc(project.name)}, ${esc(project.status)}" data-category="${esc(project.type)}">${projectArt(project.id)}<div class="project-caption"><div><h3>${esc(project.name)}</h3><p>${esc(project.category)} · ${esc(project.status)}</p></div><span>${esc(project.year)}</span></div></button>`;}
function ticker(){const content=['Strategy with substance','Design with a point of view','Development with purpose','Independent by design','Dream. Build. Grow. Together.'].map(t=>`<span>${t}</span><i aria-hidden="true">✳</i>`).join('');return `<div class="ticker" aria-label="Strategy, design and development"><div class="ticker-track" aria-hidden="true">${content}${content}</div></div>`;}
function serviceScene(index){const labels=['WEB EXPERIENCE','PRODUCT INTERFACE','IDENTITY IN MOTION','CONNECTED SYSTEMS','CONTENT & MOTION'];return `<div class="service-scene service-scene-${index}" aria-hidden="true"><div class="service-scene-floor"></div><div class="service-object"><div class="service-plane plane-back"><i></i><i></i><i></i></div><div class="service-plane plane-front">${index===2?'<img src="/assets/brand/veloryz-mark.svg" alt="">':index===3?'<span class="system-node"></span><span class="system-node"></span><span class="system-node"></span>':index===4?'<span class="motion-bars"><i></i><i></i><i></i><i></i><i></i></span>':'<span class="browser-dots">•••</span><span class="browser-block"></span><span class="browser-lines"><i></i><i></i></span>'}</div></div><span class="service-scene-label">${labels[index]||labels[0]}</span></div>`;}

function serviceList(full=false){return `<div class="service-list ${full?'services-page-list':''}">${services.map((service,i)=>`<div class="service-item ${i===0?'open':''}"><button data-service="${i}" aria-expanded="${i===0}" aria-controls="service-panel-${i}"><span class="service-no">0${i+1}</span><span class="service-title">${service.name}</span><span class="service-plus" aria-hidden="true">+</span></button><div class="service-details" id="service-panel-${i}" ${i===0?'':'inert'}><div><div class="service-details-inner">${full?serviceScene(i):''}<p>${service.description}</p>${full?`<p style="margin-top:15px"><strong style="color:var(--ink);font-weight:400">Typical scope:</strong> ${service.deliverables}</p>`:''}<div class="tags">${service.tags.map(tag=>`<span class="tag">${tag}</span>`).join('')}</div>${full?`<button class="text-link" style="margin-top:22px;background:none" data-book data-preset="${esc(service.name)}">Discuss this service ${arrow}</button>`:''}</div></div></div></div>`).join('')}</div>`;}
function process(){return `<div class="process-grid">${[
 ['Discover','We talk through your idea, your audience and what success should look like. A clear brief comes first.','◌'],
 ['Define','We align on the scope, design direction, deliverables and an estimate before starting.','⌘'],
 ['Design','Explore the visual direction, refine the key screens and review how the experience should feel.','✳'],
 ['Develop','Build the approved direction into responsive interfaces and connected workflows, with reviews at agreed milestones.','⌘'],
 ['Launch & evolve','We check the experience, prepare the handover and agree on what support comes next.','↗']
 ].map(([title,description,symbol],i)=>`<div class="process-card reveal"><span class="process-number">0${i+1} /</span><span class="process-symbol" aria-hidden="true">${symbol}</span><h3>${title}</h3><p>${description}</p></div>`).join('')}</div>`;}
function faqs(){return `<div class="faq">${[
 ['What can we build together?','Custom websites, product interfaces, visual identities, backend workflows and creative content. Tell us what you are trying to achieve and we will help define a practical scope.'],
 ['How much does a project cost?','Every project has a different scope. We discuss your requirements, timeline and budget, then prepare a specific estimate. There is no payment required to send an enquiry.'],
 ['Can we collaborate remotely?','Yes. The studio is based in Bokaro, Jharkhand, and project discussions, reviews and handovers can happen remotely.'],
 ['Can you improve an existing website?','Yes. Share your current website and what needs to change. We can discuss a focused improvement, a visual redesign or a broader rebuild.'],
 ['What happens after I request a consultation?','Your request is saved in the studio’s protected enquiry inbox and you receive a reference number. The studio will contact you to confirm availability. A preferred date is a request, not a confirmed appointment.'],
 ['Who owns the source files?','Ownership, asset licences and source-file handover are specified in your written agreement. Third-party fonts, templates, imagery, plugins and provider accounts may have their own licence terms.'],
 ['Are hosting and maintenance included?','Hosting, domain renewals, paid services and ongoing maintenance are separate unless explicitly listed in your scope. We identify account ownership and running costs before launch.'],
 ['How are changes handled?','We review feedback at agreed checkpoints. New features or changes beyond the approved scope are estimated and agreed before they are added to the project.'],
 ['Can you connect a database or admin panel?','Yes. We can scope database-backed content, enquiry workflows, protected admin tools and external integrations. Access permissions and operational responsibilities are part of the implementation plan.'],
 ['Is VELORI a client project?','VELORI is a VELORYZ product currently in development. It is part of our own product journey, with its features and availability evolving as development continues.']
 ].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;}

function deliveryStandards(){return `<section class="section container delivery-section"><div class="section-head reveal"><div><div class="eyebrow">The details behind the delivery</div><h2>A clear scope.<br>A considered handover.</h2></div><p>Know what is being made, how decisions are reviewed and what happens after launch.</p></div><div class="delivery-grid">${[
 ['01 / Before we begin','Agree on the essentials.','Your goals, audience, content, pages, integrations and budget become a written scope. Timeline, dependencies, revision rounds and exclusions are discussed before work starts.'],
 ['02 / During the build','Review the decisions.','We work through agreed design and development checkpoints. Feedback is gathered in one place; changes outside the scope are estimated before implementation.'],
 ['03 / Before launch','Check the real experience.','We review mobile layouts, navigation, forms, error states and key user journeys. Configuration and deployment responsibilities are confirmed for the selected host.'],
 ['04 / At handover','Keep the next step clear.','Receive the source files and operating notes included in your agreement. Hosting, domains, third-party charges, maintenance and future changes have clearly assigned owners.']
].map(([label,title,body])=>`<article class="delivery-card reveal"><span class="eyebrow">${label}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div><a class="text-link" href="/process/" data-route>Explore the project journey ${arrow}</a></section>`;}
function deliveryPage(){return `${intro('From first conversation to handover','Good work needs<br>a clear process.','A practical guide to planning, reviewing and launching your project with VELORYZ. Timelines and deliverables are agreed for each project.','PROCESS')}<section class="section container">${process()}</section>${deliveryStandards()}<section class="section container"><div class="section-head"><div><div class="eyebrow">Prepare your first conversation</div><h2>Bring the idea.<br>We’ll shape the brief.</h2></div></div><div class="delivery-grid"><article class="delivery-card"><h3>Your business & audience</h3><p>What do you offer? Who needs it? Share the problem your website or product should help solve and the action you want visitors to take.</p></article><article class="delivery-card"><h3>Your starting point</h3><p>Share your existing website, logo, content, useful references and any systems the project must connect to. Tell us what is ready and what needs creating.</p></article><article class="delivery-card"><h3>Your priorities</h3><p>Separate the features needed for launch from future ideas. Include your preferred launch window and budget range so the scope can stay realistic.</p></article><article class="delivery-card"><h3>Your decision makers</h3><p>Identify the people who approve content, design and technical decisions. Agree on a feedback contact to keep reviews clear and timely.</p></article></div><button class="primary-button" data-book>Discuss your project ${arrow}</button></section><section class="section container"><div class="section-head"><h2>Questions before<br>we begin.</h2></div>${faqs()}</section>${cta()}`;}

function cta(){return `<section class="cta-section"><img class="cta-mark" src="/assets/brand/veloryz-mark.svg" alt="" width="360" height="360"><div class="container"><div class="cta-top"><div><div class="eyebrow" style="--accent:#20211f">Your next chapter</div><h2>Good things start<br>with a conversation.</h2></div><button class="cta-orb" data-book aria-label="Book a consultation">↗</button></div><div class="cta-bottom"><p>A new idea, a fresh perspective, or a platform ready for its next step. Let’s make it happen.</p><a href="mailto:${CONTACT.email}" class="text-link">${CONTACT.email} ${arrow}</a></div></div></section>`;}
function intro(label,title,description,index){return `<section class="page-intro container">${motionGlyph()}<div class="eyebrow intro-animate">${label}</div><h1 class="intro-animate delay-1">${title}</h1><div class="page-intro-bottom intro-animate delay-2"><p>${description}</p><span class="page-index">VELORYZ STUDIO / ${index}</span></div></section>`;}
function reelStrip(){return `<div class="reel-strip reveal"><video class="ambient-video" loop muted playsinline preload="none" poster="/assets/studio-poster.jpg" aria-label="VELORYZ animated studio film"><source src="${esc(studioCMS?.branding?.showreel||'/assets/studio-film.mp4')}" type="video/mp4"></video><div class="reel-overlay"><div><h3>A studio in motion.</h3><p>THE VELORYZ FILM · 16 SECONDS</p></div><button class="reel-play" data-reel aria-label="Watch the VELORYZ studio film">▶</button></div></div>`;}
function logoStage(variant='hero'){return `<div class="logo-stage logo-stage-${variant}">${variant==='lab'?`<div class="logo-object-controls" role="group" aria-label="Choose a 3D sculpture"><button data-logo-object="logo" aria-pressed="true">V mark</button><button data-logo-object="ribbon" aria-pressed="false">Ribbon</button><button data-logo-object="orbit" aria-pressed="false">Orbital</button></div>`:''}<div class="logo-grid" aria-hidden="true"></div><div class="logo-scene" data-logo-scene role="img" aria-label="Interactive three-dimensional sculpture of the pink and blue VELORYZ logo"><img class="logo-fallback" src="/assets/brand/veloryz-mark.svg" alt="" width="680" height="620"></div><span class="scene-coordinate scene-coordinate-top">V / 01 &nbsp; BRAND IN MOTION</span><span class="scene-coordinate scene-coordinate-bottom"><span class="rotation-hint">Drag to rotate · Arrow keys to turn</span><button type="button" data-inspect-logo>Inspect in 3D</button></span><div class="logo-view-controls" role="group" aria-label="3D logo camera"><button data-logo-view="front" aria-pressed="true">Front</button><button data-logo-view="orbit" aria-pressed="false">Orbit</button><button data-logo-view="explode" aria-pressed="false">Explode</button></div><label class="logo-speed">3D speed<input type="range" min="0.25" max="1.75" step="0.25" value="1" data-logo-speed aria-label="3D animation speed"></label><div class="logo-controls" role="group" aria-label="Logo material"><button data-logo-material="solid" aria-pressed="true">Solid</button><button data-logo-material="glass" aria-pressed="false">Glass</button><button data-logo-material="wire" aria-pressed="false">Wire</button><button data-logo-replay aria-label="Replay logo assembly">↻</button></div></div>`;}
function creatorSection(){return `<section class="creator-section container"><div class="creator-visual reveal"><div class="creator-orbit" aria-hidden="true"><i></i><i></i><img src="/assets/brand/veloryz-mark.svg" alt="" width="300" height="300"></div><span class="creator-visual-note">AN IDEA. A VISION. A VELORYZ CREATION.</span></div><div class="creator-copy reveal"><span class="eyebrow">A personal point of view</span><h2>Made with intent.<br><span class="gradient-text">Built by Aryan.</span></h2><p>Design, code and a little different thinking. I’m Aryan Raj Singh, founder of VELORYZ Studio. I bring the vision together, from the first idea to the details you can experience.</p><div class="creator-signature"><span>Designed & built by</span><strong>Aryan Raj Singh<span class="signature-line" aria-hidden="true"></span></strong></div><a href="/studio/" class="text-link">Meet the studio ${arrow}</a></div></section>`;}
function motionManifesto(){return `<section class="motion-manifesto container"><span class="eyebrow reveal">An independent creative practice</span><h2 class="manifesto-words"><span class="reveal">DESIGN.</span><span class="reveal">DEVELOP.</span><span class="reveal gradient-text">MOVE.</span></h2><div class="manifesto-bottom"><p>Purpose in every pixel.<br>Personality in every interaction.</p><a href="/services/" class="text-link">Explore our capabilities ${arrow}</a></div></section>`;}
function uiConceptPreview(kind){
 if(kind==='spectra')return `<div class="ui-preview ui-spectra"><div class="preview-top"><strong>SPECTRA®</strong><span>INDEPENDENT IDEAS ↗</span></div><div class="spectra-heading">Create<br><em>the unexpected.</em></div><div class="spectra-orb" aria-hidden="true"><i></i><i></i><i></i></div><div class="preview-foot"><span>ART DIRECTION / DIGITAL EXPERIENCES</span><span>01 — 03</span></div></div>`;
 if(kind==='nova')return `<div class="ui-preview ui-nova"><div class="nova-sidebar"><strong>n.</strong><span class="nova-nav-dot active"></span><span class="nova-nav-dot"></span><span class="nova-nav-dot"></span></div><div class="nova-content"><div class="preview-top"><strong>Your next<br>clear thought.</strong><span>WORKSPACE CONCEPT</span></div><div class="nova-cards"><div><span>TODAY’S FOCUS</span><strong>Make room<br>for good ideas.</strong><i class="nova-flow"></i></div><div><span>A LITTLE MOMENTUM</span><div class="nova-chart"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div><div class="nova-task"><i></i><span>Define the next chapter</span><b>↗</b></div><div class="nova-task"><i></i><span>Explore a different direction</span><b>↗</b></div></div></div>`;
 return `<div class="ui-preview ui-muse"><div class="preview-top"><strong>MUSE / OBJECTS</strong><span>THINGS WITH A POINT OF VIEW</span></div><div class="muse-layout"><div><span class="muse-kicker">A STUDY IN FORM</span><h3>Less, but<br><em>considered.</em></h3><span class="muse-link">EXPLORE THE COLLECTION ↗</span></div><div class="muse-object" aria-hidden="true"><i></i><i></i><i></i></div></div><div class="preview-foot"><span>FICTIONAL OBJECT COLLECTION</span><span>EST. FOR THIS EXPLORATION</span></div></div>`;
}
function uiExplorations(){return `<section class="section container ui-explorations"><div class="section-head reveal"><div><span class="eyebrow">The interface studies / studio concepts</span><h2>Different worlds.<br>One curious studio.</h2></div><p>Three original visual directions. Explorations of layout, colour and interaction, created to show what your next experience could feel like.</p></div><div class="ui-study-grid">${[['spectra','SPECTRA','Creative studio','Expressive type. Electric colour. A little controlled chaos.'],['nova','NOVA','Product workspace','A calmer interface for ideas, focus and a clearer next step.'],['muse','MUSE','Editorial commerce','Sculptural objects, warm materials and an editorial point of view.']].map(([id,name,category,description],i)=>`<article class="ui-study-card reveal" style="--study-order:${i}">${uiConceptPreview(id)}<div class="ui-study-copy"><div><span class="eyebrow">0${i+1} / ${category}</span><h3>${name}</h3><p>${description}</p></div><button class="study-open" data-ui-concept="${id}" aria-label="Open ${name} UI concept">↗</button></div></article>`).join('')}</div><div class="study-note"><span>VISUAL CONCEPTS · NOT CLIENT RESULTS</span><a href="/motion/" class="text-link">Enter the motion playground ${arrow}</a></div></section>`;}
function designComparison(){return `<section class="section container comparison-section"><div class="section-head reveal"><div><span class="eyebrow">One brief / two directions</span><h2>See the difference.<br>Move the divider.</h2></div><p>An illustrative redesign study. Compare a plain layout with a more expressive direction. This is a studio demonstration, not a client before-and-after result.</p></div><div class="design-comparison" data-comparison style="--comparison:50%"><div class="comparison-layer comparison-before" role="img" aria-label="Before: plain website concept"><div class="comparison-browser">STUDIO / A SIMPLE STARTING POINT</div><div class="comparison-basic"><span>WELCOME TO OUR STUDIO</span><h3>We build<br>websites.</h3><p>Design and development services<br>for your next project.</p><span class="basic-demo-button">Contact us</span><div class="basic-boxes"><i></i><i></i><i></i></div></div></div><div class="comparison-layer comparison-after" role="img" aria-label="After: expressive website concept"><div class="comparison-browser">VELORYZ / A MORE CONSIDERED EXPERIENCE</div><div class="comparison-designed"><span>DESIGN × CODE × PERSONALITY</span><h3>Built to be<br><em>remembered.</em></h3><p>A clear idea.<br>A world of its own.</p><img src="/assets/brand/veloryz-mark.svg" alt="" width="300" height="300"><span class="designed-demo-button">Explore the possibilities ↗</span></div></div><span class="comparison-divider" aria-hidden="true"><b>↔</b></span><div class="comparison-labels" aria-hidden="true"><span>BEFORE</span><span>AFTER</span></div></div><div class="comparison-tools"><label for="comparison-position">Reveal the new direction</label><input id="comparison-position" type="range" min="0" max="100" value="50" data-comparison-range aria-valuetext="50 percent of the new direction shown"><output for="comparison-position" data-comparison-output>50%</output><button class="text-link" data-comparison-reset>Reset ↺</button></div></section>`;}
function assemblySequence() {
 const chapters = [
  ['Silhouette','Two pieces. One V.','The pink blade and blue shard keep the outline of the original VELORYZ mark.'],
  ['Cutaway','Inside the edge.','Watch the enamel faces lift away from five polished ribs and a recessed core.'],
  ['Reverse','Around the mark.','The layers close as the reverse facet turns into view. Scroll back to take it apart again.']
 ];
 return `<section class="assembly-sequence container" aria-label="Scroll through the construction of the VELORYZ logo">
   <div class="assembly-visual"><div class="assembly-heading"><span class="eyebrow">Motion studio</span><h2>The anatomy of the V.</h2></div>
   <div class="assembly-plate logo-stage"><div class="assembly-plate-grid" aria-hidden="true"></div>
   <div class="logo-scene" data-logo-scene role="img" aria-label="Three-dimensional cross-section of the VELORYZ logo"><img class="logo-fallback" src="/assets/brand/veloryz-mark.svg" alt=""></div>
   <span class="assembly-scale" aria-hidden="true"><i></i></span></div></div>
   <div class="assembly-chapters">${chapters.map(([name,title,copy])=>`<article><span class="eyebrow">${name}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>
 </section>`;
}
function motionLabPage(){return `${intro('VELORYZ / The motion playground','A little curiosity.<br><span class="gradient-text">A lot of possibility.</span>','Explore a living brand sculpture, play with an interface direction and move between two visual approaches. Every study here is an original studio concept.','PLAY')}<section class="container lab-stage-section"><div class="lab-stage-wrap">${logoStage('lab')}</div><aside class="lab-control-panel"><span class="eyebrow">Make it your own</span><h2>A brand.<br>In another dimension.</h2><p>Change the material, explore a camera angle, then take the sculpture apart.</p><div class="lab-status"><span class="live-dot" aria-hidden="true"></span>INTERACTIVE 3D STUDY</div><a class="text-link" href="/assets/brand/veloryz-logo.glb" download>Download the 3D logo ↓</a><button class="lab-motion-toggle" data-motion-control>Change your motion preference ↗</button><p class="lab-fallback-note">Drag to turn the model, or focus it and use the arrow keys. Home resets the view.</p></aside></section>${assemblySequence()}${uiExplorations()}${designComparison()}<section class="section container interaction-lab"><div class="section-head"><div><span class="eyebrow">Small details / a different feeling</span><h2>Interfaces that<br>answer back.</h2></div><p>Choose a mood, try a tab and watch a layout respond. These interactions are local to this page.</p></div><div class="lab-interaction-grid"><article class="lab-swatch-card" data-colour-study data-mood="orchid"><span class="eyebrow">01 / COLOUR & ATMOSPHERE</span><div class="swatch-orbit" aria-hidden="true"><i></i><i></i></div><h3 data-mood-title>Orchid after hours.</h3><p>A different atmosphere. The same clear idea.</p><div class="mood-controls" role="group" aria-label="Choose a visual mood"><button data-mood="orchid" aria-pressed="true">Orchid</button><button data-mood="aurora" aria-pressed="false">Aurora</button><button data-mood="ember" aria-pressed="false">Ember</button></div></article><article class="lab-tab-card"><span class="eyebrow">02 / CONTENT IN CONTEXT</span><div class="lab-tabs" role="tablist" aria-label="Explore the studio approach"><button id="lab-tab-design" role="tab" aria-selected="true" aria-controls="lab-tab-panel" tabindex="0" data-lab-tab="design">Design</button><button id="lab-tab-build" role="tab" aria-selected="false" aria-controls="lab-tab-panel" tabindex="-1" data-lab-tab="build">Build</button><button id="lab-tab-move" role="tab" aria-selected="false" aria-controls="lab-tab-panel" tabindex="-1" data-lab-tab="move">Move</button></div><div id="lab-tab-panel" role="tabpanel" aria-labelledby="lab-tab-design" tabindex="0"><span class="lab-tab-symbol" aria-hidden="true">✳</span><h3>Give the idea<br>a point of view.</h3><p>Shape the visual language, hierarchy and details around what people need to do.</p></div></article></div></section>${typeStudy()}${cta()}`;}

const journeyStages=[
 ['Sketch','Start with the right question.','What should this experience help people do? We begin with the audience, the main action and the idea that makes the project worth building.','A focused brief · audience · priorities'],
 ['Structure','Give the idea a clear path.','Map the pages, organise the content and work through the key journeys. A wireframe makes the hierarchy visible before visual details take over.','Page map · content hierarchy · user journeys'],
 ['Design','Build a world around the idea.','Bring typography, colour, spacing and interaction together. Review the direction on small and large screens, with readable content at the centre.','Visual direction · responsive screens · components'],
 ['Build','Connect the details that matter.','Translate the approved design into working interfaces. Forms, loading, error states and integrations receive the same attention as the first impression.','Responsive code · connected workflows · verification'],
 ['Review','Prepare a considered handover.','Review the real experience, test the important actions and document what comes next. Launch follows the agreed scope and a final readiness check.','Quality checks · configuration · handover']
];
function projectJourney(){return `<section class="section container project-journey" data-project-journey data-stage="0" style="--journey-progress:0"><div class="section-head reveal"><div><span class="eyebrow">From an idea / to an experience</span><h2>Good work takes shape.<br><span class="gradient-text">One decision at a time.</span></h2></div><p>A studio process illustrated through a fictional interface study. Follow the stages, explore the details and see how a direction comes together.</p></div><div class="journey-grid"><div class="journey-copy">${journeyStages.map(([name,title,body,outcome],i)=>`<article id="journey-stage-${i}" class="journey-chapter" data-journey-chapter="${i}"><span class="eyebrow">0${i+1} / ${name}</span><h3>${title}</h3><p>${body}</p><div class="journey-outcome"><span aria-hidden="true">↳</span>${outcome}</div></article>`).join('')}</div><div class="journey-display"><div class="journey-visual" aria-hidden="true"><div class="journey-glow"></div><div class="journey-device"><div class="journey-browser"><span>● ● ●</span><span>VELORYZ / INTERFACE STUDY</span><span>↗</span></div><div class="journey-screen"><div class="journey-view journey-sketch"><span>THE FIRST QUESTION</span><div class="sketch-title">What if<br>we made it<br><em>matter?</em></div><i class="sketch-ring"></i><span class="sketch-note">audience → purpose → action</span></div><div class="journey-view journey-wireframe"><div class="wire-nav"><i></i><i></i><i></i></div><div class="wire-heading"></div><div class="wire-heading short"></div><div class="wire-description"></div><div class="wire-button"></div><div class="wire-image">VISUAL DIRECTION</div><div class="wire-cards"><i></i><i></i><i></i></div></div><div class="journey-view journey-design"><div class="designed-top"><strong>V.</strong><span>A LITTLE DIFFERENT THINKING</span></div><h4>Built to be<br><em>remembered.</em></h4><p>A clear idea.<br>A world of its own.</p><img src="/assets/brand/veloryz-mark.svg" alt="" width="200" height="200"><span class="journey-demo-cta">EXPLORE THE POSSIBILITIES ↗</span></div><div class="journey-view journey-build"><div class="build-code"><span>interface / experience</span><code><i>const</i> idea = {<br>&nbsp; purpose: <b>'make it useful'</b>,<br>&nbsp; detail: <b>'make it considered'</b>,<br>&nbsp; motion: <b>'make it feel right'</b><br>};<br><br><i>build</i>(idea);</code></div><div class="build-mini"><img src="/assets/brand/veloryz-mark.svg" alt="" width="100" height="100"><span>DESIGN → WORKING INTERFACE</span></div></div><div class="journey-view journey-review"><img src="/assets/brand/veloryz-mark.svg" alt="" width="70" height="70"><span>READY FOR A FINAL REVIEW</span><h4>A considered<br>next chapter.</h4><div><span>✓ Key journeys reviewed</span><span>✓ Mobile experience checked</span><span>✓ Handover prepared</span></div><small>ILLUSTRATIVE CHECKLIST / NOT A LIVE PROJECT STATUS</small></div></div></div><span class="journey-floating-label">IDEA → STRUCTURE → DESIGN → BUILD → REVIEW</span></div><nav class="journey-stage-nav" aria-label="Project story stages">${journeyStages.map(([name],i)=>`<button type="button" data-journey-select="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${name}</button>`).join('')}</nav><p class="journey-stage-caption"><span data-journey-caption>01 / Sketch</span><a href="/create/" class="text-link">Shape your project ↗</a></p></div></div><div class="journey-signoff"><span>AN IDEA, MADE CONSIDERED.</span><strong>Designed & built by Aryan Raj Singh<i aria-hidden="true"></i></strong><a href="/create/" class="button">Start your own story ${arrow}</a></div></section>`;}
function journeyPage(){return `${intro('VELORYZ / the project journey','From a first thought.<br><span class="gradient-text">To something you can experience.</span>','Explore the studio’s approach through a visual interface study. Scroll through the stages or choose one to take a closer look.','JOURNEY')}${projectJourney()}${cta()}`;}

function projectShowcase(){
 // Three independently created live design references; these are not studio client projects.
 return window.VeloryzExternalDesignLibrary?.showcase() ||
 '<p class="empty-work">Explore our curated real-world websites in the <a href="/design/">design library</a>.</p>';
}

function typeStudy(){
 return `<section class="type-study container"><div class="type-heading"><div><span class="eyebrow">Motion playground</span><h2>Type in motion.</h2></div><label>Letter spacing <input type="range" min="0" max="100" value="40" data-type-spacing></label></div>
 <div class="type-window" aria-label="Veloryz kinetic type study"><div aria-hidden="true">${['VELORYZ','STUDIO','VELORYZ'].map(word=>`<span>${word}</span>`).join('')}</div></div></section>`;
}
function homePage(){const settings=studioCMS?.site||{};return `
 <section class="hero container motion-hero"><div class="hero-topline intro-animate"><div class="eyebrow hero-studio-tagline" data-cursor-fade>Independent creative & technology studio</div><span class="small-index">BOKARO, INDIA · WORKING EVERYWHERE</span></div><div class="hero-layout"><div class="hero-copy"><div class="hero-chapter intro-animate">DESIGN × CODE × MOTION</div><h1 class="intro-animate delay-1">Built to be<br><span class="serif">remembered.</span></h1><p class="hero-desc intro-animate delay-2">Distinctive identities, thoughtful websites and digital experiences. A little different thinking. A lasting impression.</p><div class="hero-actions intro-animate delay-3"><a href="/work/" class="button">Explore our work ${arrow}</a><button class="motion-secondary" data-book>Start a conversation ${arrow}</button></div><a class="hero-maker intro-animate delay-3" href="/studio/"><span class="maker-monogram">AR</span><span>Designed & built by<strong>Aryan Raj Singh <span aria-hidden="true">↗</span></strong></span></a></div><div class="hero-art intro-animate delay-2">${logoStage()}</div></div><div class="hero-meta intro-animate delay-3"><div><span>01 / A SMALL STUDIO. A BIG VISION.</span>Design, technology & a little different thinking.</div><div><span>02 / FOUNDED BY ARYAN RAJ SINGH</span>Independent since 2025.</div><div><span>03 / KEEP EXPLORING</span><a href="${settings.showWork===false?'/work/':'#selected-work'}">Scroll to discover ↓</a></div></div></section>
${settings.showWork!==false?` <section id="selected-work" class="section container"><div class="section-head reveal"><div><div class="eyebrow">Featured real-world design references</div><h2>${esc(settings.showcaseTitle||'Ideas, made tangible.')}</h2></div><a href="/work/" class="text-link">Explore the design library ${arrow}</a></div>${projectShowcase()}</section>`:''}
${settings.showScarf!==false?` <veloryz-frame-cut aria-label="The VELORYZ logo reveal and animated scarf"><div class="frame-stage">
   <div class="frame-emblem" aria-hidden="true"><img class="frame-rings" src="/assets/frame-cut/portal-rings.svg" alt="" loading="lazy"><img class="frame-mark" src="/assets/brand/veloryz-mark.svg" alt="" loading="lazy"></div>
   <video class="frame-scarf" preload="none" muted loop playsinline poster="/assets/frame-cut/scarf.jpg" aria-label="VELORYZ animated scarf"></video>
   <button type="button" class="frame-toggle" hidden aria-label="Pause VELORYZ scarf animation">Pause scarf</button>
 </div></veloryz-frame-cut>`:''}
 ${settings.showManifesto!==false?motionManifesto():''}
 ${ticker()}
 ${settings.showStudies!==false?uiExplorations():''}
 <section class="section container services-section"><div class="split-section"><div class="split-intro reveal"><div class="eyebrow">What we bring</div><h2>From the first idea<br>to the finer detail.</h2><p>A connected approach to strategy, design and development. One studio, with the right people around your idea.</p><a href="/services/" class="text-link">Explore our services ${arrow}</a></div><div class="reveal">${serviceList()}</div></div></section>
 ${settings.showFounder!==false?creatorSection():''}
 <section class="studio-band"><div class="container"><div class="band-layout"><div class="eyebrow reveal">Meet your creative partners</div><div class="reveal"><h2>Different minds.<br>One shared ambition.<br>Make something that matters.</h2><p>Founded by Aryan Raj Singh in 2025, VELORYZ brings designers, developers and creative thinkers together. We believe thoughtful design and solid technology work best side by side.</p><a href="/studio/" class="text-link">A little about us ${arrow}</a><div class="mini-facts"><div><strong>2025</strong><span>Our beginning</span></div><div><strong>07</strong><span>People, one studio</span></div><div><strong>01</strong><span>Shared point of view</span></div></div></div></div></div></section>
 ${settings.showJourney!==false?projectJourney():''}
${settings.showFilm!==false?` <section class="container" style="padding-bottom:100px">${reelStrip()}</section>`:''}
 <section class="section container faq-section"><div class="faq-grid"><div class="reveal"><div class="eyebrow">Before we begin</div><h2>A few things<br>you might ask.</h2></div><div class="reveal">${faqs()}</div></div></section>${cta()}`;}
function workPage(){return `${intro('Work & studio explorations','Good ideas.<br>Considered execution.','An inside look at our own products, ongoing projects and the visual thinking behind VELORYZ.','01')}<section class="container work-full"><div class="filter-bar" role="group" aria-label="Filter projects"><button class="filter active" data-filter="all" aria-pressed="true">All work <span class="muted">${String(projects.length).padStart(2,'0')}</span></button><button class="filter" data-filter="product" aria-pressed="false">Digital products</button><button class="filter" data-filter="web" aria-pressed="false">Web experiences</button><button class="filter" data-filter="brand" aria-pressed="false">Brand identity</button><button class="filter" data-filter="motion" aria-pressed="false">Motion & film</button></div><div class="work-grid">${projects.map(p=>projectCard(p)).join('')}</div><p class="product-note">Project visuals are studio presentations. Open a project to explore its details, creative direction and current status.</p></section>${cta()}`;}
function servicesPage(){return `${intro('Our capabilities','Big-picture thinking.<br>Detail-driven making.','Design, development and creative direction, working together. We shape the right mix around your project.','02')}<section class="section container"><div class="split-section"><div class="split-intro reveal"><div class="eyebrow">Designed around your ambition</div><h2>The right people.<br>The right approach.</h2><p>Whether you are starting something new or improving what exists, we work with you to define what matters, then make a plan to build it.</p><button class="button" data-book>Talk through your idea ${arrow}</button></div><div class="reveal">${serviceList(true)}</div></div></section><section class="studio-band"><div class="container"><div class="section-head reveal"><div><div class="eyebrow">A collaborative process</div><h2>Clear scope. Shared direction.</h2></div><p>We agree on the deliverables, estimate and milestones before the work begins.</p></div>${process()}</div></section><section class="section container"><div class="faq-grid"><div class="reveal"><div class="eyebrow">The practical side</div><h2>Let’s clear<br>a few things up.</h2></div><div class="reveal">${faqs()}</div></div></section>${deliveryStandards()}${cta()}`;}
function studioPage(){return `${intro('The people behind the pixels','Independent minds.<br>Connected by design.','A creative and technology studio from Bokaro, India. Founded in 2025. Built on a shared ambition to make thoughtful digital work.','03')}<section class="section container founder-section"><div class="founder-art reveal founder-logo-stage">${logoStage('founder')}</div><div class="founder-content reveal"><div class="eyebrow">Meet Aryan</div><h2>One idea.<br>A studio built<br>around possibility.</h2><p>Aryan Raj Singh founded VELORYZ Studio in 2025, bringing together his interests in digital development, design and building original products.</p><p>As Founder, CEO and Executive Manager, he leads the studio’s direction and brings the team together across design, development and creative delivery. VELORI, a VELORYZ product in development, is part of that broader vision for connection, creativity and community.</p><p>Based in Bokaro, Jharkhand, the studio is a place for ambitious ideas to become clear, useful digital experiences.</p><div class="founder-name"><div><h3>Aryan Raj Singh</h3><p>Founder · CEO & Executive Manager</p></div><span class="signature" aria-hidden="true">Aryan.</span></div></div></section><section class="section team-section"><div class="container"><div class="section-head reveal"><div><div class="eyebrow">The studio collective</div><h2>Meet the minds<br>behind the work.</h2></div><p>Six specialists alongside our founder.<br>Different strengths, a shared direction.</p></div><div class="team-grid">${team.map(person=>`<article class="team-card reveal"><div class="team-art" aria-hidden="true"><span>${person.initials}.</span></div><h3>${person.name}</h3><p class="team-role">${person.role}</p><p class="team-description">${person.description}</p></article>`).join('')}</div></div></section><section class="section container"><div class="section-head reveal"><div><div class="eyebrow">Our point of view</div><h2>What holds it together.</h2></div></div><div class="values-grid">${[
 ['01 / INTENTION','Make it mean something.','Every visual choice and interaction should have a reason. We put the purpose of your project at the centre of the work.'],
 ['02 / COLLABORATION','Build it together.','The strongest work comes from an open conversation. Your understanding of the business meets our design and development thinking.'],
 ['03 / CRAFT','Care about the details.','The way a page reads, the feel of a transition and the clarity of a workflow all shape the experience. We treat them as part of the same whole.']
 ].map(([label,title,desc])=>`<article class="value reveal"><span>${label}</span><h3>${title}</h3><p>${desc}</p></article>`).join('')}</div></section><section class="container" style="padding-bottom:90px">${reelStrip()}</section>${cta()}`;}
function veloriPage(){return `<section class="velori-feature"><div class="container"><div class="velori-hero-grid"><div class="intro-animate"><div class="eyebrow">A VELORYZ product · In development</div><h1>velori.</h1><h2>Your world.<br>Your people.<br>A little more you.</h2><p>A social platform being built around self-expression, meaningful connection and creative communities.</p><div class="hero-actions"><a class="button" href="${CONTACT.product}" target="_blank" rel="noopener">Visit product website ${arrow}</a></div></div><div class="velori-product-art intro-animate delay-2">${renderFeature('velori','product-render')}<span class="product-art-note">A WORLD OF YOUR OWN. <span aria-hidden="true">↗</span></span></div></div><div class="velori-status"><span>DESIGNED & DEVELOPED BY VELORYZ</span><span>Ongoing product development · Illustrative interface</span></div></div></section><section class="section container"><div class="section-head reveal"><div><div class="eyebrow">The product vision</div><h2>More room to be you.</h2></div><p>We are exploring how a social experience can bring creation, discovery and community into one coherent world.</p></div><div class="feature-grid">${[
 ['◌','People & connection','A vision for profiles, social discovery and communities that help people find their own circle.'],
 ['▧','Creation & expression','Posts, stories and short-form video are part of the creative experiences being developed.'],
 ['↗','A connected experience','The goal is a consistent experience across sharing, conversations and the spaces people build together.']
 ].map(([icon,title,description])=>`<article class="feature-card reveal"><div class="feature-icon" aria-hidden="true">${icon}</div><h3>${title}</h3><p>${description}</p></article>`).join('')}</div><p class="product-note">VELORI is in development. This page describes the product direction; it does not guarantee that every feature is currently available. The product website is managed separately from this studio website.</p></section><section class="studio-band"><div class="container"><div class="band-layout"><div class="eyebrow reveal">Built from within</div><div class="reveal"><h2>Our own ambition.<br>The same thoughtful approach.</h2><p>VELORI gives our team a place to bring product design, frontend experiences, backend systems and creative direction together. It is an ongoing part of the VELORYZ story.</p><a href="/studio/" class="text-link">Meet the team behind it ${arrow}</a></div></div></div></section><section class="section container"><div class="split-section"><div class="split-intro reveal"><div class="eyebrow">Build something of your own</div><h2>Have a product<br>idea in mind?</h2></div><div class="reveal"><p style="color:var(--muted);font-size:16px;max-width:560px;margin-bottom:25px">From an early concept to a considered interface and a development plan, we can help you work out what comes next.</p><button class="button" data-book data-preset="UI/UX & product design">Discuss your product ${arrow}</button></div></div></section>${cta()}`;}
function newRequestId(){if(crypto.randomUUID)return crypto.randomUUID();const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);}
function todayInIndia(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(key=>parts.find(p=>p.type===key).value).join('-');}
function consultationForm(compact=false,preset=''){
 const id='enquiry-'+(++formCounter);
 return `<form class="consultation-form" data-enquiry data-request-id="${newRequestId()}"><div class="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><div class="enquiry-error" role="alert" hidden></div><div class="form-grid"><div class="field"><label for="${id}-name">Your name <span>*</span></label><input id="${id}-name" name="name" autocomplete="name" placeholder="Your full name" required maxlength="100"></div><div class="field"><label for="${id}-email">Email address <span>*</span></label><input id="${id}-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required maxlength="150"></div><div class="field full"><label for="${id}-phone">Phone / WhatsApp · optional</label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" maxlength="20" placeholder="Include country code, e.g. +91"></div><div class="field"><label for="${id}-service">What do you need? <span>*</span></label><select id="${id}-service" name="service" required><option value="">Choose a service</option>${services.map(service=>`<option ${preset===service.name?'selected':''}>${service.name}</option>`).join('')}<option>Not sure yet — let’s discuss</option></select></div><div class="field"><label for="${id}-budget">Project budget</label><select id="${id}-budget" name="budget"><option value="To be discussed">Let’s discuss</option><option>Under ₹15,000</option><option>₹15,000 – ₹30,000</option><option>₹30,000 – ₹75,000</option><option>₹75,000 – ₹1,50,000</option><option>₹1,50,000+</option></select></div><div class="field"><label for="${id}-date">Preferred date <span>*</span></label><input id="${id}-date" name="date" type="date" min="${todayInIndia()}" max="${new Date(Date.now()+180*86400000+330*60000).toISOString().slice(0,10)}" required></div><div class="field"><label for="${id}-time">Preferred time · IST <span>*</span></label><select id="${id}-time" name="time" required><option value="">Choose a time</option><option>10:00 AM – 11:00 AM</option><option>11:00 AM – 12:00 PM</option><option>12:00 PM – 1:00 PM</option><option>2:00 PM – 3:00 PM</option><option>3:00 PM – 4:00 PM</option><option>4:00 PM – 5:00 PM</option><option>5:00 PM – 6:00 PM</option></select></div>${compact?'':`<div class="field full"><label for="${id}-company">Company / website</label><input id="${id}-company" name="company" placeholder="Optional — tell us a little more" maxlength="200" autocomplete="organization"></div>`}<div class="field full"><label for="${id}-message">A little about your idea <span>*</span></label><textarea id="${id}-message" name="message" required minlength="10" maxlength="2000" placeholder="What are you looking to create or improve?"></textarea></div></div><label class="consent"><input type="checkbox" name="consent" required><span>I agree to send and store these details with VELORYZ to handle my enquiry. <button type="button" data-legal="privacy">Privacy details</button></span></label><div class="form-actions"><button type="submit" class="button">Send consultation request ${arrow}</button><a class="text-link" href="${wa('Hi VELORYZ Studio! I would like to discuss a project.')}" target="_blank" rel="noopener">Chat on WhatsApp ↗</a></div><p class="form-note">Your request is saved securely for the studio to review. The studio will contact you to confirm availability. Times are in India Standard Time.</p><div class="book-preview" role="status" aria-live="polite"></div></form>`;
}
function contactPage(){return `${intro('Say hello','Your next idea.<br>Our next conversation.','Have a project in mind? Tell us a little about it. We would love to understand what you are building and how we can help.','05')}<section class="section container contact-layout"><div class="contact-info reveal"><div><div class="eyebrow">Let’s make a connection</div><h3 class="contact-support-ai-link"><a href="/support/">✳ Talk to VELORYZ Contact Support AI ↗</a></h3><h2>Good work starts<br>with a hello.</h2><p>Reach out directly, or prepare a consultation request. Share your goals, your timeline and the kind of help you need.</p></div><div><a class="contact-channel" href="mailto:${CONTACT.email}"><span class="label">01 / Email the studio</span><strong>${CONTACT.email} ${arrow}</strong></a><a class="contact-channel" href="${wa('Hi VELORYZ Studio! I would like to discuss a project.')}" target="_blank" rel="noopener"><span class="label">02 / Chat on WhatsApp</span><strong>${CONTACT.display} ${arrow}</strong></a><a class="contact-channel" href="tel:+${CONTACT.phone}"><span class="label">03 / Give us a call</span><strong>${CONTACT.display} ${arrow}</strong></a><a class="contact-channel" href="https://www.google.com/maps/search/?api=1&query=Bokaro%20Jharkhand%20India" target="_blank" rel="noopener"><span class="label">04 / Our home</span><strong>Bokaro, Jharkhand, India ${arrow}</strong></a></div><p class="location-note">Based in India · Collaborating remotely<br>Times shown in India Standard Time (UTC+5:30).</p></div><div class="form-panel reveal"><h2>Let’s talk about your project.</h2><p class="form-intro">A few details will help us start in the right place.</p>${consultationForm()}</div></section><section class="section container faq-section"><div class="faq-grid"><div class="reveal"><div class="eyebrow">Before you say hello</div><h2>A little more clarity.</h2></div><div class="reveal">${faqs()}</div></div></section>`;}
function notFoundPage(){return `<section class="container not-found"><div class="eyebrow">A little off the map</div><h1>Let’s head home.</h1><p>This page isn’t part of the studio. The next good idea might be.</p><a href="/" class="button">Back to the studio ${arrow}</a></section>`;}
function renderRoute(route,scroll=true){
 currentRoute=normalise(route);document.body.classList.toggle('v4-creator-page',currentRoute==='/create/');let page=routes[currentRoute];
 if(!page&&(/^\/docs\/[a-z0-9-]+\/$/.test(currentRoute)||/^\/(?:docs|help)\/studio(?:\/[a-z0-9-]+)*\/$/.test(currentRoute)))page={title:'VELORYZ Documentation — Studio Guides',render:()=>window.VeloryzDocs?.render()||'<p>Documentation is loading.</p>'};
 if(!page&&currentRoute.startsWith('/teamjob/')){const slug=currentRoute.split('/')[2];page={title:'Team Profile — VELORYZ Studio',render:()=>teamProfilePage(slug)};}
 document.title=page?.title||'Page not found — VELORYZ Studio';
 const canonical=$('link[rel="canonical"]'),canonicalOrigin=canonical?new URL(canonical.href).origin:location.origin,url=canonicalOrigin+(currentRoute==='/'?'/':currentRoute);if(canonical)canonical.href=url;const ogUrl=$('meta[property="og:url"]'),ogTitle=$('meta[property="og:title"]');if(ogUrl)ogUrl.content=url;if(ogTitle)ogTitle.content=document.title;const metaDesc=$('meta[name="description"]'),ogDesc=$('meta[property="og:description"]');const routeSummary=page?.title?('Explore '+page.title.replace(/ — VELORYZ Studio$/,'')+' at VELORYZ Studio. Design, development and considered digital experiences from Bokaro, India.'):'This page does not exist on the VELORYZ Studio website.';if(metaDesc)metaDesc.content=routeSummary;if(ogDesc)ogDesc.content=routeSummary;
 if(observer)observer.disconnect();
 $('#main').innerHTML=currentRoute==='/create/'&&typeof window.VeloryzCreatorV4?.renderPage==='function'?window.VeloryzCreatorV4.renderPage():(page?page.render():notFoundPage());
 hydrateCMSPage();
 header();footer();window.StudioMotion?.sync();
 if(currentRoute==='/'){const teaser=document.createElement('section');teaser.className='container platform-teaser';teaser.innerHTML='<span class="teaser-star" aria-hidden="true">✳</span><div><div class="eyebrow">A LITTLE INSPIRATION, TO BEGIN</div><h2>Your next direction starts here.</h2><p>Explore the design library. Shape a brief. Make it yours.</p></div><a class="button" href="/design/">Explore the design library ↗</a>';$('#main').insertBefore(teaser,$('#main').querySelector('.motion-manifesto')||null);}
 if(currentRoute==='/create/'){
  document.getElementById('expert-launcher')?.remove();document.getElementById('offer-dock')?.remove();
  document.getElementById('site-pin')?.remove();document.getElementById('ad-slider')?.remove();
}else{initMotion();renderOfferDock();platformMount();}
 document.dispatchEvent(new CustomEvent('studio:route'));
 if(scroll){if(!reduced.matches&&typeof $('#main').animate==='function')$('#main').animate([{opacity:.55,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.2,.7,.3,1)'});window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});}
}
function navigate(path){
 while(modalOpen)closeModal();
 const update=()=>{history.pushState({},'',path);renderRoute(path);};
 if(!reduced.matches&&typeof document.startViewTransition==='function'){
  const transition=document.startViewTransition(update);
  transition.finished.catch(()=>{});
 }else update();
}
function initMotion(){
 initVisualMotion();observer?.disconnect();
 document.body.classList.toggle('js-motion',!reduced.matches);
 if(!reduced.matches&&typeof IntersectionObserver==='function'){
  try{observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.06,rootMargin:'0px 0px -20px 0px'});$$('.reveal').forEach(el=>{el.classList.remove('in-view');observer.observe(el);});}catch{$$('.reveal').forEach(el=>el.classList.add('in-view'));}
 }else $$('.reveal').forEach(el=>el.classList.add('in-view'));
 window.StudioMotion?.observe();
 observeAmbientFilms();
}
function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),4500);}
function openModal(content,className='',returnFocus=null){
 if(window.StudioMotion?.onboardingActive)return;
 const previous=$('.modal-backdrop');
 if(previous){modalStack.push({element:previous,returnFocus:modalReturnFocus,active:document.activeElement});previous.remove();}
 modalReturnFocus=returnFocus||document.activeElement;
 modalOpen=true;clearTimeout(popupTimer);
 $('#modal-root').innerHTML=`<div class="modal-backdrop"><div class="modal ${className}" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><button class="modal-close" data-close aria-label="Close dialog">×</button>${content}</div></div>`;
 document.body.style.overflow='hidden';
 [$('#header'),$('#main'),$('#footer'),$('.whatsapp-float'),$('#expert-launcher'),$('#offer-dock'),$('#site-pin'),$('#ad-slider')].filter(Boolean).forEach(el=>el.inert=true);
 requestAnimationFrame(()=>$('.modal').focus({preventScroll:true}));
}
function closeModal(){
 const vid=$('.modal video');if(vid)vid.pause();
 $('#modal-root').innerHTML='';
 if(modalStack.length){const previous=modalStack.pop();$('#modal-root').append(previous.element);modalReturnFocus=previous.returnFocus;requestAnimationFrame(()=>previous.active?.isConnected?previous.active.focus({preventScroll:true}):$('.modal').focus());return;}
 document.body.style.overflow='';modalOpen=false;
 [$('#header'),$('#main'),$('#footer'),$('.whatsapp-float'),$('#expert-launcher'),$('#offer-dock'),$('#site-pin'),$('#ad-slider')].filter(Boolean).forEach(el=>el.inert=false);
 if(modalReturnFocus?.isConnected)modalReturnFocus.focus({preventScroll:true});
}
function consultationSuppressed(){try{return localStorage.getItem('veloryz.consultation.no-auto')==='1'}catch{return false}}
document.addEventListener('change',event=>{
 if(event.target?.id!=='vz-consultation-dont-show')return;
 try{if(window.VeloryzPrivacy?.allowed('preferences')&&event.target.checked)localStorage.setItem('veloryz.consultation.no-auto','1');else localStorage.removeItem('veloryz.consultation.no-auto')}catch{}
});
function openBooking(preset=''){
 openModal(`<div class="booking-layout"><div class="booking-aside"><div class="eyebrow">Your next big thing</div><h2 id="dialog-title">Let’s build<br>something<br>worth talking<br>about.</h2><p>A new website, a better experience or a completely new idea. It starts here.</p><div class="booking-info">A conversation, not a commitment.<br>Tell us what you have in mind.<br>Bokaro, India · Working remotely.</div><div class="booking-v" aria-hidden="true">V</div></div><div class="booking-main"><h3>Request a consultation.</h3>${consultationForm(true,preset)}<div class="vz-consultation-preference"><label for="vz-consultation-dont-show"><input id="vz-consultation-dont-show" type="checkbox" ${consultationSuppressed()?'checked':''}> Don’t show this consultation suggestion again on this device</label><p>You can still request a consultation any time from the website.</p></div></div></div>`,'booking-modal');
}
function openReel(){
 openModal(`<video controls autoplay playsinline preload="auto" aria-labelledby="dialog-title"><source src="${esc(studioCMS?.branding?.showreel||'/assets/studio-film.mp4')}">Your browser does not support this video.</video><div class="showreel-caption"><span id="dialog-title">VELORYZ STUDIO / A STUDIO IN MOTION.</span><span>Studio motion film</span></div>`,'showreel-modal');
 const video=$('.modal video');video.play().catch(()=>{});
}
function openCase(id){
 const p=projects.find(p=>p.id===id);if(!p)return;
 openModal(`${p.video?`<div class="case-video"><video controls playsinline poster="${esc(p.cover)}" preload="metadata"><source src="${esc(p.video)}"></video></div>`:projectArt(id)}<div class="case-body"><div class="eyebrow">${esc(p.category)} · ${esc(p.status)}</div><h2 id="dialog-title">${esc(p.name)}</h2><p>${esc(p.description)}</p><p class="case-evidence-note"><strong>Project transparency:</strong> ${esc(p.status||'Status not verified')}. Illustrations and concept demos are not proof of client results. Ask the studio for verified deliverables and availability.</p><div class="case-grid"><div><h3>The focus</h3><ul>${p.scope.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div><div><h3>The approach</h3><p>${esc(p.approach)}</p></div></div><p class="product-note">${esc(p.note)}</p>${p.website?`<a class="button outline" href="${esc(p.website)}" target="_blank" rel="noopener" style="margin-right:10px">Visit project ↗</a>`:''}<button class="button" data-book>Have something in mind? ${arrow}</button></div>`,'case-modal');initVisualMotion();
}
function openLegal(type){
 const route=type==='terms'?'/terms/':'/privacy/';
 navigate(route);
}

document.addEventListener('click',event=>{
 if($('.founder-mailbox.opened')&&!event.target.closest('.founder-mailbox'))toggleMailbox(false,false);
 const el=event.target.closest('a,button,.modal-backdrop');if(!el)return;
 if(el.hasAttribute('data-mailbox')){toggleMailbox();return;}
 if(el.hasAttribute('data-mailbox-close')){toggleMailbox(false);return;}
 if(el.hasAttribute('data-material')){chooseMaterial(el);return;}
 if(el.hasAttribute('data-focus-mode')){setFocusMode(el);return;}
 if(el.hasAttribute('data-focus-start')){toggleFocus();return;}
 if(el.hasAttribute('data-focus-reset')){resetFocus();return;}
 if(el.hasAttribute('data-finish')){chooseFinish(el);return;}
 if(el.hasAttribute('data-demo-add')){addDemoItem(el.dataset.demoAdd);return;}
 if(el.hasAttribute('data-demo-cart')){openDemoCart();return;}
 if(el.hasAttribute('data-cart-remove')){demoCart.splice(Number(el.dataset.cartRemove),1);const count=$('#demo-bag-count');if(count)count.textContent=demoCart.length;closeModal();openDemoCart();return;}
 if(el.hasAttribute('data-campaign-dismiss')){dismissCampaign(el.dataset.campaignDismiss);return;}
 if(el.hasAttribute('data-offer-open')){openOffer(Number(el.dataset.offerOpen)||0);return;}
 if(el.hasAttribute('data-offer-minimize')){document.body.classList.toggle('offer-minimized');return;}
 if(el.matches('.modal-backdrop')&&event.target===el){closeModal();return;}
 if(el.hasAttribute('data-close')){closeModal();return;}
 if(el.hasAttribute('data-book')){openBooking(el.dataset.preset||'');return;}
 if(el.hasAttribute('data-reel')){openReel();return;}
 if(el.hasAttribute('data-case')){openCase(el.dataset.case);return;}
 if(el.hasAttribute('data-legal')){openLegal(el.dataset.legal);return;}
 if(el.hasAttribute('data-service')){
  const item=el.closest('.service-item');const isOpen=item.classList.toggle('open');el.setAttribute('aria-expanded',String(isOpen));$('.service-details',item).inert=!isOpen;return;
 }
 if(el.hasAttribute('data-filter')){
  $$('.filter').forEach(button=>{button.classList.toggle('active',button===el);button.setAttribute('aria-pressed',String(button===el));});
  $$('[data-category]').forEach(card=>{card.hidden=el.dataset.filter!=='all'&&card.dataset.category!==el.dataset.filter;card.style.display=card.hidden?'none':'';});return;
 }
 if(el.matches('.menu-toggle')){
  const open=$('#mobile-nav').classList.toggle('open');el.setAttribute('aria-expanded',String(open));el.setAttribute('aria-label',open?'Close menu':'Open menu');return;
 }
 if(el.tagName==='A'&&!el.target&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){
  const url=new URL(el.href,location.origin);
  if(url.origin===location.origin&&!url.hash&&(routes[normalise(url.pathname)]||/^\/teamjob\/[a-z0-9-]+\/?$/.test(url.pathname)||/^\/docs\/[a-z0-9-]+\/?$/.test(url.pathname))){event.preventDefault();while(modalOpen)closeModal();if(url.search)location.assign(url.href);else navigate(url.pathname);}
 }
});
document.addEventListener('submit',async event=>{
 const form=event.target;if(!form.matches('[data-enquiry]'))return;event.preventDefault();
 if(form.dataset.sending==='true'||form.dataset.sent==='true'||!form.reportValidity())return;
 clearTimeout(popupTimer);clearTimeout(campaignTimer);
 const data=new FormData(form),errorBox=$('.enquiry-error',form),submit=$('[type="submit"]',form),original=submit.innerHTML;
 errorBox.hidden=true;form.dataset.sending='true';form.setAttribute('aria-busy','true');submit.disabled=true;submit.textContent='Sending your request…';
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const payload=Object.fromEntries(data);payload.consent=data.get('consent')==='on';payload.requestId=form.dataset.requestId;
  const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
  let result;try{result=await response.json();}catch{throw new Error('The enquiry service could not respond. Please try again or contact us directly.');}
  if(!response.ok)throw new Error(result.error||'Please try again or contact the studio directly.');
  form.dataset.sent='true';submit.textContent='Request received ✓';
  const preview=$('.book-preview',form);preview.hidden=false;preview.classList.add('visible');
  const message=`Hi VELORYZ Studio! My reference is ${result.reference}. I’m ${data.get('name')}. ${form.dataset.summary||data.get('service')||'Project discussion'}.\n${data.get('message')}`;
  preview.innerHTML=`<h3>Your request is saved.</h3><p>Your request is saved. Keep reference <strong>${esc(result.reference)}</strong>. The studio will contact you at ${esc(data.get('email'))} to confirm the next step.</p><a href="${wa(message)}" target="_blank" rel="noopener">Send to the studio on WhatsApp ↗</a><button type="button" class="text-link" data-enquiry-new>Send another request ↗</button>`;
  if(form.matches('.purchase-form'))location.assign(wa(message));
  preview.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest'});
 }catch(error){errorBox.textContent=error.name==='AbortError'?'The connection timed out. Retry this form safely, or contact the studio directly.':error.message;errorBox.hidden=false;submit.disabled=false;submit.innerHTML=original;errorBox.scrollIntoView({behavior:'instant',block:'nearest'});}
 finally{clearTimeout(timeout);delete form.dataset.sending;form.removeAttribute('aria-busy');}
});
document.addEventListener('click',event=>{const button=event.target.closest('[data-enquiry-new]');if(!button)return;const form=button.closest('form');form.reset();form.dataset.requestId=newRequestId();delete form.dataset.sent;$('.book-preview',form).classList.remove('visible');$('.book-preview',form).innerHTML='';const submit=$('[type="submit"]',form);submit.disabled=false;submit.innerHTML=(form.matches('.purchase-form')?'Save and open WhatsApp ':'Send consultation request ')+arrow;$('[name="name"]',form).focus();});
document.addEventListener('change',event=>{if(event.target.name!=='date'||!event.target.closest('[data-enquiry]'))return;const form=event.target.closest('form'),time=$('[name="time"]',form),local=new Date(Date.now()+330*60000);for(const option of time.options){if(!option.value)continue;const h=Number(option.value.split(':')[0])+(option.value.startsWith('12:')?0:option.value.split(' – ')[0].includes('PM')?12:0);option.disabled=event.target.value===todayInIndia()&&h<=local.getUTCHours();}if(time.selectedOptions[0]?.disabled)time.value='';});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){
  if(modalOpen)closeModal();
  else if($('.founder-mailbox.opened'))toggleMailbox(false);
  const nav=$('#mobile-nav');if(nav?.classList.contains('open')){nav.classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').focus();}
 }
 if(event.key==='Tab'&&modalOpen){
  const modal=$('.modal');const focusables=$$('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),video[controls],[tabindex="0"]',modal).filter(el=>el.offsetParent!==null);
  if(!focusables.length){event.preventDefault();return;}
  const first=focusables[0],last=focusables[focusables.length-1];
  if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===modal)){event.preventDefault();first.focus();}
 }
});
window.addEventListener('popstate',()=>{if(normalise(location.pathname)===currentRoute)return;while(modalOpen)closeModal();renderRoute(location.pathname);});
let ambientObserver;
function observeAmbientFilms(){
 ambientObserver?.disconnect();
 const films=$$('video.ambient-video');
 const allowed=!document.hidden && !reduced.matches && !window.StudioMotion?.onboardingActive;
 if(!allowed || !window.IntersectionObserver){films.forEach(video=>video.pause());return;}
 ambientObserver=new IntersectionObserver(entries=>{
  for(const {target,isIntersecting} of entries){
   if(isIntersecting && !document.hidden && !reduced.matches && !window.StudioMotion?.onboardingActive){
    target.play()?.catch(()=>{});
   }else target.pause();
  }
 });
 films.forEach(video=>ambientObserver.observe(video));
}
document.addEventListener('visibilitychange',observeAmbientFilms);
reduced.addEventListener('change',()=>{resetDepth();initMotion();});


function applyCMS(config,version){
 if(!config?.site)return;
 studioCMS=config;studioVersion=Number(version)||0;
 Object.assign(CONTACT,{phone:config.site.phone,email:config.site.email,display:config.site.phone==='919955326740'?'+91 99553 26740':'+'+config.site.phone,product:config.site.productUrl});
 projects=config.projects.filter(p=>p.published).sort((a,b)=>a.order-b.order);
 services.splice(0,services.length,...config.services);team.splice(0,team.length,...config.team);
 document.documentElement.style.setProperty('--accent',config.site.accent);
 $('link[rel="icon"]').href=config.branding.favicon||'/assets/favicon.svg';
}
function hydrateCMSPage(){
 if(!studioCMS)return;
 $$('.team-card').forEach((card,i)=>{const person=team[i];if(!person)return;const link=document.createElement('a');link.className='team-profile-link';link.href='/teamjob/'+(person.slug||profileSlug(person.name))+'/';link.innerHTML='Explore profile <span aria-hidden="true">↗</span>';card.append(link);if(person.avatar){const art=$('.team-art',card);if(art)art.innerHTML='<img src="'+esc(person.avatar)+'" alt="'+esc(person.name)+'">';}});
 const s=studioCMS.site,b=studioCMS.branding;
 document.title=document.title.replaceAll('VELORYZ',s.name);
 const descriptionMeta=$('meta[name="description"]');if(descriptionMeta)descriptionMeta.content=s.description;
 const lines=value=>esc(value).replace(/\n/g,'<br>');
 const set=(selector,value,html=false)=>{const el=$(selector,$('#main'));if(el){if(html)el.innerHTML=value;else el.textContent=value;}};
 set('.hero h1',`${esc(s.headline)}<br><span class="serif">${esc(s.headlineAccent)}</span>`,true);
 set('.hero-desc',s.description);set('.hero-topline .eyebrow',s.heroEyebrow);
 set('.studio-band .band-layout h2',lines(s.studioTitle),true);
 set('.studio-band .band-layout p',s.studioDescription);
 set('.founder-name h3',s.founderName);set('.founder-name p',s.founderRole);
 const locationLink=$('.contact-channel[href*="google.com/maps"]');if(locationLink){locationLink.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.location);$('strong',locationLink).innerHTML=esc(s.location)+' '+arrow;}
 if($('.founder-content')){
  const paragraphs=$$('.founder-content>p');
  paragraphs.forEach((p,i)=>{if(i===0)p.textContent=s.founderBio;else p.remove();});
 }
 set('.cta-section h2',lines(s.ctaHeadline),true);set('.cta-bottom>p',s.ctaDescription);
 if(b.heroLogo&&$('.hero-art .logo-scene')){const scene=$('.hero-art .logo-scene');scene.removeAttribute('data-logo-scene');scene.setAttribute('aria-label',s.name+' studio emblem');scene.innerHTML=`<img class="logo-fallback" src="${esc(b.heroLogo)}" alt="" width="680" height="620">`;scene.closest('.logo-stage').setAttribute('data-static-logo','');}
 if(b.productLogo&&$('.velori-hero-grid h1'))$('.velori-hero-grid h1').innerHTML=`<img class="product-brand-logo" src="${esc(b.productLogo)}" alt="VELORI">`;
 if($('.hero-meta>div:nth-child(2) span'))$('.hero-meta>div:nth-child(2) span').textContent='02 / FOUNDED BY '+s.founderName.toUpperCase();
 const facts=$$('.mini-facts strong');if(facts[1])facts[1].textContent=String(team.length+1).padStart(2,'0');
 if(currentRoute==='/'&&!projects.filter(p=>p.featured).length&&$('#selected-work .work-grid'))$('.work-grid').innerHTML='<p class="empty-work">New studio work is coming into focus. <a href="/contact/">Tell us about your next idea ↗</a></p>';
}
function liveOffers(){return (studioCMS?.offers||[]).filter(o=>o.enabled&&(!o.startAt||Date.parse(o.startAt)<=Date.now())&&(!o.endAt||Date.parse(o.endAt)>Date.now())).sort((a,b)=>b.priority-a.priority);}
function offerKey(o){return CampaignDesign.signature(o);}
const campaignDismissed=new Set();
let pinResizeObserver=null,pinExpiryTimer=null;
function campaignPlacement(o){return o.placement||'popup';}
function campaignHidden(o){return campaignDismissed.has(offerKey(o))||CampaignDesign.seen(o,'session')==='dismissed';}
function dismissCampaign(id){const o=liveOffers().find(x=>x.id===id);if(!o)return;campaignDismissed.add(offerKey(o));CampaignDesign.remember(o,'session','dismissed');renderOfferDock();}
function popupSeen(o){
 if(displayedOffers.has(offerKey(o)))return true;
 if(o.frequency==='session')return CampaignDesign.seen(o,'session')==='seen';
 if(o.frequency==='day')return CampaignDesign.seen(o,'local')===new Date().toDateString();
 return false;
}
function rememberPopup(o){displayedOffers.add(offerKey(o));if(o.frequency==='session')CampaignDesign.remember(o,'session','seen');if(o.frequency==='day')CampaignDesign.remember(o,'local',new Date().toDateString());}
function currentAds(){
 return liveOffers().filter(o=>campaignPlacement(o)==='slider'&&!campaignHidden(o));
}
function renderAdSlider(step=0){
 const ads=currentAds();
 let bar=$('#ad-slider');
 if(!ads.length){clearTimeout(adTimer);adTimer=0;bar?.remove();adIndex=0;return;}
 if(!bar){
  bar=document.createElement('aside');bar.id='ad-slider';bar.setAttribute('aria-label','Studio advertisements');
  bar.innerHTML='<div class="ad-panel"></div><div class="ad-controls"><button data-ad-step="-1" aria-label="Previous advertisement">‹</button><button data-ad-pause>Pause</button><button data-ad-step="1" aria-label="Next advertisement">›</button></div>';
  $('#header').after(bar);
 }
 const oldId=bar.dataset.id;
 const current=ads.findIndex(o=>o.id===oldId);
 adIndex=((current<0?0:current)+step+ads.length)%ads.length;
 const ad=ads[adIndex], key=offerKey(ad);
 if(bar.dataset.key!==key){
  bar.dataset.id=ad.id;bar.dataset.key=key;bar.dataset.theme=ad.theme||'ivory';
  const panel=$('.ad-panel',bar);
  panel.innerHTML=`<span class="ad-brand">${CampaignDesign.mark(ad,studioCMS.branding.headerLogo)}</span><div class="ad-content"><small>ADVERTISEMENT</small><strong>${esc(ad.title)}</strong></div><button data-ad-detail>Details</button>${ad.buttonUrl?`<a class="ad-cta" href="${esc(ad.buttonUrl)}">${esc(ad.buttonLabel)}</a>`:''}${ad.dismissible!==false?'<button data-ad-dismiss aria-label="Dismiss this advertisement">×</button>':''}`;
  if(!reduced.matches)panel.animate?.([{opacity:.15,transform:'translateX(32px)'},{opacity:1,transform:'none'}],{duration:500,easing:'cubic-bezier(.2,.7,.2,1)'});
 }
 $('.ad-controls',bar).hidden=ads.length<2;
 $('[data-ad-pause]',bar).textContent=adPaused?'Resume':'Pause';
 bar.inert=modalOpen;
 if(!adTimer||step!==0||oldId!==ad.id){
  clearTimeout(adTimer);
  adTimer=setTimeout(()=>{
   adTimer=0;
   const rotate=!adPaused&&!reduced.matches&&!document.hidden&&!modalOpen&&!bar.matches(':hover,:focus-within')&&!document.querySelector('veloryz-frame-cut[data-focus]');
   renderAdSlider(rotate?1:0);
  },1000*(Number(studioCMS.site.adInterval)||8));
 }
}
document.addEventListener('click',event=>{
 const button=event.target.closest('#ad-slider button');if(!button)return;
 const id=button.closest('#ad-slider').dataset.id;
 if(button.hasAttribute('data-ad-step'))renderAdSlider(Number(button.dataset.adStep));
 if(button.hasAttribute('data-ad-pause')){adPaused=!adPaused;renderAdSlider();}
 if(button.hasAttribute('data-ad-dismiss'))dismissCampaign(id);
 if(button.hasAttribute('data-ad-detail')){const index=liveOffers().findIndex(o=>o.id===id);if(index>=0)openOffer(index);}
});

function renderCampaignSurfaces(){
 if(currentRoute==='/create/')return;
 renderAdSlider();
 const offers=liveOffers(),pin=offers.find(o=>campaignPlacement(o)==='pinned'&&!campaignHidden(o));
 let bar=$('#site-pin');
 if(!pin){bar?.remove();pinResizeObserver?.disconnect();document.body.classList.remove('has-site-pin');document.documentElement.style.removeProperty('--site-pin-height');}
 else{
  if(!bar){bar=document.createElement('aside');bar.id='site-pin';bar.setAttribute('aria-label','Pinned studio message');document.body.insertBefore(bar,$('#header'));}
  const key=offerKey(pin);
  if(bar.dataset.campaignKey!==key){
   bar.dataset.campaignKey=key;bar.className='pin-theme-'+(['ivory','dark','gold'].includes(pin.theme)?pin.theme:'ivory');
   const index=offers.findIndex(o=>o.id===pin.id),logo=pin.logo||studioCMS.branding.headerLogo;
   bar.innerHTML=`<div class="site-pin-inner"><a class="pin-brand" href="${esc(pin.logoLink||'/')}" aria-label="${esc(studioCMS.site.name)}">${CampaignDesign.mark(pin,studioCMS.branding.headerLogo)}</a><span class="pin-label"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3 9 9-4 1-3 5-2-2 3-5-1-4ZM8 16l-5 5"/></svg>PINNED</span><div class="pin-copy"><strong>${esc(pin.title)}</strong><span>${esc(pin.body)}</span></div>${pin.buttonUrl&&pin.buttonLabel?`<a class="pin-link" href="${esc(pin.buttonUrl)}"${pin.buttonUrl.startsWith('/')?'':' target="_blank" rel="noopener"'}>${esc(pin.buttonLabel)} ↗</a>`:''}<button class="pin-details" data-offer-open="${index}">Details ↗</button>${pin.dismissible!==false?`<button class="pin-close" data-campaign-dismiss="${esc(pin.id)}" aria-label="Dismiss pinned studio message">×</button>`:''}</div>`;
  }
  bar.inert=modalOpen;document.body.classList.add('has-site-pin');
  const measure=()=>document.documentElement.style.setProperty('--site-pin-height',bar.getBoundingClientRect().height+'px');measure();
  pinResizeObserver?.disconnect();if(typeof ResizeObserver==='function'){pinResizeObserver=new ResizeObserver(measure);pinResizeObserver.observe(bar);}
 }
 const inline=offers.filter(o=>campaignPlacement(o)==='inline'&&!campaignHidden(o));let zone=$('#campaign-inline-zone');
 if(!inline.length){zone?.remove();return;}
 const key=inline.map(offerKey).join('|');if(zone?.dataset.campaignKey===key)return;
 if(!zone){zone=document.createElement('aside');zone.id='campaign-inline-zone';zone.className='container campaign-inline-zone';zone.setAttribute('aria-label','Studio advertisements and announcements');const main=$('#main');main.insertBefore(zone,main.children[1]||null);}
 zone.dataset.campaignKey=key;
 zone.innerHTML=inline.map(o=>`<div class="campaign-inline-item">${CampaignDesign.card(o,{brandLogo:studioCMS.branding.headerLogo})}${o.dismissible!==false?`<button class="campaign-inline-close" data-campaign-dismiss="${esc(o.id)}" aria-label="Dismiss ${esc(o.title)}">×</button>`:''}</div>`).join('');
}
function renderOfferDock(){
 if(currentRoute==='/create/')return;
 renderCampaignSurfaces();
 let dock=$('#offer-dock');const all=liveOffers(),offers=all.filter(o=>campaignPlacement(o)==='popup'&&o.ribbon!==false);
 if(!offers.length){dock?.remove();document.body.classList.remove('has-offer','offer-minimized');return;}
 document.body.classList.add('has-offer');
 if(!dock){dock=document.createElement('aside');dock.id='offer-dock';dock.setAttribute('aria-label','Studio offers and announcements');document.body.append(dock);}
 dock.inert=modalOpen;offerIndex=offerIndex%offers.length;const offer=offers[offerIndex],index=all.findIndex(o=>o.id===offer.id);
 dock.innerHTML=`<button class="offer-mini" data-offer-open="${index}" aria-label="Open studio update"><span aria-hidden="true">↗</span> Studio update ${arrow}</button><div class="offer-dock-content"><span class="offer-dock-symbol">${CampaignDesign.mark(offer,studioCMS.branding.headerLogo)}</span><button class="offer-dock-copy" data-offer-open="${index}"><span>${esc(offer.eyebrow||offer.kind)}</span><strong>${esc(offer.title)}</strong></button><button class="offer-dock-action" data-offer-open="${index}">View details ${arrow}</button><button class="offer-dock-minimize" data-offer-minimize aria-label="Minimize studio update">−</button></div>`;
}
function openOffer(index=0){
 if(currentRoute==='/create/')return;
 const offers=liveOffers();if(!offers.length)return;index=((index%offers.length)+offers.length)%offers.length;
 const o=offers[index];rememberPopup(o);
 openModal(CampaignDesign.card(o,{titleId:'dialog-title',brandLogo:studioCMS.branding.headerLogo})+(offers.length>1?`<nav class="campaign-pagination" aria-label="Other studio updates">${offers.map((item,i)=>`<button class="${i===index?'selected':''}" data-offer-open="${i}" aria-label="Show ${esc(item.title)}">${String(i+1).padStart(2,'0')}</button>`).join('')}</nav>`:''),'campaign-modal');
}
function startVisitorCampaigns(initial=true){
 clearTimeout(campaignTimer);clearInterval(campaignRotation);clearTimeout(popupTimer);clearTimeout(pinExpiryTimer);
 if(currentRoute==='/create/'){
  for(const id of ['offer-dock','site-pin','ad-slider','campaign-inline-zone'])document.getElementById(id)?.remove();
  document.body.classList.remove('has-offer','has-site-pin','offer-minimized');
  document.documentElement.style.removeProperty('--site-pin-height');
  return;
 }
 if(window.StudioMotion?.onboardingActive){
  // A new-session brand intro precedes the required first-visit motion choice.
  // Resume campaigns after whichever gate is currently active, without duplicates.
  const readyEvent=window.VeloryzIntro?.active?'studio:brand-intro-complete':'studio:motion-intro-complete';
  document.addEventListener(readyEvent,()=>startVisitorCampaigns(initial),{once:true});
  renderOfferDock();
  return;
 }
 const offers=liveOffers();const index=offers.findIndex(o=>campaignPlacement(o)==='popup'&&!popupSeen(o));
 if(index>=0){
  const o=offers[index],delay=initial?Math.max(50,(Number(o.delay)||4.7)*1000-performance.now()):250;
  campaignTimer=setTimeout(()=>{if(!modalOpen&&!document.querySelector('veloryz-frame-cut[data-focus]')&&!document.activeElement?.matches('input,select,textarea'))openOffer(index);},delay);
 }else if(initial&&!offers.some(o=>campaignPlacement(o)==='popup')&&studioCMS?.site.consultationEnabled&&!['/book/','/contact/','/create/'].includes(currentRoute)&&!consultationSuppressed()){
  popupTimer=setTimeout(()=>{if(!consultationSuppressed()&&!modalOpen&&!document.querySelector('veloryz-frame-cut[data-focus]')&&!document.activeElement?.matches('input,select,textarea'))openBooking();},studioCMS.site.consultationDelay*1000);
 }
 campaignRotation=setInterval(()=>{if(!document.hidden&&!modalOpen&&!$('#site-pin')?.contains(document.activeElement)&&!$('#offer-dock')?.contains(document.activeElement)){if(!reduced.matches&&!document.body.classList.contains('motion-paused'))offerIndex++;renderOfferDock();}},9000);
 const boundaries=(studioCMS?.offers||[]).filter(o=>o.enabled).flatMap(o=>[o.startAt,o.endAt]).map(x=>Date.parse(x)).filter(x=>Number.isFinite(x)&&x>Date.now());
 if(boundaries.length)pinExpiryTimer=setTimeout(()=>startVisitorCampaigns(false),Math.max(10,Math.min(2147483647,Math.min(...boundaries)-Date.now()+20)));
 renderOfferDock();
}

async function refreshCMS(){
 if(document.hidden||window.STUDIO_STATE?.preview)return;
 try{
  const response=await fetch('/api/site',{cache:'no-store'});if(!response.ok)return;const data=await response.json();
  if(Number(data.version)>studioVersion&&!modalOpen&&!$('[data-enquiry][data-dirty]')&&!document.activeElement?.matches('input,select,textarea')){
   const scroll=window.scrollY;applyCMS(data.state,data.version);
   if(currentRoute==='/create/')document.dispatchEvent(new CustomEvent('veloryz:cms-updated'));
   else renderRoute(currentRoute,false);
   window.scrollTo({top:scroll,behavior:'instant'});
   if(currentRoute!=='/create/')startVisitorCampaigns(false);
  }else if(currentRoute==='/create/')return;
  else if(liveOffers().some(o=>campaignPlacement(o)==='popup'&&!popupSeen(o))&&!modalOpen)startVisitorCampaigns(false);else renderOfferDock();
 }catch{/* The current published view remains available during transient network loss. */}
}

function mailbox(){
 if(studioCMS?.site.mailboxEnabled===false)return '';
 const title=studioCMS?.site.mailboxTitle||'A little note from Aryan.';
 const message=studioCMS?.site.mailboxMessage||'Built with coffee, curiosity and a lot of passion. Thanks for stopping by. — Aryan';
 const paragraphs=message.split(/\n\s*\n/).map((text,i)=>`<p style="--paragraph:${Math.min(i,6)}">${esc(text).replace(/\n/g,'<br>')}</p>`).join('');
 return `<div class="founder-mailbox">
  <button class="mailbox-button" data-mailbox aria-expanded="false" aria-controls="founder-letter" aria-label="Open a personal note from Aryan">
   <span class="mailbox-illustration" aria-hidden="true"><span class="postbox-flag"></span><span class="postbox-shell"><span class="postbox-inside"></span><span class="mailbox-peek"></span><span class="postbox-door"><span class="postbox-slot"></span><span class="postbox-initial">V</span></span></span><span class="postbox-post"></span><span class="mailbox-spark">✧</span></span>
  </button>
  <div class="mailbox-caption"><span>A NOTE FROM THE FOUNDER</span><small>Some coffee. A little chaos. Open me <span aria-hidden="true">↗</span></small></div>
  <article class="founder-letter" id="founder-letter" role="region" aria-labelledby="founder-letter-title" aria-hidden="true" tabindex="-1" hidden inert>
   <button class="letter-close" data-mailbox-close aria-label="Close Aryan’s note">×</button>
   <div class="letter-paper"><div class="letter-topline"><span>FROM ARYAN’S DESK</span><span class="letter-stamp" aria-hidden="true">V</span></div>
   <h3 id="founder-letter-title">${esc(title)}</h3>
   <div class="letter-message">${paragraphs}</div>
   <div class="letter-doodles" aria-hidden="true"><span class="coffee-doodle"><span class="coffee-cup"><i></i><i></i><i></i><b></b></span><small>fuelled by coffee</small></span><span class="letter-404"><span class="letter-loading">future.loading<i></i><i></i><i></i></span><span>present: <b class="error-code">404</b><span class="blink-cursor">_</span></span></span></div>
   <div class="letter-postscript">PASSION NEVER ASKS YOUR AGE <span aria-hidden="true">↗</span></div></div>
  </article>
 </div>`;
}
function toggleMailbox(force,returnFocus=true){
 const root=$('.founder-mailbox');if(!root)return;
 const button=$('.mailbox-button',root),letter=$('.founder-letter',root);
 const open=typeof force==='boolean'?force:button.getAttribute('aria-expanded')!=='true';
 button.setAttribute('aria-expanded',String(open));
 button.setAttribute('aria-label',open?'Close a personal note from Aryan':'Open a personal note from Aryan');
 if(open){
  clearTimeout(popupTimer);letter.hidden=false;letter.inert=false;letter.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>{if(button.getAttribute('aria-expanded')==='true'){root.classList.add('opened');letter.focus({preventScroll:true});}});
 }else{
  if(returnFocus&&letter.contains(document.activeElement))button.focus({preventScroll:true});
  root.classList.remove('opened');letter.inert=true;letter.setAttribute('aria-hidden','true');
  setTimeout(()=>{if(button.getAttribute('aria-expanded')!=='true')letter.hidden=true;},reduced.matches?0:650);
 }
}
function profileSlug(name){return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function allPeople(){
 const s=studioCMS?.site;
 return [{name:s?.founderName||'Aryan Raj Singh',slug:profileSlug(s?.founderName||'Aryan Raj Singh'),initials:'AR',role:s?.founderRole||'Founder · CEO & Executive Manager',description:s?.founderBio||'',specialties:['Creative direction','Digital development','Studio leadership'],experience:[],experienceIsSample:false,avatar:'',projects:projects.filter(p=>p.featured).map(p=>p.id)},...team];
}
function teamDirectoryPage(){return `${intro('The studio collective','People with perspective.<br>Ideas with possibility.','Meet the designers, developers and creative minds behind VELORYZ. Explore each person’s role, specialisations and studio profile.','PEOPLE')}<section class="section container"><div class="people-grid">${allPeople().map((p,i)=>`<a class="people-card reveal" href="/teamjob/${esc(p.slug||profileSlug(p.name))}/"><div class="people-portrait shade-${i%3}">${p.avatar?`<img src="${esc(p.avatar)}" alt="${esc(p.name)}">`:`<span>${esc(p.initials||p.name.slice(0,2))}.</span>`}<i aria-hidden="true"></i><span class="people-arrow" aria-hidden="true">↗</span></div><div class="people-meta"><span class="label">${i===0?'FOUNDER':'STUDIO COLLECTIVE'}</span><h2>${esc(p.name)}</h2><p>${esc(p.role)}</p><div class="tags">${(p.specialties||[]).slice(0,3).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div></div></a>`).join('')}</div></section>${cta()}`;}
function teamProfilePage(slug){
 const p=allPeople().find(p=>(p.slug||profileSlug(p.name))===slug);if(!p)return notFoundPage();
 const work=projects.filter(project=>(p.projects||[]).includes(project.id));
 return `<section class="profile-hero container"><a class="profile-back" href="/teamjob/">← Back to the collective</a><div class="profile-layout"><div class="profile-copy"><div class="eyebrow">VELORYZ / THE PEOPLE</div><h1>${esc(p.name)}</h1><p class="profile-role">${esc(p.role)}</p><p class="profile-bio">${esc(p.description)}</p><div class="tags">${(p.specialties||[]).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><a href="/contact/" class="button" style="margin-top:28px">Build with the studio ${arrow}</a></div><div class="profile-portrait">${p.avatar?`<img src="${esc(p.avatar)}" alt="${esc(p.name)}">`:`<span>${esc(p.initials||p.name.slice(0,2))}.</span><i class="profile-orbit"></i><i class="profile-orbit two"></i>`}<span class="profile-portrait-label">INDEPENDENT MINDS. CONNECTED BY DESIGN.</span></div></div></section>${p.experience?.length?`<section class="section container profile-experience"><div class="section-head reveal"><div><div class="eyebrow">${p.experienceIsSample?'Illustrative experience':'Experience & practice'}</div><h2>A closer look<br>at the practice.</h2></div>${p.experienceIsSample?'<p>Role-aligned sample highlights for this profile. These are illustrative examples, rather than verified employment or client credits.</p>':''}</div><div class="profile-highlights">${p.experience.map((x,i)=>`<article class="profile-highlight reveal"><span>0${i+1} / ${p.experienceIsSample?'SAMPLE PRACTICE':'EXPERIENCE'}</span><h3>${esc(x)}</h3><span class="highlight-arrow" aria-hidden="true">↗</span></article>`).join('')}</div></section>`:''}${work.length?`<section class="section container services-section"><div class="section-head reveal"><div><div class="eyebrow">Studio connections</div><h2>Work in the orbit.</h2></div><p>Selected studio projects and self-initiated concepts associated with this profile.</p></div><div class="work-grid">${work.slice(0,4).map(p=>projectCard(p)).join('')}</div></section>`:''}${cta()}`;
}
function conceptNotice(name){return `<div class="concept-notice container"><span>VELORYZ / SELF-INITIATED CONCEPT</span><span>${name} is a fictional brand. Explore the interactive design.</span><a href="/work/">Back to work ↗</a></div>`;}
function buildingScene(){return `<div class="building-scene render-building" data-depth><div class="depth-plane"><div class="render-drift">${renderPicture('aurel')}</div></div><span class="architecture-light" aria-hidden="true"></span><span class="architecture-material-note" aria-hidden="true">LIGHT / FORM / FEELING</span></div>`;}

function aurelConcept(){return `${conceptNotice('AUREL Atelier')}<section class="aurel-world"><div class="container"><div class="concept-subnav"><strong>AUREL<span>ATELIER</span></strong><a href="#aurel-vision">Our perspective ↘</a><span>SPACES / MATERIALS / FEELING</span></div><div class="aurel-hero"><div class="aurel-heading"><div class="eyebrow">Architecture, as a feeling.</div><h1>Spaces for<br>the way<br>you <em>live.</em></h1><p>A fictional architecture atelier, explored through material, light and a quietly expressive digital experience.</p><a href="#aurel-vision" class="text-link">Explore the vision ↓</a></div>${buildingScene()}</div><div class="aurel-material-bar"><span>EXPLORE A MATERIAL DIRECTION</span><div role="group" aria-label="Choose architectural material"><button class="selected" data-material="stone"><i></i>Warm stone</button><button data-material="clay"><i></i>Terracotta</button><button data-material="chalk"><i></i>Soft chalk</button></div><span class="aurel-material-name">01 / WARM STONE</span></div></div></section><section class="section container" id="aurel-vision"><div class="split-section"><div><div class="eyebrow">A self-initiated studio concept</div><h2 style="font-size:clamp(38px,5vw,70px);letter-spacing:-.055em;line-height:1.05;margin-top:25px">A little less noise.<br>A little more space.</h2></div><div><p style="font-size:17px;line-height:1.8;color:var(--muted)">This exploration pairs a detailed architectural render with an editorial layout. The material selector changes the atmosphere, while slow, continuous motion gives the composition room to breathe.</p><div class="tags"><span class="tag">Art direction</span><span class="tag">Interactive illustration</span><span class="tag">Responsive web design</span></div><button class="button" data-book style="margin-top:28px">Create a website like this ${arrow}</button></div></div></section>`;}
function chooseMaterial(button){const world=$('.aurel-world');if(!world)return;world.dataset.material=button.dataset.material;$$('[data-material]').forEach(b=>b.classList.toggle('selected',b===button));const names={stone:'01 / WARM STONE',clay:'02 / TERRACOTTA',chalk:'03 / SOFT CHALK'};$('.aurel-material-name').textContent=names[button.dataset.material];}
let focusInterval=null,focusSeconds=1500,focusRunning=false;
function orbitConcept(){return `${conceptNotice('ORBIT Workspace')}<section class="orbit-world"><div class="container"><div class="concept-subnav"><strong>ORBIT<span>YOUR IDEAS, ALIGNED.</span></strong><button class="orbit-nav-action" data-focus-start>Try the focus timer ↗</button></div><div class="orbit-concept-hero"><div class="orbit-concept-copy"><div class="eyebrow">A clearer headspace.</div><h1>Less scattered.<br>More <em>in orbit.</em></h1><p>A fictional productivity brand with a real, hands-on interaction demo. Explore a mode. Start a quiet focus session.</p><div class="orbit-modes" role="group" aria-label="Choose a workspace mode"><button class="active" data-focus-mode="focus">Deep focus</button><button data-focus-mode="flow">Creative flow</button><button data-focus-mode="clarity">Quiet clarity</button></div></div>${renderFeature('orbit','orbit-showcase')}</div><div class="orbit-demo" data-mode="focus"><div class="orbit-demo-copy"><span class="orbit-demo-label">INTERACTIVE CONCEPT / FOCUS TOOL</span><h2 id="focus-mode-title">A little room for deep work.</h2><p id="focus-mode-description">One task. A clear timer. Give your next idea your full attention.</p><div class="orbit-demo-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="focus-timer"><span class="focus-timer-label">YOUR NEXT FOCUSED MOMENT</span><strong id="focus-clock">${String(Math.floor(focusSeconds/60)).padStart(2,'0')}:${String(focusSeconds%60).padStart(2,'0')}</strong><div><button data-focus-start>${focusRunning?'Pause session':'Start session'} ▶</button><button data-focus-reset aria-label="Reset focus timer">↻</button></div><small>This demo runs on this page. No account or tracking.</small></div></div><div class="orbit-concept-footer"><span>DESIGN EXPLORATION BY VELORYZ</span><button data-book>Build your next product with us ↗</button></div></div></section>`;}
function setFocusMode(button){const modes={focus:['A little room for deep work.','One task. A clear timer. Give your next idea your full attention.'],flow:['Let your next idea find its rhythm.','A playful change of perspective for the work that needs room to wander.'],clarity:['Clear the noise. Keep the essentials.','A calmer workspace direction, with fewer distractions and a little more breathing room.']};const mode=button.dataset.focusMode;$$('[data-focus-mode]').forEach(b=>b.classList.toggle('active',b===button));$('.orbit-demo').dataset.mode=mode;$('.orbit-world').dataset.mode=mode;$('#focus-mode-title').textContent=modes[mode][0];$('#focus-mode-description').textContent=modes[mode][1];}
function updateFocus(){const clock=$('#focus-clock');if(!clock){clearInterval(focusInterval);focusInterval=null;focusRunning=false;return;}clock.textContent=String(Math.floor(focusSeconds/60)).padStart(2,'0')+':'+String(focusSeconds%60).padStart(2,'0');$$('[data-focus-start]').forEach(b=>{if(!b.classList.contains('orbit-nav-action'))b.textContent=focusRunning?'Pause session Ⅱ':'Start session ▶';});}
function toggleFocus(){if(!$('#focus-clock'))return;focusRunning=!focusRunning;if(focusRunning){if(focusSeconds<=0)focusSeconds=1500;clearInterval(focusInterval);focusInterval=setInterval(()=>{if(!$('#focus-clock')){clearInterval(focusInterval);focusRunning=false;return;}focusSeconds=Math.max(0,focusSeconds-1);if(!focusSeconds){focusRunning=false;clearInterval(focusInterval);showToast('A focused moment, well spent. Time for a little break.');}updateFocus();},1000);}else clearInterval(focusInterval);updateFocus();}
function resetFocus(){clearInterval(focusInterval);focusRunning=false;focusSeconds=1500;updateFocus();}
const demoObjects=[{id:'vase',name:'The Arc Vase',type:'Sculptural ceramic',price:2600},{id:'lamp',name:'The Halo Lamp',type:'Soft, considered light',price:4800},{id:'chair',name:'The Loop Chair',type:'A quieter kind of form',price:12900}];
let demoFinish='Sand',demoCart=[];
function objectArt(type){return `<div class="object-scene object-${type} rendered-object" data-depth><div class="depth-plane"><div class="render-drift">${renderPicture(type)}</div></div><span class="object-finish-glaze" aria-hidden="true"></span></div>`;}

function formeConcept(){return `${conceptNotice('FORME Objects')}<section class="forme-world"><div class="container"><div class="concept-subnav"><strong>FORME<span>THOUGHTFUL OBJECTS.</span></strong><button class="forme-bag" data-demo-cart>Demo bag <span id="demo-bag-count">${demoCart.length}</span> ↗</button></div><div class="forme-hero"><div><div class="eyebrow">A collection of quieter things.</div><h1>Objects with<br><em>intention.</em></h1><p>A fictional objects store. Explore the finishes and add a little form to the demo bag.</p><a href="#forme-collection" class="text-link">Explore the collection ↓</a></div><div class="forme-hero-sculpture">${renderFeature('forme','forme-collection-render')}<span class="forme-hero-caption">A COLLECTION / A STUDY IN FORM</span></div></div><div class="forme-finishes"><span>CHOOSE A FINISH</span><div role="group" aria-label="Choose product finish"><button class="selected" data-finish="Sand"><i></i>Sand</button><button data-finish="Terracotta"><i></i>Terracotta</button><button data-finish="Olive"><i></i>Olive</button></div><span>DESIGNED TO BE CONSIDERED.</span></div><div class="forme-collection" id="forme-collection">${demoObjects.map(p=>`<article class="forme-product">${objectArt(p.id)}<div class="forme-product-info"><div><h2>${p.name}</h2><p>${p.type}</p></div><span>₹${p.price.toLocaleString('en-IN')}</span></div><button data-demo-add="${p.id}">Add to demo bag ${arrow}</button></article>`).join('')}</div><p class="forme-demo-note">Fictional products and illustrative prices. This is a studio design concept; no orders or payments are taken.</p></div></section>`;}
function chooseFinish(button){demoFinish=button.dataset.finish;$('.forme-world').dataset.finish=demoFinish.toLowerCase();$$('[data-finish]').forEach(b=>b.classList.toggle('selected',b===button));}
function addDemoItem(id){const p=demoObjects.find(p=>p.id===id);if(!p)return;demoCart.push({...p,finish:demoFinish});const count=$('#demo-bag-count');if(count)count.textContent=demoCart.length;showToast(p.name+' added to the demo bag.');}
function openDemoCart(){openModal(`<div class="demo-cart"><div class="eyebrow">FORME / INTERACTIVE STUDIO CONCEPT</div><h2 id="dialog-title">A little form,<br>in your demo bag.</h2>${demoCart.length?`<div class="demo-cart-items">${demoCart.map((p,i)=>`<div class="demo-cart-row"><span>${esc(p.name)}<small>${esc(p.finish)} finish</small></span><strong>₹${p.price.toLocaleString('en-IN')}</strong><button data-cart-remove="${i}" aria-label="Remove ${esc(p.name)}">×</button></div>`).join('')}</div><div class="demo-cart-total"><span>Illustrative total</span><strong>₹${demoCart.reduce((sum,p)=>sum+p.price,0).toLocaleString('en-IN')}</strong></div>`:'<p>Your demo bag is empty. Explore the collection and choose an object to try the interaction.</p>'}<p class="demo-cart-note">This is a fictional storefront demo. No purchase, reservation or payment is made.</p><button class="button" data-book>Create a commerce site with us ${arrow}</button></div>`,'demo-cart-modal');}

if(window.STUDIO_STATE)applyCMS(window.STUDIO_STATE.state,window.STUDIO_STATE.version);
renderRoute(window.STUDIO_PREVIEW_ROUTE||(window.STUDIO_STATE?.preview?'/':location.pathname),false);
startVisitorCampaigns();
setInterval(refreshCMS,12000);
window.addEventListener('storage', event=>{
 if(event.key==='veloryz.publication')refreshCMS();
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCMS();});
document.addEventListener('input',event=>{
 if(event.target.matches('[data-type-spacing]'))event.target.closest('.type-study').style.setProperty('--tracking',(event.target.value/400-.12)+'em');
});
window.addEventListener('focus',refreshCMS);

// Shared motion stays attached to the document as public routes change.
function initVisualMotion(){
 visualObserver?.disconnect();resetDepth();
 $$('[data-depth]').forEach(el=>el.classList.add('visual-in-view'));
}
function resetDepth(){
 cancelAnimationFrame(depthFrame);depthFrame=0;
 if(depthTarget){['--studio-rx','--studio-ry','--studio-shine-x','--studio-shine-y'].forEach(key=>depthTarget.style.removeProperty(key));depthTarget=null;}
}
document.addEventListener('pointermove',event=>{
 if(!depthPointer.matches||reduced.matches||document.body.classList.contains('motion-paused'))return;
 const art=event.target.closest('[data-depth]');if(!art){resetDepth();return;}
 if(depthTarget!==art){resetDepth();depthTarget=art;}
 const clientX=event.clientX,clientY=event.clientY;
 cancelAnimationFrame(depthFrame);
 depthFrame=requestAnimationFrame(()=>{
  if(!art.isConnected)return;
  const rect=art.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const x=Math.max(0,Math.min(1,(clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(clientY-rect.top)/rect.height));
  art.style.setProperty('--studio-rx',((.5-y)*4).toFixed(2)+'deg');art.style.setProperty('--studio-ry',((x-.5)*5).toFixed(2)+'deg');
  art.style.setProperty('--studio-shine-x',Math.round(x*100)+'%');art.style.setProperty('--studio-shine-y',Math.round(y*100)+'%');
 });
},{passive:true});
document.addEventListener('pointerout',event=>{if(depthTarget&&!depthTarget.contains(event.relatedTarget))resetDepth();},{passive:true});
document.addEventListener('input',event=>{const form=event.target.closest('[data-enquiry]');if(form){form.dataset.dirty='true';clearTimeout(popupTimer);clearTimeout(campaignTimer);}});
