
/* Smart Cart Studio | Small, dependency-free 3D math utilities. */
'use strict';
window.CartLab = window.CartLab || {};
CartLab.V = {
 add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
 sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
 mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
 dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 norm:a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l);},
 lerp:(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t)
};
CartLab.M = {
 identity:()=>new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
 mul:(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;},
 translate:(x,y,z)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]),
 scale:(x,y,z)=>new Float32Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]),
 rx:a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);},
 ry:a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);},
 rz:a=>{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]);},
 point:(m,p)=>{const x=p[0],y=p[1],z=p[2],w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w];},
 vector:(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2],m[1]*p[0]+m[5]*p[1]+m[9]*p[2],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]],
 perspective:(fov,asp,n,f)=>{const t=1/Math.tan(fov/2),nf=1/(n-f);return new Float32Array([t/asp,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,0,2*f*n*nf,0]);},
 ortho:(l,r,b,t,n,f)=>new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]),
 lookAt:(eye,target,up=[0,1,0])=>{const V=CartLab.V,z=V.norm(V.sub(eye,target)),x=V.norm(V.cross(up,z)),y=V.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,eye),-V.dot(y,eye),-V.dot(z,eye),1]);},
 inverse:a=>{
  const out=new Float32Array(16),rows=Array.from({length:4},(_,r)=>Array.from({length:8},(_,c)=>c<4?a[c*4+r]:(c-4===r?1:0)));
  for(let i=0;i<4;i++){let pivot=i;for(let j=i+1;j<4;j++)if(Math.abs(rows[j][i])>Math.abs(rows[pivot][i]))pivot=j;[rows[i],rows[pivot]]=[rows[pivot],rows[i]];const d=rows[i][i];if(Math.abs(d)<1e-12)throw new Error('Singular matrix');for(let c=0;c<8;c++)rows[i][c]/=d;for(let j=0;j<4;j++)if(j!==i){const k=rows[j][i];for(let c=0;c<8;c++)rows[j][c]-=k*rows[i][c];}}
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)out[c*4+r]=rows[r][c+4];return out;
 }
};
CartLab.transform=(p=[0,0,0],r=[0,0,0])=>{const M=CartLab.M;return M.mul(M.translate(...p),M.mul(M.rz(r[2]),M.mul(M.ry(r[1]),M.rx(r[0]))));};
CartLab.hex=(hex)=>{const x=parseInt(hex.replace('#',''),16);return [x>>16&255,x>>8&255,x&255].map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});};

