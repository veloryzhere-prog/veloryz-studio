// The original animated V is unchanged. Parse its 3D runtime only near a scene.
let loading=null,requested=false,observer=null,idleScheduled=false;
function fallback(){
 document.querySelectorAll('[data-logo-scene]:not(:has(canvas))').forEach(el=>{el.dataset.webgl='fallback';});
}
function loadRuntime(){
 if(loading||window.StudioMotion?.onboardingActive)return;
 loading=import('/motion-3d.js'+new URL(import.meta.url).search).catch(()=>{loading=null;fallback();});
}
function scheduleRuntime(){
 if(loading||idleScheduled)return;
 idleScheduled=true;
 const load=()=>{idleScheduled=false;loadRuntime();};
 if(typeof requestIdleCallback==='function')requestIdleCallback(load,{timeout:800});
 else setTimeout(load,200);
}
function mountWhenNeeded(){
 if(window.StudioMotion?.onboardingActive||loading)return;
 const nodes=[...document.querySelectorAll('[data-logo-scene]')];
 if(!nodes.length)return;
 if(window.StudioMotion&&window.StudioMotion.level!=='full'&&!requested){fallback();return;}
 if(requested){loadRuntime();return;}
 observer?.disconnect();
 if(typeof IntersectionObserver!=='function'){scheduleRuntime();return;}
 observer=new IntersectionObserver(entries=>{
  if(entries.some(e=>e.isIntersecting)){observer.disconnect();observer=null;scheduleRuntime();}
 },{rootMargin:'140px'});
 nodes.forEach(node=>observer.observe(node));
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-inspect-logo]')){requested=true;loadRuntime();}
});
document.addEventListener('studio:route',mountWhenNeeded);
window.addEventListener('pageshow',mountWhenNeeded);
window.StudioMotion?.addEventListener('change',mountWhenNeeded);
document.addEventListener('studio:motion-intro-complete',mountWhenNeeded);
mountWhenNeeded();
