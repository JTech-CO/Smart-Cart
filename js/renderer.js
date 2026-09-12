
/* WebGL 2 studio renderer. Cook-Torrance direct light + analytic studio reflections.
   No network, external runtime, CAD kernel, sensor feed, or hardware control. */
'use strict';
CartLab.Renderer = (()=>{
 const M=CartLab.M,V=CartLab.V,PI=Math.PI,MAX_PARTS=24;
 const mainVS=`#version 300 es
 precision highp float;
 layout(location=0) in vec3 a_position;
 layout(location=1) in vec3 a_normal;
 layout(location=2) in vec3 a_color;
 layout(location=3) in vec4 a_properties;
 uniform mat4 u_vp; uniform mat4 u_lightVP; uniform vec3 u_offsets[24];
 out vec3 v_position; out vec3 v_normal; out vec3 v_color;
 out vec3 v_surface; out vec4 v_shadow; flat out int v_part;
 void main(){v_part=int(a_properties.w+.5);v_position=a_position+u_offsets[v_part];
 v_normal=a_normal;v_color=a_color;v_surface=a_properties.xyz;
 v_shadow=u_lightVP*vec4(v_position,1.);gl_Position=u_vp*vec4(v_position,1.);}`;
 const mainFS=`#version 300 es
 precision highp float; precision highp int;
 in vec3 v_position;in vec3 v_normal;in vec3 v_color;in vec3 v_surface;in vec4 v_shadow;flat in int v_part;
 uniform vec3 u_eye;uniform sampler2D u_shadow;uniform int u_hidden[24];uniform int u_selected[24];
 uniform int u_hasSelection;uniform int u_grid;uniform int u_lightTheme;uniform float u_exposure;uniform float u_shadowSize;
 out vec4 fragColor;
 const float PI=3.14159265359;
 vec3 fresnel(float ct,vec3 F0){return F0+(1.-F0)*pow(clamp(1.-ct,0.,1.),5.);}
 float distribution(float nh,float r){float a=r*r,a2=a*a,d=nh*nh*(a2-1.)+1.;return a2/max(PI*d*d,.00001);}
 float geometry(float nv,float r){float k=(r+1.);k=k*k/8.;return nv/(nv*(1.-k)+k);}
 vec3 brdf(vec3 N,vec3 V,vec3 L,vec3 base,float metal,float rough,vec3 intensity){
 vec3 H=normalize(V+L);float nv=max(dot(N,V),.001),nl=max(dot(N,L),0.),nh=max(dot(N,H),0.),hv=max(dot(H,V),0.);
 vec3 F=fresnel(hv,mix(vec3(.04),base,metal));float D=distribution(nh,rough);float G=geometry(nv,rough)*geometry(nl,rough);
 return (((1.-F)*(1.-metal)*base/PI)+(D*G*F/max(4.*nv*nl,.0001)))*intensity*nl;}
 float softbox(vec3 R,vec3 aim,vec2 size,float rough){
 vec3 n=normalize(aim);vec3 right=normalize(cross(vec3(0.,1.,0.),n));vec3 up=cross(n,right);
 float den=dot(R,n);if(den<=0.)return 0.;vec2 uv=vec2(dot(R,right),dot(R,up))/den;
 float dist=max(abs(uv.x)-size.x,abs(uv.y)-size.y);float blur=.018+rough*rough*.8;
 return (1.-smoothstep(-blur,blur,dist))/(1.+rough*.75);}
 vec3 environment(vec3 R,float rough){
 vec3 base=mix(vec3(.028,.032,.038),vec3(.21,.235,.26),smoothstep(-.3,1.,R.y));
 base+=vec3(4.1,4.05,3.95)*softbox(R,vec3(-2.4,3.,2.),vec2(.60,.85),rough);
 base+=vec3(1.8,2.05,2.4)*softbox(R,vec3(2.,2.1,-2.4),vec2(.24,.85),rough);
 base+=vec3(1.45,1.40,1.34)*softbox(R,vec3(2.8,.4,2.3),vec2(.15,.72),rough);
 return base;}
 float shadow(float nl){vec3 s=v_shadow.xyz/v_shadow.w*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;
 float bias=max(.00042*(1.-nl),.00018);float value=0.;
 for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++){float z=texture(u_shadow,s.xy+vec2(float(x),float(y))*1.25/u_shadowSize).r;value+=s.z-bias<=z?1.:0.;}
 return value/25.;}
 vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
 void main(){if(u_hidden[v_part]==1)discard;
 vec3 N=normalize(v_normal),W=normalize(u_eye-v_position);vec3 base=v_color;float metal=v_surface.x,rough=clamp(v_surface.y,.08,1.),emission=v_surface.z;
 float alpha=1.;
 if(v_part==23){base=u_lightTheme==1?vec3(.64,.67,.70):vec3(.026,.032,.040);alpha=1.-smoothstep(1.6,4.2,length(v_position.xz));
 if(u_grid==1){vec2 co=v_position.xz/.10;vec2 gr=abs(fract(co-.5)-.5)/max(fwidth(co),vec2(.0001));float lines=(1.-min(min(gr.x,gr.y),1.))*.24*(1.-smoothstep(.8,2.6,length(v_position.xz)));base=mix(base,u_lightTheme==1?vec3(.36):vec3(.1,.125,.155),lines);}}
 float nv=max(dot(N,W),.001);vec3 F0=mix(vec3(.04),base,metal);
 vec3 L=normalize(vec3(-2.4,3.8,2.8));float sh=shadow(max(dot(N,L),0.));
 vec3 light=brdf(N,W,L,base,metal,rough,vec3(4.,3.92,3.8))*mix(.10,1.,sh);
 light+=brdf(N,W,normalize(vec3(3.,2.,-3.)),base,metal,rough,vec3(1.5,1.8,2.2));
 light+=brdf(N,W,normalize(vec3(2.,.8,2.)),base,metal,rough,vec3(.85,.76,.67));
 light+=brdf(N,W,normalize(vec3(-1.,-.8,-1.)),base,metal,rough,vec3(.18,.23,.28));
 float ao=1.;if(v_position.y<.27&&abs(v_position.x)<.31&&abs(v_position.z)<.46&&v_part!=23)ao=.72;
 if(v_part==23){float a=pow(v_position.x/.43,4.)+pow(v_position.z/.56,4.);ao=1.-.66*exp(-a);
 for(int i=0;i<4;i++){vec2 c=vec2(i<2?-.38:.38,(i==0||i==2)?-.38:.39);ao*=1.-.45*exp(-dot(v_position.xz-c,v_position.xz-c)/.004);}}
 vec3 ambient=mix(vec3(.17,.195,.23),vec3(.48,.50,.52),N.y*.5+.5)*base*(1.-metal)*ao;
 vec4 c0=vec4(-1.,-.0275,-.572,.022),c1=vec4(1.,.0425,1.04,-.04);vec4 r=rough*c0+c1;
 float a004=min(r.x*r.x,exp2(-9.28*nv))*r.x+r.y;vec2 AB=vec2(-1.04,1.04)*a004+r.zw;
 vec3 spec=environment(reflect(-W,N),rough)*(F0*AB.x+AB.y)*ao;
 vec3 color=light+ambient+spec+base*emission;
 if(u_hasSelection==1&&v_part!=23){if(u_selected[v_part]==0)color*=.64;else color+=vec3(.28,.073,.014)*pow(1.-nv,2.)+.017;}
 color=aces(color*u_exposure);color=pow(color,vec3(1./2.2));
 float grain=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.0018;
 fragColor=vec4(color+grain,alpha);
 }`;
 const shadowVS=`#version 300 es
 precision highp float;layout(location=0) in vec3 a_position;layout(location=3) in vec4 a_properties;
 uniform mat4 u_lightVP;uniform vec3 u_offsets[24];flat out int v_part;
 void main(){v_part=int(a_properties.w+.5);gl_Position=u_lightVP*vec4(a_position+u_offsets[v_part],1.);}`;
 const shadowFS=`#version 300 es
 precision highp float;flat in int v_part;uniform int u_hidden[24];void main(){if(v_part==23||u_hidden[v_part]==1)discard;}`;
 const lineVS=`#version 300 es
 precision highp float;layout(location=0) in vec3 a_position;layout(location=1) in vec4 a_color;uniform mat4 u_vp;
 out vec4 v_color;void main(){v_color=a_color;gl_Position=u_vp*vec4(a_position,1.);}`;
 const lineFS=`#version 300 es
 precision highp float;in vec4 v_color;out vec4 fragColor;void main(){fragColor=v_color;}`;
 const decalVS=`#version 300 es
 precision highp float;layout(location=0) in vec3 a_position;layout(location=1) in vec3 a_normal;layout(location=2) in vec2 a_uv;
 uniform mat4 u_vp;uniform vec3 u_offset;out vec2 v_uv;out vec3 v_normal;
 void main(){v_uv=a_uv;v_normal=a_normal;gl_Position=u_vp*vec4(a_position+u_offset,1.);}`;
 const decalFS=`#version 300 es
 precision highp float;in vec2 v_uv;in vec3 v_normal;uniform sampler2D u_tex;uniform float u_exposure;uniform float u_dim;
 out vec4 fragColor;void main(){vec4 t=texture(u_tex,v_uv);if(t.a<.02)discard;float d=.65+.55*max(dot(normalize(v_normal),normalize(vec3(-2.,4.,3.))),0.);
 vec3 x=pow(t.rgb,vec3(2.2))*d*u_exposure*u_dim;vec3 c=clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);fragColor=vec4(pow(c,vec3(1./2.2)),t.a);}`;
 function compile(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
 function program(gl,vs,fs){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));gl.deleteShader(v);gl.deleteShader(f);return p;}
 function uniforms(gl,p,names){return Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));}
 class Renderer{
  constructor(canvas,model,callbacks={}){
   this.canvas=canvas;this.model=model;this.callbacks=callbacks;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
   if(!this.gl)throw new Error('이 기기에서 WebGL 2를 시작할 수 없습니다. 브라우저의 그래픽 가속 설정을 확인해 주세요.');
   this.state={theme:'dark',grid:false,labels:false,auto:false,mode:'studio',exposure:1.03,explode:0,open:false,selected:'all',quality:'high'};
   this.offsets=new Float32Array(72);this.hidden=new Int32Array(24);this.selected=new Int32Array(24);
   this.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   this.camera={azimuth:.82,elevation:.37,distance:2.56,target:[0,.50,0]};this.goal={...this.camera,target:this.camera.target.slice()};
   this.explodeNow=0;this.dirtyShadow=true;this.running=false;this.last=0;this.pointerMap=new Map();this.isDragging=false;
   this.setup();this.bind();this.resize();this.updateParts();this.invalidate();
  }
  setup(){
   const gl=this.gl;
   this.main=program(gl,mainVS,mainFS);this.mainU=uniforms(gl,this.main,['u_vp','u_lightVP','u_eye','u_offsets[0]','u_hidden[0]','u_selected[0]','u_hasSelection','u_exposure','u_grid','u_lightTheme','u_shadow','u_shadowSize']);
   this.shadowP=program(gl,shadowVS,shadowFS);this.shadowU=uniforms(gl,this.shadowP,['u_lightVP','u_offsets[0]','u_hidden[0]']);
   this.lineP=program(gl,lineVS,lineFS);this.lineU=uniforms(gl,this.lineP,['u_vp']);
   this.decalP=program(gl,decalVS,decalFS);this.decalU=uniforms(gl,this.decalP,['u_vp','u_offset','u_tex','u_exposure','u_dim']);
   this.meshVAO=gl.createVertexArray();gl.bindVertexArray(this.meshVAO);this.vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);gl.bufferData(gl.ARRAY_BUFFER,this.model.vertices,gl.STATIC_DRAW);
   const stride=13*4;for(const [idx,size,off]of[[0,3,0],[1,3,12],[2,3,24],[3,4,36]]){gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,size,gl.FLOAT,false,stride,off);}gl.bindVertexArray(null);
   this.lineVAO=gl.createVertexArray();gl.bindVertexArray(this.lineVAO);this.lineVBO=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.lineVBO);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,28,12);gl.bindVertexArray(null);
   this.shadowSize=Math.min(2048,gl.getParameter(gl.MAX_TEXTURE_SIZE));this.shadowTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.shadowTex);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,this.shadowSize,this.shadowSize,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
   for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.NEAREST);
   for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
   this.shadowFB=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.shadowFB);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,this.shadowTex,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
   if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('그림자 프레임버퍼를 초기화하지 못했습니다.');gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   this.lightVP=M.mul(M.ortho(-1.5,1.5,-1.5,1.5,.1,9),M.lookAt([-2.4,3.8,2.8],[0,.4,0]));
   this.decals=this.model.decals.map(d=>this.makeDecal(d));
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
  }
  makeDecal(d){
   const gl=this.gl,c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*d.height/d.width));const ctx=c.getContext('2d');
   ctx.fillStyle=d.options.bg||'#22282b';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=d.options.color||'#dae1e0';ctx.textAlign='center';ctx.textBaseline='middle';
   const font=Math.min(c.height*.65,(c.width-48)/(d.text.length*.6));ctx.font=`600 ${font}px Arial, sans-serif`;
   if(d.options.accent){ctx.fillStyle='#ff662b';ctx.fillRect(0,0,28,c.height);ctx.fillStyle=d.options.color;}
   ctx.fillText(d.text,c.width/2,c.height*.51,c.width-45);
   const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
   const mat=CartLab.transform(d.pos,d.rot),n=M.vector(mat,[0,0,1]),w=d.width/2,h=d.height/2,points=[[-w,-h,0],[w,-h,0],[w,h,0],[-w,h,0]],uv=[[0,0],[1,0],[1,1],[0,1]],data=[];
   for(const i of[0,1,2,0,2,3])data.push(...M.point(mat,points[i]),...n,...uv[i]);
   const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);for(const [idx,size,off]of[[0,3,0],[1,3,12],[2,2,24]]){gl.enableVertexAttribArray(idx);gl.vertexAttribPointer(idx,size,gl.FLOAT,false,32,off);}gl.bindVertexArray(null);
   return {...d,vao,vbo,tex};
  }
  resize(){
   const rect=this.canvas.parentElement.getBoundingClientRect(),max=this.state.quality==='high'?1.75:1,dpr=Math.min(window.devicePixelRatio||1,max);
   this.width=rect.width;this.height=rect.height;const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
   if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
   if(!this.sized){this.goal.distance=this.camera.distance=2.56*Math.max(1,.9/(rect.width/rect.height));this.sized=true;}
   this.invalidate();
  }
  updateParts(){
   const t=this.explodeNow;this.offsets.fill(0);const set=(i,a)=>this.offsets.set(a,i*3);
   set(1,[0,.40*t,0]);set(2,[0,.22*t,0]);set(3,[-.16*t,-.025*t,-.03*t]);set(4,[.16*t,-.025*t,-.03*t]);
   set(5,[-.1*t,-.075*t,.17*t]);set(6,[.1*t,-.075*t,.17*t]);set(7,[0,-.035*t,-.28*t]);set(8,[0,-.025*t,.30*t]);
   set(9,[0,.24*t,.10*t]);set(10,[-.05*t,.40*t,0]);set(11,[.05*t,.40*t,0]);set(12,[-.04*t,0,.12*t]);set(13,[.04*t,0,.12*t]);set(15,[0,.18*t,-.20*t]);set(16,[0,.23*t,.30*t]);set(17,[0,.06*t,.10*t]);set(18,[0,-.025*t,.30*t]);
   this.hidden.fill(0);if(this.state.open){this.hidden[2]=1;this.hidden[16]=1;}if(t>.025)this.hidden[14]=1;
   this.hidden[23]=(this.camera.elevation<-.05||t>.015)?1:0;
   this.selected.fill(0);for(const i of this.model.components[this.state.selected].ids)this.selected[i]=1;
  }
  set(key,value){this.state[key]=value;if(['open','explode'].includes(key))this.dirtyShadow=true;if(key==='quality')this.resize();this.updateParts();this.invalidate();}
  select(key){if(!this.model.components[key])return;this.set('selected',key);this.callbacks.onSelect?.(key);}
  preset(name){
   this.state.auto=false;
   const extra=2.56*(Math.max(1,.9/(this.width/this.height))-1);
   const presets={iso:{azimuth:.82,elevation:.37,distance:2.56+extra,target:[0,.5,0]},front:{azimuth:0,elevation:.11,distance:2.1+extra,target:[0,.49,0]},rear:{azimuth:PI,elevation:.14,distance:2.1+extra,target:[0,.50,-.04]},side:{azimuth:PI/2,elevation:.10,distance:2.12+extra,target:[0,.47,-.01]},top:{azimuth:0,elevation:1.50,distance:2.05+extra,target:[0,.35,0]},bottom:{azimuth:2.28,elevation:-.64,distance:2.65+extra,target:[0,.53,-.025]},sensors:{azimuth:.80,elevation:.49,distance:3.15+extra,target:[0,.45,.25]}};
   const p=presets[name]||presets.iso;this.goal={...p,target:p.target.slice()};this.callbacks.onCamera?.(name);this.invalidate();
  }
  mode(name){
   this.state.mode=name;this.set('explode',0);this.state.open=false;this.state.selected='all';this.state.labels=name==='sensors';
   this.preset(name==='bottom'?'bottom':name==='sensors'?'sensors':'iso');this.updateParts();this.dirtyShadow=true;this.callbacks.onSelect?.('all');this.invalidate();
  }
  bind(){
   const c=this.canvas;const pos=e=>({x:e.clientX,y:e.clientY});
   c.addEventListener('contextmenu',e=>e.preventDefault());
   c.addEventListener('pointerdown',e=>{if(e.button>2)return;c.setPointerCapture(e.pointerId);this.pointerMap.set(e.pointerId,pos(e));this.down={x:e.clientX,y:e.clientY,moved:0,button:e.button,pan:e.button===2||e.shiftKey};this.isDragging=true;this.state.auto=false;this.callbacks.onInteract?.();c.style.cursor='grabbing';});
   c.addEventListener('pointermove',e=>{
    if(!this.pointerMap.has(e.pointerId))return;const prev=this.pointerMap.get(e.pointerId),dx=e.clientX-prev.x,dy=e.clientY-prev.y;this.down.moved+=Math.hypot(dx,dy);
    if(this.pointerMap.size===2){const other=[...this.pointerMap.entries()].find(([id])=>id!==e.pointerId)[1],d0=Math.hypot(prev.x-other.x,prev.y-other.y),d1=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(d1>1)this.goal.distance=Math.min(5,Math.max(.65,this.goal.distance*d0/d1));this.pan(dx*.45,dy*.45);}
    else if(this.down.pan)this.pan(dx,dy);else{this.goal.azimuth-=dx*.006;this.goal.elevation=Math.max(-1.50,Math.min(1.50,this.goal.elevation+dy*.006));}
    this.pointerMap.set(e.pointerId,pos(e));this.invalidate();
   });
   const end=e=>{if(!this.pointerMap.has(e.pointerId))return;this.pointerMap.delete(e.pointerId);if(this.pointerMap.size===0){this.isDragging=false;c.style.cursor='grab';if(this.down&&this.down.moved<5&&this.down.button===0&&e.type!=='pointercancel'){const rect=c.getBoundingClientRect();this.pick(e.clientX-rect.left,e.clientY-rect.top);}}};
   c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
   c.addEventListener('wheel',e=>{e.preventDefault();this.goal.distance=Math.min(5,Math.max(.65,this.goal.distance*Math.exp(e.deltaY*.001)));this.invalidate();},{passive:false});
   c.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')this.goal.azimuth+=.12;if(e.key==='ArrowRight')this.goal.azimuth-=.12;if(e.key==='ArrowUp')this.goal.elevation=Math.min(1.5,this.goal.elevation+.12);if(e.key==='ArrowDown')this.goal.elevation=Math.max(-1.5,this.goal.elevation-.12);if(e.key==='+'||e.key==='=')this.goal.distance=Math.max(.65,this.goal.distance*.9);if(e.key==='-')this.goal.distance=Math.min(5,this.goal.distance*1.1);this.invalidate();}});
   this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(c.parentElement);
   c.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;this.callbacks.onError?.('그래픽 컨텍스트가 중단되었습니다. 페이지를 새로고침해 주세요.');});
   c.addEventListener('webglcontextrestored',()=>location.reload());document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.invalidate();});
  }
  pan(dx,dy){const a=this.goal.azimuth,e=this.goal.elevation,s=this.goal.distance*.0013,right=[Math.cos(a),0,-Math.sin(a)],up=[-Math.sin(a)*Math.sin(e),Math.cos(e),-Math.cos(a)*Math.sin(e)];this.goal.target=V.add(this.goal.target,V.add(V.mul(right,-dx*s),V.mul(up,dy*s)));}
  invalidate(){if(!this.running&&!this.contextLost){this.running=true;requestAnimationFrame(t=>this.frame(t));}}
  frame(time){
   this.running=false;if(this.contextLost||document.hidden)return;const dt=Math.min((time-this.last)/1000||.016,.08);this.last=time;
   const k=this.reducedMotion?1:1-Math.exp(-dt*10),c=this.camera,g=this.goal;
   if(this.state.auto)g.azimuth+=dt*.20;
   let motion=0;for(const key of['azimuth','elevation','distance']){const diff=g[key]-c[key];c[key]+=diff*k;motion+=Math.abs(diff);}
   const delta=V.sub(g.target,c.target);motion+=Math.hypot(...delta);c.target=V.lerp(c.target,g.target,k);
   const old=this.explodeNow;this.explodeNow+=(this.state.explode-old)*k;if(Math.abs(this.state.explode-this.explodeNow)<.0001)this.explodeNow=this.state.explode;
   if(Math.abs(old-this.explodeNow)>.00001){this.dirtyShadow=true;motion+=Math.abs(old-this.explodeNow)*100;}
   this.updateParts();this.draw(time/1000);this.callbacks.onFrame?.(this);
   if((motion>.0001&&!this.reducedMotion)||this.state.auto||(this.state.mode==='sensors'&&!this.reducedMotion))this.invalidate();
  }
  draw(time=0){
   const gl=this.gl,c=this.camera;
   this.eye=V.add(c.target,[Math.sin(c.azimuth)*Math.cos(c.elevation)*c.distance,Math.sin(c.elevation)*c.distance,Math.cos(c.azimuth)*Math.cos(c.elevation)*c.distance]);
   this.view=M.lookAt(this.eye,c.target);this.projection=M.perspective(38*PI/180,this.width/this.height,.025,45);this.vp=M.mul(this.projection,this.view);
   if(this.dirtyShadow){gl.bindFramebuffer(gl.FRAMEBUFFER,this.shadowFB);gl.viewport(0,0,this.shadowSize,this.shadowSize);gl.clear(gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);gl.useProgram(this.shadowP);gl.uniformMatrix4fv(this.shadowU.u_lightVP,false,this.lightVP);gl.uniform3fv(this.shadowU['u_offsets[0]'],this.offsets);gl.uniform1iv(this.shadowU['u_hidden[0]'],this.hidden);gl.bindVertexArray(this.meshVAO);gl.drawArrays(gl.TRIANGLES,0,this.model.vertices.length/13);gl.bindFramebuffer(gl.FRAMEBUFFER,null);this.dirtyShadow=false;}
   gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(this.main);const u=this.mainU;
   gl.uniformMatrix4fv(u.u_vp,false,this.vp);gl.uniformMatrix4fv(u.u_lightVP,false,this.lightVP);gl.uniform3fv(u.u_eye,this.eye);gl.uniform3fv(u['u_offsets[0]'],this.offsets);gl.uniform1iv(u['u_hidden[0]'],this.hidden);gl.uniform1iv(u['u_selected[0]'],this.selected);gl.uniform1i(u.u_hasSelection,this.state.selected==='all'?0:1);gl.uniform1f(u.u_exposure,this.state.exposure);gl.uniform1i(u.u_grid,this.state.grid?1:0);gl.uniform1i(u.u_lightTheme,this.state.theme==='light'?1:0);gl.uniform1f(u.u_shadowSize,this.shadowSize);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.shadowTex);gl.uniform1i(u.u_shadow,0);gl.bindVertexArray(this.meshVAO);gl.drawArrays(gl.TRIANGLES,0,this.model.vertices.length/13);
   gl.useProgram(this.decalP);gl.uniformMatrix4fv(this.decalU.u_vp,false,this.vp);gl.uniform1f(this.decalU.u_exposure,this.state.exposure);gl.uniform1i(this.decalU.u_tex,1);gl.activeTexture(gl.TEXTURE1);
   for(const d of this.decals){if(this.hidden[d.group])continue;gl.uniform3fv(this.decalU.u_offset,this.offsets.subarray(d.group*3,d.group*3+3));gl.uniform1f(this.decalU.u_dim,this.state.selected==='all'||this.selected[d.group]?1:.65);gl.bindTexture(gl.TEXTURE_2D,d.tex);gl.bindVertexArray(d.vao);gl.drawArrays(gl.TRIANGLES,0,6);}gl.activeTexture(gl.TEXTURE0);
   if(this.state.mode==='sensors')this.drawSensors(time);
   gl.bindVertexArray(null);
  }
  drawSensors(time){
   const gl=this.gl,tri=[],lines=[],orange=[1,.48,.22,.45],cyan=[.37,.80,.83,.75],mint=[.41,.87,.64,.5],tag=[.77,.80,1.16],lidar=[0,.383,.49];
   const line=(a,b,col)=>lines.push(...a,...col,...b,...col),triangle=(a,b,c,col)=>tri.push(...a,...col,...b,...col,...c,...col);
   const pt=(r,a,y=.383)=>[Math.sin(a)*r,y,.49+Math.cos(a)*r];
   for(let i=0;i<100;i++){const a=-PI*.68+i/100*PI*1.36,b=-PI*.68+(i+1)/100*PI*1.36;triangle(lidar,pt(1.06,a),pt(1.06,b),[1,.46,.19,.026]);for(const r of[.35,.7,1.06])if(i%3!==2)line(pt(r,a),pt(r,b),[1,.5,.24,r===1.06?.40:.19]);}
   const angle=-PI*.68+((time*.15)%1)*PI*1.36;line(lidar,pt(1.06,angle),[1,.59,.26,.85]);
   for(const s of[-1,1]){const base=[s*.313,.87,.446];for(let i=0;i<24;i++)if(i%2===0)line(V.lerp(base,tag,i/24),V.lerp(base,tag,(i+1)/24),cyan);for(let j=0;j<28;j++){const a=j/28*PI*2,b=(j+1)/28*PI*2;line([base[0]+Math.cos(a)*.044,base[1]+Math.sin(a)*.044,base[2]+.023],[base[0]+Math.cos(b)*.044,base[1]+Math.sin(b)*.044,base[2]+.023],[.4,.84,.88,.65]);}}
   const corners=[[tag[0]-.021,tag[1]-.037,tag[2]],[tag[0]+.021,tag[1]-.037,tag[2]],[tag[0]+.021,tag[1]+.037,tag[2]],[tag[0]-.021,tag[1]+.037,tag[2]]];triangle(corners[0],corners[1],corners[2],[.2,.7,.76,.4]);triangle(corners[0],corners[2],corners[3],[.2,.7,.76,.4]);for(let i=0;i<4;i++)line(corners[i],corners[(i+1)%4],cyan);line([tag[0],.01,tag[2]],[tag[0],tag[1]-.05,tag[2]],[.4,.82,.86,.18]);
   for(const s of[-1,1]){const top=[s*.205,.231,.445],floor=[s*.205,.013,.445];for(let i=0;i<16;i++){const a=i/16*PI*2,b=(i+1)/16*PI*2,q=[floor[0]+Math.cos(a)*.05,floor[1],floor[2]+Math.sin(a)*.05],r=[floor[0]+Math.cos(b)*.05,floor[1],floor[2]+Math.sin(b)*.05];triangle(top,q,r,[.40,.90,.66,.045]);line(q,r,mint);}line(top,floor,[.4,.9,.66,.6]);}
   const imu=[.05,.255,.09];line(imu,V.add(imu,[.10,0,0]),[1,.35,.3,.9]);line(imu,V.add(imu,[0,.10,0]),[.4,1,.5,.9]);line(imu,V.add(imu,[0,0,.10]),[.4,.6,1,.9]);
   gl.useProgram(this.lineP);gl.uniformMatrix4fv(this.lineU.u_vp,false,this.vp);gl.bindVertexArray(this.lineVAO);gl.bindBuffer(gl.ARRAY_BUFFER,this.lineVBO);gl.depthMask(false);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tri),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,tri.length/7);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lines),gl.DYNAMIC_DRAW);gl.drawArrays(gl.LINES,0,lines.length/7);gl.depthMask(true);
  }
  project(pos,part=0){if(!this.vp)return null;const p=V.add(pos,Array.from(this.offsets.subarray(part*3,part*3+3))),clip=M.point(this.vp,p);return{x:(clip[0]*.5+.5)*this.width,y:(-.5*clip[1]+.5)*this.height,z:clip[2],visible:clip[2]>-1&&clip[2]<1&&!this.hidden[part]};}
  pick(x,y){
   if(!this.vp)return;const inv=M.inverse(this.vp),nx=x/this.width*2-1,ny=1-y/this.height*2,near=M.point(inv,[nx,ny,-1]),far=M.point(inv,[nx,ny,1]),direction=V.norm(V.sub(far,near));let best=Infinity,part=-1;
   const data=this.model.vertices;
   for(const prim of this.model.primitives){
    if(prim.group===23||this.hidden[prim.group])continue;const off=this.offsets.subarray(prim.group*3,prim.group*3+3),origin=[near[0]-off[0],near[1]-off[1],near[2]-off[2]];let tmin=-Infinity,tmax=Infinity;
    for(let k=0;k<3;k++){if(Math.abs(direction[k])<1e-9){if(origin[k]<prim.lo[k]||origin[k]>prim.hi[k]){tmax=-Infinity;break;}}else{let a=(prim.lo[k]-origin[k])/direction[k],b=(prim.hi[k]-origin[k])/direction[k];if(a>b)[a,b]=[b,a];tmin=Math.max(tmin,a);tmax=Math.min(tmax,b);}}
    if(tmax<Math.max(tmin,0)||tmin>best)continue;
    for(let j=prim.start*13;j<(prim.start+prim.count)*13;j+=39){const a=[data[j],data[j+1],data[j+2]],b=[data[j+13],data[j+14],data[j+15]],c=[data[j+26],data[j+27],data[j+28]],e1=V.sub(b,a),e2=V.sub(c,a),h=V.cross(direction,e2),det=V.dot(e1,h);if(Math.abs(det)<1e-10)continue;const f=1/det,s=V.sub(origin,a),u=f*V.dot(s,h);if(u<0||u>1)continue;const q=V.cross(s,e1),v=f*V.dot(direction,q);if(v<0||u+v>1)continue;const t=f*V.dot(e2,q);if(t>0&&t<best){best=t;part=prim.group;}}
   }
   this.select(this.model.partToKey[part]||'all');
  }
  async capture(){
   this.draw(performance.now()/1000);const out=document.createElement('canvas');out.width=this.canvas.width;out.height=this.canvas.height;const ctx=out.getContext('2d'),light=this.state.theme==='light';const gr=ctx.createRadialGradient(out.width*.5,out.height*.65,0,out.width*.5,out.height*.45,out.width*.7);gr.addColorStop(0,light?'#eceef0':'#242b34');gr.addColorStop(1,light?'#f7f8f9':'#101318');ctx.fillStyle=gr;ctx.fillRect(0,0,out.width,out.height);ctx.drawImage(this.canvas,0,0);ctx.fillStyle=light?'#333d44':'#b7c2cc';ctx.font=`500 ${Math.max(14,out.width*.012)}px Arial, sans-serif`;ctx.fillText('SMART CART / PHOTO-BASED 3D RECONSTRUCTION',out.width*.03,out.height*.95);
   return new Promise((resolve,reject)=>out.toBlob(b=>b?resolve(b):reject(new Error('PNG 저장에 실패했습니다.')),'image/png'));
  }
  stats(){return {vertices:this.model.vertices.length/13,triangles:this.model.vertices.length/39,primitives:this.model.primitives.length,webgl:2,runtimeDependencies:0};}
 }
 return Renderer;
})();

