
/* Procedural geometry. Every vertex carries a real component ID for selection. */
'use strict';
CartLab.Geometry = (()=>{
 const V=CartLab.V,M=CartLab.M,TAU=Math.PI*2;
 function quad(out,a,b,c,d,na,nb=na,nc=na,nd=na){out.push(...a,...na,...b,...nb,...c,...nc,...a,...na,...c,...nc,...d,...nd);}
 function box(w,h,d,r=0){
  const out=[],hs=[w/2,h/2,d/2];r=Math.min(r,...hs.map(v=>v*.8));
  // Outward-oriented local face bases. Rounded normals remain continuous at edges.
  const faces=[[[1,0,0],[0,0,-1],[0,1,0],hs[0],hs[2],hs[1]], [[-1,0,0],[0,0,1],[0,1,0],hs[0],hs[2],hs[1]], [[0,1,0],[1,0,0],[0,0,-1],hs[1],hs[0],hs[2]], [[0,-1,0],[1,0,0],[0,0,1],hs[1],hs[0],hs[2]], [[0,0,1],[1,0,0],[0,1,0],hs[2],hs[0],hs[1]], [[0,0,-1],[-1,0,0],[0,1,0],hs[2],hs[0],hs[1]]];
  const steps=s=>r?[ -s,-s+r*.3,-s+r,s-r,s-r*.3,s ]:[-s,s];
  for(const [n,u,v,a,b,c] of faces){
   const us=steps(b),vs=steps(c);
   const point=(x,y)=>{const p=V.add(V.mul(n,a),V.add(V.mul(u,x),V.mul(v,y)));if(!r)return [p,n];const q=p.map((e,i)=>Math.max(-hs[i]+r,Math.min(hs[i]-r,e)));const no=V.norm(V.sub(p,q));return [V.add(q,V.mul(no,r)),no];};
   for(let i=0;i<us.length-1;i++)for(let j=0;j<vs.length-1;j++){const a=point(us[i],vs[j]),b=point(us[i+1],vs[j]),c=point(us[i+1],vs[j+1]),d=point(us[i],vs[j+1]);quad(out,a[0],b[0],c[0],d[0],a[1],b[1],c[1],d[1]);}
  }return out;
 }
 function cylinder(radius,height,n=32,topRadius=radius){
  const out=[],y0=-height/2,y1=height/2,slope=(radius-topRadius)/height;
  for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);const n1=V.norm([ca,slope,sa]),n2=V.norm([cb,slope,sb]);
   quad(out,[radius*ca,y0,radius*sa],[topRadius*ca,y1,topRadius*sa],[topRadius*cb,y1,topRadius*sb],[radius*cb,y0,radius*sb],n1,n1,n2,n2);
   out.push(0,y1,0,0,1,0,topRadius*cb,y1,topRadius*sb,0,1,0,topRadius*ca,y1,topRadius*sa,0,1,0);
   out.push(0,y0,0,0,-1,0,radius*ca,y0,radius*sa,0,-1,0,radius*cb,y0,radius*sb,0,-1,0);
  }return out;
 }
 function torus(R,r,major=64,minor=10,start=0,end=TAU){
  const out=[];const p=(a,b)=>{const n=[Math.cos(a)*Math.cos(b),Math.sin(b),Math.sin(a)*Math.cos(b)];return [[(R+r*Math.cos(b))*Math.cos(a),r*Math.sin(b),(R+r*Math.cos(b))*Math.sin(a)],n];};
  for(let i=0;i<major;i++)for(let j=0;j<minor;j++){const a=start+(end-start)*i/major,b=start+(end-start)*(i+1)/major,c=TAU*j/minor,d=TAU*(j+1)/minor;const p0=p(a,c),p1=p(a,d),p2=p(b,d),p3=p(b,c);quad(out,p0[0],p1[0],p2[0],p3[0],p0[1],p1[1],p2[1],p3[1]);}return out;
 }
 function lathe(profile,n=64){
  const out=[];
  for(let j=0;j<profile.length-1;j++){
   const [r0,y0]=profile[j],[r1,y1]=profile[j+1],dy=y1-y0,dr=r1-r0;
   for(let i=0;i<n;i++){const a=TAU*i/n,b=TAU*(i+1)/n,na=V.norm([Math.cos(a)*dy,-dr,Math.sin(a)*dy]),nb=V.norm([Math.cos(b)*dy,-dr,Math.sin(b)*dy]);quad(out,[r0*Math.cos(a),y0,r0*Math.sin(a)],[r1*Math.cos(a),y1,r1*Math.sin(a)],[r1*Math.cos(b),y1,r1*Math.sin(b)],[r0*Math.cos(b),y0,r0*Math.sin(b)],na,na,nb,nb);}
  }return out;
 }
 function fender(radius,width,thickness,n=72){
  const out=[],point=(a,x,r)=>[x,Math.sin(a)*r,Math.cos(a)*r],normal=a=>[0,Math.sin(a),Math.cos(a)];
  for(let i=0;i<n;i++){
   const a=.10+(Math.PI-.20)*i/n,b=.10+(Math.PI-.20)*(i+1)/n;
   for(const [r,sign] of [[radius,1],[radius-thickness,-1]]){
    const na=V.mul(normal(a),sign),nb=V.mul(normal(b),sign);
    quad(out,point(a,-width/2,r),point(a,width/2,r),point(b,width/2,r),point(b,-width/2,r),na,na,nb,nb);
   }
   for(const sign of [-1,1]){const x=sign*width/2;quad(out,point(a,x,radius),point(b,x,radius),point(b,x,radius-thickness),point(a,x,radius-thickness),[sign,0,0]);}
  }
  return out;
 }
 function sphere(r,n=20,m=12){
  const out=[],p=(a,b)=>{const n=[Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)];return [V.mul(n,r),n];};
  for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=TAU*i/n,b=TAU*(i+1)/n,c=Math.PI*j/m,d=Math.PI*(j+1)/m;const ps=[p(a,c),p(b,c),p(b,d),p(a,d)];quad(out,...ps.map(p=>p[0]),...ps.map(p=>p[1]));}return out;
 }
 class Builder {
  constructor(){this.data=[];this.primitives=[];this.cache=new Map();this.decals=[];}
  add(geo,material,group=0,transform=M.identity()){
   const start=this.data.length/13,lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
   for(let i=0;i<geo.length;i+=6){const p=M.point(transform,geo.slice(i,i+3)),n=V.norm(M.vector(transform,geo.slice(i+3,i+6)));for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}this.data.push(...p,...n,...material.color,material.metal,material.rough,material.emission||0,group);}
   this.primitives.push({start,count:this.data.length/13-start,group,lo,hi});
  }
  cached(key,make){if(!this.cache.has(key))this.cache.set(key,make());return this.cache.get(key);}
  box(size,pos,material,group=0,r=.0015,rot=[0,0,0]){const key='b'+size.join(',')+','+r;this.add(this.cached(key,()=>box(...size,r)),material,group,CartLab.transform(pos,rot));}
  cyl(r,h,pos,material,group=0,rot=[0,0,0],segments=32,r2=r){this.add(this.cached(`c${r},${h},${segments},${r2}`,()=>cylinder(r,h,segments,r2)),material,group,CartLab.transform(pos,rot));}
  torus(R,r,pos,material,group=0,rot=[0,0,0],n=48,m=8,start=0,end=TAU){this.add(this.cached(`t${R},${r},${n},${m},${start},${end}`,()=>torus(R,r,n,m,start,end)),material,group,CartLab.transform(pos,rot));}
  sphere(r,pos,material,group=0){this.add(this.cached('s'+r,()=>sphere(r)),material,group,M.translate(...pos));}
  beam(a,b,width,depth,material,group=0,r=.001){const dir=V.norm(V.sub(b,a)),helper=Math.abs(dir[1])>.95?[1,0,0]:[0,1,0],x=V.norm(V.cross(helper,dir)),z=V.norm(V.cross(x,dir)),mid=V.mul(V.add(a,b),.5);const m=new Float32Array([x[0],x[1],x[2],0,dir[0],dir[1],dir[2],0,z[0],z[1],z[2],0,...mid,1]);this.add(this.cached(`b${width},${Math.hypot(...V.sub(b,a))},${depth},${r}`,()=>box(width,Math.hypot(...V.sub(b,a)),depth,r)),material,group,m);}
  rod(a,b,r,material,group=0,segments=16){const dir=V.norm(V.sub(b,a)),helper=Math.abs(dir[1])>.95?[1,0,0]:[0,1,0],x=V.norm(V.cross(helper,dir)),z=V.norm(V.cross(x,dir)),mid=V.mul(V.add(a,b),.5);const m=new Float32Array([x[0],x[1],x[2],0,dir[0],dir[1],dir[2],0,z[0],z[1],z[2],0,...mid,1]);this.add(this.cached(`r${r},${Math.hypot(...V.sub(b,a))},${segments}`,()=>cylinder(r,Math.hypot(...V.sub(b,a)),segments)),material,group,m);}
  tube(points,r,material,group=0){for(let i=0;i<points.length-1;i++)this.rod(points[i],points[i+1],r,material,group,10);for(let i=1;i<points.length-1;i++)this.sphere(r,points[i],material,group);}
  decal(text,width,height,pos,rot,group=0,options={}){this.decals.push({text,width,height,pos,rot,group,options});}
  finish(){return {vertices:new Float32Array(this.data),primitives:this.primitives,decals:this.decals};}
 }
 return {box,cylinder,torus,lathe,sphere,fender,Builder};
})();

