import * as T from './vendor/three.module.js';
import {createCinemaFilm} from './cinema-film.js';
const texturePromises=new Map();
function baseTexture(file){if(!texturePromises.has(file))texturePromises.set(file,new Promise((resolve,reject)=>new T.TextureLoader().load('./'+file,t=>{t.colorSpace=T.SRGBColorSpace;resolve(t);},undefined,reject)));return texturePromises.get(file);}
function region(texture,rect,size){const [x,y,w,h]=rect,[fw,fh]=size,t=texture.clone();t.repeat.set(w/fw,h/fh);t.offset.set(x/fw,1-(y+h)/fh);t.needsUpdate=true;return t;}
export async function prepareArt(theme,items){const files=new Set(items.map(it=>ART_MAP.items[it.id]?.file).filter(Boolean));const bg=ART_MAP.scenes[theme];if(bg)files.add(bg.file);if(theme==='sinema')files.add(ART_MAP.scenes.tropik.file);const loaded=new Map();await Promise.all([...files].map(async file=>loaded.set(file,await baseTexture(file))));return {loaded,bg};}
export function buildWorld(theme,items,art,placements={}){
 const scene=new T.Scene();scene.background=new T.Color(0xe9eee6);const root=new T.Group();scene.add(root);
 const mat=(color,map=null,extra={})=>new T.MeshStandardMaterial({color,map,roughness:.82,...extra});
 function mesh(geometry,material,x=0,y=0,z=0,parent=root){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;parent.add(m);return m;}
 const box=(w,h,d,color,x=0,y=h/2,z=0,parent=root,map=null)=>mesh(new T.BoxGeometry(w,h,d),mat(color,map),x,y,z,parent);
 const flat=(w,d,texture,x=0,y=0,z=0,parent=root,color=0xffffff)=>{const m=mesh(new T.PlaneGeometry(w,d),mat(color,texture),x,y,z,parent);m.rotation.x=-Math.PI/2;return m;};
 function bgTexture(crop=[0,0,1,1]){const b=art.bg,base=art.loaded.get(b.file),im=base.image;const square=b.single?[0,0,im.width,im.height]:[b.col*im.width/4,b.row*im.height/4,im.width/4,im.height/4];return region(base,[square[0]+crop[0]*square[2],square[1]+crop[1]*square[3],crop[2]*square[2],crop[3]*square[3]],[im.width,im.height]);}
 function artTexture(it){const a=ART_MAP.items[it.id],base=art.loaded.get(a.file);if(typeof document==='undefined')return region(base,a.rect,a.size);
  // Isolate atlas cells before mipmapping, so neighbouring products never bleed in.
  const canvas=document.createElement('canvas'),[x,y,w,h]=a.rect;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(base.image,x,y,w,h,0,0,w,h);
  const pixels=ctx.getImageData(0,0,w,h),data=pixels.data,seen=new Uint8Array(w*h),parts=[];
  for(let i=0;i<w*h;i++){if(seen[i]||data[i*4+3]<32)continue;const queue=[i];seen[i]=1;let edge=false;for(let q=0;q<queue.length;q++){const at=queue[q],px=at%w,py=Math.floor(at/w);if(px===0||py===0||px===w-1||py===h-1)edge=true;for(const n of [px>0?at-1:-1,px<w-1?at+1:-1,py>0?at-w:-1,py<h-1?at+w:-1])if(n>=0&&!seen[n]&&data[n*4+3]>=32){seen[n]=1;queue.push(n);}}parts.push({queue,edge});}
  const biggest=Math.max(1,...parts.map(p=>p.queue.length));for(const p of parts)if(p.edge&&p.queue.length<biggest*.14)for(const i of p.queue)data[i*4+3]=0;ctx.putImageData(pixels,0,0);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
 }
 function photo(it,x,z,width=2.4,y=0,parent=root){const a=ART_MAP.items[it.id],texture=artTexture(it),sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,alphaTest:.06,depthWrite:false,toneMapped:false}));sprite.center.set(.5,.03);sprite.position.set(x,y,z);sprite.scale.set(width,width*a.rect[3]/a.rect[2],1);sprite.userData.purchase=it.id;parent.add(sprite);if(y<.5){const sh=mesh(new T.CircleGeometry(width*.28,24),new T.MeshBasicMaterial({color:0x554c37,transparent:true,opacity:.12,depthWrite:false}),x,.025,z,parent);sh.rotation.x=-Math.PI/2;sh.scale.y=.45;sh.castShadow=false;sh.userData.purchase=it.id;}return sprite;}
 function cylinder(radius,height,color,x=0,y=height/2,z=0,parent=root,map=null){return mesh(new T.CylinderGeometry(radius,radius,height,48),mat(color,map),x,y,z,parent);}
 const owns=new Set(items.map(it=>it.id)),outdoor=WorldPlan.OUTDOOR.has(theme);
 const plans=WorldPlan.plan(theme,[...new Map(items.map(it=>[it.id,it])).values()]);
 function named(object,name,purchase){object.name=name;if(purchase)object.userData.purchase=purchase;return object;}
 function table(x,z,w=4,d=2,h=1.4,color=0x9a6b43){const g=new T.Group();g.position.set(x,0,z);root.add(g);box(w,.16,d,color,0,h-.08,0,g);for(const dx of [-w/2+.2,w/2-.2])for(const dz of [-d/2+.2,d/2-.2])box(.13,h-.16,.13,0x353d42,dx,(h-.16)/2,dz,g);return g;}
 function room(color=0xeee5d6,floor=0xc6a57b){
  flat(14,12,null,0,-.04,0,root,floor);
  for(let x=-6.5;x<7;x+=.7)box(.015,.01,12,0xb18c65,x,-.025,0);
  box(14,5,.15,color,0,2.4,-6);box(.15,5,12,color,-7,2.4,0);
  box(14,.15,.2,0xf7f1e7,0,.06,-5.9);box(.2,.15,12,0xf7f1e7,-6.9,.06,0);
  scene.background=new T.Color(0xe9e3d9);
 }
 function screen(w,h,x,y,z,map=null){const frame=box(w+.22,h+.22,.18,0x171e25,x,y,z);const face=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:map?0xffffff:0x354451,map,toneMapped:false}),x,y,z+.1);return {frame,face};}
 function chair(x,z,y=0,rotation=0,color=0xa52d3f,parent=root){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);box(.78,.2,.85,color,0,.65,0,g);box(.78,1.05,.2,color,0,1.1,.4,g);for(const dx of [-.47,.47]){box(.17,.48,.93,color,dx,.83,0,g);box(.11,.57,.6,0x24282c,dx,.28,0,g);}return g;}
 function sofa(p,color=0xbda389){const g=new T.Group();g.position.set(p.x,0,p.z);root.add(g);const w=p.width;box(w,.45,1.6,color,0,.48,0,g);box(w,1.1,.3,color,0,1.05,.68,g);for(const x of [-w/2+.18,w/2-.18]){box(.4,.8,1.7,color,x,.8,0,g);for(const z of [-.5,.5])box(.12,.25,.12,0x5f4936,x,.13,z,g);}for(let n=0;n<3;n++){const x=-w/2+.65+n*(w-1.3)/2;box((w-.9)/3,.17,1.1,0xd4bfa6,x,.8,-.15,g);box((w-.9)/3,.65,.2,0xcbb398,x,1.2,.45,g);}g.userData.faces=new T.Vector3(0,0,-1);named(g,'sofa-facing-front',p.id);return g;}
 function fixture(p){
  const {x,z,mount,width:w,y}=p;
  if(['desk','counter','bench','teacher','host','lab','console','vanity'].includes(mount)){
   const key=mount==='desk'?'desk':`${mount}:${Math.round(x)}:${Math.round(z)}`;
   if(!scene.userData.supports)scene.userData.supports=new Set();if(scene.userData.supports.has(key))return;scene.userData.supports.add(key);
   if(mount==='desk'){const cx=theme==='bilgisayar'?1.7:theme==='muzik'?0:theme==='okul'?-5:0,cz=theme==='muzik'?4:theme==='okul'?1:theme==='oyunodasi'?-2.4:-.7;table(cx,cz,theme==='okul'?1.9:theme==='muzik'?5:5.6,theme==='okul'?1.4:2.5,theme==='okul'?1.2:theme==='muzik'?1.4:1.5);}
   else table(x,z,Math.max(w+.4,1.8),1.3,Math.max(.8,y));
  }else if(['shelf','display','rack','nightstand','table','rail'].includes(mount)){
   if(mount==='rail'){box(w+.3,.08,.1,0xb79761,x,y+.2,z);for(const dx of [-w/2,w/2])box(.06,y+.2,.06,0xb79761,x+dx,(y+.2)/2,z);}
   else if(!(theme==='yatak'&&owns.has('yatak-7'))&&!(theme==='salon'&&owns.has('salon-1')))table(x,z,w+.35,1.3,Math.max(.3,y),mount==='display'?0x293c46:0x9a6b43);
  }
 }
 if(theme==='sinema'){
  room(0x252736,0x302e3b);scene.background=new T.Color(0x202534);
  const hasScreen=owns.has('sinema-4');if(hasScreen){const outer=screen(8,4,0,2.7,-5.8);named(outer.frame,'cinema-screen-frame','sinema-4');outer.face.userData.purchase='sinema-4';}
  const projection=owns.has('sinema-0')&&hasScreen;let movie=null;
  if(projection){const b=ART_MAP.scenes.tropik,base=art.loaded.get(b.file);if(base){const im=base.image;movie=region(base,b.single?[0,0,im.width,im.height]:[b.col*im.width/4,b.row*im.height/4,im.width/4,im.height/4],[im.width,im.height]);}}
  if(projection&&typeof document!=='undefined'){const film=createCinemaFilm(art.loaded.get(ART_MAP.scenes.tropik.file).image);movie=new T.CanvasTexture(film.canvas);movie.colorSpace=T.SRGBColorSpace;scene.userData.animate=time=>{if(!scene.userData.projecting)return false;if(film.draw(time)){movie.needsUpdate=true;return true;}return false;};}
  if(hasScreen){const inner=screen(7.8,3.8,0,2.7,-5.6,movie),image=inner.face;inner.frame.userData.purchase='sinema-4';named(image,'cinema-projected-image','sinema-4');scene.userData.projecting=projection;}
  for(let row=0;row<3;row++){const z=-.5+row*1.9,y=row*.24;box(10,.24+row*.24,1.9,0x3d3949,0,(.24+row*.24)/2-.12,z);if(owns.has('sinema-2'))for(const x of [-3.6,-2.25,-.9,.9,2.25,3.6]){const seat=named(chair(x,z,y,0,0xa52743),'cinema-seat','sinema-2');seat.userData.faces=new T.Vector3(0,0,-1);}}
  if(owns.has('sinema-0')){const g=new T.Group();g.position.set(0,4.25,3.6);root.add(g);box(.08,.5,.08,0x9ba4ac,0,.42,0,g);box(1.1,.4,.8,0xd9dce0,0,0,0,g);const lens=mesh(new T.CylinderGeometry(.17,.17,.17,24),mat(projection?0x97d8ed:0x293f4a),0,0,-.48,g);lens.rotation.x=Math.PI/2;named(g,'cinema-projector','sinema-0');}
  if(projection){
   const source=[0,4.25,3.1],corners=[[-3.9,.8,-5.4],[3.9,.8,-5.4],[3.9,4.6,-5.4],[-3.9,4.6,-5.4]],vertices=[];for(let n=0;n<4;n++)vertices.push(...source,...corners[n],...corners[(n+1)%4]);const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));const beam=mesh(geometry,new T.MeshBasicMaterial({color:0xc6e8ff,transparent:true,opacity:.045,depthWrite:false,side:T.DoubleSide}));named(beam,'cinema-projection-beam','sinema-0');const glow=new T.PointLight(0x8fc8ff,10,13);glow.position.set(0,3,-4);root.add(glow);
  }
  if(owns.has('sinema-1'))for(const x of [-5.1,5.1]){const speaker=box(.85,2.1,.7,0x171e24,x,1.2,-4.7);named(speaker,'cinema-front-speaker','sinema-1');for(const yy of [.7,1.5]){const cone=mesh(new T.CircleGeometry(.25,24),mat(0x59616c),x,yy,-4.34);named(cone,'speaker-cone','sinema-1');}named(box(.5,.85,.5,0x202734,x,2.5,2.4),'cinema-surround-speaker','sinema-1');}
  if(owns.has('sinema-4'))for(const x of [-4.6,4.6]){named(box(1.1,4.7,.3,0x8f2038,x,2.4,-5.45),'curtain','sinema-4');for(let n=0;n<6;n++)named(cylinder(.09,4.7,n%2?0x992a45:0x6d1930,x-.45+n*.18,2.4,-5.23),'curtain-fold','sinema-4');}
  if(owns.has('sinema-5'))for(const x of [-6.6,6.6])for(const z of [-3,0,3]){named(box(.15,.65,.38,0xffd28a,x,2.2,z),'cinema-wall-light','sinema-5');const light=new T.PointLight(0xffbd76,.9,5);light.position.set(x,2.2,z);light.userData.purchase='sinema-5';root.add(light);}
  for(const p of plans){if([0,1,2,4,5].includes(p.index))continue;const it=items.find(i=>i.id===p.id);if(p.index===9){if(owns.has('sinema-2'))photo(it,2.3,3.3,1.1,1.2);continue;}photo(it,p.x,p.z,p.width,p.y);}
  scene.userData.range=19;scene.userData.targetY=1.7;
 }else if(theme==='stadyum'){
  box(20,.35,27,0xc9c7bb,0,-.3,0);flat(10,16,bgTexture([.1,.48,.8,.45]),0,.005,0);
  const turf=owns.has('stadyum-0');scene.userData.hasTurf=turf;if(turf){flat(10,16,null,0,.02,0,root,0x397c35);for(let z=-7;z<8;z+=2)flat(10,1,null,0,.024,z,root,0x458d3d);
   for(const x of [-4.7,4.7])box(.05,.02,15.3,0xf4f0d5,x,.05,0);for(const z of [-7.65,0,7.65])box(9.45,.02,.05,0xf4f0d5,0,.05,z);
   const circle=mesh(new T.TorusGeometry(1.5,.025,8,64),mat(0xf4f0d5),0,.055,0);circle.rotation.x=Math.PI/2;
   for(const z of [-6.4,6.4]){for(const x of [-2.8,2.8])box(.045,.02,2.5,0xf4f0d5,x,.05,z);box(5.6,.02,.045,0xf4f0d5,0,.05,z<0?-5.15:5.15);}
  }
  for(const side of [-1,1])for(let row=0;row<5;row++)box(2.1,.5,20,0xb7b4a8,side*(6.3+row*.52),row*.48+.05,0);
  for(const end of [-1,1])for(let row=0;row<4;row++)box(10,.5,1.4,0xb7b4a8,0,row*.48+.05,end*(9+row*.58));
  if(owns.has('stadyum-1')){const places=[];for(const side of [-1,1])for(let row=0;row<5;row++)for(let seat=0;seat<24;seat++)places.push({x:side*(6.15+row*.52),y:row*.48+.55,z:-9.2+seat*.8,ry:side*Math.PI/2});for(const end of [-1,1])for(let row=0;row<4;row++)for(let seat=0;seat<12;seat++)places.push({x:-4.4+seat*.8,y:row*.48+.55,z:end*(8.9+row*.58),ry:end===1?0:Math.PI});
   const seats=new T.InstancedMesh(new T.BoxGeometry(.56,.13,.52),mat(0xb83638),places.length),backs=new T.InstancedMesh(new T.BoxGeometry(.56,.48,.1),mat(0xbc4143),places.length),o=new T.Object3D();places.forEach((p,i)=>{o.position.set(p.x,p.y,p.z);o.rotation.set(0,p.ry,0);o.updateMatrix();seats.setMatrixAt(i,o.matrix);o.translateZ(-.23);o.position.y+=.22;o.updateMatrix();backs.setMatrixAt(i,o.matrix);});seats.name='stadium-seats';backs.name='stadium-seat-backs';root.add(seats,backs);seats.castShadow=true;backs.castShadow=true;
  }
  if(owns.has('stadyum-5'))for(const end of [-1,1]){for(const x of [-1.4,1.4])box(.08,1.4,.08,0xf1e9d1,x,.7,end*7.8);box(2.9,.08,.08,0xf1e9d1,0,1.4,end*7.8);for(let i=0;i<9;i++)box(.018,1.4,.018,0xd9ddd3,-1.3+i*.325,.7,end*8.5);for(let i=0;i<6;i++)box(2.7,.018,.018,0xd9ddd3,0,.1+i*.25,end*8.5);}
  if(owns.has('stadyum-3'))for(const x of [-8,8])for(const z of [-10,10]){cylinder(.075,6,0x667274,x,3,z);box(1.8,.7,.3,0xffeec0,x,6,z);}
  if(owns.has('stadyum-4')){box(5,2.1,.25,0x2c3437,0,4,-11);const original=items.find(it=>it.id==='stadyum-4');photo(original,0,-10.9,4.6,3.1);}
  for(const p of WorldPlan.plan(theme,items)){const it=items.find(it=>it.id===p.id);if([0,1,3,4,5].includes(p.index))continue;const locations={2:[-7,0,3,1.8],6:[8,0,3.8,2.4],7:[-8,11,2.4,0],8:[0,-11,4.5,2.1],9:[8,14,4.3,0]};const [x,z,w,y]=locations[p.index];photo(it,x,z,w,y);}
  scene.userData.range=29;scene.userData.targetY=.3;
 }else{
  if(theme==='tropik'){flat(32,30,null,0,-.4,0,root,0x45bacc);const sand=cylinder(7,.35,0xffffff,0,-.2,0,root,bgTexture([.28,.48,.43,.3]));sand.scale.z=.83;scene.background=bgTexture();}
  else if(theme==='kahvalti'){
   const tabletop=box(13,.25,10,0xffffff,0,1.3,0,root,bgTexture([.04,.35,.92,.59]));for(const x of [-5.3,5.3])for(const z of [-3.8,3.8])box(.3,1.2,.3,0x9e6b3f,x,.6,z);
   scene.background=bgTexture();
  }else if(!outdoor){room(theme==='banyo'?0xe4edeb:theme==='oyunodasi'?0x383f60:0xeee5d6,theme==='banyo'?0xc7d6d5:0xc6a57b);}
  else{
   const ground={akvaryum:0x62afc0,uzay:0x8d939f,garaj:0x929ca3,sehir:0x82a27c,tatil:0xdacb9f,kamp:0x678a54};flat(16,15,null,0,-.04,0,root,ground[theme]||0x7caa65);scene.background=new T.Color(theme==='uzay'?0x202d49:0xbce1ed);
   if(['sehir','lunapark','hayvanat','otel'].includes(theme)){flat(1.1,15,null,1.8,-.015,0,root,0xe8d8b6);flat(16,.8,null,0,-.01,-1.2,root,0xe8d8b6);}
  }
  if(['bilgisayar','oyunodasi','muzik'].includes(theme))fixture({x:0,z:0,width:5.6,y:1.5,mount:'desk'});
  if(theme==='bilgisayar'){
   const shell=box(2.1,2.8,2.6,0x27313d,-1.5,1.4,-1.3);shell.material.transparent=true;shell.material.opacity=.16;named(shell,'computer-case');for(const x of [-2.6,-.4])box(.08,2.8,2.6,0x344450,x,1.4,-1.3);
  }
  if(theme==='mutfak'&&owns.has('mutfak-6'))flat(4.5,1.6,null,0,1.29,-4.2,root,0xddd4c5);
  if(theme==='banyo'&&owns.has('banyo-4'))flat(3,1.5,null,0,1.27,-4.1,root,0xe7e7df);
  if(theme==='giydirme')for(const p of plans.filter(p=>p.index<4)){const h=p.width+.6;table(p.x,p.z,.9,.9,.16,0x495867);cylinder(.035,h,0xa48757,p.x,h/2,p.z+.2);box(p.width,.05,.05,0xa48757,p.x,h,p.z+.2);}
  if(theme==='okul'&&owns.has('okul-0')){for(const z of [-.3,2.2,4.7])for(const x of [-2.5,.5]){named(table(x,z,1.8,1.1,1.1),'school-desk','okul-0');const seat=chair(x,z+.85,0,0,0xc18c54);seat.scale.setScalar(.7);named(seat,'classroom-chair','okul-0');}}
  if(theme==='garaj')for(const x of [-5.8,-2,2,5.8])box(.045,.015,8,0xf0d68a,x,.015,1);
  if(theme==='kamp'&&owns.has('kamp-2')){const glow=new T.PointLight(0xffa044,4,7);glow.position.set(0,1,2.2);root.add(glow);}
  if(theme==='hayvanat')for(const p of plans){flat(3.6,2.8,null,p.x,-.005,p.z,root,[3,6].includes(p.index)?0x64bed2:0xa0b778);for(const dx of [-1.8,1.8])for(const dz of [-1.4,1.4])cylinder(.04,.55,0x977450,p.x+dx,.275,p.z+dz);box(3.6,.06,.06,0xa68c66,p.x,.45,p.z+1.4);}
  if(theme==='akvaryum'){for(const p of plans.filter(p=>p.index!==8)){const tank=box(p.width+.35,Math.max(1.5,p.width*.65),1.8,0x8ce2e4,p.x,Math.max(1.5,p.width*.65)/2,p.z);tank.material.transparent=true;tank.material.opacity=.13;tank.material.depthWrite=false;box(p.width+.45,.12,1.9,0x335b68,p.x,.02,p.z);}}
  for(const p of plans){const it=items.find(i=>i.id===p.id);const {x,z,width:w,y}=p;
   if(theme==='okul'&&p.index===0)continue;
   if(['oturma','salon','isyeri','oyunodasi'].includes(theme)&&p.type==='sofa'){sofa(p,theme==='oyunodasi'?0x526b9c:0xbda389);continue;}
   if(theme==='oturma'&&p.type==='coffeeTable'){named(table(x,z,2.8,1.5,.7),'coffee-table',p.id);continue;}
   if(['isyeri','oyunodasi'].includes(theme)&&p.type==='officeChair'){const seat=chair(x,z,0,0,0x3a5265);named(seat,'office-chair-facing-monitor',p.id);continue;}
   if(theme==='salon'&&p.type==='dining'){named(table(x,z,3.5,2.4,1.3),'dining-table',p.id);for(const dx of [-1.2,1.2])for(const dz of [-1.6,1.6]){const seat=chair(x+dx,z+dz,0,dz<0?Math.PI:0,0xb58d61);seat.scale.setScalar(.8);seat.userData.purchase=p.id;}continue;}
   if(theme==='yatak'&&p.index===1&&owns.has('yatak-0')){photo(it,x,z,w,y);continue;}
   // Purchased desks/cabinets already supply the support for their accessories.
   if(!(theme==='isyeri'&&p.mount==='desk'&&owns.has('isyeri-3'))&&!(theme==='banyo'&&p.mount==='vanity'&&owns.has('banyo-4'))&&!(theme==='mutfak'&&p.mount==='counter'&&owns.has('mutfak-6')))fixture(p);
   if(p.type==='rug'){const rug=flat(w,w*.65,artTexture(it),x,.035,z);rug.material.transparent=true;rug.material.alphaTest=.06;rug.castShadow=false;named(rug,'floor-rug',it.id);continue;}
   if(p.wall){const a=ART_MAP.items[it.id],h=Math.min(4.7-y,w*a.rect[3]/a.rect[2]);const picture=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:artTexture(it),transparent:true,alphaTest:.06,toneMapped:false}),x,y+h*.5,z);named(picture,'wall-'+p.type,it.id);continue;}
   const picture=photo(it,x,z,w,y);picture.userData.mount=p.mount;
  }
  scene.userData.range=['kahvalti','tropik'].includes(theme)?15:18;scene.userData.targetY=1.2;
 }
 const movable=new Map();root.updateMatrixWorld(true);
 function applyRotation(group,r){if(r===undefined)return;group.userData.manualRotation=true;const axis=new T.Vector3(0,0,1).applyQuaternion(group.parent.getWorldQuaternion(new T.Quaternion()));group.rotation.y=r*Math.PI/180-Math.atan2(axis.x,axis.z);const sprites=[];group.traverse(o=>{if(o.isSprite)sprites.push(o);});for(const sprite of sprites){const picture=new T.Mesh(new T.PlaneGeometry(sprite.scale.x,sprite.scale.y),new T.MeshBasicMaterial({map:sprite.material.map,transparent:true,alphaTest:.06,side:T.DoubleSide,toneMapped:false}));picture.position.copy(sprite.position);picture.position.y+=sprite.scale.y*(.5-sprite.center.y);picture.userData={...sprite.userData};sprite.parent.add(picture);sprite.removeFromParent();sprite.material.dispose();}group.updateMatrixWorld(true);}
 for(const p of plans){if(theme==='stadyum'&&[0,1,3,5].includes(p.index))continue;const parts=[];root.traverse(o=>{if(o.userData.purchase===p.id&&!o.parent?.userData.purchase)parts.push(o);});if(!parts.length)continue;const group=new T.Group();group.position.set(p.x,p.y,p.z);group.userData.itemId=p.id;group.userData.plan=p;root.add(group);group.updateMatrixWorld(true);for(const part of parts)group.attach(part);const saved=placements[p.id];if(saved){group.position.set(saved.x,saved.y,saved.z);applyRotation(group,saved.r);}movable.set(p.id,group);}
 for(const p of plans){const child=movable.get(p.id),parent=movable.get(`${theme}-${p.parent}`);if(child&&parent){parent.updateMatrixWorld(true);parent.attach(child);}}
 scene.userData.movable=movable;scene.userData.layout=plans;scene.userData.applyRotation=applyRotation;
 scene.userData.updatePlacement=()=>{root.updateMatrixWorld(true);if(theme==='sinema'){const screen=scene.getObjectByName('cinema-projected-image'),projector=scene.getObjectByName('cinema-projector'),beam=scene.getObjectByName('cinema-projection-beam');if(screen&&projector&&beam){root.attach(beam);beam.position.set(0,0,0);const start=projector.localToWorld(new T.Vector3(0,0,-.5)),center=screen.getWorldPosition(new T.Vector3()),forward=new T.Vector3(0,0,-1).transformDirection(projector.matrixWorld),aligned=start.z>center.z+1&&forward.dot(center.clone().sub(start).normalize())>.7;screen.visible=aligned;beam.visible=aligned;scene.userData.projecting=aligned;const points=[[-3.9,-1.9,0],[3.9,-1.9,0],[3.9,1.9,0],[-3.9,1.9,0]].map(a=>screen.localToWorld(new T.Vector3(...a)));const values=[];for(let n=0;n<4;n++)values.push(...start.toArray(),...points[n].toArray(),...points[(n+1)%4].toArray());beam.geometry.setAttribute('position',new T.Float32BufferAttribute(values,3));beam.geometry.computeBoundingSphere();}}
  const target=movable.get(theme==='oturma'?'oturma-1':theme==='sinema'?'sinema-4':theme==='isyeri'?'isyeri-1':theme==='oyunodasi'?'oyunodasi-1':'');if(target){const at=target.getWorldPosition(new T.Vector3());for(const g of movable.values())g.traverse(o=>{if(o.name==='sofa-facing-front'||o.name==='office-chair-facing-monitor'||o.name==='cinema-seat'){let owner=o;while(owner&&!owner.userData.itemId)owner=owner.parent;if(owner?.userData.manualRotation){o.rotation.y=0;return;}const point=(o.name==='cinema-seat'?movable.get('sinema-2'):o).getWorldPosition(new T.Vector3());o.rotation.y=Math.atan2(point.x-at.x,point.z-at.z);}});}
 };scene.userData.updatePlacement();
 scene.add(new T.HemisphereLight(0xfff6e4,0x9aafa0,theme==='sinema'?.75:2.1));const sun=new T.DirectionalLight(0xffe7c0,theme==='sinema'?.65:2.1);sun.position.set(-9,18,13);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20});sun.shadow.normalBias=.04;scene.add(sun);return scene;
}
