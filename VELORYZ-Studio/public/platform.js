'use strict';
// Shared platform pages. Editorial previews retain their original creator credits.
const VeloryzPlanner=window.VeloryzPlanner;
function savedPlanner(){try{return VeloryzPlanner.restore(sessionStorage.getItem('veloryz.planner.v1'));}catch{return VeloryzPlanner.normalize();}}
let designCategory='All',designQuery='',projectBrief=savedPlanner(),chosenDesign=null;
let adviserIndex=0,chatMessages=[],chatBusy=false,chatAgent='',chatSession=0;
// Conversations are kept only while this page is open, separately for each AI persona.
let visitorFirstName='',nameRequired=false;
const introducedTo=new Set();
const chatHistories=Object.create(null);
const chatHeat=Object.create(null);
const chatToneReady=import('/chat-tone.mjs?v=20261121-spicy-v4');
const advisers=[
 {id:'happy',name:'Happy',role:'First contact · Bold & friendly',color:'#eab04d'},
 {id:'nikhil',name:'Nikhil',role:'Senior intelligence · Strategy',color:'#56adbd'},
 {id:'milky',name:'Milky',role:'Creative director · Visuals',color:'#e58bb6'},
 {id:'ritik',name:'Ritik',role:'Technical specialist · Engineering',color:'#68a0eb'},
 {id:'aryan',name:'ARYAN',role:'Executive escalation · Final review',color:'#9462da'},
 {id:'madherchod',name:'Madherchod AI',role:'Brutally frank · Reality check',color:'#d77748'}
];
const adviserIntros={
 happy:'Happy here. I’ll help you get moving—tell me what you need. ⚡',
 nikhil:'Nikhil. Give me the objective and constraints. We’ll find the sharpest solution.',
 milky:'Hi, I’m Milky ✨. Let’s make something extraordinary.',
 ritik:'Ritik here. Describe the technical problem and I’ll get straight to the point.',
 aryan:'ARYAN. Final review. Bring your hardest problem and let’s get serious. ⚡',
 madherchod:'Madherchod AI here. Give me your idea and I will tell you the good, the bad, and what to fix. ⚡'
};
const STUDIO_HELP_ROUTES={
 '/':'Home','/work/':'Our work','/design/':'Design library','/services/':'Services','/studio/':'The studio','/teamjob/':'Our team',
 '/pricing/':'Starting prices','/create/':'Project planner','/book/':'Book a conversation','/contact/':'Contact studio',
 '/process/':'Our process','/journey/':'Project journey','/developers/':'Development & APIs','/payments/':'Payment information',
 '/motion/':'Motion lab','/velori/':'VELORI','/veloryz/':'Studio platform'
};
const PAGE_AI_HELP={
 '/': ['Find your next direction.','Explore how our studio could turn your idea into a real digital product.','How can VELORYZ help me with my idea?','/services/'],
 '/work/':['See the possibilities.','Ask about a style, project category or similar work for your brief.','Show me what kind of project is right for me','/create/'],
 '/design/':['Choose with confidence.','Get an explanation of styles, scopes and practical customization.','Help me choose a design direction','/create/'],
 '/pricing/':['Understand your investment.','Review what affects cost before requesting a written proposal.','What will my website cost?','/create/'],
 '/create/':['Shape a stronger brief.','Turn your ideas into features, milestones and a realistic project scope.','Help me define my project requirements','/book/'],
 '/book/':['Prepare a great conversation.','Understand the process before submitting your preferred time.','What should I prepare for the discovery call?','/contact/'],
 '/services/':['Find the right expertise.','Match your needs to our services without guesswork.','Which VELORYZ service suits my project?','/create/'],
 '/developers/':['Get technical clarity.','Discuss integrations, data design, APIs and deployment.','How should I plan my app backend?','/create/'],
 '/payments/':['Understand the next milestone.','Get guidance on the published payment process.','How do project payments work?','/contact/'],
 '/teamjob/':['Meet the thinking behind the work.','Ask about studio roles and who handles which kind of project.','Who should I talk to about my project?','/contact/']
};
const helpForPage=()=>PAGE_AI_HELP[currentRoute]||['Need a hand?','Get page-aware guidance from the VELORYZ AI team.','Help me understand this page','/contact/'];
const validSiteLink=url=>typeof url==='string'&&Object.hasOwn(STUDIO_HELP_ROUTES,url);
const money=value=>'₹'+Number(value).toLocaleString('en-IN');
function catalogue(){return (studioCMS?.catalogue||[]).filter(d=>d.enabled);}
function avatar(a,small=false){return `<span class="expert-avatar ${small?'small':''} expert-avatar-${a.id}" style="--avatar-tone:${a.color}" aria-hidden="true">${a.id==='madherchod'?'<b class="vz-agent-flash">⚡</b>':`<img src="/assets/ai-avatars/${a.id}.webp" alt="" width="80" height="80" decoding="async">`}<i></i></span>`;}

