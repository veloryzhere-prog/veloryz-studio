import * as THREE from 'three';
export function createStudyModel(kind='ribbon', economical=false){
 const root=new THREE.Group();root.name=kind==='orbit'?'VELORYZ / Orbital study':'VELORYZ / Continuous ribbon';
 const material=new THREE.MeshStandardMaterial({color:0xdc50bc,metalness:.68,roughness:.2});
 if(kind==='orbit'){
  for(let i=0;i<3;i++){
   const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.095,economical?7:14,economical?44:100),material.clone());
   ring.material.color.setHex([0xf056a9,0x9e78ef,0x48b5ef][i]);
   ring.rotation.set(i*.75,i*.65,i*.4);root.add(ring);
  }
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.37,1),new THREE.MeshStandardMaterial({color:0xf5c5e7,metalness:.75,roughness:.12}));root.add(core);
 }else{
  const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(.8,.21,economical?65:160,economical?8:18,2,3),material);root.add(knot);
  const pebble=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,1),new THREE.MeshStandardMaterial({color:0x55bcff,metalness:.6,roughness:.18}));
  pebble.position.set(1.15,-.7,.15);root.add(pebble);
 }
 root.userData.parts=[...root.children];
 for(const part of root.children){part.userData.basePosition=part.position.toArray();part.userData.baseRotation=[part.rotation.x,part.rotation.y,part.rotation.z];}
 return root;
}
export function disposeModel(root){
 const geometries=new Set(),materials=new Set();
 root.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)for(const m of Array.isArray(n.material)?n.material:[n.material])materials.add(m);});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
}
