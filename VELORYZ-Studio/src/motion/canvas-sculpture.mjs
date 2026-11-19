import {Matrix4,Matrix3,Vector3,DoubleSide} from 'three';

// A painter for the convex plates used in the brand study; it reuses the actual
// model vertices and materials when the browser cannot create a WebGL context.
export function createCanvasSculpture() {
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d',{alpha:true});
  if (!ctx) return null;
  const cache=new WeakMap(), view=new Matrix4(), normals=new Matrix3(), normal=new Vector3();
  let width=1,height=1,ratio=1;
  function meshData(geometry) {
    if (cache.has(geometry)) return cache.get(geometry);
    const positions=geometry.attributes.position, indices=geometry.index;
    const coords=new Float32Array(positions.count*3);
    const faces=[];
    const groups=geometry.groups.length?geometry.groups:[{start:0,count:indices?.count??positions.count,materialIndex:0}];
    const a=new Vector3(),b=new Vector3(),c=new Vector3();
    for (const group of groups) {
      for (let i=group.start;i<group.start+group.count;i+=3) {
        const ids=[i,i+1,i+2].map(j=>indices?indices.getX(j):j);
        a.fromBufferAttribute(positions,ids[0]); b.fromBufferAttribute(positions,ids[1]); c.fromBufferAttribute(positions,ids[2]);
        const n=new Vector3().subVectors(b,a).cross(c.sub(a)).normalize();
        faces.push({ids:ids.map(id=>id*3),n,materialIndex:group.materialIndex});
      }
    }
    const data={positions,coords,faces};
    cache.set(geometry,data);return data;
  }
  function resize(w,h) {
    width=Math.max(1,w); height=Math.max(1,h);
    const pixelWidth=Math.round(width*ratio), pixelHeight=Math.round(height*ratio);
    if (canvas.width!==pixelWidth) canvas.width=pixelWidth;
    if (canvas.height!==pixelHeight) canvas.height=pixelHeight;
  }
  function render(scene,camera) {
    scene.updateMatrixWorld();camera.updateMatrixWorld();
    const triangles=[],focus=height*camera.projectionMatrix.elements[5]/2;
    scene.traverseVisible(mesh=>{
      if (!mesh.isMesh || mesh.userData.ambient) return;
      const {positions,coords,faces}=meshData(mesh.geometry);
      view.multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld);
      normals.getNormalMatrix(view);
      const matrix=view.elements;
      for (let i=0;i<positions.count;i++) {
        const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
        const depth=-(matrix[2]*x+matrix[6]*y+matrix[10]*z+matrix[14]);
        coords[3*i]=width/2+(matrix[0]*x+matrix[4]*y+matrix[8]*z+matrix[12])*focus/depth;
        coords[3*i+1]=height/2-(matrix[1]*x+matrix[5]*y+matrix[9]*z+matrix[13])*focus/depth;
        coords[3*i+2]=depth;
      }
      const mats=mesh.material;
      for (const {ids,n,materialIndex} of faces) {
        const [a,b,c]=ids;
        const mat=Array.isArray(mats)?mats[materialIndex]:mats;
        if (!mat || Math.min(coords[a+2],coords[b+2],coords[c+2])<camera.near) continue;
        const winding=(coords[b]-coords[a])*(coords[c+1]-coords[a+1])-(coords[b+1]-coords[a+1])*(coords[c]-coords[a]);
        if (winding>=0 && mat.side!==DoubleSide && !mat.wireframe) continue;
        normal.copy(n).applyNormalMatrix(normals);
        if(winding>0)normal.negate();
        const light=Math.max(0,-normal.x*.42+normal.y*.65+normal.z*.62);
        const shade=.52+.48*light, shine=31*Math.pow(light,12);
        const color=mat.color.getHex();
        const channel=shift=>Math.min(255,Math.round(((color>>shift)&255)*shade+shine));
        triangles.push({a,b,c,coords,z:(coords[a+2]+coords[b+2]+coords[c+2])/3,
          paint:'rgb('+channel(16)+','+channel(8)+','+channel(0)+')',mat});
      }
    });
    triangles.sort((a,b)=>b.z-a.z);
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    ctx.lineJoin='round';ctx.lineWidth=.65;
    for (const {a,b,c,coords:p,paint,mat} of triangles) {
      ctx.beginPath();ctx.moveTo(p[a],p[a+1]);ctx.lineTo(p[b],p[b+1]);ctx.lineTo(p[c],p[c+1]);ctx.closePath();
      ctx.globalAlpha=mat.opacity;ctx.strokeStyle=paint;
      if (!mat.wireframe) {ctx.fillStyle=paint;ctx.fill();}
      if (!mat.transparent) ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  return {domElement:canvas,setPixelRatio(value){ratio=Math.min(1.5,value);},setSize:resize,render,
    dispose(){canvas.width=canvas.height=1;}};
}
