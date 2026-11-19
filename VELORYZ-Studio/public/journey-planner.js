'use strict';
(()=>{
 const storageKey='veloryz.planner.v1',stepNames=['Direction','Scope','Review'];
 let step=0,stories=[],scrollFrame=0;
 const compact=matchMedia('(max-width: 760px)');
 function persist(){
  projectBrief=VeloryzPlanner.normalize(projectBrief);
  let message='Saved in this tab. Nothing has been sent.';
  try{sessionStorage.setItem(storageKey,JSON.stringify(projectBrief));}catch{message='Kept on this page only. Nothing has been sent.';}
  const status=document.querySelector('[data-planner-save-status]');if(status)status.textContent=message;
  const review=document.querySelector('[data-planner-review-copy]');if(review)review.innerHTML=plannerReview();
 }
 function chooseStep(value,focus=true){
  const root=document.querySelector('#guided-project-planner');if(!root)return;
  step=Math.max(0,Math.min(2,Number(value)||0));
  root.querySelectorAll('[data-planner-panel]').forEach((panel,i)=>{panel.hidden=i!==step;});
  document.querySelectorAll('[data-planner-go]').forEach(button=>{
   const index=Number(button.dataset.plannerGo);button.setAttribute('aria-current',index===step?'step':'false');
   button.classList.toggle('complete',index<step);
  });
  root.querySelector('[data-planner-back]').disabled=step===0;
  root.querySelector('[data-planner-next]').hidden=step===2;
  root.querySelector('[data-planner-submit]').hidden=step!==2;
  root.querySelector('.planner-progress span').style.width=((step+1)/3*100)+'%';
  root.querySelector('.planner-step-status').textContent='Step '+(step+1)+' of 3 · '+stepNames[step];
  persist();
  if(focus){const panel=root.querySelector('[data-planner-panel="'+step+'"]');panel.querySelector('[data-planner-heading]').focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:window.StudioMotion?.matches?'auto':'smooth'});}
 }
 function validateGoal(){
  const input=document.querySelector('[data-planner-goal]');if(!input)return false;
  const error=VeloryzPlanner.goalError(input.value),node=document.querySelector('#planner-goal-error');
  input.setAttribute('aria-invalid',String(!!error));node.hidden=!error;node.textContent=error;
  if(error){input.focus();return false;}return true;
 }
 function selectStory(story,index,fromControl=false){
  index=Math.max(0,Math.min(story.chapters.length-1,Number(index)||0));
  story.active=index;story.root.dataset.stage=String(index);
  story.root.style.setProperty('--journey-progress',String(index/(story.chapters.length-1)));
  story.root.querySelectorAll('[data-journey-select]').forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));
  story.chapters.forEach((chapter,i)=>{chapter.hidden=compact.matches&&i!==index;chapter.classList.toggle('is-current',index===i);});
  const caption=story.root.querySelector('[data-journey-caption]');caption.textContent='0'+(index+1)+' / '+journeyStages[index][0];
  if(fromControl&&!compact.matches)story.chapters[index].scrollIntoView({block:'center',behavior:window.StudioMotion?.matches?'auto':'smooth'});
 }
 function scrollStories(){
  scrollFrame=0;
  if(compact.matches)return;
  for(const story of stories){
   const bounds=story.root.getBoundingClientRect();if(bounds.bottom<0||bounds.top>innerHeight)continue;
   let closest=0,distance=Infinity;
   story.chapters.forEach((chapter,i)=>{const rect=chapter.getBoundingClientRect(),delta=Math.abs(rect.top+Math.min(rect.height,300)/2-innerHeight*.5);if(delta<distance){closest=i;distance=delta;}});
   if(closest!==story.active)selectStory(story,closest);
  }
 }
 function schedule(){if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollStories);}
 function mount(){
  stories=[...document.querySelectorAll('[data-project-journey]')].map(root=>({root,active:0,chapters:[...root.querySelectorAll('[data-journey-chapter]')]}));
  stories.forEach(story=>selectStory(story,0));
  if(document.querySelector('#guided-project-planner'))chooseStep(step,false);
  schedule();
 }
 document.addEventListener('studio:route',mount);
 document.addEventListener('studio:brief',persist);
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-planner-go'))chooseStep(button.dataset.plannerGo);
  if(button.hasAttribute('data-planner-next'))chooseStep(step+1);
  if(button.hasAttribute('data-planner-back'))chooseStep(step-1);
  if(button.hasAttribute('data-planner-clear')){
   step=0;projectBrief=VeloryzPlanner.normalize();chosenDesign=null;
   try{sessionStorage.removeItem(storageKey);}catch{}
   if(currentRoute==='/create/'){renderRoute('/create/',false);chooseStep(0);}
  }
  if(button.hasAttribute('data-journey-select')){
   const story=stories.find(s=>s.root===button.closest('[data-project-journey]'));if(story)selectStory(story,button.dataset.journeySelect,true);
  }
 });
 document.addEventListener('input',event=>{
  if(!event.target.matches('[data-planner-goal]'))return;
  projectBrief.goal=event.target.value.slice(0,1000);
  const counter=document.querySelector('[data-goal-count]');if(counter)counter.textContent=projectBrief.goal.length+'/1000';
  if(event.target.getAttribute('aria-invalid')==='true'){const node=document.querySelector('#planner-goal-error');if(!VeloryzPlanner.goalError(event.target.value)){event.target.setAttribute('aria-invalid','false');node.hidden=true;}}
  persist();
 });
 document.addEventListener('change',event=>{
  if(event.target.matches('[data-planner-asset]')){
   projectBrief.assets=[...document.querySelectorAll('[data-planner-asset]:checked')].map(input=>input.dataset.plannerAsset);
   persist();
  }
 });
 document.addEventListener('submit',event=>{
  if(event.target.id!=='guided-project-planner')return;
  event.preventDefault();if(step<2){chooseStep(step+1);return;}
  if(!validateGoal())return;
  projectBrief.goal=document.querySelector('[data-planner-goal]').value;persist();
  navigate('/book/');
 });
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 compact.addEventListener?.('change',()=>{stories.forEach(story=>selectStory(story,story.active));schedule();});
 mount();
})();
