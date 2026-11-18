(function(root){
'use strict';
// Essential items, working combinations, and three visual roles for every theme.
const PROFILES={
kahvalti:['0 2 4','0 2 4|1 9|5 8','0 1 9|2 7 8|3 5 6'],
hayvanat:['0 1 2','0 1 2|3 4|5 6','0 1 2|3 4|5 6 7 8 9'],
stadyum:['0 1 5','0 5|0 1 2|3 4','0 5|1 2 6|3 4 8'],
bilgisayar:['0 2 3 4 8','0 2 3 8|1 4|4 5 6','0 1 3|4 5 6|7 9'],
yatak:['0 1 2','0 1|4 7|5 9','0 1|2 7|3 4 5 6 9'],
oturma:['0 1 3','0 1|1 7|0 3 8','0 3|1 4|2 5 6 9'],
salon:['0 1 2','1 9|0 4 8|3 7','0 1|2 6|3 4 5 9'],
isyeri:['0 1 3','0 1 3|1 5|2 9','0 3|1 2|4 6 7 8 9'],
mutfak:['0 1 6','0 4|3 9|6 7','0 1 2|6 9|3 4 5 8'],
banyo:['1 2 4','2 4|1 3 7|8 0','0 1 4|2 7|3 5 6 8 9'],
oyunodasi:['0 1 2','0 1|1 2 3|4 8','0 1 2|3 4 8|5 7 9'],
bahce:['0 2 3','2 3|4 2|0 7','0 1|2 3|5 6 7 8'],
garaj:['0 4 6','0 4 6|5 8|0 7','0 1 2 5|4 6|3 7 8 9'],
kafe:['0 1 2','0 1 2|5 6|7 9','0 1 6|2 8|3 4 9'],
restoran:['0 1 2','0 1 2|2 6|8 9','0 1 3|2 6|4 5 7'],
tatil:['0 1 7','0 1|2 6|4 8','0 5|2 4 6|3 7 8 9'],
kamp:['0 1 3','0 1|2 6|4 7 8','0 1|2 5|3 4 6 7 8 9'],
lunapark:['0 1 2','0 1 2|4 6|8 9','0 1|2 3 7|4 5 6 8 9'],
akvaryum:['0 1 8','1 2 8|3 8|5 9','0 1 5|2 9|3 4 6 7'],
uzay:['0 2 9','2 3 9|1 8|6 9','0 2 8|1 5 6|3 4 7 9'],
muzik:['0 5 6','0 5 6|5 8|6 7','0 1 2 3|5 6 8|4 7 9'],
sinema:['0 4 2','0 4|0 4 2|0 4 1','2|4 5|3 6 7 8 9'],
spor:['0 1 3','0 5|1 2|3 9','0 1 2 4|3 5|6 7 8 9'],
okul:['0 1 2','0 1|2 5|3 7','0 1|2 3 7|4 5 6 8 9'],
cocuk:['0 3 9','0 1 8|2 9|3 4 6','0 3 6|2 4 7 9|1 5 8'],
magaza:['0 1 4','0 1|1 4 9|6 7 8','0 1|2 3|5 8 9'],
otel:['0 3 7','0 3 7|2 6|4 8','0 3|1 5|2 4 6 9'],
sehir:['0 1 2','0 1 2|4 6|7 9','0 1 2|3 8|4 5 6 7 9'],
tropik:['0 1 4','1 2 3|0 7|4 9','0 1 4|2 5|3 6 7 8 9'],
dekor:['0 4 5','0 1|2 8|6 7','0 1|4 5|2 3 6 7 8 9'],
giydirme:['1 2 5','1 2 5|0 4 6|3 8 9','0 1 2 3|4 5 6|7 8 9'],
taki:['0 1 3','1 3|2 4|5 6','0 1 2|3 4 9|5 6 7 8']
};
const numbers=s=>s.split(' ').map(Number),groups=s=>s.split('|').map(numbers);
function profile(theme){const p=PROFILES[theme]||PROFILES.kahvalti;return {essentials:numbers(p[0]),combinations:groups(p[1]),visual:groups(p[2])};}
function evaluate(player,theme,catalog,plan){
 const t=catalog.find(t=>t.id===theme);if(!t){const base=player.items.reduce((s,it)=>s+it.points,0),variety=new Set(player.items.map(it=>it.category)).size*2;return {base,variety,total:base+variety};}
 const owned=new Map(player.items.map(it=>[it.id,it])),ids=new Set([...owned.keys()].map(id=>Number(id.split('-').pop()))),p=profile(theme);
 if(!t){const base=player.items.reduce((s,it)=>s+it.points,0),variety=new Set(player.items.map(it=>it.category)).size*2;return {base,variety,essentials:0,functionality:0,visual:0,savings:0,total:base+variety,missing:[],max:100};}
 const base=Math.round([...owned.values()].reduce((s,it)=>s+it.points,0)/t.items.reduce((s,it)=>s+it.points,0)*25);
 const essentials=Math.round(p.essentials.filter(i=>ids.has(i)).length/p.essentials.length*25);
 const complete=p.combinations.filter(g=>g.every(i=>ids.has(i)));
 let functionality=Math.round(complete.length/p.combinations.length*20);
 const placements=player.placements||{},layout=plan.plan(theme,[...owned.values()]),at=id=>{const d=layout.find(p=>p.index===id);return d?{...d,...placements[d.id]}:null;};
 // Functional relationships matter as well as ownership.
 if(theme==='sinema'&&ids.has(0)&&ids.has(4)){const screen=at(4),projector=at(0),seats=at(2);if(projector.z<screen.z+2||(seats&&seats.z<screen.z+2))functionality=0;}
 let collisions=0;for(let i=0;i<layout.length;i++)for(let j=i+1;j<layout.length;j++){const a=layout[i],b=layout[j];if(!placements[a.id]&&!placements[b.id])continue;if(a.mount!=='ground'||b.mount!=='ground'||['rug','linen','pillow','bananas','monkey'].includes(a.type)||['rug','linen','pillow','bananas','monkey'].includes(b.type))continue;const pa={...a,...placements[a.id]},pb={...b,...placements[b.id]};if(Math.hypot(pa.x-pb.x,pa.z-pb.z)<Math.min(1.3,(a.width+b.width)*.22))collisions++;}
 const visual=Math.max(0,Math.round(p.visual.filter(g=>g.some(i=>ids.has(i))).length/3*15)-Math.min(10,collisions*3));
 const variety=Math.round(new Set([...owned.values()].map(it=>it.category)).size/new Set(t.items.map(it=>it.category)).size*10),savings=owned.size?Math.floor(Math.max(0,Math.min(20,player.money))/4):0;
 const missing=p.essentials.filter(i=>!ids.has(i)).map(i=>t.items[i].name);
 return {base,variety,essentials,functionality,visual,savings,total:base+variety+essentials+functionality+visual+savings,missing,collisions,max:100};
}
const api={PROFILES,profile,evaluate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ScoreRules=api;
})(typeof window!=='undefined'?window:globalThis);