function platformIntro(kicker,title,description,number){return `<section class="platform-intro container"><div class="eyebrow">${kicker}</div><div class="platform-title-line"><h1>${title}</h1>${motionGlyph()}</div><p>${description}</p></section>`;}
function designCard(d,i){return `<article class="design-card reveal" data-design-category="${esc(d.category)}" data-design-name="${esc((d.name+' '+d.category+' '+d.description).toLowerCase())}"><button class="design-preview" data-design-preview="${esc(d.id)}" aria-label="Preview ${esc(d.name)}"><div class="browser-rail"><i></i><i></i><i></i><span>${esc(d.category.toUpperCase())} / INTERFACE REFERENCE</span><b>↗</b></div><div class="design-image-wrap"><img src="${esc(d.image)}" alt="${esc(d.name)} — imported ${esc(d.category)} website interface preview" width="1280" height="727" loading="${i<2?'eager':'lazy'}" decoding="async"></div><span class="design-preview-label">Explore direction <span>↗</span></span></button><div class="design-card-body"><div class="design-meta"><span>${esc(d.category)}</span><span>${esc(d.timeline)}</span></div><h2>${esc(d.name)}</h2><p>${esc(d.description)}</p><div class="design-card-bottom"><span>Adaptation from <strong>${money(d.price)}</strong></span><button class="shop-request" data-design-purchase="${esc(d.id)}" aria-label="Request ${esc(d.name)}">Request design ↗</button></div>${d.source?`<a class="source-credit" href="${esc(d.source)}" target="_blank" rel="noopener">Reference by ${esc(d.author)} · source ↗</a>`:''}</div></article>`;}
function designPage(){
 // The active Design page is the original VELORYZ working-template storefront.
 // Historic licensed third-party inspiration is not repackaged or offered for resale.
 return window.VeloryzTemplateStore?.render()||
   '<section class="container vz-store-loading"><h1>Designs are loading.</h1><p>Explore original VELORYZ template showcases or <a href="/contact/">contact the studio</a>.</p></section>';
}
function filterDesigns(){let visible=0;$$('[data-design-category]').forEach(c=>{c.hidden=(designCategory!=='All'&&c.dataset.designCategory!==designCategory)||!c.dataset.designName.includes(designQuery);if(!c.hidden)visible++;});const empty=$('.catalogue-empty');if(empty)empty.hidden=visible>0;}
function openDesign(id){const d=catalogue().find(d=>d.id===id);if(!d)return;openModal(`<div class="design-detail"><div class="design-detail-art"><img src="${esc(d.image)}" alt="${esc(d.name)} interface preview"></div><div class="design-detail-copy"><div class="eyebrow">${esc(d.category)} / CURATED REFERENCE</div><h2 id="dialog-title">${esc(d.name)}</h2><p>${esc(d.description)}</p><div class="design-detail-price"><strong>${money(d.price)}</strong><span>starting estimate · ${esc(d.timeline)}</span></div><ul>${d.scope.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="button" data-design-purchase="${esc(d.id)}">Request design ↗</button> <button class="text-link" data-design-select="${esc(d.id)}">Customise in planner ↗</button>${d.demo?`<a class="text-link" href="${esc(d.demo)}" target="_blank" rel="noopener">Open original demo ↗</a>`:''}<div class="design-license">${d.source?`<a href="${esc(d.source)}" target="_blank" rel="noopener">Source: ${esc(d.author)} ↗</a>`:''}<p>${esc(d.license)}</p><p>Adaptation service estimate. Final scope, assets, provider costs and licenses are agreed before work begins.</p></div></div></div>`,'design-detail-modal');}
function selectDesign(id){const d=catalogue().find(d=>d.id===id);if(!d)return;chosenDesign=d;projectBrief.purpose=d.category;projectBrief.referenceId=d.id;while(modalOpen)closeModal();navigate('/create/');}
function plannerEstimate(){return VeloryzPlanner.estimate(projectBrief,chosenDesign,catalogue());}
function briefEstimate(){return plannerEstimate().low;}
function briefText(){return VeloryzPlanner.format(projectBrief,chosenDesign,catalogue());}

const projectStarters=[
 {id:'business',num:'01',name:'Business website',subtitle:'Show your services and turn visits into enquiries',details:'4 pages · Editable content',purpose:'Portfolio',pages:'4',features:['Content management'],goal:'Create a clear website explaining our services and making it easy for visitors to get in touch.'},
 {id:'store',num:'02',name:'Online store',subtitle:'Make shopping straightforward and memorable',details:'6 pages · Payments · Content editing',purpose:'Ecommerce',pages:'6',features:['Payment integration','Content management'],goal:'Create an online store where visitors can explore our products and confidently complete a purchase.'},
 {id:'portfolio',num:'03',name:'Creative portfolio',subtitle:'Give your projects a memorable home',details:'4 pages · Motion direction',purpose:'Portfolio',pages:'4',features:['Motion direction'],goal:'Present selected projects beautifully, explain our creative approach and invite collaboration enquiries.'},
 {id:'platform',num:'04',name:'Web app / platform',subtitle:'Plan user journeys and digital workflows',details:'8 screens · Accounts · CMS',purpose:'SaaS / platform',pages:'8',features:['Member accounts','Content management'],goal:'Plan a web platform with user accounts, clear core journeys and an interface designed for everyday use.'}
];
function projectStarterCards(){return `<section class="planner-starters" aria-labelledby="planner-starters-title"><div class="planner-starters-heading"><div><span class="eyebrow">START SIMPLE / MAKE IT YOURS</span><h2 id="planner-starters-title">Pick a starting point.<br><em>Make it your own.</em></h2></div><p>Choose a quick-start project. We’ll fill in a draft for you, and you can change every detail before sending a request.</p></div><div class="planner-starter-grid">${projectStarters.map(t=>`<button class="planner-starter" type="button" data-planner-template="${t.id}" aria-label="Use ${esc(t.name)} starter"><span class="planner-starter-num">${t.num} / STARTER</span><strong>${esc(t.name)}</strong><span class="planner-starter-subtitle">${esc(t.subtitle)}</span><small>${esc(t.details)}</small><span class="planner-starter-action">Use this starter <b aria-hidden="true">↗</b></span></button>`).join('')}</div><p class="planner-starters-note">Want to start from scratch? Follow the <strong>Direction → Scope → Review</strong> steps below. These are illustrative starting points, not fixed-price packages.</p></section>`;}

