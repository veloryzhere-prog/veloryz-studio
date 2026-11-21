'use strict';
/* Creator 2.0 extends the existing VELORYZ planner without replacing its enquiry API. */
(function(){
 const styles=[
  {id:'Editorial',tag:'CALM & CONSIDERED',desc:'Typography-led, timeless layouts with room for your story.',preview:'A different perspective.',tone:'editorial',colors:['#e9dbcb','#29211e','#bd614a']},
  {id:'Minimal',tag:'CLEAR & EFFORTLESS',desc:'Clean geometry, quiet confidence and product-focused clarity.',preview:'Less, but better.',tone:'minimal',colors:['#f4f5f1','#22332e','#91b2a1']},
  {id:'Bold',tag:'BRAVE & DISTINCTIVE',desc:'Strong contrast, oversized type and expressive personality.',preview:'Made to stand out.',tone:'bold',colors:['#22162c','#f6e7ff','#ee77b3']},
  {id:'Immersive',tag:'SPATIAL & MOTION',desc:'Depth, deliberate movement and cinematic storytelling.',preview:'Go beyond.',tone:'immersive',colors:['#151f25','#9cdae0','#e3b58d']}
 ];
 const featureInfo={
  'Content management':['▤','Update pages, projects and images without changing code.','Editable website content'],
  'Booking workflow':['⌁','Accept consultation and service requests through a guided journey.','Appointments and enquiries'],
  'Payment integration':['↗','Plan checkout or milestone payment requests; provider fees are separate.','Secure payments'],
  'AI adviser':['✳','Create a guided assistant with clear boundaries and human fallback.','Questions and support'],
  'Member accounts':['◇','Private authenticated pages and role-specific customer experiences.','Login and portals'],
  'Motion direction':['◌','Purposeful animation with responsive and reduced-motion behavior.','Polished interactions']
 };
 const stepNames=['Vision','Visual style','Features & budget','Proposal'];
 const oldCreatePage=createPage,oldReview=plannerReview;
 function escapeText(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
 function INR(n){return '₹'+Math.round(Number(n)||0).toLocaleString('en-IN');}
 function stylePanel(){
  return '<fieldset data-planner-panel="1" hidden><legend class="sr-only">Step 2: choose visual style</legend><div class="guided-step-heading creator-stage-heading"><span class="eyebrow">02 / THE VISUAL LANGUAGE</span><h2 data-planner-heading tabindex="-1">How should it <em>feel?</em></h2><p>Explore four visual directions. These are original mood previews, not fixed templates or finished designs.</p></div><div class="creator-style-grid">'+
  styles.map((x,i)=>'<button type="button" class="creator-style-card '+(projectBrief.style===x.id?'is-selected':'')+'" data-creator-style="'+x.id+'" aria-pressed="'+(projectBrief.style===x.id)+'"><div class="creator-style-visual creator-tone-'+x.tone+'"><div class="creator-mini-top">V / STUDIO <span>— &nbsp; ⊞ &nbsp; ↗</span></div><div class="creator-mini-body"><small>'+x.tag+'</small><strong>'+x.preview+'</strong><span>EXPLORE THE IDEA ↗</span></div><div class="creator-mini-shapes"><i></i><i></i><i></i></div></div><div class="creator-style-info"><span class="creator-style-number">0'+(i+1)+' / '+x.id.toUpperCase()+'</span><span class="creator-selected-label">✓ SELECTED</span><h3>'+x.id+'</h3><p>'+x.desc+'</p><div class="creator-style-palette">'+x.colors.map(c=>'<i style="background:'+c+'"></i>').join('')+'</div></div></button>').join('')+
  '</div><div class="creator-style-note"><span>✳</span><div><strong>Nothing is locked in yet.</strong><p>Your selection is a starting point for the design discussion. We can blend directions once we learn about your audience.</p></div></div></fieldset>';
 }
 function featurePanel(){
  return '<div class="brief-features creator-feature-grid">'+VeloryzPlanner.features.map(name=>{
   const details=featureInfo[name];
   return '<label class="creator-feature-card"><input type="checkbox" data-brief-feature="'+escapeText(name)+'" '+(projectBrief.features.includes(name)?'checked':'')+'><span class="creator-feature-symbol">'+details[0]+'</span><span class="creator-feature-copy"><strong>'+name+'</strong><small>'+details[1]+'</small><em>'+details[2]+'</em></span><span class="creator-feature-fee">+ ₹2,500</span></label>';
  }).join('')+'</div>';
 }
 function timelinePanel(){
  return '<div class="creator-timeline-intro"><span class="eyebrow">DELIVERY / PREFERRED WINDOW</span><h3>When would you like to launch?</h3><p>Your preference informs discovery. The schedule only becomes a commitment after written studio confirmation.</p></div><div class="creator-timeline-grid">'+
  VeloryzPlanner.timelines.map((t,i)=>'<button type="button" class="creator-timeline-card '+(projectBrief.timeline===t?'is-selected':'')+'" data-creator-timeline="'+escapeText(t)+'" aria-pressed="'+(projectBrief.timeline===t)+'"><span>0'+(i+1)+'</span><strong>'+escapeText(t)+'</strong><small>'+['Room to explore','An accelerated request','Focused delivery','More time to refine'][i]+'</small></button>').join('')+'</div>';
 }
 function budgetResult(){
  const low=plannerEstimate().low,target=Number(projectBrief.budget)||50000;
  const msg=target<low?'Your target is below the starting range. Try fewer pages or features, then discuss scope with us.':target<plannerEstimate().high?'Your preferred budget is within the planning range. Final costs still need studio approval.':'Your preferred budget is above the initial range and leaves room for possible refinements.';
  return '<div class="creator-budget-result '+(target<low?'is-below':'')+'">'+(target<low?'!':'✓')+' &nbsp; '+msg+'</div>';
 }
 function budgetPanel(){
  return '<section class="creator-budget-panel"><div class="creator-budget-heading"><div><span class="eyebrow">YOUR COMFORT ZONE</span><h3>Set a working budget.</h3><p>Adjusting this slider records your preference. To change the estimated scope, adjust page count or features.</p></div><output id="creator-budget-output" for="creator-budget-slider">'+INR(projectBrief.budget)+'</output></div><input id="creator-budget-slider" type="range" min="20000" max="300000" step="5000" data-creator-budget value="'+escapeText(projectBrief.budget)+'"><div class="creator-budget-ticks"><span>₹20,000</span><span>₹1,60,000</span><span>₹3,00,000</span></div><div data-creator-budget-status>'+budgetResult()+'</div></section>';
 }
 function hero(){
  return '<section class="creator-hero"><div class="container creator-hero-inner"><div class="creator-hero-copy"><span class="creator-hero-eyebrow"><i></i> PROJECT CREATOR 2.0 <b>/ A BETTER BEGINNING</b></span><h1>Make it <em>real.</em><br>Start with the <span>right brief.</span></h1><p>Pick a direction. Find a visual language. Choose the essentials. Leave with a project plan you can actually use.</p><div class="creator-hero-benefits"><span>✳ &nbsp; Four simple stages</span><span>⌁ &nbsp; A transparent range</span><span>↗ &nbsp; Your own proposal PDF</span></div></div><div class="creator-hero-scene" aria-hidden="true"><div class="creator-scene-window"><div>VELORYZ <span>● ● ●</span></div><section><small>INDEPENDENT CREATIVE STUDIO</small><strong>Ideas that <em>move</em> people.</strong><i></i><b>EXPLORE THE STORY ↗</b></section></div><span class="creator-floating-label creator-float-left">01 / DEFINE</span><span class="creator-floating-label creator-float-right">02 / DESIGN ✓</span></div></div></section>';
 }
 function roadmap(){
  const stages=[['01','Discover','Align on goals and priorities.'],['02','Define','Agree a written scope and quote.'],['03','Design','Review the direction together.'],['04','Build','Implement and test the agreed work.'],['05','Handover','Deliver and prepare for launch.']];
  return '<div class="creator-roadmap"><div class="creator-roadmap-title"><span class="eyebrow">A CLEARER ROAD AHEAD</span><h3>How the project takes shape.</h3><p>Suggested stages for '+escapeText(projectBrief.timeline).toLowerCase()+' timing. The actual dates and deliverables are confirmed with the studio.</p></div><div class="creator-roadmap-grid">'+stages.map(([n,name,description])=>'<div><span>'+n+'</span><strong>'+name+'</strong><small>'+description+'</small></div>').join('')+'</div></div>';
 }
 function sideSummary(){
  const e=plannerEstimate(),target=Number(projectBrief.budget)||50000;
  return '<div class="creator-side-head"><span>YOUR PROJECT / LIVE SUMMARY</span><span class="creator-side-live">● LIVE</span></div><h2>A thoughtful start.<br><em>Not a final quote.</em></h2>'+
  '<div class="creator-side-data"><div><span>Direction</span><b>'+escapeText(projectBrief.purpose)+'</b></div><div><span>Visual style</span><b>'+escapeText(projectBrief.style)+'</b></div><div><span>Core pages</span><b>'+escapeText(projectBrief.pages)+'</b></div><div><span>Features</span><b>'+projectBrief.features.length+'</b></div><div><span>Budget preference</span><b>'+INR(target)+'</b></div></div>'+
  '<div class="creator-side-price"><span>ILLUSTRATIVE PLANNING RANGE</span><strong>'+INR(e.low)+' <i>–</i> '+INR(e.high)+'</strong><p>Upper range includes a rounded 25% contingency.</p></div>'+
  '<div class="creator-side-breakdown"><div><span>Starting point</span><b>'+INR(e.base)+'</b></div><div><span>Additional pages</span><b>'+INR(e.additionalPages)+'</b></div><div><span>Feature allowances</span><b>'+INR(e.featureAllowance)+'</b></div><div><span>Contingency</span><b>'+INR(e.contingency)+'</b></div></div><p class="creator-side-budget-note">'+(target<e.low?'Your preferred budget is below the scope estimate.':'Your budget preference has been noted, not treated as an approved quote.')+'</p>';
 }
 plannerReview=function(){
  return '<div class="creator-review-fields">'+oldReview()+'<div><span>Visual direction</span><strong>'+escapeText(projectBrief.style)+'</strong></div><div><span>Budget preference</span><strong>'+INR(projectBrief.budget)+'</strong></div>'+(chosenDesign?'<div><span>Reference design</span><strong>'+escapeText(chosenDesign.name)+'</strong></div>':'')+'</div>';
 };
 briefSummary=sideSummary;
 createPage=function(){
  let html=oldCreatePage();
  const marker='<section class="container guided-planner">',start=html.indexOf(marker);
  if(start<0)return html;
  html=hero()+html.slice(start);
  html=html.replace(marker,'<section class="container guided-planner creator-v2" data-creator-v2>');
  html=html.replace(/<nav class="planner-step-nav"[\s\S]*?<\/nav>/,
   '<nav class="planner-step-nav creator-step-nav" aria-label="Creator stages">'+stepNames.map((t,i)=>'<button type="button" data-planner-go="'+i+'" aria-current="'+(i===0?'step':'false')+'"><span>0'+(i+1)+'</span><b>'+t+'</b><i aria-hidden="true">✓</i></button>').join('')+'</nav>');
  html=html.replace('Step 1 of 3 · Direction','Step 1 of 4 · Vision');
  html=html.replace('data-planner-panel="2"','data-planner-panel="3"').replace('data-planner-panel="1"','data-planner-panel="2"');
  html=html.replace('<fieldset data-planner-panel="2" hidden>',stylePanel()+'<fieldset data-planner-panel="2" hidden>');
  html=html.replace('What are we<br>creating together?','What are we<br><em>building?</em>');
  html=html.replace('Choose the essentials.<br>Leave room to evolve.','Choose what matters.<br><em>Leave room to grow.</em>');
  html=html.replace('Make the goal clear.<br>We’ll shape the next step.','See the whole picture.<br><em>Make the next move.</em>');
  html=html.replace(/<div class="brief-features">[\s\S]*?<\/div><div class="guided-assets">/,featurePanel()+'<div class="guided-assets">');
  html=html.replace('<p class="planner-small">Your timing is a preference, subject to the studio’s availability and the final scope.</p>',timelinePanel()+budgetPanel()+'<p class="planner-small">Your timing is a preference, subject to the studio’s availability and the final scope.</p>');
  html=html.replace(/<aside class="guided-summary">[\s\S]*?<\/aside>/,
   '<aside class="guided-summary creator-summary-card" aria-label="Live project estimate"><div id="brief-live">'+sideSummary()+'</div>'+
   '<div class="creator-summary-actions"><button type="button" data-creator-pdf class="creator-pdf-button">↓ Download proposal PDF</button>'+
   '<button type="button" data-planner-go="3" class="creator-review-button">Review full project ↗</button>'+
   '<button type="button" data-brief-download class="creator-brief-button">Download brief as text ↓</button></div>'+
   '<details class="creator-estimate-notes"><summary>How is this calculated?</summary><p>Up to 4 pages are included. Extra pages: ₹1,500 each. Each feature allowance: ₹2,500. Upper range adds rounded 25% contingency. Hosting, licenses, provider fees, subscriptions and taxes are excluded. Complex applications and third-party integrations require studio review.</p></details></aside>');
  html=html.replace('<label class="guided-goal"',roadmap()+'<label class="guided-goal"');
  html=html.replace('data-planner-submit hidden>Review request','data-planner-submit hidden>Review and send request');
  return html;
 };
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-creator-style],[data-creator-timeline],[data-creator-pdf]');
  if(!b)return;
  if(b.hasAttribute('data-creator-style')){
   projectBrief.style=b.dataset.creatorStyle;
   document.querySelectorAll('[data-creator-style]').forEach(el=>{const chosen=el===b;el.classList.toggle('is-selected',chosen);el.setAttribute('aria-pressed',String(chosen));});
   updateBrief();return;
  }
  if(b.hasAttribute('data-creator-timeline')){
   projectBrief.timeline=b.dataset.creatorTimeline;
   const select=document.querySelector('[data-brief-timeline]');if(select)select.value=projectBrief.timeline;
   document.querySelectorAll('[data-creator-timeline]').forEach(el=>{const chosen=el===b;el.classList.toggle('is-selected',chosen);el.setAttribute('aria-pressed',String(chosen));});
   updateBrief();return;
  }
  if(b.hasAttribute('data-creator-pdf')){
   try{if(!globalThis.VeloryzProposal)throw Error('PDF maker not loaded');
    VeloryzProposal.download({brief:VeloryzPlanner.normalize(projectBrief),estimate:plannerEstimate(),reference:chosenDesign});
   }catch(error){console.error(error);alert('Your proposal could not be generated. Please retry or use Download brief.');}
  }
 });
 document.addEventListener('input',event=>{
  if(!event.target.matches('[data-creator-budget]'))return;
  projectBrief.budget=Number(event.target.value);
  const val=document.getElementById('creator-budget-output');if(val)val.textContent=INR(projectBrief.budget);
  const node=document.querySelector('[data-creator-budget-status]');if(node)node.innerHTML=budgetResult();
  updateBrief();
 });
 document.addEventListener('studio:brief',()=>{const node=document.querySelector('[data-creator-budget-status]');if(node)node.innerHTML=budgetResult();});
 globalThis.VeloryzCreatorV2={styles,stepNames};
})();
