import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createLogo,setLogoMaterial,logoPolygons} from '../src/motion/logo-model.mjs';
const model=createLogo(),bounds=new THREE.Box3().setFromObject(model);
assert.equal(model.userData.parts.length,2);
assert(bounds.max.z-bounds.min.z>.75,'The machined logo must retain its front-to-back depth.');
for (const part of model.userData.parts) {
 assert.equal(part.children.filter(layer=>layer.name.startsWith('Polished edge rib')).length,5);
 assert(part.getObjectByName('Reverse enamel'));
}
for(const axis of ['x','y','z'])assert(Number.isFinite(bounds.min[axis])&&Number.isFinite(bounds.max[axis]));
// Every front silhouette vertex supplied in the design must lie within the model bounds.
for(const polygon of logoPolygons)for(const [x,y] of polygon.outline){
 assert((x-512)/256>=bounds.min.x&&(x-512)/256<=bounds.max.x);
 assert((512-y)/256>=bounds.min.y&&(512-y)/256<=bounds.max.y);
}
setLogoMaterial(model,'wire');model.traverse(n=>{if(n.isMesh)for(const m of Array.isArray(n.material)?n.material:[n.material])assert.equal(m.wireframe,true);});
setLogoMaterial(model,'glass');model.traverse(n=>{if(n.isMesh)for(const m of Array.isArray(n.material)?n.material:[n.material])assert(m.transparent&&m.opacity<1);});
setLogoMaterial(model,'solid');model.traverse(n=>{if(n.isMesh)for(const m of Array.isArray(n.material)?n.material:[n.material])assert.equal(m.opacity,1);});
const file=readFileSync(new URL('../public/assets/brand/veloryz-logo.glb',import.meta.url));
assert.equal(file.readUInt32LE(0),0x46546c67);assert.equal(file.readUInt32LE(4),2);assert.equal(file.readUInt32LE(8),file.length);
const asset=await new GLTFLoader().parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'');
let count=0;asset.scene.traverse(n=>{if(n.isMesh)count++;});
assert(count>=7,'Portable GLB must contain both extruded shards and their facets.');
const exportedBounds=new THREE.Box3().setFromObject(asset.scene);
assert(Math.abs(exportedBounds.getSize(new THREE.Vector3()).x-bounds.getSize(new THREE.Vector3()).x)<.001);
console.log('PASS: logo silhouette bounds, real 3D depth, material switching and portable GLB round-trip.');
for(const kind of ['ribbon','orbit']){
 const data=readFileSync(new URL('../public/assets/brand/study-'+kind+'.glb',import.meta.url));
 const imported=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 const size=new THREE.Box3().setFromObject(imported.scene).getSize(new THREE.Vector3());
 assert(size.x>1&&size.y>1&&size.z>.5,'Study model must contain real three-dimensional geometry.');
}
console.log('PASS: ribbon and orbital GLB models export as usable 3D geometry.');

// A complete turn around either axis comes back to the front, including through the poles.
const {attachInspection}=await import('../src/motion/inspection.mjs');
const surface=new EventTarget(), front=new THREE.Quaternion();
const control=attachInspection(surface,()=>{},()=>{});
function key(key,shiftKey=false) {
 surface.dispatchEvent(Object.assign(new Event('keydown',{cancelable:true}),{key,shiftKey}));
}
for (const arrow of ['ArrowRight','ArrowUp']) {
 for(let i=0;i<4;i++) key(arrow,true);
 assert(Math.abs(control.orientation.angleTo(front)-Math.PI)<1e-6);
 for(let i=0;i<4;i++) key(arrow,true);
 assert(control.orientation.angleTo(front)<1e-6);
}
key('ArrowLeft');key('ArrowDown');
assert(control.orientation.angleTo(front)>.3);
key('Home');
assert(control.orientation.angleTo(front)<1e-6);
control.dispose();key('ArrowUp');
assert(control.orientation.angleTo(front)<1e-6);
console.log('PASS: unrestricted vertical and horizontal inspection turns, home reset and cleanup.');
