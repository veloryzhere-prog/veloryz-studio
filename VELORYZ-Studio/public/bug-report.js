/* VELORYZ real bug reporting — submitted into the existing private Studio Control enquiry queue.
   Templates are examples, never sent unless the visitor edits/confirms the form. */
(()=>{
'use strict';
const templates={
 navigation:{
  name:'Menu / quick action cannot be clicked',severity:'high',
  steps:'1. Open the website.\n2. Click Menu, Motion, or Quick Create in the top-right header.\n3. Check whether the expected control opens.',
  expected:'The selected button should respond immediately and open its menu, motion preferences, or project creator.',
  actual:'The button appears on screen, but clicking it sometimes does nothing.'
 },
 motion:{
  name:'Motion settings are not responding',severity:'high',
  steps:'1. Open a public page.\n2. Click Motion in the header.\n3. Choose Full, Reduced, or Pause.',
  expected:'The motion panel should open, the choice should be saved, and animations should respond.',
  actual:'The Motion control does not open, or the preference does not update the page.'
 },
 performance:{
  name:'Scrolling or animation feels laggy',severity:'medium',
  steps:'1. Open the homepage.\n2. Scroll through the design library or reviews.\n3. Move the pointer over the hero.',
  expected:'Scrolling and moving visual elements should remain smooth and responsive.',
  actual:'Scrolling, animation, or pointer interactions appear to stutter.'
 },
 logo:{
  name:'Official logo / 3D V is hard to see or use',severity:'medium',
  steps:'1. Open the homepage.\n2. Inspect the official wordmark.\n3. Drag the 3D V and try its rotation controls.',
  expected:'The wordmark should be readable and the actual 3D V should rotate and resume as requested.',
  actual:'The logo appears unclear or the 3D controls behave unexpectedly.'
 },
 layout:{
  name:'Text or buttons overlap on screen',severity:'medium',
  steps:'1. Open the affected page.\n2. Resize the browser to your device width.\n3. Scroll to the overlapping content.',
  expected:'Every title, button, and card should remain readable without covering another element.',
  actual:'Text, controls, or panels overlap or are clipped on this screen size.'
 },
 media:{
  name:'Admin media or project upload fails',severity:'high',
  steps:'1. Open the media upload screen.\n2. Select a permitted image or video.\n3. Submit the upload.',
  expected:'A valid media upload should finish and display its saved file or a clear error.',
  actual:'The upload does not complete or the media is not shown.'
 },
 ai:{
  name:'AI assistant does not open or reply',severity:'medium',
  steps:'1. Open the relevant AI chat.\n2. Select the assistant and enter a question.\n3. Submit the message.',
  expected:'The selected assistant should open and return a real response or a meaningful error.',
  actual:'The chat launcher or message submission is unresponsive.'
 },
 other:{
  name:'Other website issue',severity:'medium',
  steps:'1. Open the affected page.\n2. Describe the actions that trigger the issue.',
  expected:'Explain how the website should behave here.',
  actual:'Explain what actually occurs instead.'
 }
};
const labels={
 navigation:'Navigation or quick actions',motion:'Motion controls',performance:'Scrolling / animation performance',
 logo:'Official logo / 3D',layout:'Layout or text overlap',media:'Media upload',ai:'AI chat',other:'Other problem'
};
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(q,root=document)=>root.querySelector(q);
const initialPath=()=>{
 try{const ref=new URL(document.referrer);if(ref.origin===location.origin&&ref.pathname!=='/report-bug/')return ref.pathname.slice(0,160);}catch{}
 return '/';
};
const hint='Never include passwords, access tokens, private client data or financial details.';
function render(){
 const starter=templates.navigation;
 return `<section class="vz-bug-page" aria-labelledby="vz-bug-title">
 <div class="vz-bug-head"><span class="vz-bug-eyebrow">VELORYZ Studio / Feedback & quality</span>
 <h1 id="vz-bug-title">See something wrong?<br><em>Report a bug.</em></h1>
 <p>Help the studio improve the experience. Choose an editable example or describe your own issue. Your report goes to the private Studio Control enquiry queue; it is not posted publicly.</p>
 <div class="vz-bug-head-actions"><a href="/help/assistant/">Ask Help AI ↗</a><a href="/support/">Contact support ↗</a><a href="/">Back to Studio ↗</a></div></div>
 <div class="vz-bug-layout">
 <aside class="vz-bug-templates"><p class="vz-bug-small-label">Editable issue templates</p>
 <h2>Start with a common issue.</h2><p>These are examples, not confirmed open bugs. Select one to pre-fill the report, then update the details to reflect what you experienced.</p>
 <div class="vz-bug-template-list">
 ${Object.entries(templates).map(([id,t],i)=>`<button type="button" data-bug-example="${id}" aria-pressed="${i===0?'true':'false'}"><span class="vz-bug-template-index">${String(i+1).padStart(2,'0')}</span><span>${safe(t.name)}</span><span aria-hidden="true">↗</span></button>`).join('')}
 </div></aside>
 <div class="vz-bug-form-panel">
 <div class="vz-bug-form-title"><span class="vz-bug-small-label">Actual report / Private</span><h2>Describe what happened.</h2><p>All fields marked * are required. We include the page and your browser details for troubleshooting.</p></div>
 <form data-bug-report novalidate>
 <label class="vz-bug-honeypot" aria-hidden="true" tabindex="-1">Website<input type="text" name="website" autocomplete="off" tabindex="-1"></label>
 <div class="vz-bug-grid">
 <label class="vz-bug-field">Your name *<input name="name" type="text" autocomplete="name" required maxlength="100" placeholder="Your full name"></label>
 <label class="vz-bug-field">Email address *<input name="email" type="email" autocomplete="email" required maxlength="180" placeholder="you@example.com"></label>
 <label class="vz-bug-field">Issue category *<select name="category" required>${Object.entries(labels).map(([id,label])=>`<option value="${id}" ${id==='navigation'?'selected':''}>${safe(label)}</option>`).join('')}</select></label>
 <label class="vz-bug-field">How serious is it? *<select name="severity" required><option value="low">Low — minor visual issue</option><option value="medium">Medium — some features affected</option><option value="high" selected>High — key feature inaccessible</option><option value="critical">Critical — data loss or security concern</option></select></label>
 <label class="vz-bug-field vz-bug-full">Affected page (path only) *<input name="page" type="text" required maxlength="180" value="${safe(initialPath())}" placeholder="/create/"><small>Change this if the issue occurred on a different page. Avoid private URLs or tokens.</small></label>
 <label class="vz-bug-field vz-bug-full">Steps to reproduce *<textarea name="steps" required minlength="12" maxlength="620" rows="5">${safe(starter.steps)}</textarea></label>
 <label class="vz-bug-field vz-bug-full">What should happen? *<textarea name="expected" required minlength="10" maxlength="340" rows="3">${safe(starter.expected)}</textarea></label>
 <label class="vz-bug-field vz-bug-full">What actually happened? *<textarea name="actual" required minlength="10" maxlength="340" rows="3">${safe(starter.actual)}</textarea></label>
 <label class="vz-bug-field vz-bug-full">Extra details (optional)<textarea name="details" maxlength="350" rows="3" placeholder="Device, browser version, screen size, exact error message, or visual description"></textarea></label>
 </div>
 <p class="vz-bug-sensitive">${hint}</p>
 <label class="vz-bug-consent"><input type="checkbox" name="consent" required><span>I agree to send this report and my contact details to VELORYZ Studio for troubleshooting. <a href="/privacy/">Privacy policy</a>.</span></label>
 <p class="vz-bug-error" data-bug-error role="alert" hidden></p>
 <div class="vz-bug-form-actions"><button type="submit" class="vz-bug-submit">Send bug report ↗</button><span class="vz-bug-small-label">Private submission / Reference issued when saved</span></div>
 <div class="vz-bug-result" data-bug-result tabindex="-1" role="status" hidden></div>
 </form></div></div></section>`;
}
function assignTemplate(form,id){
 const t=templates[id];if(!t)return;
 for(const key of ['steps','expected','actual']){
  const target=$('[name="'+key+'"]',form);if(target)target.value=t[key];
 }
 const category=$('[name="category"]',form),severity=$('[name="severity"]',form);
 if(category)category.value=id;if(severity)severity.value=t.severity;
 for(const button of document.querySelectorAll('[data-bug-example]'))button.setAttribute('aria-pressed',String(button.dataset.bugExample===id));
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-bug-example]');
 if(!button)return;
 const form=$('[data-bug-report]');if(!form)return;
 assignTemplate(form,button.dataset.bugExample);
 form.querySelector('[name="steps"]')?.focus({preventScroll:true});
});
document.addEventListener('submit',async event=>{
 const form=event.target;
 if(!form.matches('[data-bug-report]'))return;
 event.preventDefault();
 if(form.dataset.sending==='true'||form.dataset.sent==='true')return;
 if(!form.reportValidity())return;
 const values=new FormData(form);
 const error=$('[data-bug-error]',form),result=$('[data-bug-result]',form),submit=$('[type="submit"]',form);
 error.hidden=true;result.hidden=true;
 const category=String(values.get('category')||'other');
 const page=String(values.get('page')||'/').trim();
 const browser=(navigator.userAgent||'Browser not identified').slice(0,140);
 const message=[
  'WEBSITE BUG REPORT',
  'Category: '+(labels[category]||labels.other),
  'Priority: '+String(values.get('severity')||'medium'),
  'Affected page: '+page,
  'Browser: '+browser,
  '',
  'Steps to reproduce:',String(values.get('steps')||'').trim(),
  '',
  'Expected:',String(values.get('expected')||'').trim(),
  '',
  'Actual:',String(values.get('actual')||'').trim(),
  '',
  'Extra details:',String(values.get('details')||'None').trim()
 ].join('\n');
 if(message.length>2000){
  error.hidden=false;error.textContent='The report is too long. Shorten the extra details or steps and try again.';
  error.focus?.();return;
 }
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),16000);
 form.dataset.sending='true';form.setAttribute('aria-busy','true');
 submit.disabled=true;submit.textContent='Saving report…';
 try{
  const payload={kind:'bug',requestId:crypto.randomUUID(),
   name:String(values.get('name')||''),email:String(values.get('email')||''),
   service:'Website bug report',message,consent:values.get('consent')==='on',website:String(values.get('website')||'')};
  const response=await fetch('/api/enquiries',{
   method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
   body:JSON.stringify(payload),signal:controller.signal
  });
  let body;try{body=await response.json();}catch{throw new Error('Unable to read the report service response.');}
  if(!response.ok||!body.ok||!/^VZ-[A-F0-9]{12}$/.test(String(body.reference||''))){
   throw new Error(body?.error||'The report could not be saved.');
  }
  form.dataset.sent='true';
  submit.textContent='Report received ✓';
  result.hidden=false;
  result.replaceChildren();
  const title=document.createElement('h3');title.textContent='Your bug report is saved.';
  const note=document.createElement('p');note.textContent='Reference '+body.reference+' · The VELORYZ Studio team can review this report in Studio Control. Keep this reference when following up.';
  const again=document.createElement('button');again.type='button';again.textContent='Report another issue ↗';
  again.addEventListener('click',()=>{
   form.reset();form.dataset.sent='false';delete form.dataset.sending;
   assignTemplate(form,'navigation');result.hidden=true;
   submit.disabled=false;submit.textContent='Send bug report ↗';
   $('input[name="name"]',form)?.focus({preventScroll:true});
  });
  result.append(title,note,again);result.focus({preventScroll:true});
 }catch(e){
  error.hidden=false;error.textContent=e.name==='AbortError'?'The request timed out. Please try again.':(e.message||'Could not submit the report.');
  submit.disabled=false;submit.textContent='Retry bug report ↗';
 }finally{
  clearTimeout(timeout);form.dataset.sending='false';form.removeAttribute('aria-busy');
 }
});
window.VeloryzBugReport={render,templates};
})();