function createPage(){
 projectBrief=VeloryzPlanner.normalize(projectBrief);
 chosenDesign=catalogue().find(d=>d.id===projectBrief.referenceId)||chosenDesign;
 const options=[...new Set([...VeloryzPlanner.purposes,projectBrief.purpose])];
 return `${platformIntro('Create with VELORYZ / a guided project brief','A clear idea.<br><em>A considered beginning.</em>','Three small steps to shape your project. Explore an illustrative planning range, review the assumptions, then send your brief with a consultation request.','PLAN')}<section class="container guided-planner"><form id="guided-project-planner" novalidate>${projectStarterCards()}<nav class="planner-step-nav" aria-label="Project planner steps">${['Direction','Scope','Review'].map((name,i)=>`<button type="button" data-planner-go="${i}" aria-current="${i===0?'step':'false'}"><span>0${i+1}</span>${name}<i aria-hidden="true">✓</i></button>`).join('')}</nav><div class="planner-progress" aria-hidden="true"><span></span></div><div class="planner-step-status" role="status" aria-live="polite">Step 1 of 3 · Direction</div><fieldset data-planner-panel="0"><legend class="sr-only">Step 1: project direction</legend><div class="guided-step-heading"><span class="eyebrow">01 / THE STARTING POINT</span><h2 tabindex="-1" data-planner-heading>What are we<br>creating together?</h2><p>Choose a direction below, or use one of the ready-made starters above. You can change everything later.</p></div><div class="purpose-grid">${options.map((p,i)=>`<button type="button" class="purpose-card ${projectBrief.purpose===p?'selected':''}" data-purpose="${esc(p)}" aria-pressed="${projectBrief.purpose===p}"><span aria-hidden="true">${['◌','▧','✳','≡','⌘','↗'][i]||'↗'}</span><strong>${esc(p)}</strong><small>${['A home for your work','A place for your products','A world for your community','Stories worth sharing','A useful digital product','Let’s find the right shape'][i]||'Your selected direction'}</small></button>`).join('')}</div><div class="guided-page-control"><label for="planner-pages">How many core pages?</label><select id="planner-pages" data-brief-pages>${VeloryzPlanner.pages.map(n=>`<option value="${n}" ${projectBrief.pages===String(n)?'selected':''}>${n} ${n===1?'page':'pages'}</option>`).join('')}</select><p>Think of distinct pages or major screens. Complex applications need a separate scope review.</p></div></fieldset><fieldset data-planner-panel="1" hidden><legend class="sr-only">Step 2: scope and preparation</legend><div class="guided-step-heading"><span class="eyebrow">02 / MAKE ROOM FOR WHAT MATTERS</span><h2 tabindex="-1" data-planner-heading>Choose the essentials.<br>Leave room to evolve.</h2><p>These options create planning allowances. They do not promise a complete integration at a fixed price.</p></div><div class="brief-features">${VeloryzPlanner.features.map(f=>`<label><input type="checkbox" data-brief-feature="${esc(f)}" ${projectBrief.features.includes(f)?'checked':''}><span>${esc(f)}</span><small>Planning allowance · ₹2,500</small></label>`).join('')}</div><div class="guided-assets"><h3>What do you already have?</h3><p>This helps us understand preparation. It does not change the estimate.</p><div>${VeloryzPlanner.assets.map(a=>`<label><input type="checkbox" data-planner-asset="${esc(a)}" ${projectBrief.assets.includes(a)?'checked':''}><span>${esc(a)}</span></label>`).join('')}</div></div><label class="guided-timeline" for="planner-timeline">Preferred launch window<select id="planner-timeline" data-brief-timeline>${VeloryzPlanner.timelines.map(t=>`<option ${projectBrief.timeline===t?'selected':''}>${t}</option>`).join('')}</select></label><p class="planner-small">Your timing is a preference, subject to the studio’s availability and the final scope.</p></fieldset><fieldset data-planner-panel="2" hidden><legend class="sr-only">Step 3: review your project</legend><div class="guided-step-heading"><span class="eyebrow">03 / BEFORE THE CONVERSATION</span><h2 tabindex="-1" data-planner-heading>Make the goal clear.<br>We’ll shape the next step.</h2><p>Review your choices and tell us what success looks like. Any starter example is fully editable.</p></div><div class="guided-review" data-planner-review-copy>${plannerReview()}</div><label class="guided-goal" for="planner-goal">What should this project help you achieve?<textarea id="planner-goal" rows="5" minlength="10" maxlength="1000" data-planner-goal aria-describedby="planner-goal-help planner-goal-error" placeholder="Tell us about your audience, the problem to solve and the action visitors should take.">${esc(projectBrief.goal)}</textarea></label><div class="goal-counter"><span id="planner-goal-help">10–1,000 characters · please avoid sensitive details</span><output for="planner-goal" data-goal-count>${projectBrief.goal.length}/1000</output></div><p id="planner-goal-error" class="guided-error" role="alert" hidden></p><div class="planner-contact-block"><div class="planner-contact-icon" aria-hidden="true">✉</div><div class="planner-contact-description"><strong>Where should we send your client invitation?</strong><p>Enter your email now. Once the studio approves your project and opens your private workspace, this address will be used for your invitation. No invitation is issued automatically when you submit a brief.</p></div><label for="planner-contact-email">Your email address <span aria-hidden="true">*</span><input type="email" id="planner-contact-email" name="client_email" data-planner-contact-email required maxlength="180" autocomplete="email" placeholder="you@company.com"></label><p id="planner-contact-error" class="guided-error" role="alert" hidden></p></div><div class="guided-next-note"><span aria-hidden="true">↗</span><p>Next, choose a consultation time and review your contact details. Your brief is sent only when you submit that request.</p></div></fieldset><div class="guided-actions"><button class="motion-secondary" type="button" data-planner-back disabled>← Back</button><button class="button" type="button" data-planner-next>Continue ${arrow}</button><button class="button" type="submit" data-planner-submit hidden>Review request ${arrow}</button></div><p class="guided-local-note"><span data-planner-save-status>Planning choices stay in this browser tab.</span> <button type="button" data-planner-clear>Clear draft</button></p></form><aside class="guided-summary"><div class="eyebrow">YOUR PROJECT / IN FOCUS</div><img src="/assets/brand/veloryz-mark.svg" alt="" width="70" height="70"><h2>A starting point.<br>Not a final quote.</h2><div id="brief-live">${briefSummary()}</div><button type="button" class="button" data-planner-go="2">Review my brief ${arrow}</button><button type="button" class="text-link" data-brief-download>Download my brief ↓</button><button type="button" class="text-link" data-proposal-draft>Download proposal outline ↓</button><details class="estimate-assumptions"><summary>How this range is calculated</summary><p>The base uses your selected design reference or a matching published catalogue price. If neither exists, the illustrative base is ₹17,999.</p><ul><li>Up to four core pages in the base.</li><li>₹1,500 for each additional page.</li><li>₹2,500 allowance per selected feature.</li><li>The upper end adds a rounded 25% scope contingency.</li></ul><p>Hosting, licenses, provider subscriptions and taxes are excluded. Complex commerce, accounts, AI and platform workflows need a separate estimate.</p></details></aside></section>`;
}
function plannerReview(){return `<div><span>Direction</span><strong>${esc(projectBrief.purpose)}</strong></div><div><span>Pages</span><strong>${esc(projectBrief.pages)}</strong></div><div><span>Features</span><strong>${esc(projectBrief.features.join(', ')||'Core website')}</strong></div><div><span>Materials ready</span><strong>${esc((projectBrief.assets||[]).join(', ')||'To discuss')}</strong></div><div><span>Timeline preference</span><strong>${esc(projectBrief.timeline)}</strong></div>`;}

