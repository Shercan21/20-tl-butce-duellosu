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
  function score(player){const base=player.items.reduce((sum,x)=>sum+x.points,0);const variety=new Set(player.items.map(x=>x.category)).size*2;return {base,variety,total:base+variety};}
  function resolveRound(game,bids){if(game.round>=game.deck.length)throw Error('Oyun tamamlandı');if(!Array.isArray(bids)||bids.length!==game.players.length)throw Error('Eksik teklif');bids.forEach((v,i)=>{if(!Number.isInteger(v)||v<0||v>game.players[i].money)throw Error('Geçersiz teklif');});const item=game.deck[game.round],max=Math.max(...bids),count=game.players.length;let winner=null;if(max>0)for(let offset=0;offset<count;offset++){const i=(game.round+offset)%count;if(bids[i]===max){winner=i;break;}}if(winner!==null){game.players[winner].money-=bids[winner];game.players[winner].items.push(item);}const result={item,bids:[...bids],winner,tie:max>0&&bids.filter(b=>b===max).length>1};game.history.push(result);game.bids=[...bids];game.stage='reveal';return result;}
  function nextRound(game){game.round++;game.bids=Array(game.players.length).fill(null);game.turn=0;game.stage=game.round>=game.deck.length?'finished':'bid';}
  function cpuBid(game,random=Math.random){const player=game.players[1];const item=game.deck[game.round];const rounds=game.deck.length-game.round;const novel=!player.items.some(x=>x.category===item.category);if(!player.money)return 0;const value=item.points+(novel?2:0);const target=player.money/Math.max(1,rounds*.65);return Math.max(0,Math.min(player.money,Math.round(target*(value/9)*(.55+random()*.9))));}
  function winner(game){const scores=game.players.map(p=>score(p).total),best=Math.max(...scores);let leaders=scores.map((s,i)=>s===best?i:-1).filter(i=>i>=0);if(leaders.length===1)return leaders[0];const money=Math.max(...leaders.map(i=>game.players[i].money));leaders=leaders.filter(i=>game.players[i].money===money);return leaders.length===1?leaders[0]:null;}
  const api={ITEMS,createGame,score,resolveRound,nextRound,cpuBid,winner};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Breakfast=api;
})(typeof window!=='undefined'?window:globalThis);
