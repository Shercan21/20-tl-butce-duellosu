/* Real raster scenery and transparent purchase cutouts; both game modes share this renderer. */
(function(root){
'use strict';
const seen=new Map();
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ground=[[50,85,58],[78,75,37],[22,76,39],[16,95,28],[49,60,34],[20,45,30],[79,44,31],[82,98,31],[53,96,30],[54,82,35]];
const tabletop=[[21,60,27],[51,60,28],[80,60,26],[13,81,24],[39,80,23],[66,80,25],[87,82,25],[23,99,27],[51,99,28],[78,99,27]];
const layouts={
 tropik:[[18,85,50],[75,83,47],[43,91,29],[63,96,24],[49,72,54],[79,48,21],[14,99,28],[32,84,44],[81,98,45],[57,98,18]],
 hayvanat:[[23,85,37],[70,67,39],[51,89,42],[82,95,32],[14,63,32],[78,48,29],[50,99,29],[45,65,35],[82,75,34],[18,45,33]],
 stadyum:[[50,90,89],[20,55,33],[80,93,31],[87,43,27],[48,37,37],[46,82,36],[82,65,35],[18,96,31],[50,56,67],[78,99,41]],
 bilgisayar:[[44,82,24],[48,85,34],[63,88,25],[40,85,29],[52,71,58],[50,96,52],[83,95,21],[20,79,34],[21,96,28],[82,76,30]],
 kahvalti:tabletop,
 yatak:[[50,94,75],[51,88,63],[81,76,47],[18,68,34],[28,64,23],[52,40,49],[87,94,27],[19,87,29],[79,97,43],[51,31,50]],
 oturma:[[51,84,76],[76,60,43],[50,99,85],[50,95,49],[17,69,40],[87,81,28],[14,96,30],[78,93,26],[51,78,43],[48,38,40]],
 salon:[[50,86,78],[49,98,59],[51,25,38],[18,43,31],[51,99,84],[72,91,22],[51,38,63],[80,69,44],[15,95,43],[52,90,23]],
 isyeri:[[51,89,40],[53,70,36],[82,80,35],[50,89,69],[19,94,34],[80,91,21],[13,85,27],[49,28,50],[77,99,48],[28,43,37]],
 mutfak:[[22,79,40],[82,79,48],[49,75,43],[24,94,24],[64,94,29],[84,98,28],[49,57,81],[81,78,39],[13,97,25],[49,98,71]],
 banyo:[[30,93,72],[80,76,44],[49,43,33],[69,99,34],[50,77,46],[13,90,31],[48,80,25],[17,50,29],[80,97,23],[82,44,35]],
 oyunodasi:[[26,87,35],[52,68,59],[50,96,49],[52,94,47],[81,84,27],[50,32,65],[17,81,40],[80,98,45],[81,71,29],[20,42,33]],
 bahce:[[21,75,50],[16,99,35],[57,98,67],[53,71,62],[80,90,40],[28,98,44],[53,46,69],[29,86,47],[76,98,43],[13,90,27]],
 taki:tabletop,giydirme:[[49,85,65],[21,88,47],[77,70,45],[22,68,48],[66,98,30],[34,98,31],[82,92,34],[50,47,32],[74,58,30],[49,31,37]]
};
function atlas(){return root.ART_MAP||{scenes:{},items:{}};}
function rectArt(info,extra=''){
 if(!info)return '<span class="art-missing" aria-hidden="true"></span>';
 const [x,y,w,h]=info.rect,[fw,fh]=info.size,ratio=w/h,fit=ratio>=1?`width:100%;height:${100/ratio}%`:`height:100%;width:${ratio*100}%`;
 return `<span class="item-art ${extra}" aria-hidden="true"><span class="sprite-crop" style="${fit}"><img src="./${info.file}" alt="" draggable="false" decoding="async" style="width:${fw/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span></span>`;
}
function item(item,extra=''){return rectArt(atlas().items[item.id],extra);}
function backdrop(themeId){const t=atlas().scenes[themeId];if(!t)return '';if(t.single)return `<img class="scene-background" src="./${t.file}" alt="" draggable="false" decoding="async">`;return `<div class="scene-background scene-atlas" style="background-image:url('./${t.file}');background-position:${t.col/3*100}% ${t.row/3*100}%" aria-hidden="true"></div>`;}
function position(themeId,it,index){let result=[...(layouts[themeId]||ground)[index%10]],kind='floor';
 if(!layouts[themeId]){
  if(/halı|kilim|oyun halısı/.test(it.name.toLocaleLowerCase('tr'))){result=[50,90,85];kind='rug';}
  else if(/avize|ışık panelleri|gece lambası/.test(it.name.toLocaleLowerCase('tr')))result=[52,34,37];
  else if(/tablo|afiş|poster|ayna|tahta/.test(it.name.toLocaleLowerCase('tr')))result=[index%2?77:23,44,38];
 }
 if(['oturma','salon'].includes(themeId)&&index===(['oturma'].includes(themeId)?2:4))kind='rug';
 if(themeId==='stadyum'&&index===0)kind='field';
 return {x:result[0],y:result[1],w:result[2],z:['rug','field'].includes(kind)?1:Math.round(result[1]),kind};
}
function scene(themeId,items,key='',large=false){
 const t=(root.CATALOG||[]).find(t=>t.id===themeId),previous=seen.get(key)||0;seen.set(key,items.length);
 const copies=new Map();
 const list=items.map((it,i)=>{let idx=t?.items.findIndex(x=>x.id===it.id)??i;if(idx<0)idx=i;const p=position(themeId,it,idx),copy=copies.get(it.id)||0;copies.set(it.id,copy+1);if(copy){p.x=Math.max(10,Math.min(90,p.x+(copy%2?1:-1)*Math.ceil(copy/2)*14));p.y=Math.min(99,p.y+(copy%2?4:-4));p.w*=Math.max(.65,1-copy*.07);p.z+=copy;}const fresh=!large&&items.length>previous&&i>=previous;return `<span class="scene-object ${p.kind} ${themeId==='tropik'&&idx<2?'palm-sway':themeId==='tropik'&&idx===2?'monkey-bounce':''} ${fresh?'new-purchase':''}" style="left:${p.x}%;top:${p.y}%;width:${p.w}%;z-index:${p.z}" role="img" aria-label="${safe(it.name)}, ${it.points} puan" title="${safe(it.name)} · ${it.points} puan">${item(it)}</span>`;}).join('');
 return `<div class="world-scene ${themeId==='kahvalti'?'breakfast-scene':''} ${large?'large-scene':''}" data-scene="${safe(themeId)}" role="group" aria-label="${safe(t?.name||'Oyun alanı')}: ${items.length} ürün">${backdrop(themeId)}${list}${!items.length?'<span class="scene-empty">Satın aldıkların burada canlanır.</span>':''}${!large?`<button class="scene-expand" aria-label="Sahneyi büyüt" title="Sahneyi büyüt" data-scene-open="${safe(themeId)}" data-owned="${items.map(x=>safe(x.id)).join(',')}">⛶</button>`:''}</div>`;
}
function category(theme){return `<span class="category-art" aria-hidden="true">${backdrop(theme.id)}</span>`;}
function owned(items){return items.length?`<details class="owned-items"><summary>Alınanları gör (${items.length})</summary><ul>${items.map(it=>`<li>${item(it)}<span>${safe(it.name)}</span><small>${it.points} puan</small></li>`).join('')}</ul></details>`:'';}
function show(themeId,ids){const t=(root.CATALOG||[]).find(t=>t.id===themeId);if(!t)return;const items=ids.split(',').map(id=>t.items.find(x=>x.id===id)).filter(Boolean);let d=document.querySelector('#scene-viewer');if(!d){d=document.createElement('dialog');d.id='scene-viewer';document.body.append(d);}d.innerHTML=`<button class="close" aria-label="Kapat">×</button><span class="eyebrow">SENİN KURDUĞUN DÜNYA</span><h2>${safe(t.name)}</h2>${scene(themeId,items,'viewer',true)}<p class="muted">${items.length} ürün · Sadece kazandığın parçalar sahnende görünür.</p>`;d.querySelector('.close').onclick=()=>d.close();d.onclick=e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}};d.showModal();}
if(typeof document!=='undefined')document.addEventListener('click',e=>{const b=e.target.closest('[data-scene-open]');if(b)show(b.dataset.sceneOpen,b.dataset.owned);});
const api={item,scene,category,owned,position};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Visuals=api;
})(typeof window!=='undefined'?window:globalThis);