function briefSummary(){const e=plannerEstimate();return `<div class="summary-lines"><div><span>Direction</span><strong>${esc(projectBrief.purpose)}</strong></div><div><span>Core pages</span><strong>${esc(projectBrief.pages)}</strong></div><div><span>Selected features</span><strong>${projectBrief.features.length}</strong></div>${chosenDesign?`<div><span>Design reference</span><strong>${esc(chosenDesign.name)}</strong></div>`:''}</div><div class="summary-estimate" role="status" aria-live="polite"><span>Illustrative planning range</span><strong>${money(e.low)}<span>– ${money(e.high)}</span></strong><small>Final scope and quote after studio review.</small></div>`;}
function updateBrief(){clearTimeout(popupTimer);clearTimeout(campaignTimer);const el=$('#brief-live');if(el)el.innerHTML=briefSummary();document.dispatchEvent(new CustomEvent('studio:brief'));}
function bookingPage(){const s=studioCMS?.site;return `${platformIntro('Book a conversation / discovery call','The first step<br>is a <em>conversation.</em>',esc(s?.bookingDescription||''),'08')}<section class="container booking-page-grid"><aside><div class="call-card glass-panel"><span class="call-icon" aria-hidden="true">↗</span><div class="eyebrow">DISCOVERY / 30 MINUTES</div><h2>Bring your idea.<br>We’ll bring perspective.</h2><p>A focused introduction with the studio to discuss your goals, references and the next useful step.</p><ul><li>Understand your audience and goals</li><li>Explore the right design direction</li><li>Talk through scope and starting costs</li><li>Agree the next step, without pressure</li></ul><div class="booking-facts"><span>Online / remote</span><span>Complimentary</span><span>Times in IST</span></div><p class="planner-small">Choose a preferred time in the form. Your request reaches the studio inbox; an appointment is confirmed only after the studio responds.</p></div><button class="expert-inline" data-expert>${avatar(advisers[adviserIndex],true)}<span>Need a little clarity first?<strong>Ask ${advisers[adviserIndex].name} ↗</strong></span><small>AI adviser</small></button></aside><div class="booking-page-form"><div class="eyebrow">TELL US A LITTLE ABOUT IT</div><h2>Let’s find your starting point.</h2>${consultationForm()}</div></section>`;}
function pricingPage(){return `${platformIntro('A clear starting point / pricing','Thoughtful work.<br><em>Clear expectations.</em>','Choose a starting direction, then agree a written scope. All estimates are in INR and depend on your content, integrations and delivery needs.','09')}<section class="container price-grid">${catalogue().map((d,i)=>`<article class="price-card reveal ${i===1?'featured':''}"><div class="eyebrow">${esc(d.category)}</div><h2>${esc(d.name.split(' / ')[0])}</h2><span class="price-from">Adaptation & development from</span><strong class="price-number">${money(d.price)}</strong><span class="price-timeline">Typical planning window: ${esc(d.timeline)}</span><ul>${d.scope.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="button ${i===1?'':'outline'}" data-design-select="${esc(d.id)}">Plan this project ↗</button></article>`).join('')}</section><section class="container pricing-details"><div class="section-head"><div><div class="eyebrow">BEFORE THE FIRST PIXEL</div><h2>Everything,<br>in the open.</h2></div><p>Our proposal sets the scope, milestones, review rounds, delivery window and payment schedule before a project begins.</p></div><div class="platform-info-grid">${[['Design only','Need interface design rather than development? Request a scoped quote for user flows, wireframes, high-fidelity layouts and an organised Figma handover.'],['Provider costs','Domain, hosting, paid assets, payment-provider fees, AI usage, app subscriptions and taxes where applicable are identified separately.'],['Milestone payments','We agree payment milestones in your proposal. Connect with the studio to discuss your project reference and milestone.'],['Scope & support','Extra pages, review rounds, complex backend work and ongoing maintenance are quoted separately. Support and handover are agreed in writing.']].map(([h,p])=>`<article><span>↗</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</div><a class="button" href="/book/">Request a scoped proposal ↗</a></section>${expertSection()}`;}
function expertSection(){return `<section class="container expert-section"><div><div class="eyebrow">A LITTLE GUIDANCE GOES A LONG WAY</div><h2>Not sure where<br>to <em>begin?</em></h2><p>Start with Happy for everyday help, Nikhil for hard analysis, Milky for creative ideas or Ritik for technology. ARYAN takes the final high-stakes review.</p></div><div class="expert-lineup">${advisers.map(a=>`<button class="expert-person" data-expert="${a.id}">${avatar(a)}<strong>${a.name}</strong><span>${a.role}</span><small>${a.id==='aryan'?'Executive escalation ↗':'Ask this specialist ↗'}</small></button>`).join('')}</div></section>`;}
function developersPage(){return `${platformIntro('VELORYZ / integrations & API','Useful connections.<br><em>Solid foundations.</em>',esc(studioCMS?.site.apiDescription||''),'10')}<section class="container developers-layout"><aside class="api-sidebar"><span class="eyebrow">ON THIS PAGE</span><a href="#api-overview">Overview</a><a href="#api-endpoints">Website endpoints</a><a href="#api-security">Security & scope</a><a href="/book/">Discuss an integration ↗</a></aside><div class="developer-content"><article id="api-overview"><span class="eyebrow">INTEGRATIONS / BUILT AROUND THE WORK</span><h2>Connect the right pieces.</h2><p>From a contact form to a content platform, we define how information moves, who can access it and what happens when a service is unavailable. Every integration starts with an agreed purpose and provider access.</p><div class="api-capabilities"><span>Content & CMS</span><span>Forms & booking</span><span>Payment discussions</span><span>AI guidance</span><span>Business workflows</span></div></article><article id="api-endpoints"><span class="eyebrow">THIS WEBSITE / READ-ONLY EXAMPLES</span><h2>A small, practical API.</h2><p>These endpoints power this studio website. They are internal website interfaces, with no public API service-level agreement or external write access.</p><div class="endpoint-row"><span>GET</span><code>/api/health</code><button data-api-test="health">Try it ↗</button></div><p>Service and enquiry database availability. No personal data.</p><div class="endpoint-row"><span>GET</span><code>/api/platform</code><button data-api-test="platform">Try it ↗</button></div><p>AI connection status and the payment-link mode available on this site.</p><pre class="api-result" aria-live="polite">Select an endpoint to view its response.</pre></article><article id="api-security"><span class="eyebrow">CLEAR BOUNDARIES</span><h2>Access with intention.</h2><p>Enquiry details, content drafts, media management and payment requests stay behind owner authorisation and the admin password gate. Public enquiries validate the fields, require consent and limit repeated requests. AI credentials remain on the server.</p><p>Client integration work is scoped separately. We confirm provider access, rate limits, operating costs, failure handling and handover before implementation.</p><a class="button" href="/create/">Plan an integration ↗</a></article></div></section>`;}
function veloryzPage(){return `${platformIntro('The studio platform / VELORYZ','One studio.<br><em>Many possibilities.</em>','A connected place for our work, our people and your next idea. Explore a direction, shape a brief and start a useful conversation.','11')}<section class="container platform-hub">${[['/design/','01','Design library','Imported interface references, considered categories and clear starting prices.'],['/create/','02','Project planner','Turn your idea into a brief with purpose, features and a planning estimate.'],['/book/','03','Discovery & booking','Request a focused conversation and keep your enquiry reference.'],['/developers/','04','APIs & integrations','Understand the connections behind a useful digital experience.'],['/teamjob/','05','The people','Meet the studio collective and explore individual profiles.'],['/payments/','06','Project payments','Discuss your scope, invoice and next milestone with the studio.']].map(([url,n,h,p])=>`<a class="hub-card reveal" href="${url}"><span>${n} /</span><h2>${h}</h2><p>${p}</p><i>↗</i></a>`).join('')}</section>${expertSection()}${cta()}`;}
function requestStudio(kind, designId='', reference='') {
 const d=kind==='design'?catalogue().find(item=>item.id===designId):null;
 if(kind==='design'&&!d)return;
 const title=d?d.name:kind==='payment'?'Discuss a payment':'Your project brief';
 const summary=d?'Design adaptation · '+money(d.price)+' onwards':kind==='payment'?'Payment discussion':'Custom project';
 const initial=kind==='project'?briefText():reference?'My milestone reference is '+reference+'. ':'';
 if(modalOpen)closeModal();
 openModal(`<div class="purchase-sheet"><aside>${d?`<img src="${esc(d.image)}" alt="${esc(d.name)} preview">`:''}<small>VELORYZ / STUDIO REQUEST</small><h2 id="dialog-title">${esc(title)}</h2><p>${esc(summary)}</p>${d?`<ul>${d.scope.map(item=>'<li>'+esc(item)+'</li>').join('')}</ul>`:''}<p>We’ll confirm scope, price and timing with you on WhatsApp.</p></aside>
 <form class="purchase-form" data-enquiry data-summary="${esc(summary)}" data-request-id="${newRequestId()}">
 <input type="hidden" name="kind" value="${kind}"><input type="hidden" name="designId" value="${esc(designId)}">
 <h3>Connect studio to discuss</h3>${kind==='project'?'<p class="purchase-invite-explainer">Your brief reaches the studio first. An invitation is only created once the owner opens your project workspace.</p>':''}<div class="enquiry-error" hidden role="alert"></div>
 <label>Your name<input name="name" autocomplete="name" maxlength="100" required></label>
 <label>Email — where your client invitation will be sent<input name="email" type="email" autocomplete="email" maxlength="180" value="${kind==='project'?esc(window.VeloryzProjectEmail||''):''}" required></label>
 <label>Phone or WhatsApp<input name="phone" type="tel" autocomplete="tel" maxlength="20"></label>
 <label>Company (optional)<input name="company" autocomplete="organization" maxlength="200"></label>
 <label>Project details<textarea name="message" minlength="10" maxlength="2000" rows="4" placeholder="What would you like the studio to make or discuss?" required>${esc(initial)}</textarea></label>
 <label class="purchase-consent"><input name="consent" type="checkbox" required> Save my contact details in the studio inbox and open WhatsApp with my project message.</label>
 <button class="button" type="submit">Save and open WhatsApp ↗</button><div class="book-preview" role="status" hidden></div>
 </form></div>`,'purchase-modal');
}
function paymentsPage(){
 return `<section class="studio-shop-payment container"><small>PROJECT PAYMENTS</small><h1>Discuss your<br><em>next milestone.</em></h1><p>Bring your project reference, budget or invoice question. The studio will confirm your scope and payment arrangements directly.</p><div id="payment-request"><button class="button" data-purchase-payment>Connect studio to discuss ↗</button></div></section>`;
}
async function loadPaymentRequest(){
 const token=new URLSearchParams(location.search).get('request'),box=$('#payment-request');
 if(!token||!box)return;
 try{
  const r=await fetch('/api/payment-request?token='+encodeURIComponent(token),{cache:'no-store'}),data=await r.json();
  if(!r.ok)throw Error(data.error||'Could not open this milestone.');
  const p=data.item;
  box.innerHTML=`<div class="milestone-slip"><small>${esc(p.reference)} · ${esc(p.status)}</small><h2>${esc(p.title)}</h2><strong>${money(p.amount_paise/100)}</strong></div><button class="button" data-purchase-payment="${esc(p.reference)}">Connect studio to discuss ↗</button>`;
 }catch(error){box.insertAdjacentHTML('afterbegin','<p role="alert">'+esc(error.message)+'</p>');}
}
function mountPageHelp(){
 const main=$('#main');if(!main)return;
 main.querySelector('.studio-ai-help')?.remove();
 const [title,description,prompt,link]=helpForPage();
 const section=document.createElement('section');section.className='studio-ai-help container';section.setAttribute('aria-label','Page help');
 section.innerHTML=`<div class="studio-ai-help-art">${avatar(advisers[0])}<span>AI SUPPORT / THE STUDIO TEAM</span></div><div class="studio-ai-help-copy"><span class="eyebrow">HELP FOR THIS PAGE</span><h2>${esc(title)}</h2><p>${esc(description)}</p></div><div class="studio-ai-help-actions"><button class="button" data-help-question="${esc(prompt)}">Ask our AI team ↗</button><a class="studio-ai-help-link" href="${link}">${esc(STUDIO_HELP_ROUTES[link])} ↗</a></div>`;
 main.append(section);
}
function platformMount(){
 if(currentRoute==='/create/'){document.getElementById('expert-launcher')?.remove();return;}
 mountPageHelp();
 if(currentRoute==='/book/'||currentRoute==='/contact/')clearTimeout(popupTimer);
 if(!$('#expert-launcher')){const a=advisers[adviserIndex],button=document.createElement('button');button.id='expert-launcher';button.className='expert-launcher';button.dataset.expert=a.id;button.setAttribute('aria-label','Ask '+a.name+', AI studio adviser');button.innerHTML=avatar(a,true)+`<span>Need a hand?<strong>Ask ${a.name} <i>↗</i></strong><small>AI studio adviser</small></span>`;document.body.append(button);}
 if(currentRoute==='/book/'){const form=$('[data-enquiry]');if(form&&(chosenDesign||projectBrief.features.length||projectBrief.purpose!=='Portfolio'||projectBrief.goal||projectBrief.referenceId)){$('[name="message"]',form).value=briefText();form.dataset.dirty='true';const service=$('[name="service"]',form);if(service)service.value=services[0]?.name||service.value;}}
 if(currentRoute==='/payments/')loadPaymentRequest();
}
function chatHandoff(){return wa('Hi VELORYZ Studio! I was speaking with '+(advisers.find(a=>a.id===chatAgent)?.name||'the AI adviser')+'. '+chatMessages.filter(m=>m.role==='user').slice(-2).map(m=>m.content).join(' | ').slice(0,1000));}
function appendChatExtras(item,extras){
 if(!extras||typeof extras!=='object')return;
 const wrap=document.createElement('div');wrap.className='chat-followups';
 const links=document.createElement('div');links.className='chat-relevant-links';
 for(const entry of (Array.isArray(extras.links)?extras.links:[]).slice(0,3)){
  if(!validSiteLink(entry.url))continue;
  const link=document.createElement('a');link.href=entry.url;link.textContent=STUDIO_HELP_ROUTES[entry.url]+' ↗';link.title='Open '+STUDIO_HELP_ROUTES[entry.url];links.append(link);
 }
 if(links.childElementCount){const label=document.createElement('span');label.className='chat-recommend-label';label.textContent='Useful next steps';wrap.append(label,links);}
 const prompts=document.createElement('div');prompts.className='chat-next-prompts';
 for(const suggestion of (Array.isArray(extras.suggestions)?extras.suggestions:[]).slice(0,3)){
  if(typeof suggestion!=='string'||!suggestion.trim()||suggestion.length>140)continue;
  const button=document.createElement('button');button.type='button';button.dataset.chatPrompt=suggestion;button.textContent=suggestion;prompts.append(button);
 }
 if(prompts.childElementCount){const label=document.createElement('span');label.className='chat-recommend-label';label.textContent='Keep exploring';wrap.append(label,prompts);}
 if(extras.action&&typeof extras.action==='object'&&['open_booking_form','open_project_planner','open_contact'].includes(extras.action.type)){
  const button=document.createElement('button');button.type='button';button.className='chat-action-button';button.dataset.chatAction=extras.action.type;
  const name={open_booking_form:'Open consultation form',open_project_planner:'Open project planner',open_contact:'Contact the studio'};
  button.textContent=name[extras.action.type]+' ↗';wrap.append(button);
 }
 if(wrap.childElementCount)item.append(wrap);
}
function chatBubble(message,a){
 const item=document.createElement('div');item.className='chat-message '+(message.role==='user'?'user':'assistant');
 if(message.role==='user'){item.innerHTML='<span>You</span><p>'+esc(message.content)+'</p>';}
 else{item.innerHTML='<div class="chat-bubble-person">'+avatar(a,true)+'<span>'+esc(a.name)+' · AI</span></div><p>'+esc(message.content)+'</p>';appendChatExtras(item,message.extras);}
 return item;
}
function askFirstName(log){
 if(visitorFirstName||document.querySelector('.chat-name-card'))return;
 const card=document.createElement('form');
 nameRequired=true;
 card.className='chat-name-card';
 card.innerHTML='<label for="chat-first-name">Your first name, please</label><p id="chat-name-help">Enter only your first name to continue chatting.</p><div><input id="chat-first-name" aria-label="Your first name" aria-describedby="chat-name-help" placeholder="Your first name" autocomplete="given-name" maxlength="40" required><button type="submit">Continue ↗</button></div>';
 card.onsubmit=e=>{
  e.preventDefault();
  const field=card.querySelector('input'),name=field.value.normalize('NFC').trim();
  if(!/^[\p{L}][\p{L}\p{M}'’-]{0,39}$/u.test(name)||/^(?:jagriti|jagruti|जागृति|जाग्रति)$/iu.test(name)){field.setCustomValidity('Please enter your own first name only — without surnames, nicknames used as pranks, or relationship titles.');field.reportValidity();field.oninput=()=>field.setCustomValidity('');return;}
  visitorFirstName=name;nameRequired=false;card.remove();syncChatComposer();chatStatus('I’ll call you '+name+'.');
  const form=$('#expert-chat-form'),input=$('#expert-question');
  if(form&&input&&!input.value.trim()&&!chatBusy){input.value='My first name is '+name+'.';sendChat(form);}else input?.focus();
 };
 $('.chat-name-slot').append(card);syncChatComposer();
}
function syncChatComposer(){
 const form=$('#expert-chat-form');if(!form)return;
 const locked=nameRequired&&!visitorFirstName;
 $('textarea',form).disabled=locked;
 $('button[type="submit"]',form).disabled=locked||chatBusy;
 $('textarea',form).placeholder=locked?'Enter your first name above to continue':'Message '+(advisers.find(a=>a.id===chatAgent)?.name||'the studio')+'…';
}
function setChatHeat(active){
 const panel=$('.expert-modal');if(!panel)return;
 panel.classList.toggle('chat-spicy',active);
 const label=$('.chat-mood',panel);
 if(label)label.textContent=active?'🌶 Spicy mode':'Studio lounge';
}
function chatStatus(text,error=false){const el=$('.chat-connection');if(!el)return;el.textContent=text;el.classList.toggle('offline',error);el.classList.toggle('guide-mode',error);}
function openExpert(id=''){
 chatSession++;const connectionSession=chatSession;
 const a=advisers.find(a=>a.id===id)||advisers[adviserIndex];
 chatAgent=a.id;chatMessages=chatHistories[a.id]||(chatHistories[a.id]=[]);chatBusy=false;
 clearTimeout(campaignTimer);
 openModal(`<div class="expert-chat ai-conversation" data-persona="${a.id}">
 <div class="chat-header">${avatar(a)}<div class="chat-header-copy"><div class="eyebrow">VELORYZ / CONVERSATIONS</div><h2 id="dialog-title">${a.name}<span> · ${a.role}</span></h2><p>Ideas, honest answers & a little personality.</p></div><span class="chat-online-beacon" title="Connection status is shown below" aria-hidden="true"></span></div>
 <div class="chat-personas" role="group" aria-label="Choose AI personality">${advisers.map(p=>`<button type="button" class="${p.id===a.id?'selected':''} ${p.id==='aryan'?'executive-agent':''}" data-chat-agent="${p.id}" aria-pressed="${p.id===a.id}" title="${p.id==='aryan'?'Executive escalation':p.role}">${avatar(p,true)}<span>${p.name}</span></button>`).join('')}</div>
 <div class="chat-conversation-meta"><span class="chat-mood" aria-live="polite">Studio lounge</span><span><span class="chat-live-dot" aria-hidden="true"></span> ${a.name} · <span data-chat-mode>Connecting…</span></span><button type="button" data-chat-clear>New chat ↺</button></div>
 <div class="chat-scroll-area"><div class="chat-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Chat with ${a.name}"></div>
 <div class="chat-suggestions" ${chatMessages.length?'hidden':''}>${['Help me choose a design','How do I request a project?','Hinglish mein baat karein'].map(t=>`<button type="button" data-chat-prompt="${esc(t)}">${esc(t)}</button>`).join('')}</div>
 </div><div class="chat-name-slot"></div>
 <div class="chat-connection" role="status">Checking VELORYZ AI connection…</div>

 <div class="chat-footer"><span>AI studio adviser · Chats stay in this tab.</span><a href="${wa('Hi VELORYZ! I would like to speak with the studio.')}" target="_blank" rel="noopener">Human studio ↗</a></div>
 <form id="expert-chat-form"><label class="sr-only" for="expert-question">Message ${a.name}</label><textarea id="expert-question" name="question" maxlength="1200" required rows="2" placeholder="Message ${a.name}…"></textarea><button type="submit" class="button" aria-label="Send message to ${a.name}"><span>Send</span><span aria-hidden="true">↗</span></button></form>
 </div>`,'expert-modal');
 sizeChatViewport();
 setChatHeat(Boolean(chatHeat[a.id]));
 const log=$('.chat-log');
 if(nameRequired)askFirstName(log);
 if(chatMessages.length){for(const message of chatMessages)log.append(chatBubble(message,a));askFirstName(log);}
 else{const intro=chatBubble({role:'assistant',content:adviserIntros[a.id]},a);intro.classList.add('intro');log.append(intro);}
 log.parentElement.scrollTop=log.offsetTop+log.offsetHeight-log.parentElement.clientHeight;
 fetch('/api/platform',{cache:'no-store'}).then(r=>r.json()).then(d=>{
  if(chatAgent!==a.id||chatSession!==connectionSession||chatBusy||chatMessages.length)return;
  const configured=Boolean(d.aiConfigured);
  chatStatus(configured?'Studio AI is configured · Ask anything about the studio or your project.':'Studio guide · Answers from the published library.',!configured);
  const mode=$('[data-chat-mode]');if(mode)mode.textContent=configured?'Ready':'Studio guide';
 }).catch(()=>{if(chatSession===connectionSession)chatStatus('Could not check the live provider status.',true);});
}
async function sendChat(form){
 if(nameRequired&&!visitorFirstName){askFirstName($(".chat-log"));$("#chat-first-name")?.focus();return;}
 if(chatBusy||!form.reportValidity())return;
 const input=$('textarea',form),question=input.value.trim();if(!question)return;
 const session=chatSession,agent=chatAgent,a=advisers.find(p=>p.id===agent),name=a.name,log=$('.chat-log');
 chatBusy=true;form.setAttribute('aria-busy','true');$('button[type="submit"]',form).disabled=true;
 input.value='';const turn={role:'user',content:question};
 // Keep the latest 16 user turns and 15 assistant replies, preserving role alternation.
 const history=[...chatMessages.slice(-30),turn].map(({role,content})=>({role,content}));
 while(new TextEncoder().encode(JSON.stringify(history)).length>97000)history.splice(0,2);
 const userBubble=chatBubble({role:'user',content:question},a);log.append(userBubble);
 const typing=document.createElement('div');typing.className='chat-typing';typing.innerHTML=avatar(a,true)+'<i></i><i></i><i></i><span>'+esc(name)+' is thinking…</span>';log.append(typing);
 log.parentElement.scrollTop=log.offsetTop+log.offsetHeight-log.parentElement.clientHeight;$('.chat-suggestions').hidden=true;
 chatStatus(name+' is preparing a reply…');
 try{
  const {isSpicy}=await chatToneReady;
  if(chatSession!==session||!form.isConnected)return;
  chatHeat[agent]=isSpicy(question);setChatHeat(chatHeat[agent]);
  const r=await fetch('/api/adviser',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({agent,firstName:visitorFirstName,firstNamed:Boolean(visitorFirstName)&&!introducedTo.has(agent),allowGuide:true,messages:history.map(({role,content})=>({role,content})),page:currentRoute}),signal:AbortSignal.timeout(36000)});
  const data=await r.json();if(chatSession!==session||chatAgent!==agent||!form.isConnected)return;
  typing.remove();
  if(!r.ok||!['ai','guide'].includes(data.mode)||!data.answer){
   userBubble.remove();
   const error=document.createElement('div');error.className='chat-error';error.setAttribute('role','alert');
   error.textContent=data.error||'The live AI could not reply. Please try again.';
   log.append(error);input.value=question;
   chatStatus(data.notice||'Live AI unavailable · No fake answer was sent.',true);
   const mode=$('[data-chat-mode]');if(mode)mode.textContent='Unavailable';
  }else{
   chatMessages.push(turn,{role:'assistant',content:data.answer,extras:data.extras});
   if(chatMessages.length>32)chatMessages.splice(0,2);
   log.append(chatBubble({role:'assistant',content:data.answer,extras:data.extras},a));
   if(visitorFirstName)introducedTo.add(agent);askFirstName(log);
   chatStatus(data.notice||'Live AI answer',false);
   const mode=$('[data-chat-mode]');if(mode)mode.textContent=data.mode==='guide'?'Studio guide':'Live AI';
  }
  log.parentElement.scrollTop=log.offsetTop+log.offsetHeight-log.parentElement.clientHeight;
 }catch{
  if(chatSession!==session||!form.isConnected)return;
  typing.remove();userBubble.remove();input.value=question;
  const error=document.createElement('div');error.className='chat-error';error.setAttribute('role','alert');error.textContent='The live connection timed out or was interrupted. Your message is ready to retry.';log.append(error);
  chatStatus('Live AI connection interrupted. Please retry.',true);log.parentElement.scrollTop=log.offsetTop+log.offsetHeight-log.parentElement.clientHeight;
 }finally{if(chatSession===session&&chatAgent===agent&&form.isConnected){chatBusy=false;form.removeAttribute('aria-busy');syncChatComposer();if(nameRequired&&!visitorFirstName)$('#chat-first-name')?.focus();else input.focus();}}
}

document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-design-purchase'))requestStudio('design',b.dataset.designPurchase);
 if(b.hasAttribute('data-purchase-payment'))requestStudio('payment','',b.dataset.purchasePayment);
 if(b.hasAttribute('data-design-filter')){designCategory=b.dataset.designFilter;$$('[data-design-filter]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});filterDesigns();}
 if(b.hasAttribute('data-design-preview'))openDesign(b.dataset.designPreview);
 if(b.hasAttribute('data-design-select'))selectDesign(b.dataset.designSelect);
 if(b.hasAttribute('data-purpose')){projectBrief.purpose=b.dataset.purpose;chosenDesign=null;projectBrief.referenceId='';$$('[data-purpose]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});updateBrief();}
 if(b.hasAttribute('data-brief-book'))navigate('/book/');
 if(b.hasAttribute('data-proposal-draft')){
  const estimate=plannerEstimate(),date=new Date().toISOString().slice(0,10);
  const draft=['VELORYZ STUDIO / PROPOSAL OUTLINE (UNAPPROVED)','Date: '+date,'Status: CLIENT-SIDE DRAFT — NOT A STUDIO QUOTATION','',briefText(),'','Suggested delivery discussion: discovery → written scope → design review → development → testing → handover.','', 'Milestone 1: Brief and scope confirmation (not booked).','Milestone 2: Design direction and review (proposed only).','Milestone 3: Implementation and testing (proposed only).','Milestone 4: Handover and agreed support (proposed only).','','Illustrative range: '+money(estimate.low)+' – '+money(estimate.high)+' (not an offer).','', 'Confirm actual scope, schedule, pricing, deliverables, payment terms and any third-party costs with the human studio before acceptance.','Contact: '+CONTACT.email].join('\n');
  const blob=new Blob([draft],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='VELORYZ-proposal-outline-unapproved.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
 }
 if(b.hasAttribute('data-brief-download')){const blob=new Blob(['VELORYZ / PROJECT STARTING BRIEF\n\n'+briefText()+'\n\nPlanning estimate only. Contact '+CONTACT.email+' to confirm a scoped proposal.'],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='veloryz-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 if(b.hasAttribute('data-expert'))openExpert(b.dataset.expert);
 if(b.hasAttribute('data-help-question')){openExpert('happy');const field=$('#expert-question');if(field){field.value=b.dataset.helpQuestion;field.focus();}}
 if(b.hasAttribute('data-chat-agent')){closeModal();openExpert(b.dataset.chatAgent);}
 if(b.hasAttribute('data-chat-action')){
  const action=b.dataset.chatAction;
  if(action==='open_booking_form')openBooking();
  else if(action==='open_project_planner')navigate('/create/');
  else if(action==='open_contact')navigate('/contact/');
  return;
 }
 if(b.hasAttribute('data-chat-clear')){if(chatBusy)return;chatHistories[chatAgent]=[];chatHeat[chatAgent]=false;const id=chatAgent;closeModal();openExpert(id);}
 if(b.hasAttribute('data-chat-prompt')){const prompt=b.dataset.chatPrompt;if(/bring in aryan/i.test(prompt)){closeModal();openExpert('aryan');return;}const form=$('#expert-chat-form');if(!form)return;$('textarea',form).value=prompt;sendChat(form);}
 if(b.hasAttribute('data-api-test')){const output=$('.api-result');b.disabled=true;output.textContent='Requesting…';try{const r=await fetch('/api/'+b.dataset.apiTest,{cache:'no-store'});output.textContent=r.status+' '+r.statusText+'\n'+JSON.stringify(await r.json(),null,2);}catch{output.textContent='The endpoint is temporarily unavailable.';}finally{b.disabled=false;}}
});
document.addEventListener('input',e=>{if(e.target.matches('.catalogue-search input')){designQuery=e.target.value.toLowerCase().trim();filterDesigns();}});
document.addEventListener('change',e=>{const t=e.target;if(t.hasAttribute('data-shop-sort')){const designs=catalogue().slice();if(t.value!=='featured')designs.sort((a,b)=>t.value==='low'?a.price-b.price:b.price-a.price);$('.catalogue-grid').innerHTML=designs.map(designCard).join('');filterDesigns();}
 if(t.hasAttribute('data-brief-pages'))projectBrief.pages=t.value;if(t.hasAttribute('data-brief-timeline'))projectBrief.timeline=t.value;if(t.hasAttribute('data-brief-feature'))projectBrief.features=[...$$('[data-brief-feature]:checked')].map(x=>x.dataset.briefFeature);updateBrief();});
// Keep the composer inside the usable screen when a mobile keyboard appears.
function sizeChatViewport(){
 const viewport=window.visualViewport;
 if(!viewport)return;
 const root=document.querySelector('#modal-root');
 if(!root)return;
 root.style.setProperty('--chat-height',viewport.height+'px');
 root.style.setProperty('--chat-top',viewport.offsetTop+'px');
}
window.visualViewport?.addEventListener('resize',sizeChatViewport);
window.visualViewport?.addEventListener('scroll',sizeChatViewport);
document.addEventListener('keydown',event=>{
 if(event.target.id==='expert-question' && event.key==='Enter' && !event.shiftKey && !event.isComposing && event.keyCode!==229){
  event.preventDefault();
  event.target.form.requestSubmit();
 }
});
document.addEventListener('submit',e=>{if(e.target.id==='expert-chat-form'){e.preventDefault();sendChat(e.target);}});
