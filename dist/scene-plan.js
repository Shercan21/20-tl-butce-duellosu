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
// Coordinates are authored by purpose: x, z, width, elevation, mounting surface.
// Negative z is the front/back wall; positive z is the entrance/viewer side.
const LAYOUTS={
kahvalti:[[-4.4,-2.8,2.1,1.48],[-1.5,-2.8,2.1,1.48],[1.5,-2.8,2.1,1.48],[4.4,-2.8,2.1,1.48],[-4.4,.3,1.5,1.48],[-1.5,.3,2,1.48],[1.5,.3,2,1.48],[4.4,.3,2,1.48],[-1.8,3.1,2,1.48],[1.8,3.1,2,1.48]],
hayvanat:[[-5,-3.3,2.5],[0,-3.4,2.4],[5,-3.4,3],[-5,1,2.3],[5,1,2.6],[-5,4.5,2.2],[0,4.5,2.3],[0,1,2.4],[5,4.5,2.5],[0,-6.3,2.4]],
stadyum:[[0,0,10],[-7,0,3],[-7,0,3],[8,-10,2],[0,-11,4],[0,-7.8,3],[8,0,3],[-8,11,2],[0,-11,4],[8,14,4]],
bilgisayar:[[-1.45,-1.9,.7,1.2,'case'],[-1.1,-1.1,1.35,1,'case'],[-1.75,-.5,.65,.75,'case'],[-.9,-1.9,.65,1.55,'case'],[1.8,-2.2,3.1,1.55,'desk'],[1.4,.1,2,1.5,'desk'],[3.6,.1,.8,1.5,'desk'],[-1.85,-2,1,1.9,'case'],[-1.4,-1.4,1.1,.2,'case'],[4.1,-2.2,1.2,1.55,'desk']],
yatak:[[0,-1,4.6],[0,.4,2.9,.6],[4.8,-3.7,2.8],[-4.9,-3.9,1.6],[-3.1,-1.7,1,1.25,'nightstand'],[0,-5.4,4,1.4,'wall'],[-5,3.4,1.8],[-3.1,-1.7,1.8],[4,2.8,2.3],[0,-5.35,4,3.8,'wall']],
oturma:[[0,2.2,4.8],[0,-4.8,3.6,1,'wall'],[0,.4,5.5,0,'floor'],[0,.3,2.5],[-5,-3.7,2.5],[4,2.4,1.8],[-5,3.5,1.9],[0,-4.2,1.6,.55,'console'],[-1,2.2,1.2,.85,'sofa'],[4,-5.35,2.3,2,'wall']],
salon:[[-3,1.8,4],[3.2,-1,3.3],[3.2,-1,2,4,'ceiling'],[-3.5,-5.35,2,2,'wall'],[-3,1,4.6,0,'floor'],[3.2,-1,1.1,1.3,'table'],[1,-5.35,3,1.3,'wall'],[-3.5,-4.3,3],[-5,3.4,2],[3.6,-.6,.9,1.3,'table']],
isyeri:[[0,1.4,2.5],[0,-1,2.6,1.5,'desk'],[-5,-3.6,2.7],[0,-.5,4.2],[-4,3,2.2],[2,-1,.8,1.5,'desk'],[5,-3.8,1.7],[0,0,2,4,'ceiling'],[4,3.2,3],[-1,-5.35,3.5,2,'wall']],
mutfak:[[-4,-3.6,2.3],[5,-3.9,2.6],[-1.8,-3.7,2.1],[-4,-4.6,1.1,1.7,'counter'],[-4,-3.2,1.4,1.25,'counter'],[1.1,-3.8,1.3,1.35,'counter'],[0,-4.7,4.3],[3.1,-3.8,1.8],[-5,2.7,1.6],[0,2,4.2]],
banyo:[[-3,1,3.8],[4.5,-3.5,2.8],[0,-5.3,2.6,2,'wall'],[-4.8,3.8,1.2,1,'rack'],[0,-4.1,3],[5,3.2,1.7],[.9,-4.1,.8,1.3,'vanity'],[-5,-4.5,1.4,.9,'wall'],[-3,1.1,.7,.8,'bath'],[-4.6,-3.8,1.8]],
oyunodasi:[[-2,-2.8,1.4,1.5,'desk'],[0,-3,3.8,1.5,'desk'],[0,0,2.7],[0,-1.5,2,1.5,'desk'],[2.7,-2.9,1,1.6,'desk'],[0,-5.35,4,2.3,'wall'],[-5,0,2.5],[3.6,3.2,3],[4.5,-3.7,1.8],[-4,-5.35,2,2,'wall']],
bahce:[[-5,-3.6,3],[5,-4.2,2.3],[0,-1.6,3.5],[0,-2.4,5],[-5,2.6,2.3],[3.7,2,3.1],[0,-6,5,2.4],[-3,4,3.1],[5,4.2,2.5],[-5,4.8,1.5]],
garaj:[[-4,2.5,3.8],[0,2.5,3.8],[4,2.5,3.8],[-5,-1.3,2],[0,-4.5,3.8],[4,-2,3.8],[0,-4.5,1.7,1.2,'bench'],[-4,-4.3,2],[5.8,-4.7,1.4],[-5,4.8,1.6]],
kafe:[[-4.6,-4,2,1.2,'counter'],[0,-4.3,3.1],[-2,1.3,3.5],[4.7,-5.2,1.4,2.5,'wall'],[-5,3.6,1.6],[0,-4.3,1.2,1.2,'counter'],[4.3,-4.1,2.1],[2.3,-4.8,.8,1.5,'counter'],[4,3,3.3],[-5,-.8,2]],
restoran:[[-3.6,-3.4,1.6],[-4,-4.3,3.4],[2.2,1.8,4],[1,-4,2.5],[-5,3.7,1.9],[4.5,-3.7,1.7,1.1,'counter'],[4.8,2,1.8],[2.2,1.8,2,4,'ceiling'],[5.3,4.7,2],[-.5,4.7,1.3,1,'host']],
tatil:[[-3,-4.7,4],[3.7,-5,2.8,3],[4.5,2.6,3.1],[-3.4,3.4,1.3,.9,'table'],[-5,0,2.5],[1,-4.8,3],[5,4.7,1.5],[-3.2,3.5,2.3],[0,4.2,2.2],[4,-1.5,2.6]],
kamp:[[-2.8,-2,4],[-2.7,-.7,1.7,.1],[0,2.2,2],[4.7,2.6,1.2],[4.8,4.4,1],[-1.4,-1.2,.8,1.5],[4.3,-.7,1.6],[-5,1.5,1.9],[4.7,1,1.1],[2.4,4.7,1]],
lunapark:[[-4.1,-4,4.2],[4,-4.5,4],[0,.1,3.6],[-5,1.2,2.4],[-4,4.8,1.7],[0,-4.4,2.8],[4.3,4.8,1.8],[5,.3,2.8],[0,-6.3,4.5,3],[0,5.6,3]],
akvaryum:[[0,-3.5,4.2],[-4,-1,2.1],[0,1,2.2],[4,-2.5,2.1],[4.8,1.2,1.7],[-4,3.4,2.2],[4.8,4.5,1.4],[0,4.7,1.4],[6,-5,1.5],[-1.8,2.6,2]],
uzay:[[-5,-3.4,2.5],[4,-5,2.4,4],[0,-2.7,3.4],[4.7,-1.6,2.8],[-2,2.3,1.8],[-5,2.5,2.3],[3.7,4,3],[-.3,4.4,2.8],[-.4,-5,3],[5.7,1.5,1.8]],
muzik:[[0,.8,1.1],[-4,-1,3.2],[4,-1,1.6],[0,-3.7,3.3],[1.3,4,1,1.4,'desk'],[0,4,2.4,1.4,'desk'],[-3,-4.4,1.6],[0,-5.35,5,2,'wall'],[-1.6,4,1.8,1.4,'desk'],[0,-5.2,5,3.9,'wall']],
sinema:[[0,3.6,1.4,4,'ceiling'],[0,-4.7,1.3],[0,1,10],[-5.2,3.5,1.8],[0,-5.25,8,0,'wall'],[0,0,2,4,'ceiling'],[-5.2,-1.5,1.8],[5.2,3.5,1.7],[5,-5.3,1.5,2,'wall'],[2,2.6,1.2,.8,'seat']],
spor:[[-5,-3.3,2.4],[-2,-3.6,2.5],[1.6,-3.6,2.3],[1,2.2,3.5],[5,-2,1.6,1.8],[-1,-5.3,5,2,'wall'],[-5,3.8,2.5],[5,-5.2,1.5,2.7,'wall'],[5,4,1.6],[.7,4,2]],
okul:[[-2,1,3.8],[0,-5.3,4.5,1.6,'wall'],[-5,-3.5,2.5],[4.8,-2.5,1.6,1.1,'lab'],[4.6,2.5,2.4],[-3.8,-3.5,1.1,1.4,'teacher'],[-5,4,1.5],[-5,1,1.8,1.2,'desk'],[4.8,4.6,1.5],[0,0,2,4,'ceiling']],
cocuk:[[-3,-2.8,3.8],[-3,-2,1.1,.7,'bed'],[0,2.2,1.7],[-5,-4.2,2],[4,0,2.4],[1,-5.3,2.4,2,'wall'],[4.8,-3.8,2.3],[-4,3.7,2.6],[-.8,-2.8,1,1,'nightstand'],[0,2,4.4,0,'floor']],
magaza:[[0,4.7,3.5],[-3.7,1.3,2.7],[4.8,-1,2.8],[0,4.8,3,4,'ceiling'],[2.7,-3.8,1.4,1.2,'counter'],[-4.8,-3.6,2.4],[0,-5,2.9],[-2,-4.7,1.5,1.2,'counter'],[4.3,-3.7,1.5,.9,'counter'],[2.5,-2,1.6]],
otel:[[0,-5,5],[4,2.4,3.4],[-4,1.5,3.3],[0,-.5,2.9],[5,-3.8,2.4],[-5,-4.5,2.5],[-4,4.7,2.3],[1.8,.2,1.5],[5,4.8,1.8],[0,5,3]],
sehir:[[-4,1.8,3],[4,-4,3],[-4,-4,2.9],[0,1.5,3.6],[4,1.5,2.7],[0,-4,3],[-4,5,2.8],[5,5,2.6],[0,5,2.7],[-5,-6,2.6]],
tropik:[[-4,-1,4.8],[3,-2,4.1],[1.6,.5,2.2],[2.8,1,1.4],[-.8,-3.4,4.4],[3,-2,1.1,3],[-4,3.8,2],[-3,1.7,3],[4.3,4.1,3],[-1.5,4.5,1.2]],
dekor:[[-3,-5.35,3,2,'wall'],[3,-5.35,2.5,2,'wall'],[-3.6,-2,1.2,1.1,'console'],[3.8,1.2,1,.9,'table'],[-5,3.5,2.2],[5,-2,1.8],[0,1,5,0,'floor'],[-1,3.2,1.6,.7,'sofa'],[0,-3.8,1.3,1,'console'],[4.8,4,1.7]],
giydirme:[[-3,-2,2.5,.5],[0,-2,2,.5],[2.5,-2,2,.5],[5,-2,2.5,.5],[-3,3.5,1.3,.3,'shelf'],[-.6,3.5,1.4,.3,'shelf'],[4,3.2,1.7,.9,'shelf'],[-5,3.2,1,.9,'shelf'],[0,-5,1.5,1.4,'rail'],[-5,-2,1.5,2,'rail']],
taki:[[-4,-2.8,1.2,.8,'display'],[-1.5,-2.8,1.7,.8,'display'],[1.5,-2.8,1.6,.8,'display'],[4,-2.8,1.3,.8,'display'],[-4,.4,1.2,.8,'display'],[-1.5,.4,1.3,.8,'display'],[1.5,.4,1.3,.8,'display'],[4,.4,1.3,.8,'display'],[-1.5,3.5,1.3,.8,'display'],[1.5,3.5,1.3,.8,'display']]
};
const PARENTS={yatak:{1:0,4:7},oturma:{8:0,7:1},salon:{5:1,9:1},isyeri:{1:3,5:3},mutfak:{3:0,4:0,5:6},banyo:{6:4,8:0},cocuk:{1:0},sinema:{9:2}};
function plan(themeId,items){const map=TYPES[themeId]||[],counts=new Map();return items.map(item=>{const index=Number(item.id.split('-').pop()),type=map[index]||'gift',copy=counts.get(item.id)||0;counts.set(item.id,copy+1);const [x,z,width=2,y=0,mount='ground']=LAYOUTS[themeId]?.[index]||[0,0];return {id:item.id,type,index,copy,x,z,width,y,mount,parent:PARENTS[themeId]?.[index],wall:mount==='wall',facing:themeId==='sinema'||themeId==='okul'?'front':null};});}
const api={TYPES,OUTDOOR,WALL,ZONES,LAYOUTS,PARENTS,plan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WorldPlan=api;
})(typeof window!=='undefined'?window:globalThis);
