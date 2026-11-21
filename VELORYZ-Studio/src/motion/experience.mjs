import * as THREE from 'three';
import {createLogo,setLogoMaterial} from './logo-model.mjs';
import {createStudyModel,disposeModel} from './study-models.mjs';
import {attachInspection} from './inspection.mjs';
import {createCanvasSculpture} from './canvas-sculpture.mjs';

const scenes=new Map();
const motion=()=>window.StudioMotion?.level==='full';
const clamp=v=>Math.max(0,Math.min(1,v));
function mount(container,softwareOnly=false,previousPose=null) {
  if (scenes.has(container) || !container.isConnected) return;
  const target=container.closest('.logo-stage');
  const story=container.closest('.assembly-sequence');
  const economical=(navigator.hardwareConcurrency||8)<=4 || (navigator.deviceMemory||8)<=4 || matchMedia('(max-width:850px), (pointer:coarse)').matches;
  let renderer, software=softwareOnly;
  if (!softwareOnly) {
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:!economical,powerPreference:'low-power'});
      renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    } catch {software=true;}
  }
  if (software) renderer=createCanvasSculpture();
  if (!renderer) {container.dataset.webgl='fallback';return;}
  const canvas=renderer.domElement;
  canvas.setAttribute('aria-hidden','true');
  container.append(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,economical?1:1.2));
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);
  scene.add(new THREE.HemisphereLight(0xffeaf4,0x785b76,1.65));
  for (const [color,power,x,y,z] of [[0xfff4ed,3.7,-3,5,6],[0x9ebdff,2.5,4,2,-2],[0xff94c4,1.6,-3,-2,-3]]) {
    const light=new THREE.DirectionalLight(color,power);light.position.set(x,y,z);scene.add(light);
  }
  let model=createLogo();
  const pivot=new THREE.Group();pivot.add(model);scene.add(pivot);
  const entryEuler=new THREE.Euler(0,0,0,'YXZ');
  let visible=false, frame=0, last=0, elapsed=0, speed=1, view='front', mode='solid', explosion=0;
  let manual=false, disposed=false, inspection;
  function wake(){if(!frame && !disposed && visible && !document.hidden)frame=requestAnimationFrame(render);}
  function inspect(){
    if (!manual && inspection) inspection.orientation.copy(pivot.quaternion);
    manual=true;elapsed=Math.max(elapsed,1.6);
    target.querySelectorAll('[data-logo-view]').forEach(b=>b.setAttribute('aria-pressed','false'));
    wake();
  }
  if (!story) {
    inspection=attachInspection(container,wake,inspect);
    if (previousPose) {manual=true;inspection.orientation.copy(previousPose);}
    container.tabIndex=0;container.setAttribute('role','group');
    container.setAttribute('aria-label','Rotate sculpture. Drag in any direction, or use the arrow keys. Home returns to the front.');
  }
  const controller=new AbortController();
  const on=(node,type,fn)=>node.addEventListener(type,fn,{signal:controller.signal});
  function setSize() {
    const w=container.clientWidth,h=container.clientHeight;
    if (!w||!h) return;
    camera.aspect=w/h;camera.position.z=(story?6.9:5.05)/Math.min(1,camera.aspect);
    camera.updateProjectionMatrix();renderer.setSize(w,h,false);wake();
  }
  function render(time) {
    frame=0;
    if (disposed||!visible||document.hidden) return;
    const active=motion(),dt=last?Math.min(.08,(time-last)/1000):0;
    // Keep high-frequency updates for direct inspection, limit idle GPU work.
    const interval=manual?16:software?55:economical?38:30;
    if(last&&time-last<interval){if(active||manual||story)wake();return;}
    last=time;
    if(active)elapsed+=dt*speed;
    const p=story&&active?(story.assemblyProgress??0):0;
    const lift=story?Math.pow(Math.sin(p*Math.PI),1.65):0;
    const scroll=active&&!manual&&target.classList.contains('logo-stage-hero')?clamp(-target.getBoundingClientRect().top/Math.max(1,target.clientHeight)):0;
    const entry=active&&!story?1-Math.pow(1-clamp(elapsed/1.6),4):1;
    const wanted=view==='explode'?1:0;
    explosion+= (wanted-explosion)*(active?1-Math.exp(-dt*9):1);
    const auto=active&&!manual;
    let yaw=manual?0:-.4, pitch=manual?0:.085;
    if (story) {yaw=-.23+p*3.18;pitch=.08-lift*.28;}
    else if(auto) {yaw+=view==='orbit'?elapsed*.44:Math.sin(elapsed*.38)*.15+scroll*.95;pitch+=Math.sin(elapsed*.43)*.048+scroll*.12;}
    pivot.quaternion.setFromEuler(entryEuler.set(pitch,yaw,manual?0:-.025,'YXZ'));
    if(inspection)pivot.quaternion.premultiply(inspection.orientation);
    model.position.y=auto&&!story?Math.sin(elapsed*.75)*.038:0;
    model.userData.parts.forEach((part,i)=>{
      const pos=part.userData.basePosition||[0,0,0],rot=part.userData.baseRotation||[0,0,0];
      const split=explosion+lift*.64;
      part.position.set(pos[0]+(1-entry)*(i?1.3:-1.1)+split*(i%2?.23:-.23),pos[1]+(1-entry)*(i?.8:-.5)+split*(i%2?.23:-.1),pos[2]+(1-entry)*(i?-1.5:1)+split*(i%2?-.16:.16));
      part.rotation.set(rot[0],rot[1]+(1-entry)*(i?-.8:.7)+split*(i%2?-.10:.10),rot[2]);
      // Separate the cover plates, edge ribs and core along their local depth.
      for(const layer of part.children){
        if(layer.userData.restZ===undefined)layer.userData.restZ=layer.position.z;
        layer.position.z=layer.userData.restZ*(1+1.65*lift+explosion*.66);
      }
    });
    renderer.render(scene,camera);
    const mode=software?'software':'ready';
    if(container.dataset.webgl!==mode)container.dataset.webgl=mode;
    if(active&&!story&&(!manual||Math.abs(wanted-explosion)>.002))wake();
  }
  function changed(){last=0;wake();}
  window.StudioMotion?.addEventListener('change',changed);
  on(document,'visibilitychange',changed);
  if(story)on(story,'studio:assembly',wake);
  on(target,'click',e=>{
    const button=e.target.closest('button');
    if (!button) return;
    if(button.hasAttribute('data-logo-material')){mode=button.dataset.logoMaterial;setLogoMaterial(model,mode);target.querySelectorAll('[data-logo-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}
    if(button.hasAttribute('data-logo-view')){
      view=button.dataset.logoView;manual=view==='front';elapsed=Math.max(elapsed,1.6);inspection?.reset();
      target.querySelectorAll('[data-logo-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    }
    if(button.hasAttribute('data-logo-object')){
      const kind=button.dataset.logoObject;pivot.remove(model);disposeModel(model);
      model=kind==='logo'?createLogo():createStudyModel(kind,software||economical);pivot.add(model);
      setLogoMaterial(model,mode);inspection?.reset();manual=false;elapsed=0;
      target.querySelectorAll('[data-logo-object]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    }
    if(button.hasAttribute('data-logo-replay')){manual=false;inspection?.reset();elapsed=0;}
    wake();
  });
  on(target,'input',e=>{if(e.target.matches('[data-logo-speed]')){speed=Math.max(.25,Math.min(1.75,Number(e.target.value)||1));wake();}});
  const resize=new ResizeObserver(setSize);resize.observe(container);
  const visibility=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;last=0;
    if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}
  },{rootMargin:'40px'});visibility.observe(container);
  function dispose(){
    disposed=true;cancelAnimationFrame(frame);controller.abort();inspection?.dispose();
    resize.disconnect();visibility.disconnect();window.StudioMotion?.removeEventListener('change',changed);
    disposeModel(model);renderer.dispose();canvas.remove();container.removeAttribute('tabindex');
  }
  if(!software)on(canvas,'webglcontextlost',e=>{
    e.preventDefault();const pose=inspection?.orientation.clone();
    dispose();scenes.delete(container);mount(container,true,pose);
  });
  scenes.set(container,dispose);
  setSize();
}
const near=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){near.unobserve(entry.target);mount(entry.target);}
},{rootMargin:'180px'});
function refresh() {
  near.disconnect();
  for(const [node,dispose] of scenes)if(!node.isConnected){dispose();scenes.delete(node);}
  document.querySelectorAll('[data-logo-scene]').forEach(node=>{if(!scenes.has(node))near.observe(node);});
}
document.addEventListener('studio:route',refresh);
window.addEventListener('pagehide',()=>{near.disconnect();for(const dispose of scenes.values())dispose();scenes.clear();});
window.addEventListener('pageshow',refresh);
refresh();
