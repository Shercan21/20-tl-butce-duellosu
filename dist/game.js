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
  function createGame(mode='cpu',random=Math.random,theme=null){const deck=(theme?theme.items:ITEMS).map(x=>({...x}));for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return {version:2,themeId:theme?theme.id:'kahvalti',mode,round:0,deck:deck.slice(0,10),players:[{money:20,items:[]},{money:20,items:[]}],history:[],stage:'bid',turn:0,bids:[null,null]};}
  function score(player){const base=player.items.reduce((sum,x)=>sum+x.points,0);const variety=new Set(player.items.map(x=>x.category)).size*2;return {base,variety,total:base+variety};}
  function resolveRound(game,bids){if(game.round>=game.deck.length)throw Error('Oyun tamamlandı');bids.forEach((v,i)=>{if(!Number.isInteger(v)||v<0||v>game.players[i].money)throw Error('Geçersiz teklif');});const item=game.deck[game.round];let winner=null;if(bids[0]||bids[1])winner=bids[0]===bids[1]?game.round%2:(bids[0]>bids[1]?0:1);if(winner!==null){game.players[winner].money-=bids[winner];game.players[winner].items.push(item);}const result={item,bids:[...bids],winner,tie:bids[0]===bids[1]&&bids[0]>0};game.history.push(result);game.bids=[...bids];game.stage='reveal';return result;}
  function nextRound(game){game.round++;game.bids=[null,null];game.turn=0;game.stage=game.round>=game.deck.length?'finished':'bid';}
  function cpuBid(game,random=Math.random){const player=game.players[1];const item=game.deck[game.round];const rounds=game.deck.length-game.round;const novel=!player.items.some(x=>x.category===item.category);if(!player.money)return 0;const value=item.points+(novel?2:0);const target=player.money/Math.max(1,rounds*.65);return Math.max(0,Math.min(player.money,Math.round(target*(value/9)*(.55+random()*.9))));}
  function winner(game){const s=game.players.map(p=>score(p).total);if(s[0]!==s[1])return s[0]>s[1]?0:1;const m=game.players.map(p=>p.money);return m[0]===m[1]?null:(m[0]>m[1]?0:1);}
  const api={ITEMS,createGame,score,resolveRound,nextRound,cpuBid,winner};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Breakfast=api;
})(typeof window!=='undefined'?window:globalThis);
