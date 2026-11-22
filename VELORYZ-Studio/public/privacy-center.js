/* VELORYZ first-party privacy & consent center — independent of any paid CMP.
 * Stored consent choice is strictly necessary to respect the visitor's decision.
 * Preferences & optional local-only analytics stay off until explicitly approved.
 * This is not an IAB TCF consent string: no programmatic ad vendors are loaded. */
(()=>{
'use strict';
const KEY='veloryz.privacy.choice.v1',VERSION='2026-11-22.1',MAX_AGE=180*864e5;
const MEASURE='veloryz.measurement.optin.v1',DATA='veloryz.measurement.local.v1';
const GPC=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||window.doNotTrack==='1';
let current=null,open=false,lastFocus=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const shortDate=s=>{try{return new Date(s).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}catch{return 'Not recorded'}};
function valid(c){return c&&c.version===VERSION&&typeof c.at==='string'&&Date.now()-Date.parse(c.at)>=0&&Date.now()-Date.parse(c.at)<=MAX_AGE&&
 typeof c.preferences==='boolean'&&typeof c.analytics==='boolean'&&typeof c.marketing==='boolean'}
function load(){
 try{const value=JSON.parse(localStorage.getItem(KEY)||'null');return valid(value)?value:null}catch{return null}
}
current=load();
function choice(){return current?{...current,analytics:current.analytics&&!GPC(),marketing:current.marketing&&!GPC()}:
 {version:VERSION,at:'',necessary:true,preferences:false,analytics:false,marketing:false,source:'pending'};}
function allowed(category){if(category==='necessary')return true;const value=choice();return category==='preferences'?value.preferences:category==='analytics'?value.analytics:category==='marketing'?value.marketing:false}
function cleanStorage(){
 if(!allowed('analytics')){try{localStorage.removeItem(MEASURE);localStorage.removeItem(DATA);}catch{}}
 if(!allowed('preferences')){
  for(const k of ['veloryz.consultation.no-auto','veloryz.workInvitation.v1','veloryz.motion.v2','veloryz.motion.welcome.v1']){
   try{localStorage.removeItem(k)}catch{}
  }
  try{const keys=Object.keys(localStorage);for(const k of keys)if(k.startsWith('vz-campaign:'))localStorage.removeItem(k)}catch{}
  try{const keys=Object.keys(sessionStorage);for(const k of keys)if(k.startsWith('vz-campaign:'))sessionStorage.removeItem(k)}catch{}
 }
}
cleanStorage();
const htmlBox=(type,label,description,selected,locked=false)=>'<label class="vz-consent-toggle"><span class="vz-consent-toggle-text"><strong>'+label+'</strong><small>'+description+'</small></span><input type="checkbox" name="'+type+'" '+(selected?'checked ':'')+(locked?'disabled ':'')+' aria-label="'+label+'"></label>';
function remove(){document.querySelector('#vz-privacy-layer')?.remove();document.documentElement.classList.remove('vz-consent-present');open=false;lastFocus?.focus?.({preventScroll:true})}
function ui(mode='banner'){
 if(open){remove();}
 lastFocus=document.activeElement;
 const state=choice(),settings=mode==='settings';
 const root=document.createElement('section');
 root.id='vz-privacy-layer';root.className='vz-privacy-layer '+(settings?'is-settings':'is-banner');
 root.setAttribute('aria-label',settings?'Privacy and cookie preferences':'Cookie and privacy choices');
 root.innerHTML='<div class="vz-privacy-panel" role="dialog" aria-modal="true" aria-labelledby="vz-privacy-title">'+
 '<div class="vz-privacy-head"><span class="vz-privacy-brand">VELORYZ <i aria-hidden="true">✳</i></span><span class="vz-privacy-overline">PRIVACY / YOUR CHOICE</span></div>'+
 '<h2 id="vz-privacy-title">'+(settings?'Your privacy settings.':'A thoughtful experience. Your choice.')+'</h2>'+
 '<p class="vz-privacy-intro">We use essential browser storage to run the website and remember your choice. Optional preferences and local-only performance measurement stay off unless you allow them. We do not currently load advertising tracking pixels.</p>'+
 (GPC()?'<p class="vz-gpc-note">Your browser requests privacy protection. Optional analytics and marketing remain off.</p>':'')+
 '<div class="vz-consent-choices">'+
 htmlBox('necessary','Essential storage','Security, form functionality, private sign-in and remembering this choice. Always active.',true,true)+
 htmlBox('preferences','Functional preferences','Remember motion settings and dismissed announcements across visits.',state.preferences)+
 htmlBox('analytics','Local quality measurement','Opt-in counts stored only in this browser. No third-party analytics upload.',state.analytics&&!GPC(),GPC())+
 htmlBox('marketing','Marketing tracking','No cross-site advertising trackers are currently loaded. This choice reserves control for future features.',false,true)+
 '</div>'+
 '<div class="vz-privacy-actions"><button type="button" data-vz-privacy="reject" class="vz-choice-equal">Reject optional</button><button type="button" data-vz-privacy="accept" class="vz-choice-equal">Accept optional</button><button type="button" data-vz-privacy="save" class="vz-choice-save">Save my choices</button></div>'+
 '<p class="vz-consent-foot">Your choice is reversible. <a href="/privacy/">Privacy policy</a> · <a href="/cookies/">Cookie policy</a> · <a href="/terms/">Website terms</a>. '+(settings?'<button type="button" data-vz-privacy="close">Close settings</button>':'')+'</p>'+
 '</div>';
 document.body.append(root);open=true;document.documentElement.classList.add('vz-consent-present');
 root.querySelector('[data-vz-privacy="reject"]')?.focus({preventScroll:true});
}
function choose(type,options={}){
 const choices=type==='accept'?{preferences:true,analytics:!GPC(),marketing:false}:
 type==='reject'?{preferences:false,analytics:false,marketing:false}:
 {preferences:!!options.preferences,analytics:!!options.analytics&&!GPC(),marketing:false};
 const event={version:VERSION,at:new Date().toISOString(),necessary:true,...choices,source:type==='save'?'custom':type};
 current=event;
 try{localStorage.setItem(KEY,JSON.stringify(event));}catch{}
 cleanStorage();
 if(choices.analytics){try{localStorage.setItem(MEASURE,'yes')}catch{}}
 document.dispatchEvent(new CustomEvent('veloryz:privacy-choice',{detail:{...event}}));
 // Anonymous backend receipt is optional. Never block a visitor on network failure.
 try{
  fetch('/api/privacy/consent',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',keepalive:true,
   body:JSON.stringify({version:event.version,at:event.at,necessary:true,preferences:event.preferences,analytics:event.analytics,marketing:event.marketing,source:event.source,
    receipt:receiptId()})}).catch(()=>{});
 }catch{}
 remove();
}
function receiptId(){
 const key='veloryz.privacy.receipt.v1';
 try{let stored=localStorage.getItem(key);if(/^[a-f0-9-]{36}$/.test(stored||''))return stored;
 stored=crypto.randomUUID();localStorage.setItem(key,stored);return stored;}catch{return crypto.randomUUID();}
}
document.addEventListener('click',e=>{
 const action=e.target.closest('[data-vz-privacy]')?.dataset.vzPrivacy;
 if(!action)return;
 if(action==='close'){remove();return;}
 if(action==='accept'||action==='reject'){choose(action);return;}
 if(action==='save'){
  const root=document.querySelector('#vz-privacy-layer');
  choose('save',{preferences:root?.querySelector('[name="preferences"]')?.checked,analytics:root?.querySelector('[name="analytics"]')?.checked});
 }
});
document.addEventListener('keydown',e=>{
 if(!open||e.key!=='Escape')return;
 if(!current){e.preventDefault();return;} // first-visit consent remains optional, not required to use site
 remove();
});
document.addEventListener('click',e=>{
 const trigger=e.target.closest('[data-privacy-settings]');
 if(trigger){e.preventDefault();ui('settings');}
});
function mount(){
 if(!document.querySelector('#vz-privacy-fab')){
  const btn=document.createElement('button');btn.type='button';btn.id='vz-privacy-fab';btn.textContent='Privacy choices';btn.title='Reopen privacy and cookie preferences';btn.dataset.privacySettings='';
  btn.setAttribute('aria-label','Change privacy and cookie choices');document.body.append(btn);
 }
 if(!current&&!open)ui('banner');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.VeloryzPrivacy={allowed,choice,open:()=>ui('settings'),policyVersion:VERSION};
const legalLink=(href,text)=>'<a href="'+href+'">'+text+' ↗</a>';
const section=(title,paragraphs)=>'<section class="vz-legal-section"><h2>'+title+'</h2>'+paragraphs.map(p=>'<p>'+p+'</p>').join('')+'</section>';
const header=(k,title,desc)=>'<header class="vz-legal-hero"><span>'+k+'</span><h1>'+title+'</h1><p>'+desc+'</p><small>Version '+VERSION+' · Updated 22 November 2026</small></header>';
const nav=()=>'<nav class="vz-legal-nav" aria-label="Policy pages">'+legalLink('/privacy/','Privacy')+legalLink('/cookies/','Cookies')+legalLink('/terms/','Terms')+legalLink('/privacy/choices/','Your choices')+'</nav>';
const btn='<button type="button" class="vz-legal-settings-button" data-privacy-settings>Change privacy preferences ↗</button>';
function policyPage(type){
 const contact='<a href="mailto:veloryz.here@gmail.com">veloryz.here@gmail.com</a>';
 let body='';
 if(type==='privacy'){
  body=header('01 / DATA & TRUST','Privacy policy.','How personal information is handled when you visit VELORYZ Studio, make an enquiry, use a client workspace or contact the team.')+
  section('Who operates this website',[
  'VELORYZ Studio, Bokaro, Jharkhand, India, operates this website and its project enquiry process. For enquiries about the identity of the legal controller or its authorised representative, contact '+contact+'. A statutory data protection officer is not asserted unless actually appointed.',
  'For privacy requests, email '+contact+' with “Privacy Request” as the subject. Please do not include passwords, invitation codes or payment card data.'])+
  section('What we collect and why',[
  'On a normal visit, the hosting provider may process technical request information necessary to deliver and protect the site. We also use strictly necessary browser storage for security, consent preferences, the private session and user-requested forms.',
  'Project enquiries may include name, email, phone (if provided), company, requested services, budget indication, preferred meeting time, contact preferences, attached links and project brief. We use these details to review the request, discuss services and respond.',
  'If your project is accepted, the team manages linked client records, milestones, progress, approvals, files, project messages and invitation status in a protected workspace. Gmail may be used to send project correspondence and PDF summaries.',
  'If you speak to the public AI assistants, your prompt and recent conversation may be sent to configured model providers (for example Google Gemini, or a site provider configured by the studio) to create a response. Avoid sensitive or confidential data. Public AI is not authorised to access your private client records.',
  'We also store the date, categories and version of your consent selection; the optional receipt service uses a pseudonymous random receipt identifier rather than your name or email.'])+
  section('Legal basis and preferences',[
  'Depending on the processing activity and applicable law, we rely on handling enquiries before a possible contract, fulfilling an accepted project arrangement, meeting legal obligations, legitimate interests in protecting and operating the service, or your optional consent. You can decline optional preferences and local analytics without losing basic site access.',
  'You may withdraw optional consent at any time through “Privacy choices” in the footer or the persistent Privacy choices control. Where privacy law applies, contact us to exercise access, correction, deletion, objection or portability rights. Some data must be retained to meet legal obligations or protect disputes.'])+
  section('Service providers and international transfers',[
  'The website may use Cloudflare or its hosting environment to serve content, Supabase for protected project databases and media, Google/Gmail for email and selected AI models, and payment providers where you open a provider-hosted payment link. WhatsApp, Maps and other external destinations process data only when you choose to use them.',
  'Availability, processing locations and contracts vary with the provider actually selected. Providers can process information outside your country. Appropriate safeguards depend on the applicable agreement and law; contact the studio for details about your specific project.'])+
  section('Security and retention',[
  'Owner and client routes are access-controlled, and client invitations are designed as time-limited single-use credentials. No internet service can guarantee absolute security.',
  'We keep data while it is needed to respond, manage a project, maintain relevant records, resolve disputes or comply with law. Specific deletion schedules depend on the record class and legal obligations; request the current schedule for your data from the studio. Optional local measurements can be cleared in the browser.'])+
  section('Children, changes and contact',[
  'The site is not designed to collect personal information from children without appropriate authorisation. Contact us if a child has submitted information without permission.',
  'We update this notice when the actual workflow or providers change, and may request new consent for material changes. Contact: '+contact+'.']);
 }else if(type==='cookies'){
  body=header('02 / STORAGE & CHOICE','Cookie and storage policy.','A clear explanation of the cookies and similar browser storage used on this website.')+
  section('Why this policy includes browser storage',[
  'Cookies, localStorage and sessionStorage can remember choices or power a service. VELORYZ uses a consent choice receipt in local storage and session state for requested workflows; the client/owner portal uses security-related sessions. Some third-party services may set their own storage only when you open their pages.',
  'We do not currently install third-party advertising pixels or an IAB advertising-vendor framework on the website. If such technologies are introduced, their disclosure and consent mechanisms must be reviewed before activation.'])+
  '<div class="vz-cookie-table-wrap"><table class="vz-cookie-table"><thead><tr><th>Category</th><th>Examples and purpose</th><th>Choice</th><th>Retention / location</th></tr></thead><tbody>'+
  '<tr><td><strong>Necessary</strong></td><td>Private owner/client authentication, user-entered project draft within the active tab, consent receipt and security.</td><td>Always active</td><td>Session cookies follow their own expiry; consent selection is reconsidered after about 180 days.</td></tr>'+
  '<tr><td><strong>Preferences</strong></td><td>Motion preference, dismissed announcements and consultation auto-open preference.</td><td>Optional</td><td>First-party local or session storage until cleared, browser expiry or consent withdrawal.</td></tr>'+
  '<tr><td><strong>Local analytics</strong></td><td>First-party navigation and performance counters stored only on your device; not uploaded as site-wide analytics.</td><td>Optional, off by default</td><td>Browser local storage until cleared or consent withdrawn.</td></tr>'+
  '<tr><td><strong>Advertising tracking</strong></td><td>No behavioural advertising trackers are currently installed by this implementation.</td><td>Not active</td><td>No marketing-tracker retention.</td></tr>'+
  '</tbody></table></div>'+
  section('Reject, accept or change your decision',[
  'The first-visit banner has equally prominent “Reject optional” and “Accept optional” actions; custom categories can be saved separately. You can reopen the same controls at any time. Refusing optional storage does not stop necessary project, navigation or security features.',
  'Your browser may also offer a Global Privacy Control or Do Not Track signal. Where detected, this implementation disables optional local measurement and reserves marketing tracking as off.'])+btn;
 }else if(type==='terms'){
  body=header('03 / USE & AGREEMENTS','Website terms.','The practical conditions for browsing, contacting the studio, requesting projects and using private workspaces.')+
  section('Information and estimates',[
  'Published portfolios, prices, design previews and examples are provided for general information. They may change. Submitting an enquiry or selecting a template does not create an accepted contract or guarantee a quoted fee, timeline or appointment.',
  'A project starts only after the parties agree a specific scope, delivery schedule and commercial terms. Any signed project-specific agreement prevails over general website descriptions.'])+
  section('Project payments, cancellation and refunds',[
  'The project agreement or written proposal should specify deposits, milestones, payment methods, cancellations, revision allowances, refunds and delivery rights. Unless a separate written agreement or applicable law provides otherwise, an estimate on this site is not an invoice or automatic charge.',
  'For a cancellation, refund request, failed payment or billing dispute, contact '+contact+' with your project reference and the relevant written agreement. Mandatory consumer rights under applicable law are not waived by these website terms.'])+
  section('Rights, credits and deliverables',[
  'VELORYZ Studio website content and its original brand, logo and motion materials may be protected by intellectual-property law. Individual project deliverable ownership, source-code transfer, third-party licences and attribution requirements depend on the written agreement.',
  'External design references are not automatically created or owned by VELORYZ. Do not assume that a displayed example can be purchased or reused free of its creator’s rights.'])+
  section('Acceptable use and access',[
  'Do not submit malicious content, interfere with the site, attempt unauthorised access, share invitation codes or use public AI to solicit private client information. Private Client Portal access is limited to authorised recipients. Account or invitation access may be revoked when necessary for security.',
  'Public AI replies may be incorrect and should be verified for consequential design, technical, financial or legal decisions.'])+
  section('External services and contact',[
  'External services, payment providers, messaging apps and third-party links are subject to their own terms. The studio cannot guarantee availability or conduct on external websites.',
  'Questions about these website terms or service agreements: '+contact+'. Operating location: Bokaro, Jharkhand, India.']);
 }else{
  const state=choice();
  body=header('04 / CONTROLS & REQUESTS','Your privacy choices.','Change optional storage, export your local decision, or contact the studio about personal-data rights.')+
  '<section class="vz-legal-section"><h2>Current decision</h2><p>Selection: <strong>'+esc(current?.source||'Not recorded')+'</strong> · Updated: '+esc(shortDate(current?.at))+'</p><p>Functional preferences: '+(state.preferences?'Allowed':'Off')+' · Local analytics: '+(state.analytics?'Allowed':'Off')+' · Advertising tracking: Not active.</p></section>'+
  '<div class="vz-legal-rights"><button type="button" data-privacy-settings>Change preferences ↗</button><button type="button" data-vz-export-choice>Export my consent receipt</button><button type="button" data-vz-privacy-remove-local>Clear optional local data</button></div>'+
  section('California and other privacy requests',[
  'This website implementation does not currently enable third-party behavioural advertising or selling of project records. If VELORYZ introduces sale or cross-context sharing covered by applicable law, it must offer an effective opt-out and honour eligible Global Privacy Control signals.',
  'If you believe your information is being sold or shared, or you want access, correction or deletion, contact '+legalLink('mailto:veloryz.here@gmail.com?subject=VELORYZ%20Privacy%20Request%20-%20Do%20Not%20Sell%20or%20Share','Do not sell or share my personal information')+'. Include the request type, but do not send login codes or sensitive identity evidence in the initial email.']);
 }
 return '<div class="vz-legal-page container">'+nav()+body+'<footer class="vz-legal-footer">VELORYZ Studio · Bokaro, Jharkhand, India · '+legalLink('mailto:veloryz.here@gmail.com','Contact privacy team')+'</footer></div>';
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-vz-export-choice]')){
  const data=JSON.stringify({receipt:choice(),remoteReceipt:'Best-effort pseudonymous audit only; request confirmation from VELORYZ.'},null,2);
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');
  a.href=url;a.download='veloryz-privacy-choice.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
 }
 if(e.target.closest('[data-vz-privacy-remove-local]')){
  cleanStorage();try{localStorage.removeItem(DATA);localStorage.removeItem(MEASURE)}catch{}
  alert('Optional local measurements and disallowed preferences were cleared. You can change consent settings above.');
 }
});
window.VeloryzPrivacy.render=policyPage;
})();