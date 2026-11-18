import * as T from './vendor/three.module.js';
const texturePromises=new Map();
function baseTexture(file){if(!texturePromises.has(file))texturePromises.set(file,new Promise((resolve,reject)=>new T.TextureLoader().load('./'+file,t=>{t.colorSpace=T.SRGBColorSpace;resolve(t);},undefined,reject)));return texturePromises.get(file);}
function region(texture,rect,size){const [x,y,w,h]=rect,[fw,fh]=size,t=texture.clone();t.repeat.set(w/fw,h/fh);t.offset.set(x/fw,1-(y+h)/fh);t.needsUpdate=true;return t;}
export async function prepareArt(theme,items){const files=new Set(items.map(it=>ART_MAP.items[it.id]?.file).filter(Boolean));const bg=ART_MAP.scenes[theme];if(bg)files.add(bg.file);const loaded=new Map();await Promise.all([...files].map(async file=>loaded.set(file,await baseTexture(file))));return {loaded,bg};}
export function buildWorld(theme,items,art){
 const scene=new T.Scene();scene.background=new T.Color(0xe9eee6);const root=new T.Group();scene.add(root);
 const mat=(color,map=null,extra={})=>new T.MeshStandardMaterial({color,map,roughness:.82,...extra});
 function mesh(geometry,material,x=0,y=0,z=0,parent=root){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;parent.add(m);return m;}
 const box=(w,h,d,color,x=0,y=h/2,z=0,parent=root,map=null)=>mesh(new T.BoxGeometry(w,h,d),mat(color,map),x,y,z,parent);
 const flat=(w,d,texture,x=0,y=0,z=0,parent=root,color=0xffffff)=>{const m=mesh(new T.PlaneGeometry(w,d),mat(color,texture),x,y,z,parent);m.rotation.x=-Math.PI/2;return m;};
 function bgTexture(crop=[0,0,1,1]){const b=art.bg,base=art.loaded.get(b.file),im=base.image;const square=b.single?[0,0,im.width,im.height]:[b.col*im.width/4,b.row*im.height/4,im.width/4,im.height/4];return region(base,[square[0]+crop[0]*square[2],square[1]+crop[1]*square[3],crop[2]*square[2],crop[3]*square[3]],[im.width,im.height]);}
 function artTexture(it){const a=ART_MAP.items[it.id];return region(art.loaded.get(a.file),a.rect,a.size);}
 function photo(it,x,z,width=2.4,y=0,parent=root){const a=ART_MAP.items[it.id],texture=artTexture(it),sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,alphaTest:.06,depthWrite:false,toneMapped:false}));sprite.center.set(.5,.03);sprite.position.set(x,y,z);sprite.scale.set(width,width*a.rect[3]/a.rect[2],1);sprite.userData.purchase=it.id;parent.add(sprite);if(y<.5){const sh=mesh(new T.CircleGeometry(width*.28,24),new T.MeshBasicMaterial({color:0x554c37,transparent:true,opacity:.12,depthWrite:false}),x,.025,z,parent);sh.rotation.x=-Math.PI/2;sh.scale.y=.45;sh.castShadow=false;}return sprite;}
 function cylinder(radius,height,color,x=0,y=height/2,z=0,parent=root,map=null){return mesh(new T.CylinderGeometry(radius,radius,height,48),mat(color,map),x,y,z,parent);}
 const owns=new Set(items.map(it=>it.id)),outdoor=WorldPlan.OUTDOOR.has(theme);
 if(theme==='stadyum'){
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
  }else{
   flat(14,11,bgTexture([.05,.57,.9,.4]),0,-.01,0);
   const wall=mesh(new T.PlaneGeometry(14,5),new T.MeshBasicMaterial({map:bgTexture([0,0,1,.56]),side:T.FrontSide,toneMapped:false}),0,2.45,-5.5);wall.castShadow=false;
   if(!outdoor){const side=mesh(new T.PlaneGeometry(11,5),mat(0xf3e9d8,null,{side:T.FrontSide}),-7,2.45,0);side.rotation.y=Math.PI/2;}
  }
  const grouped=new Map();for(const it of items)if(!grouped.has(it.id))grouped.set(it.id,it);
  const plans=WorldPlan.plan(theme,[...grouped.values()]);
  const large=new Set(['bed','sofa','wardrobe','cabinet','island','dining','hotel','house','hospital','gazebo','hut','tent']);
  for(const p of plans){const it=grouped.get(p.id);let x=p.x,z=p.z,w=large.has(p.type)?3.8:2,y=0;
   if(theme==='kahvalti'){x=p.index>=8?[-1.5,1.5][p.index-8]:[-4.5,-1.5,1.5,4.5][p.index%4];z=-3+Math.floor(p.index/4)*3;w=2.25;y=1.48;}
   else if(theme==='tropik'){const places=[[-4,-1,4.8],[3,-2,4.1],[0,3,2.6],[2.6,3.7,1.9],[-.8,-3.4,4.4],[4,1,1.7],[-4,3.8,2],[-3,1.7,3],[4.3,4.1,3],[0,4.5,1.4]];[x,z,w]=places[p.index];if(p.type==='parrot')y=2.5;}
   else if(theme==='yatak'){const places=[[0,1.7,5],[0,1.7,3],[4,-3.6,2.8],[-4,-4.8,1.8],[-3.1,.6,1.6],[0,-5.25,4],[-5,3.7,1.7],[-3.1,.6,1.6],[4,3.3,2.4],[0,-5.2,4]];[x,z,w]=places[p.index];if(p.index===4&&owns.has('yatak-7'))y=1.15;if(p.index===1&&owns.has('yatak-0'))continue;}
   if(p.wall&&theme!=='kahvalti'){z=-5.15;y=p.type==='chandelier'?3:1.6;w=Math.min(w,3.5);}
   if(p.type==='rug'){const rug=flat(5.8,3.7,artTexture(it),x,.03,z);rug.material.transparent=true;rug.material.alphaTest=.06;rug.castShadow=false;continue;}
   photo(it,x,z,w,y);
  }
  scene.userData.range=theme==='kahvalti'?15:theme==='tropik'?15:17;scene.userData.targetY=1;
 }
 scene.add(new T.HemisphereLight(0xfff6e4,0x9aafa0,2.1));const sun=new T.DirectionalLight(0xffe7c0,2.1);sun.position.set(-9,18,13);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20});sun.shadow.normalBias=.04;scene.add(sun);return scene;
}
