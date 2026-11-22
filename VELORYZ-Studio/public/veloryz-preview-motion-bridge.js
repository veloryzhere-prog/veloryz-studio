/* VELORYZ preview motion bridge, installed only into locally mirrored public site
   demos. No cookies, URL parameters, DOM content, user input or secrets are sent.
   The parent viewer and this source iframe remain isolated (sandbox opaque origin). */
(()=>{'use strict';
const match=location.pathname.match(/^\/design-source-previews\/([a-z0-9-]+)\/index\.html$/);
if(!match||window.parent===window)return;
const id=match[1];
let queued=false;
const scrollRoot=()=>document.scrollingElement||document.documentElement;
function progress(){
 const root=scrollRoot();
 const height=Math.max(0,Math.max(root.scrollHeight,document.documentElement.scrollHeight,document.body?.scrollHeight||0)-innerHeight);
 const y=Math.max(0,window.scrollY||root.scrollTop||0);
 return height>0?Math.min(100,Math.max(0,y/height*100)):0;
}
function emit(){
 queued=false;
 try{window.parent.postMessage({type:'veloryz:preview-progress',id,percent:Math.round(progress())},'*')}catch{}
}
function report(){if(queued)return;queued=true;requestAnimationFrame(emit)}
window.addEventListener('scroll',report,{passive:true});
document.addEventListener('scroll',report,true);
window.addEventListener('resize',report,{passive:true});
window.addEventListener('load',report,{once:true});
window.addEventListener('message',event=>{
 if(event.source!==window.parent)return;
 const message=event.data;
 if(!message||message.type!=='veloryz:preview-command'||message.id!==id)return;
 if(message.command==='report'){report();return}
 if(message.command==='top'){
  window.scrollTo({top:0,left:0,behavior:'auto'});
  for(const element of document.querySelectorAll('[data-scroll-container]'))element.scrollTo?.({top:0,behavior:'auto'});
  report();
  return;
 }
 if(message.command==='wheel'){
  const dy=Number(message.delta);
  if(!Number.isFinite(dy)||Math.abs(dy)>1800)return;
  const root=scrollRoot(),target=(root.scrollHeight>root.clientHeight+10)?root:
   [...document.querySelectorAll('main,section,[data-scroll-container]')].find(e=>e.scrollHeight>e.clientHeight+30) || root;
  target.scrollBy?.({top:dy,behavior:'auto'});
  report();
 }
});
requestAnimationFrame(report);
})();
