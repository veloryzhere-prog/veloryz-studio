import * as THREE from 'three';

// Coordinates follow the two silhouettes of the original VELORYZ artwork.
export const logoPolygons = [
  {outline:[[194,224],[436,224],[648,678],[558,798]], color:0xf52b92, depth:.77},
  {outline:[[602,224],[830,224],[663,542],[572,436]], color:0x5189ff, depth:.66}
];
const point = ([x,y]) => new THREE.Vector2((x-512)/256,(512-y)/256);
const facets = [
  [
    [[[436,224],[648,678],[558,798]],0xad165f],
    [[[194,224],[324,225],[459,460],[284,262]],0xff9ed2],
    [[[324,225],[436,224],[459,460]],0xff69ac]
  ],
  [
    [[[602,224],[830,224],[572,436]],0x8067ff],
    [[[602,224],[663,224],[572,436]],0xc49aff]
  ]
];
const metal = (color,metalness=.46,roughness=.26) =>
  new THREE.MeshStandardMaterial({color,metalness,roughness});

function makePlate(shape, name, z, depth, bevel, cap, edge) {
  const geometry = new THREE.ExtrudeGeometry(shape,{
    depth, bevelEnabled:true, bevelThickness:bevel, bevelSize:bevel, bevelSegments:2, steps:1
  });
  const mesh = new THREE.Mesh(geometry,[cap,edge]);
  mesh.name = name;
  mesh.position.z = z;
  return mesh;
}

export function createLogo() {
  const root = new THREE.Group();
  root.name = 'VELORYZ / machined V';
  const parts = logoPolygons.map(({outline,color,depth}, index) => {
    const part = new THREE.Group();
    part.name = index ? 'Blue shard' : 'Pink blade';
    const points = outline.map(point);
    const center = points.reduce((sum,vertex)=>sum.add(vertex),new THREE.Vector2()).divideScalar(points.length);
    const shape = new THREE.Shape(points);
    const inner = new THREE.Shape(points.map(p=>p.clone().sub(center).multiplyScalar(.94).add(center)));
    const face = metal(color), rim = metal(index ? 0xc6c7fa : 0xffbbd7,.6,.22);
    const edge = metal(index ? 0x45448f : 0x81355c,.62,.3);
    const half = depth/2;
    part.add(makePlate(inner,'Recessed spine',-half,depth,.014,edge,edge));
    for (let i=0;i<5;i++) {
      const z = -half+.082+i*(depth-.18)/4;
      part.add(makePlate(shape,'Polished edge rib '+(i+1),z,.018,.006,edge,rim));
    }
    const skin = .053, bevel = .019;
    part.add(makePlate(shape,'Front enamel',half-skin,skin,bevel,face,rim));
    part.add(makePlate(shape,'Reverse enamel',-half,skin,bevel,face,rim));
    for (const side of [-1,1]) {
      facets[index].forEach(([polygon,tint],i)=>{
        const foil = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(polygon.map(point))),metal(tint,.31,.28));
        foil.name = (side>0?'Face':'Reverse')+' facet '+(i+1);
        foil.material.side = THREE.DoubleSide;
        foil.position.z = side*(half+bevel+.001+i*.001);
        part.add(foil);
      });
    }
    root.add(part);
    return part;
  });
  // Scene references are runtime-only and should not be serialized as duplicate GLB extras.
  Object.defineProperty(root.userData,'parts',{value:parts});
  return root;
}

export function setLogoMaterial(logo, mode) {
  logo.traverse(node=>{
    if (!node.isMesh) return;
    for (const m of Array.isArray(node.material)?node.material:[node.material]) {
      if (!m.userData.finish) m.userData.finish = [m.metalness,m.roughness];
      m.wireframe = mode==='wire';
      m.transparent = mode==='glass';
      m.opacity = m.transparent ? .43 : 1;
      m.metalness = m.transparent ? .1 : m.userData.finish[0];
      m.roughness = m.transparent ? .05 : m.userData.finish[1];
      m.needsUpdate = true;
    }
  });
}
