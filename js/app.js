
/* Accessible DOM UI and local-only application state. */
'use strict';
(()=>{
 const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
 let renderer,model,toastTimer,firstFrame=true;const markerNodes=[];
 const viewNames={iso:'사시도',front:'정면',rear:'후면',side:'측면',top:'상부',bottom:'하부 · 사진 시점',sensors:'센서 배치'};
 function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3100);}
 function error(message){$('#loading').hidden=true;$('#fatal-error').hidden=false;$('#error-message').textContent=message;$('#capture-btn').disabled=true;window.__cartError=message;}
 function syncToggles(){if(!renderer)return;for(const [id,key]of[['auto-btn','auto'],['labels-btn','labels'],['grid-btn','grid']])$('#'+id).setAttribute('aria-pressed',String(renderer.state[key]));$('#open-cover').checked=renderer.state.open;$('#explode').value=Math.round(renderer.state.explode*100);$('#explode-value').innerHTML=Math.round(renderer.state.explode*100)+'<span>%</span>';}
 function selectComponent(key){
  const c=model.components[key];$$('.component').forEach(el=>{el.classList.toggle('active',el.dataset.key===key);el.setAttribute('aria-pressed',String(el.dataset.key===key));});
  $('#detail-en').textContent=c.en;$('#detail-name').textContent=c.label;$('#detail-text').textContent=c.text;
  $('#detail-specs').replaceChildren(...c.specs.map(([name,val])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=val;row.append(dt,dd);return row;}));
  $('#reveal-btn').hidden=key!=='compute'&&key!=='power';
 }
 function mode(name){renderer.mode(name);$$('[data-mode]').forEach(b=>{const active=b.dataset.mode===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('#sensor-note').hidden=name!=='sensors';$('#render-status').textContent=name==='sensors'?'SENSOR SCHEMATIC':name==='bottom'?'UNDERSIDE VIEW':'3D STUDIO';syncToggles();}
 function onFrame(r){
  if(firstFrame){firstFrame=false;$('#loading').classList.add('done');setTimeout(()=>$('#loading').hidden=true,500);window.__cartReady=true;document.body.dataset.ready='true';}
  const boxes=[];
  for(let i=0;i<markerNodes.length;i++){
   const {element,data}=markerNodes[i];if(!r.state.labels||(data.tag&&r.state.mode!=='sensors')){element.hidden=true;continue;}
   const p=r.project(data.pos,data.part);if(!p||!p.visible||p.x<65||p.x>r.width-55||p.y<75||p.y>r.height-92){element.hidden=true;continue;}
   // Do not place markers over the title or on top of each other.
   let x=p.x,y=p.y-13;const w=element.offsetWidth||92,h=25;
   if(x<340&&y<210){y=210;}
   for(const b of boxes){if(Math.abs(x-b.x)<(w+b.w)/2+9&&Math.abs(y-b.y)<h+7)y=b.y+h+11;}
   if(y>r.height-90){element.hidden=true;continue;}element.hidden=false;element.style.left=`${x}px`;element.style.top=`${y}px`;boxes.push({x,y,w});
  }
 }
 function setupUI(){
  $$('.component').forEach(b=>b.addEventListener('click',()=>renderer.select(b.dataset.key)));$('#show-all').addEventListener('click',()=>renderer.select('all'));
  $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));
  $('#reset-btn').addEventListener('click',()=>mode('studio'));$('#brand-reset').addEventListener('click',e=>{e.preventDefault();mode('studio');});
  for(const [id,key]of[['auto-btn','auto'],['labels-btn','labels'],['grid-btn','grid']])$('#'+id).addEventListener('click',()=>{renderer.set(key,!renderer.state[key]);syncToggles();});
  $('#camera-select').addEventListener('change',e=>{renderer.preset(e.target.value);syncToggles();});
  $('#explode').addEventListener('input',e=>{const value=Number(e.target.value);renderer.set('explode',value/100);$('#explode-value').innerHTML=value+'<span>%</span>';if(renderer.state.mode==='sensors'){mode('studio');renderer.set('explode',value/100);$('#explode').value=value;$('#explode-value').innerHTML=value+'<span>%</span>';}if(value>0&&renderer.goal.distance<2.55){renderer.goal.distance=renderer.width/renderer.height<1.15?3.10:2.60;renderer.goal.target=[0,.56,0];}});
  $('#open-cover').addEventListener('change',e=>renderer.set('open',e.target.checked));
  $('#reveal-btn').addEventListener('click',()=>{renderer.set('open',true);$('#open-cover').checked=true;renderer.preset('bottom');syncToggles();toast('적재판과 전장 커버를 열었습니다. 보드 형상은 개념 모델입니다.');});
  $('#exposure').addEventListener('input',e=>{const v=Number(e.target.value)/100;renderer.set('exposure',v);$('#exposure-value').textContent=v.toFixed(2);});
  $('#quality').addEventListener('change',e=>{renderer.set('quality',e.target.value);toast(e.target.value==='high'?'고품질 렌더 해상도를 적용했습니다.':'렌더 해상도를 낮춰 그래픽 부하를 줄였습니다.');});
  $$('[data-theme]').forEach(b=>b.addEventListener('click',()=>{renderer.set('theme',b.dataset.theme);$('#app').classList.toggle('light-stage',b.dataset.theme==='light');$$('[data-theme]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});}));
  $('#full-btn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('#stage').requestFullscreen)await $('#stage').requestFullscreen();else toast('이 브라우저에서는 전체 화면 API를 사용할 수 없습니다.');}catch{toast('이 환경에서는 전체 화면 전환이 허용되지 않습니다.');}});
  document.addEventListener('fullscreenchange',()=>renderer.resize());
  $('#capture-btn').addEventListener('click',async()=>{const button=$('#capture-btn');button.disabled=true;try{const blob=await renderer.capture(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Smart-Cart-${renderer.state.mode}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('현재 시점의 3D 렌더를 PNG로 저장했습니다.');}catch(e){toast(e.message||'이미지 저장에 실패했습니다.');}finally{button.disabled=false;}});
  $('#reference-btn').addEventListener('click',()=>$('#reference-dialog').showModal());$('#help-btn').addEventListener('click',()=>$('#help-dialog').showModal());
  $$('.dialog-close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#reference-view-btn').addEventListener('click',()=>{$('#reference-dialog').close();mode('bottom');});
  document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$$('dialog').some(d=>d.open))return;const key=e.key.toLowerCase();if(key==='0')mode('studio');if(key==='1')mode('studio');if(key==='2')mode('sensors');if(key==='3')mode('bottom');for(const[k,id]of[['a','auto-btn'],['g','grid-btn'],['l','labels-btn']])if(key===k)$('#'+id).click();});
 }
 async function boot(){
  $('#reload-btn').addEventListener('click',()=>location.reload());
  try{
   model=CartLab.buildCart();
   for(const data of[...model.markers,{part:0,pos:[.77,.87,1.16],text:'사용자 태그 · 도식',key:'uwb',tag:true}]){const element=document.createElement('button');element.className='marker';element.hidden=true;const dot=document.createElement('i');element.append(dot,document.createTextNode(data.text));element.addEventListener('click',()=>renderer.select(data.key));$('#markers').append(element);markerNodes.push({element,data});}
   renderer=new CartLab.Renderer($('#scene'),model,{onSelect:selectComponent,onFrame,onError:error,onInteract:()=>syncToggles(),onCamera:name=>{$('#view-label').textContent=viewNames[name]||'자유 시점';if(name!=='sensors')$('#camera-select').value=name;}});
   setupUI();selectComponent('all');syncToggles();window.CartStudio={renderer,model,setMode:mode,stats:()=>renderer.stats()};
  }catch(e){console.error(e);error(e.message||'3D 초기화 중 오류가 발생했습니다.');}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,40));else setTimeout(boot,40);
})();

