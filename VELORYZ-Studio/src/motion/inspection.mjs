import {Quaternion,Vector3} from 'three';

// Compose drag increments in camera space so crossing the poles never locks an axis.
export function attachInspection(surface, wake, start, release=()=>{}) {
  const orientation = new Quaternion();
  const axis = new Vector3(), increment = new Quaternion();
  let pointer = null, x=0, y=0;
  const controller = new AbortController();
  const on = (type,fn) => surface.addEventListener(type,fn,{signal:controller.signal});
  function turn(dx,dy) {
    const distance = Math.hypot(dx,dy);
    if (!distance) return;
    axis.set(dy,dx,0).normalize();
    orientation.premultiply(increment.setFromAxisAngle(axis,distance)).normalize();
    wake();
  }
  function rotateYaw(radians){
    axis.set(0,1,0);
    orientation.premultiply(increment.setFromAxisAngle(axis,radians)).normalize();
    wake();
  }
  function reset() {orientation.identity();wake();}
  function end(event) {
    if (event.pointerId !== pointer) return;
    pointer = null;
    surface.removeAttribute('data-dragging');
    release();
  }
  on('pointerdown',event=>{
    if (pointer!==null || event.button!==0 || !event.isPrimary) return;
    pointer=event.pointerId; x=event.clientX; y=event.clientY;
    surface.setPointerCapture(pointer);
    surface.dataset.dragging='';
    surface.focus({preventScroll:true});
    start();
  });
  on('pointermove',event=>{
    if (event.pointerId!==pointer) return;
    const sensitivity=Math.PI*1.65/Math.max(180,Math.min(surface.clientWidth,surface.clientHeight));
    turn((event.clientX-x)*sensitivity,(event.clientY-y)*sensitivity);
    x=event.clientX; y=event.clientY;
  });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) on(type,end);
  on('keydown',event=>{
    const step=event.shiftKey?Math.PI/4:Math.PI/12;
    const angles = {ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
    if (event.key==='Home') {event.preventDefault();start();reset();}
    else if (angles[event.key]) {event.preventDefault();start();turn(...angles[event.key]);}
  });
  return {orientation,rotateYaw,reset,dispose:()=>controller.abort()};
}
