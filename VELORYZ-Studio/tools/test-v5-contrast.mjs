import assert from 'node:assert/strict';
const linear=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4;
function luminance(hex){const rgb=[1,3,5].map(i=>linear(parseInt(hex.slice(i,i+2),16)/255));return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function ratio(a,b){let x=luminance(a),y=luminance(b);if(x<y)[x,y]=[y,x];return (x+.05)/(y+.05);}
for(const [text,bg,required] of [['#231d19','#f7f0e4',4.5],['#5e5349','#f7f0e4',4.5],['#43352c','#fffdf8',4.5],['#ffffff','#b62c73',4.5],['#ffffff','#704ab4',4.5]])assert.ok(ratio(text,bg)>=required,`Insufficient token contrast: ${text} / ${bg}`);
console.log('V5 semantic text tokens and CTA endpoints pass 4.5:1 contrast calculation. Gradients, imagery and all computed combinations still require browser audit.');
