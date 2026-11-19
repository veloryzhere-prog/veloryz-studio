// Honor a quiet first paint. A deliberate inspection can load the model in any mode.
let loading=null, requested=false;
function fallback(){
 document.querySelectorAll('[data-logo-scene]:not(:has(canvas))').forEach(node=>{node.dataset.webgl='fallback';});
}
function mountWhenNeeded(){
 if(!document.querySelector('[data-logo-scene]'))return;
 if(window.StudioMotion&&window.StudioMotion.level!=='full'&&!requested){fallback();return;}
 if(!loading)loading=import('/motion-3d.js'+new URL(import.meta.url).search).catch(()=>{loading=null;fallback();});
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-inspect-logo]')){requested=true;mountWhenNeeded();}
});
document.addEventListener('studio:route',mountWhenNeeded);
window.addEventListener('pageshow',mountWhenNeeded);
window.StudioMotion?.addEventListener('change',mountWhenNeeded);
mountWhenNeeded();
