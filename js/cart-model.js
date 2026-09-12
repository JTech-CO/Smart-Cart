
/* Photo-based reconstruction, NOT a FreeCAD import. All dimensions are visual estimates (m). */
'use strict';
CartLab.buildCart = function(){
 const B=new CartLab.Geometry.Builder(),G=CartLab.Geometry,M=CartLab.M,PI=Math.PI;
 const mat=(color,metal=.1,rough=.5,emission=0)=>({color:CartLab.hex(color),metal,rough,emission});
 const p={
  paint:mat('#333a40',.65,.37),edge:mat('#171c20',.55,.4),deep:mat('#101317',.12,.7),
  alu:mat('#a5acaf',.92,.25),steel:mat('#757f84',.88,.27),chrome:mat('#d4dade',1,.16),
  rubber:mat('#1b1e21',.02,.8),tread:mat('#24282b',.03,.7),rim:mat('#828b90',.85,.3),
  orange:mat('#ff622b',.25,.36),orangeDark:mat('#a73612',.42,.42),red:mat('#bd3232',.05,.43),
  glass:mat('#192a2c',.8,.13),pcb:mat('#23635c',.14,.6),gold:mat('#bfa967',.82,.28),
  led:mat('#5bd6bd',.05,.28,2.2),amber:mat('#ff833d',.1,.35,.22),silver:mat('#c3c9c9',.85,.3),
  label:mat('#d7ddd8',.05,.6),black:mat('#0c1012',.25,.5),floor:mat('#252a30',.1,.82)
 };
 const xRot=[0,0,PI/2],zRot=[PI/2,0,0];
 function bolt(pos,group=0,axis='y',r=.0044,dark=false){const rot=axis==='x'?xRot:axis==='z'?zRot:[0,0,0];B.cyl(r,.004,pos,dark?p.edge:p.steel,group,rot,6);const off=pos.slice();off['xyz'.indexOf(axis)]+=.00225;B.cyl(r*.40,.0007,off,p.deep,group,rot,6);}
 function cap(pos,group=0){B.box([.031,.022,.031],pos,p.orange,group,.003);bolt([pos[0],pos[1]+.012,pos[2]],group,'y',.003);}
 function plate(pos,size,group=0){B.box(size,pos,p.paint,group,.002);for(const a of [-1,1])for(const c of [-1,1])bolt([pos[0]+a*(size[0]/2-.009),pos[1]+size[1]/2+.001,pos[2]+c*(size[2]/2-.009)],group);}
 // Box-section chassis and accurately separated underside support members.
 for(const s of [-1,1]){
  B.box([.038,.052,.982],[s*.321,.281,0],p.paint,0,.003);
  B.box([.004,.010,.897],[s*.342,.286,0],p.edge,0,.001);
  B.box([.003,.006,.46],[s*.344,.27,-.13],p.orange,0,.001);
  for(let z=-.4;z<=.401;z+=.1)bolt([s*.343,.291,z],0,'x',.0035);
 }
 for(const z of [-.475,.475])B.box([.67,.052,.04],[0,.281,z],p.paint,0,.003);
 for(const z of [-.33,-.04,.30])B.box([.612,.025,.032],[0,.249,z],p.steel,0,.001);
 for(const s of [-1,1])B.box([.020,.022,.86],[s*.145,.244,0],p.paint,0,.001);
 // Reinforced frame corners, replaceable bumpers, orange reflectors.
 for(const s of [-1,1])for(const t of [-1,1]){
  B.box([.087,.038,.07],[s*.30,.255,t*.445],p.edge,0,.003);
  bolt([s*.315,.31,t*.44],0);bolt([s*.28,.31,t*.46],0);
 }
 B.box([.742,.045,.044],[0,.287,.505],p.rubber,0,.01);
 for(const s of [-1,1])B.box([.042,.01,.0015],[s*.291,.29,.529],p.amber,0,.001);
 B.decal('SMART CART  /  SC-01',.345,.023,[0,.292,.530],[0,0,0],0,{color:'#b5c1c6',bg:'#161b1f',font:26,spacing:2});
 B.decal('24 V     •     DUAL DRIVE',.33,.019,[.343,.286,-.10],[0,PI/2,0],0,{color:'#b5c1c6',bg:'#22282d',font:24});
 // Raised deck and non-slip surface. The top surface is inferred from the source photo.
 B.box([.602,.014,.901],[0,.307,0],p.steel,2,.004);
 B.box([.557,.004,.84],[0,.317,0],p.rubber,2,.007);
 for(let i=-17;i<=17;i++)B.box([.54,.0014,.002],[0,.320,i*.022],p.tread,2,0);
 for(const s of [-1,1])for(let z=-.41;z<=.411;z+=.205)bolt([s*.287,.317,z],2,'y',.0038);
 // Three-sided square-section guard frame. Rear opening remains accessible.
 for(const s of [-1,1]){
  const x=s*.313;
  for(const z of [-.444,.444]){
   B.box([.025,.493,.025],[x,.557,z],p.paint,1,.002);
   B.box([.004,.449,.001],[x+s*.012,.556,z+.013],p.edge,1,0);
   cap([x,.807,z],1);
   B.box([.052,.042,.054],[x,.331,z],p.edge,1,.002);
   bolt([x,.354,z],1);
  }
  B.box([.026,.026,.914],[x,.805,0],p.paint,1,.003);
  B.box([.002,.002,.865],[x+s*.0135,.8,0],p.alu,1,.0005);
  B.box([.019,.020,.872],[x,.545,0],p.paint,1,.0018);
  B.box([.020,.476,.020],[x,.555,-.008],p.paint,1,.002);
  B.beam([x,.337,-.425],[x,.78,-.17],.017,.017,p.paint,1,.0015);
  for(const z of [-.445,0,.445])bolt([x+s*.016,.794,z],1,'x',.0035);
  B.box([.038,.06,.055],[x,.351,-.442],p.paint,1,.002);
  B.cyl(.011,.044,[x,.368,-.447],p.orange,1,xRot,20);
 }
 for(const y of [.544,.805])B.box([.642,.024,.024],[0,y,.445],p.paint,1,.0025);
 for(const x of [-.16,.16])B.box([.018,.48,.018],[x,.553,.445],p.paint,1,.002);
 B.box([.189,.082,.006],[0,.673,.464],p.edge,1,.003);
 B.decal('SC / 01',.157,.045,[0,.672,.468],[0,0,0],1,{color:'#d4d9d9',bg:'#1b2125',font:51,accent:true});
 // Folding tubular push handle, anodized hinge brackets and foam grip.
 for(const s of [-1,1]){
  B.box([.065,.038,.074],[s*.247,.339,-.413],p.edge,15,.003);
  B.cyl(.018,.052,[s*.247,.359,-.444],p.steel,15,xRot,28);
  B.cyl(.007,.056,[s*.247,.359,-.444],p.orange,15,xRot,12);
  B.tube([[s*.24,.36,-.439],[s*.24,.888,-.606],[s*.235,.958,-.627],[s*.21,.983,-.634]],.012,p.chrome,15);
  B.rod([s*.24,.506,-.485],[s*.24,.757,-.565],.0138,p.paint,15);
 }
 B.rod([-.21,.983,-.634],[.21,.983,-.634],.015,p.chrome,15,24);
 B.rod([-.168,.983,-.634],[.168,.983,-.634],.022,p.rubber,15,28);
 for(let i=-11;i<=11;i++)B.cyl(.0225,.0022,[i*.014,.983,-.634],p.tread,15,xRot,28);
 // Rear differential drive: separate wheels, gearboxes, longitudinal motor cans.
 for(const [s,group] of [[-1,3],[1,4]]){
  const center=[s*.381,.131,-.379];
  const wheelMat=M.mul(M.translate(...center),M.rz(PI/2));
  B.add(G.lathe([[.074,-.038],[.102,-.038],[.121,-.027],[.129,-.014],[.129,.014],[.121,.027],[.102,.038],[.074,.038]],72),p.rubber,group,wheelMat);
  B.cyl(.075,.067,center,p.rim,group,xRot,64);
  for(const edge of [-1,1]){
   const x=center[0]+edge*.038;
   B.cyl(.073,.006,[x,center[1],center[2]],p.steel,group,xRot,64);
   B.torus(.068,.0035,[x+edge*.004,center[1],center[2]],p.alu,group,xRot,64,8);
   B.torus(.101,.0009,[x+edge*.001,center[1],center[2]],p.tread,group,xRot,64,6);
   B.cyl(.031,.020,[x+edge*.009,center[1],center[2]],p.rim,group,xRot,32);
   B.cyl(.017,.024,[x+edge*.014,center[1],center[2]],p.steel,group,xRot,6);
   B.cyl(.008,.026,[x+edge*.016,center[1],center[2]],p.orange,group,xRot,16);
   for(let j=0;j<6;j++){
    const a=j/6*PI*2,y=center[1]+Math.cos(a)*.05,z=center[2]+Math.sin(a)*.05;
    B.cyl(.010,.007,[x+edge*.004,y,z],p.deep,group,xRot,20);
    bolt([x+edge*.006,center[1]+Math.cos(a)*.038,center[2]+Math.sin(a)*.038],group,'x',.0033);
   }
  }
  // Molded rubber chevron tread blocks, geometric rather than a flat texture.
  for(let j=0;j<44;j++)for(const side of [-1,1]){
   const a=j/44*PI*2;const t=M.mul(M.translate(center[0]+side*.017,center[1]+Math.cos(a)*.129,center[2]+Math.sin(a)*.129),M.mul(M.rx(a),M.ry(side*.33)));
   B.add(G.box(.034,.0045,.0105,.001),p.tread,group,t);
  }
  // Rear fender: semi-annular extruded shell and its flat support tab.
  B.add(G.fender(.144,.096,.0035),p.edge,group,M.translate(...center));
  B.box([.112,.008,.074],[s*.35,.270,-.38],p.paint,group,.002);
  B.box([.018,.102,.119],[s*.293,.206,-.379],p.steel,group,.003);
  B.cyl(.041,.060,[s*.287,.145,-.379],p.steel,group,xRot,32);
  B.box([.067,.088,.087],[s*.273,.166,-.376],p.paint,group,.008);
  B.cyl(.012,.062,[s*.334,.131,-.379],p.chrome,group,xRot,24);
  B.cyl(.038,.162,[s*.251,.171,-.255],p.steel,group,zRot,48);
  for(let j=0;j<8;j++)B.cyl(.040,.0027,[s*.251,.171,-.302+j*.012],p.edge,group,zRot,40);
  B.cyl(.040,.023,[s*.251,.171,-.176],p.edge,group,zRot,40);
  B.cyl(.021,.004,[s*.251,.171,-.162],p.paint,group,zRot,24);
  B.box([.075,.012,.18],[s*.251,.221,-.269],p.steel,group,.002);
  for(const z of [-.33,-.20])bolt([s*.275,.231,z],group,'y',.004);
  B.decal('250 W / 24 V',.097,.027,[s*.251,.211,-.25],[-PI/2,0,0],group,{color:'#bdc5c4',bg:'#242b2f',font:24});
 }
 // Front free-swiveling casters: mounting plate, thrust bearing, offset fork and axle.
 for(const [s,g] of [[-1,5],[1,6]]){
  const x=s*.258,z=.364;
  plate([x,.257,z],[.099,.009,.108],g);
  B.cyl(.036,.017,[x,.24,z],p.chrome,g,[0,0,0],40);
  B.cyl(.026,.020,[x,.224,z],p.edge,g,[0,0,0],32);
  B.cyl(.017,.057,[x,.202,z],p.chrome,g,[0,0,0],28);
  const wz=z+.025;
  B.box([.084,.013,.055],[x,.183,z+.008],p.steel,g,.004);
  for(const a of [-1,1]){
   B.beam([x+a*.036,.183,z],[x+a*.036,.067,wz],.009,.044,p.steel,g,.003);
   B.cyl(.012,.01,[x+a*.044,.067,wz],p.chrome,g,xRot,6);
  }
  B.cyl(.007,.10,[x,.067,wz],p.chrome,g,xRot,20);
  B.add(G.lathe([[.029,-.026],[.053,-.026],[.062,-.019],[.066,-.010],[.066,.010],[.062,.019],[.053,.026],[.029,.026]],48),p.rubber,g,M.mul(M.translate(x,.067,wz),M.rz(PI/2)));
  B.cyl(.028,.054,[x,.067,wz],p.alu,g,xRot,32);
  B.cyl(.012,.059,[x,.067,wz],p.steel,g,xRot,20);
  for(const a of [-1,1])B.torus(.045,.0015,[x+a*.027,.067,wz],p.tread,g,xRot,40,6);
 }
 // Central underside battery enclosure, orange service label and retention straps.
 B.box([.292,.124,.294],[0,.178,-.093],p.edge,7,.006);
 B.box([.303,.014,.304],[0,.246,-.093],p.paint,7,.003);
 B.box([.281,.006,.280],[0,.113,-.093],p.paint,7,.003);
 B.box([.210,.0018,.062],[0,.108,-.135],p.orange,7,.001);
 B.decal('24V DC  /  POWER',.202,.039,[0,.106,-.135],[PI/2,0,0],7,{color:'#15191c',bg:'#ff652c',font:25});
 for(const s of [-1,1]){
  B.box([.018,.134,.308],[s*.109,.176,-.092],p.rubber,7,.002);
  B.box([.022,.009,.319],[s*.109,.109,-.092],p.paint,7,.001);
  for(const z of [-.225,.045])bolt([s*.109,.25,z],7,'y',.004);
 }
 B.box([.031,.022,.015],[.09,.213,.063],p.orange,7,.003);
 B.box([.024,.022,.015],[.046,.213,.063],p.black,7,.002);
 // Electronics tray and removable cover. Boards are deliberately generic visual models.
 B.box([.366,.010,.170],[0,.177,.256],p.steel,8,.003);
 for(const s of [-1,1])B.box([.008,.065,.175],[s*.18,.209,.256],p.paint,8,.0015);
 B.box([.373,.008,.179],[0,.245,.256],p.paint,16,.003);
 B.box([.355,.062,.008],[0,.212,.343],p.steel,16,.002);
 for(let i=-12;i<=12;i++)B.box([.004,.002,.08],[i*.012,.25,.257],p.deep,16,.0005);
 for(const x of [-.164,.164])for(const z of [.187,.32])bolt([x,.25,z],16,'y',.003);
 // SBC: Orange Pi 4 Pro is specified by the user; board-level dimensions are not asserted.
 B.box([.126,.0025,.087],[-.075,.19,.25],p.pcb,8,.001);
 for(const x of [-.128,-.022])for(const z of [.215,.284]){B.cyl(.003,.016,[x,.183,z],p.gold,8,[0,0,0],12);bolt([x,.194,z],8,'y',.002);}
 B.box([.030,.008,.030],[-.076,.196,.245],p.deep,8,.001);
 B.box([.045,.004,.043],[-.076,.202,.245],p.edge,8,.001);
 for(let i=-4;i<=4;i++)B.box([.0027,.020,.043],[-.076+i*.0048,.213,.245],p.paint,8,.0005);
 for(const x of [-.123,-.093]){B.box([.024,.020,.017],[x,.202,.288],p.silver,8,.001);B.box([.018,.012,.001],[x,.202,.297],p.deep,8,.0004);}
 B.box([.019,.019,.023],[-.036,.201,.286],p.steel,8,.001);
 B.box([.014,.014,.001],[-.036,.201,.298],p.deep,8,.0004);
 for(let i=0;i<16;i++)B.cyl(.0008,.005,[-.124+i*.005,.196,.214],p.gold,8,[0,0,0],8);
 B.box([.020,.010,.040],[-.008,.197,.247],p.deep,8,.001);
 // ESP32 and dual motor-driver modules share a serviceable lower tray.
 B.box([.052,.002,.029],[.048,.191,.277],p.pcb,18,.001);
 B.box([.023,.004,.021],[.046,.195,.275],p.steel,18,.001);
 B.box([.010,.003,.026],[.069,.194,.277],p.edge,18,.0005);
 for(const x of [.093,.146]){
  B.box([.042,.002,.055],[x,.192,.234],p.pcb,18,.001);
  for(let i=-2;i<=2;i++)B.box([.003,.015,.022],[x+i*.004,.203,.23],p.paint,18,.0003);
  B.box([.029,.011,.011],[x,.199,.254],p.orange,18,.001);
  for(const t of [-1,1])bolt([x+t*.008,.206,.254],18,'y',.002);
 }
 // IMU is fixed to the chassis reference, not to the moving handle or suspension.
 B.box([.032,.002,.022],[.05,.241,.090],p.pcb,17,.001);
 B.box([.008,.003,.008],[.05,.244,.090],p.deep,17,.0006);
 for(const x of [.038,.062])bolt([x,.244,.085],17,'y',.0018);
 // Protected cable runs and visible connectors.
 for(const s of [-1,1]){
  B.tube([[s*.25,.188,-.163],[s*.245,.214,-.115],[s*.18,.226,-.06],[s*.18,.23,.128],[s*.11,.218,.195]],.0033,p.black,14);
  B.tube([[s*.303,.30,.40],[s*.294,.41,.421],[s*.294,.74,.425],[s*.295,.831,.436]],.0023,p.black,14);
  for(const y of [.4,.53,.68])B.box([.025,.007,.029],[s*.313,y,.443],p.rubber,14,.001);
 }
 B.tube([[.09,.213,.069],[.09,.20,.126],[.13,.195,.18]],.003,p.red,14);
 B.tube([[.046,.213,.069],[.046,.202,.145],[.102,.195,.181]],.003,p.black,14);
 // Front 2D LiDAR: generic protective puck, horizontal scan plane.
 B.box([.115,.008,.088],[0,.321,.484],p.paint,9,.002);
 for(const x of [-.044,.044])bolt([x,.327,.475],9,'y',.003);
 B.cyl(.044,.014,[0,.336,.49],p.steel,9,[0,0,0],64);
 B.cyl(.050,.032,[0,.357,.49],p.edge,9,[0,0,0],64);
 B.cyl(.047,.020,[0,.383,.49],p.glass,9,[0,0,0],64);
 B.cyl(.049,.010,[0,.399,.49],p.edge,9,[0,0,0],64);
 B.cyl(.039,.004,[0,.406,.49],p.paint,9,[0,0,0],64);
 B.cyl(.020,.001,[0,.409,.49],p.edge,9,[0,0,0],48);
 B.sphere(.002,[.034,.388,.521],p.led,9);
 B.decal('2D LiDAR',.06,.015,[0,.412,.49],[-PI/2,0,0],9,{color:'#b8c8c8',bg:'#20272b',font:26});
 // Two separated BU04 UWB base housings. Appearance is conceptual, not a vendor CAD.
 for(const [s,g] of [[-1,10],[1,11]]){
  B.box([.040,.016,.056],[s*.313,.825,.444],p.orange,g,.002);
  B.box([.055,.069,.029],[s*.313,.865,.446],p.edge,g,.004);
  B.box([.045,.053,.002],[s*.313,.865,.462],p.paint,g,.002);
  B.box([.030,.019,.001],[s*.313,.879,.4635],p.glass,g,.001);
  for(const x of [-.017,.017])for(const y of [-.024,.024])bolt([s*.313+x,.865+y,.464],g,'z',.0018);
  B.sphere(.0017,[s*.325,.848,.465],p.led,g);
  B.decal('UWB',.033,.011,[s*.313,.862,.4645],[0,0,0],g,{color:'#bdcece',bg:'#2a3237',font:29});
 }
 // Downward ToF sensors, two conceptual protective mounts for floor discontinuities.
 for(const [s,g] of [[-1,12],[1,13]]){
  B.box([.032,.021,.034],[s*.205,.247,.445],p.edge,g,.003);
  B.box([.017,.002,.022],[s*.205,.234,.445],p.pcb,g,.001);
  B.box([.009,.002,.011],[s*.205,.232,.445],p.glass,g,.001);
 }
 B.box([14,.015,14],[0,-.010,0],p.floor,23,0);
 const model=B.finish();model.materials=p;
 model.components={
  all:{ids:[],label:'전체 구성',en:'SYSTEM OVERVIEW',text:'평판대차를 기반으로 재구성한 사용자 추종형 스마트 카트입니다. 프레임과 구동부를 회전해 살펴보세요.',specs:[['구동 구성','좌우 독립 구동'],['설계 전원','24 V'],['모델 기준','사진 기반 재구성']]},
  frame:{ids:[0,1,2,15],label:'프레임 · 적재판',en:'CHASSIS & DECK',text:'각형 프레임, 가드 레일, 접이식 손잡이와 미끄럼 방지 적재판을 구성했습니다. 재질 표현과 세부 치수는 시각화를 위한 추정입니다.',specs:[['구조','평판대차 + 가드 프레임'],['손잡이','힌지 · 금속 튜브'],['치수 · 하중','실측 자료 미제공']]},
  drive:{ids:[3,4,5,6],label:'좌우 독립 구동계',en:'DIFFERENTIAL DRIVE',text:'24V 250W 감속모터 2개와 후륜 구동 바퀴, 전면 자유회전 캐스터를 재구성했습니다. 본 뷰어에서는 실제 모터를 제어하지 않습니다.',specs:[['모터 정격','250 W × 2'],['전원','24 V'],['주행 방식','좌우 차동 구동']]},
  uwb:{ids:[10,11],label:'사용자 위치 추적',en:'BU04 · PDoA UWB',text:'카트 좌우의 UWB 베이스 2개와 사용자 태그 1개라는 제시 구성을 표현합니다. 센서 보기의 선과 태그는 위치 관계를 설명하는 도식입니다.',specs:[['카트 장착','BU04 베이스 × 2'],['사용자 휴대','태그 × 1'],['하우징 형상','개념 모델']]},
  lidar:{ids:[9,12,13],label:'주변 · 바닥 인식',en:'2D LiDAR / ToF',text:'전면 2D LiDAR와 하향 VL53L1X ToF 배치를 표현했습니다. 스캔 반경과 광선 폭은 설명용이며 실제 유효 거리나 시야각을 나타내지 않습니다.',specs:[['주변 장애물','2D LiDAR'],['바닥 높이 변화','VL53L1X ToF'],['센서 범위 표시','설명용 · 실측 아님']]},
  compute:{ids:[8,17,18],label:'센서 융합 · 제어',en:'COMPUTE & CONTROL',text:'Orange Pi 4 Pro와 ROS 2 Humble이 상위 인식·추종·회피를, ESP32가 모터 제어를 맡는 설계 구성입니다. BNO085 IMU는 차체 기준에 고정한 것으로 표현했습니다.',specs:[['상위 컴퓨팅','Orange Pi 4 Pro'],['소프트웨어 구성','ROS 2 Humble'],['하위 제어 / 자세','ESP32 / BNO085']]},
  power:{ids:[7,14,16],label:'전원 · 전장 박스',en:'POWER & ELECTRONICS',text:'중앙 하부의 배터리 박스와 전면 전장 트레이, 보호 커버 및 케이블 경로를 구성했습니다. 배터리 용량과 실제 배선 규격은 지정되지 않았습니다.',specs:[['시스템 전압','24 V'],['배터리 용량','미지정'],['구조 확인','하부 보기 · 분해 보기']]}
 };
 model.markers=[
  {part:10,pos:[-.313,.907,.446],text:'UWB · L',key:'uwb'},
  {part:11,pos:[.313,.907,.446],text:'UWB · R',key:'uwb'},
  {part:9,pos:[0,.415,.49],text:'2D LiDAR',key:'lidar'},
  {part:4,pos:[.38,.16,-.379],text:'250W DRIVE',key:'drive'},
  {part:8,pos:[0,.24,.25],text:'COMPUTE',key:'compute'},
  {part:7,pos:[0,.105,-.093],text:'24V POWER',key:'power'}
 ];
 model.partToKey=Object.fromEntries(Object.entries(model.components).flatMap(([key,c])=>c.ids.map(i=>[i,key])));
 return model;
};

