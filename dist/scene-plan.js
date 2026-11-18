(function(root){
const TYPES={
kahvalti:['cheese','menemen','simit','olives','tea','honey','salad','croissant','pancakes','eggs'],
hayvanat:['lion','giraffe','elephant','penguin','bear','parrot','flamingo','monkey','tiger','butterfly'],
stadyum:['turf','seats','fans','floodlight','scoreboard','goal','vip','kiosk','flags','metro'],
bilgisayar:['cpu','gpu','ssd','ram','monitor','keyboard','mouse','cooling','psu','headphones'],
yatak:['bed','linen','wardrobe','mirror','lamp','curtain','plant','nightstand','chair','lights'],
oturma:['sofa','screen','rug','coffeeTable','bookshelf','floorLamp','plant','console','pillow','painting'],
salon:['sofa','dining','chandelier','mirror','rug','vase','curtain','cabinet','chair','candle'],
isyeri:['officeChair','computer','shelf','desk','coffee','router','plant','ceilingLight','sofa','whiteboard'],
mutfak:['stove','fridge','oven','knives','pots','coffee','cabinet','dishwasher','plant','island'],
banyo:['tub','shower','mirror','towels','vanity','plant','bottles','radiator','candle','shelf'],
oyunodasi:['console','monitor','officeChair','keyboard','headphones','lights','arcade','sofa','speakers','painting'],
bahce:['tree','flowers','dining','gazebo','grill','pond','lights','hammock','garden','tools'],
garaj:['car','suv','classicCar','motorbike','workbench','electricCar','tools','tires','charger','scooter'],
kafe:['coffee','pastry','dining','speakers','plant','cake','juice','router','terrace','bookshelf'],
restoran:['chef','stove','dining','pizzaOven','garden','cake','staff','chandelier','scooter','computer'],
tatil:['hotel','plane','boat','cocktail','tent','ruins','diver','meal','bicycle','spa'],
kamp:['tent','sleepingBag','campfire','water','compass','lantern','cans','backpack','firstAid','knife'],
lunapark:['coaster','wheel','carousel','haunted','kiosk','tent','kiosk','slides','lights','train'],
akvaryum:['shark','fish','coral','octopus','jellyfish','turtle','crab','shell','filter','seaweed'],
uzay:['rocket','satellite','capsule','greenhouse','robot','telescope','solar','rover','laboratory','battery'],
muzik:['microphone','piano','guitar','drums','headphones','mixer','speakers','acoustic','computer','lights'],
sinema:['projector','speakers','sofa','popcorn','curtain','ceilingLight','bookshelf','fridge','painting','pillow'],
spor:['weights','treadmill','bicycle','yoga','punchingBag','mirror','shelf','speakers','water','exerciseBall'],
okul:['schoolDesk','whiteboard','bookshelf','microscope','artTable','globe','plant','computer','blocks','ceilingLight'],
cocuk:['bed','teddy','blocks','bookshelf','artTable','painting','shelf','tent','lamp','rug'],
magaza:['display','clothes','shelf','ceilingLight','computer','chair','shelf','computer','gifts','staff'],
otel:['hotel','pool','dining','reception','spa','tree','coffee','luggage','weights','stage'],
sehir:['house','hospital','school','park','metro','theater','bikeLane','solar','library','waterPlant'],
tropik:['palm','bananaTree','monkey','bananas','hut','parrot','flowers','hammock','canoe','coconut'],
dekor:['painting','mirror','vase','candle','plant','lamp','rug','pillow','flowers','statue'],
giydirme:['dress','pants','blouse','coat','heels','sneakers','handbag','glasses','scarf','hat'],
taki:['ring','necklace','chain','earrings','hoops','watch','bracelet','beads','brooch','hairclip']
};
const OUTDOOR=new Set(['tropik','hayvanat','stadyum','bahce','garaj','tatil','kamp','lunapark','akvaryum','uzay','otel','sehir']);
const WALL=new Set(['mirror','painting','curtain','whiteboard','acoustic','lights','ceilingLight','chandelier']);
const ZONES={
yatak:[[0,1.6],[0,1.6],[4,-3.7],[-4,-5.3],[-3.1,.7],[0,-5.3],[-5,3.6],[-3,.6],[4,3.2],[0,-5.3]],
oturma:[[-1,0],[3,-3.7],[0,2],[0,2],[-4.7,-3.8],[4.7,1.4],[-5,3.8],[3,-3.5],[0,.3],[0,-5.3]],
salon:[[-2,1],[3,1],[0,-1],[3,-5.3],[0,2],[4,-3.7],[0,-5.3],[0,-4.5],[-4,3],[3,1]],
isyeri:[[0,1],[0,0],[4.7,-3.7],[0,.4],[-4,-3.5],[2,0],[-5,3.7],[0,-2],[4,3],[-1,-5.3]],
mutfak:[[-4,-3.7],[4.7,-3.8],[-1.8,-3.8],[-4,-3.7],[-2,-3.7],[1,-3.7],[0,-5],[4,-3.8],[-5,2],[0,2]],
banyo:[[-3,1.8],[4,-3],[0,-5.3],[-4,3.7],[0,-3.7],[-5,-3.8],[1,-3.7],[4,-5.3],[-4,3.5],[4,3]],
tropik:[[-4,-1],[3,-2],[0,3],[2,3.5],[-1,-3],[4,1],[-4,3.5],[-3,1.5],[4,4],[0,4]],
bilgisayar:[[-3,.2],[-1.5,.2],[1,.2],[2.5,.2],[0,-1],[0,1.8],[3,1.8],[-4,-1],[-4,1.5],[4,-1]],
sehir:[[-3,2.5],[3,-3],[-3,-3],[0,3],[4,1],[0,-3],[-5,0],[4,4],[0,0],[-5,4]]
};
function plan(themeId,items){const map=TYPES[themeId]||[];const counts=new Map();return items.map((item,i)=>{const idx=Number(item.id.split('-').pop()),type=map[idx]||'gift',copy=counts.get(item.id)||0;counts.set(item.id,copy+1);const zone=ZONES[themeId]?.[idx]||[[-4,-3],[0,-3],[4,-3],[-4,1],[0,1],[4,1],[-4,4],[0,4],[4,4],[0,-5]][idx%10];return {id:item.id,type,index:idx,copy,x:zone[0]+(copy?((copy%3)-1)*1.1:0),z:zone[1]+Math.floor(copy/3)*1.15,wall:WALL.has(type)};});}
const api={TYPES,OUTDOOR,WALL,ZONES,plan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WorldPlan=api;
})(typeof window!=='undefined'?window:globalThis);
