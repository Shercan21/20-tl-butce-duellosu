import * as T from './vendor/three.module.js';
const editing=new Set();
export function installEditor(view,player){
 const {element,scene,camera,controls,renderer}=view,canvas=renderer.domElement,button=element.querySelector('[data-world-edit]');if(!button||!player)return()=>{};
 const key=element.dataset.worldTheme+':'+element.dataset.worldOwner,ray=new T.Raycaster(),pointer=new T.Vector2();let selected=null,drag=null,mode=editing.has(key);
 const hint=element.querySelector('.world-edit-hint');
 const setMode=()=>{controls.enabled=!mode;button.setAttribute('aria-pressed',String(mode));button.textContent=mode?'✓ Düzenlemeyi bitir':'✋ Eşyaları düzenle';element.classList.toggle('editing',mode);hint.textContent=mode?'Eşyayı seç ve sürükle · Duvar ve masa eşyaları yüzeylerinde kalır':'';};
 button.onclick=e=>{e.stopPropagation();mode=!mode;if(mode)editing.add(key);else editing.delete(key);setMode();};setMode();
 function cast(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);}
 function position(group,at){const point=new T.Vector3(at.x,at.y,at.z);group.position.copy(group.parent.worldToLocal(point));scene.userData.updatePlacement?.();view.dirty=true;}
 function down(e){if(!mode||e.button>0)return;cast(e);scene.updateMatrixWorld(true);const hits=ray.intersectObjects([...scene.userData.movable.values()],true);let group=null;for(const hit of hits){let o=hit.object;while(o&&!o.userData.itemId)o=o.parent;if(o){group=o;break;}}if(!group)return;
  e.stopImmediatePropagation();selected=group;const at=group.getWorldPosition(new T.Vector3()),wall=group.userData.plan.wall,plane=new T.Plane(wall?new T.Vector3(0,0,1):new T.Vector3(0,1,0),wall?-at.z:-at.y),hit=ray.ray.intersectPlane(plane,new T.Vector3());if(!hit)return;
  drag={saved:structuredClone(player.placements||{}),plane,offset:at.clone().sub(hit),before:at.clone(),id:group.userData.itemId,last:null};element.dataset.worldDragging='1';canvas.setPointerCapture(e.pointerId);hint.textContent=player.items.find(i=>i.id===drag.id)?.name||'Eşya';
 }
 function move(e){if(!drag||!selected)return;e.stopImmediatePropagation();cast(e);const hit=ray.ray.intersectPlane(drag.plane,new T.Vector3());if(!hit)return;hit.add(drag.offset);if(element.dataset.worldTheme==='kahvalti'){hit.x=Math.max(-5.2,Math.min(5.2,hit.x));hit.z=Math.max(-4,Math.min(4,hit.z));}try{const next=Breakfast.moveItem(player,element.dataset.worldTheme,drag.id,{x:hit.x,y:hit.y,z:hit.z});position(selected,next);drag.last=next;}catch{}}
 function up(e){if(!drag)return;e.stopImmediatePropagation();const done=drag;drag=null;element.dataset.worldDragging='0';if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(done.last)element.dispatchEvent(new CustomEvent('world-placement',{bubbles:true,detail:{owner:element.dataset.worldOwner,itemId:done.id,placement:done.last}}));selected=null;setMode();}
 function cancel(e){if(!drag)return;position(selected,drag.before);player.placements=drag.saved;drag=null;selected=null;element.dataset.worldDragging='0';setMode();}
 canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointermove',move,true);canvas.addEventListener('pointerup',up,true);canvas.addEventListener('pointercancel',cancel,true);
 return()=>{canvas.removeEventListener('pointerdown',down,true);canvas.removeEventListener('pointermove',move,true);canvas.removeEventListener('pointerup',up,true);canvas.removeEventListener('pointercancel',cancel,true);};
}
