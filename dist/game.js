(function(root){
  'use strict';
  const ITEMS=[
    {id:'peynir',name:'Peynir tabağı',emoji:'🧀',category:'Peynir',points:8},
    {id:'menemen',name:'Sıcacık menemen',emoji:'🍳',category:'Sıcaklar',points:10},
    {id:'simit',name:'Çıtır simit',emoji:'🥯',category:'Fırından',points:6},
    {id:'zeytin',name:'Zeytin kasesi',emoji:'🫒',category:'Tazeler',points:5},
    {id:'cay',name:'Demli çay',emoji:'☕',category:'İçecek',points:7},
    {id:'bal',name:'Bal & kaymak',emoji:'🍯',category:'Tatlılar',points:8},
    {id:'domates',name:'Domates & salatalık',emoji:'🥗',category:'Tazeler',points:6},
    {id:'kruvasan',name:'Tereyağlı kruvasan',emoji:'🥐',category:'Fırından',points:7},
    {id:'pankek',name:'Mini pankekler',emoji:'🥞',category:'Tatlılar',points:9},
    {id:'sucuk',name:'Sucuklu yumurta',emoji:'🥘',category:'Sıcaklar',points:11},
    {id:'portakal',name:'Portakal suyu',emoji:'🍊',category:'İçecek',points:6},
    {id:'ekmek',name:'Köy ekmeği',emoji:'🍞',category:'Fırından',points:5},
    {id:'recelle',name:'Çilek reçeli',emoji:'🍓',category:'Tatlılar',points:6},
    {id:'sut',name:'Bir bardak süt',emoji:'🥛',category:'İçecek',points:5}
  ];
  function createGame(mode='cpu',random=Math.random,theme=null,count=2){if(!Number.isInteger(count)||count<2||count>8)throw Error('Oyuncu sayısı 2–8 olmalı');const source=theme?theme.items:ITEMS,deck=[],rounds=count*5;let cycle=0;while(deck.length<rounds){const batch=source.map(x=>({...x,instanceId:x.id+':'+cycle}));for(let i=batch.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[batch[i],batch[j]]=[batch[j],batch[i]];}if(deck.length&&batch[0].id===deck[deck.length-1].id)[batch[0],batch[1]]=[batch[1],batch[0]];deck.push(...batch.slice(0,rounds-deck.length));cycle++;}return {version:2,themeId:theme?theme.id:'kahvalti',mode,round:0,deck,players:Array.from({length:count},()=>({money:20,items:[]})),history:[],stage:'bid',turn:0,bids:Array(count).fill(null)};}
  function dependencies(){return {catalog:root.CATALOG||(typeof require==='function'?require('./catalog.js'):[]),scoring:root.ScoreRules||(typeof require==='function'?require('./scoring.js'):null),plan:root.WorldPlan||(typeof require==='function'?require('./scene-plan.js'):null)};}
  function score(player,themeId){const d=dependencies(),theme=themeId||player.items[0]?.id?.replace(/-\d+$/,'');return d.scoring.evaluate(player,theme,d.catalog,d.plan);}
  function moveItem(player,themeId,itemId,position){
    const {plan}=dependencies();if(!player.items.some(it=>it.id===itemId))throw Error('Sadece kendi eşyanı taşıyabilirsin.');const all=plan.plan(themeId,player.items),p=all.find(p=>p.id===itemId);
    if(themeId==='stadyum'&&[0,1,3,5].includes(p.index))throw Error('Sabit saha yapıları taşınamaz.');if(!position||![position.x,position.y,position.z].every(Number.isFinite))throw Error('Geçersiz eşya konumu.');
    const bound=themeId==='stadyum'?13:6.2,clamp=(n,min,max)=>Math.round(Math.max(min,Math.min(max,n))*100)/100,old=player.placements?.[itemId]||p;
    const rotation=position.r??old.r;if(rotation!==undefined&&!Number.isFinite(rotation))throw Error('Geçersiz eşya yönü.');const result={x:clamp(position.x,-bound,bound),z:p.wall?p.z:clamp(position.z,-bound,bound),y:p.wall?clamp(position.y,0,Math.max(p.y,4.7-Math.min(p.width,3))):p.y};
    if(rotation!==undefined)result.r=p.wall?0:((Math.round(rotation)%360)+360)%360;
    if(p.wall)result.x=clamp(result.x,-Math.max(.5,6.5-p.width/2),Math.max(.5,6.5-p.width/2));
    if(themeId==='sinema'&&p.index===2){result.x=clamp(result.x,-1.2,1.2);result.z=clamp(result.z,-.2,2.2);}
    const parent=all.find(a=>a.index===p.parent),support=parent?(player.placements?.[parent.id]||parent):null;
    if(p.mount!=='ground'&&!p.wall&&p.mount!=='ceiling'){const dx=support?support.x-parent.x:0,dz=support?support.z-parent.z:0;result.x=clamp(result.x,p.x+dx-.65,p.x+dx+.65);result.z=clamp(result.z,p.z+dz-.65,p.z+dz+.65);}
    player.placements={...player.placements,[itemId]:result};
    for(const child of all.filter(a=>a.parent===p.index)){const before=player.placements[child.id]||child;const delta=((result.r||0)-(old.r||0))*Math.PI/180,dx=before.x-old.x,dz=before.z-old.z;player.placements[child.id]={x:result.x+dx*Math.cos(delta)+dz*Math.sin(delta),y:before.y+result.y-old.y,z:result.z-dx*Math.sin(delta)+dz*Math.cos(delta),...((result.r!==undefined||before.r!==undefined)?{r:((before.r||0)+(result.r||0)-(old.r||0)+360)%360}:{})};}
    return result;
  }
  function resolveRound(game,bids){if(game.round>=game.deck.length)throw Error('Oyun tamamlandı');if(!Array.isArray(bids)||bids.length!==game.players.length)throw Error('Eksik teklif');bids.forEach((v,i)=>{if(!Number.isInteger(v)||v<0||v>game.players[i].money)throw Error('Geçersiz teklif');});const item=game.deck[game.round],max=Math.max(...bids),count=game.players.length;let winner=null;if(max>0)for(let offset=0;offset<count;offset++){const i=(game.round+offset)%count;if(bids[i]===max){winner=i;break;}}if(winner!==null){game.players[winner].money-=bids[winner];game.players[winner].items.push(item);const d=dependencies(),plan=d.plan.plan(game.themeId,game.players[winner].items),child=plan.find(p=>p.id===item.id),parent=plan.find(p=>p.index===child?.parent),saved=parent&&game.players[winner].placements?.[parent.id];if(saved){const a=(saved.r||0)*Math.PI/180,dx=child.x-parent.x,dz=child.z-parent.z;game.players[winner].placements[item.id]={x:saved.x+dx*Math.cos(a)+dz*Math.sin(a),y:child.y+saved.y-parent.y,z:saved.z-dx*Math.sin(a)+dz*Math.cos(a),...(saved.r!==undefined?{r:saved.r}:{})};}}const result={item,bids:[...bids],winner,tie:max>0&&bids.filter(b=>b===max).length>1};game.history.push(result);game.bids=[...bids];game.stage='reveal';return result;}
  function nextRound(game){game.round++;game.bids=Array(game.players.length).fill(null);game.turn=0;game.stage=game.round>=game.deck.length?'finished':'bid';}
  function cpuBid(game,random=Math.random){const player=game.players[1],item=game.deck[game.round],rounds=game.deck.length-game.round;if(!player.money||player.items.some(it=>it.id===item.id))return 0;const before=score(player,game.themeId).total,after=score({...player,items:[...player.items,item]},game.themeId).total,gain=after-before;const target=player.money/Math.max(1,rounds*.55);return Math.max(0,Math.min(player.money,Math.round(target*(.7+gain/12)*(.55+random()*.9))));}
  function winner(game){const scores=game.players.map(p=>score(p,game.themeId).total),best=Math.max(...scores);let leaders=scores.map((s,i)=>s===best?i:-1).filter(i=>i>=0);if(leaders.length===1)return leaders[0];const money=Math.max(...leaders.map(i=>game.players[i].money));leaders=leaders.filter(i=>game.players[i].money===money);return leaders.length===1?leaders[0]:null;}
  const api={ITEMS,createGame,score,moveItem,resolveRound,nextRound,cpuBid,winner};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Breakfast=api;
})(typeof window!=='undefined'?window:globalThis);
