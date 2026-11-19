'use strict';
(()=>{
 function animateHeadlines(){
  if(window.StudioMotion?.level!=='full')return;
  document.querySelectorAll('#main h1').forEach(heading=>{
   if(heading.dataset.motionWords)return;
   heading.dataset.motionWords='true';
   const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT),nodes=[];
   let current;while((current=walker.nextNode()))nodes.push(current);
   let index=0;
   for(const node of nodes){
    if(!node.textContent.trim())continue;
    const fragment=document.createDocumentFragment();
    for(const token of node.textContent.split(/(\s+)/)){
     if(!token)continue;
     if(/^\s+$/.test(token)){fragment.append(document.createTextNode(token));continue;}
     const span=document.createElement('span');span.className='heading-word';span.style.setProperty('--word-index',String(index++));span.textContent=token;fragment.append(span);
    }
    node.replaceWith(fragment);
   }
  });
 }
 if(typeof document.createTreeWalker==='function'){document.addEventListener('studio:route',animateHeadlines);animateHeadlines();}
 const titles={spectra:'SPECTRA / expressive creative studio',nova:'NOVA / considered product workspace',muse:'MUSE / editorial objects'};
 const moods={orchid:'Orchid after hours.',aurora:'A quieter kind of energy.',ember:'A warmer point of view.'};
 const tabs={
  design:{symbol:'✳',title:'Give the idea<br>a point of view.',body:'Shape the visual language, hierarchy and details around what people need to do.'},
  build:{symbol:'⌘',title:'Make the details<br>work together.',body:'Turn the approved direction into responsive screens, clear states and connected workflows.'},
  move:{symbol:'↗',title:'Bring a little<br>more life.',body:'Use timing, movement and interaction to guide attention and make the experience feel considered.'}
 };
 function compare(value){
  const root=document.querySelector('[data-comparison]');if(!root)return;
  const number=Math.max(0,Math.min(100,Math.round(Number(value)||0)));
  root.style.setProperty('--comparison',number+'%');
  const input=document.querySelector('[data-comparison-range]'),output=document.querySelector('[data-comparison-output]');
  if(input){input.value=String(number);input.setAttribute('aria-valuetext',number+' percent of the new direction shown');}
  if(output)output.textContent=number+'%';
 }
 function selectTab(button,focus=false){
  const key=button.dataset.labTab,data=tabs[key];if(!data)return;
  const root=button.closest('.lab-tab-card'),panel=root.querySelector('[role=tabpanel]');
  root.querySelectorAll('[role=tab]').forEach(tab=>{const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
  panel.setAttribute('aria-labelledby',button.id);
  panel.innerHTML='<span class="lab-tab-symbol" aria-hidden="true">'+data.symbol+'</span><h3>'+data.title+'</h3><p>'+data.body+'</p>';
  if(window.StudioMotion?.level==='full')panel.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:280,easing:'ease-out'});
  if(focus)button.focus();
 }
 document.addEventListener('click',event=>{
  const concept=event.target.closest('[data-ui-concept]');
  if(concept){
   const kind=concept.dataset.uiConcept;if(!titles[kind])return;
   openModal('<div class="ui-concept-dialog"><span class="eyebrow">ORIGINAL STUDIO UI EXPLORATION</span><h2 id="dialog-title">'+titles[kind]+'</h2>'+uiConceptPreview(kind)+'<p>A visual direction created for the VELORYZ playground. This is a concept, not a live client website or a working commerce/product service.</p><div class="concept-dialog-actions"><a href="/create/" class="button">Shape a project like this ↗</a><button class="text-link" data-close>Keep exploring</button></div></div>','ui-concept-modal',concept);
   return;
  }
  if(event.target.closest('[data-comparison-reset]'))compare(50);
  const mood=event.target.closest('button[data-mood]');
  if(mood&&moods[mood.dataset.mood]){
   const card=mood.closest('[data-colour-study]');card.dataset.mood=mood.dataset.mood;
   card.querySelector('[data-mood-title]').textContent=moods[mood.dataset.mood];
   card.querySelectorAll('button[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b===mood)));
  }
  const tab=event.target.closest('[data-lab-tab]');if(tab)selectTab(tab);
 });
 document.addEventListener('input',event=>{if(event.target.matches('[data-comparison-range]'))compare(event.target.value);});
 document.addEventListener('keydown',event=>{
  const current=event.target.closest('[data-lab-tab]');if(!current||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const items=[...current.closest('[role=tablist]').querySelectorAll('[role=tab]')],index=items.indexOf(current);
  selectTab(items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowRight'?1:-1)+items.length)%items.length],true);
 });
 let drag=null;
 const position=event=>{const r=drag.getBoundingClientRect();compare(100-(event.clientX-r.left)/r.width*100);};
 document.addEventListener('pointerdown',event=>{
  const root=event.target.closest('[data-comparison]');if(!root||event.button!==0)return;
  drag=root;root.setPointerCapture?.(event.pointerId);position(event);
 });
 document.addEventListener('pointermove',event=>{if(drag)position(event);});
 const release=()=>{drag=null;};
 document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);
 document.addEventListener('studio:route',release);
})();
