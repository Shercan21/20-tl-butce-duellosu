/* Convert generated source atlases to compact WebP without changing their artwork. */
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),catalog=require('../dist/catalog.js');
const sources=JSON.parse(fs.readFileSync(path.join(__dirname,'sources.local.json'),'utf8'));
async function main(){const manifest={scenes:{},items:{}};let total=0;const sizes={};
 async function optimize(key,file){const source=sources[key];if(!source)throw Error('Missing generated source '+key);const target=path.join(root,'dist',file);fs.mkdirSync(path.dirname(target),{recursive:true});const info=await sharp(source).metadata();await sharp(source).webp({quality:88,alphaQuality:100,effort:5}).toFile(target);total+=fs.statSync(target).size;sizes[key]=[info.width,info.height];return file;}
 await optimize('sceneAtlas0','assets/scenes/scene-0.webp');await optimize('sceneAtlas1','assets/scenes/scene-1.webp');await optimize('islandGen','assets/scenes/tropical-island.webp');
 if(sources.breakfastGen)await optimize('breakfastGen','assets/scenes/breakfast-table.webp');
 for(let page=0;page<8;page++)await optimize('itemAtlas'+page,`assets/items/items-${page}.webp`);
 catalog.forEach((theme,themeIndex)=>{const cell=themeIndex%16;manifest.scenes[theme.id]={file:`assets/scenes/scene-${Math.floor(themeIndex/16)}.webp`,row:Math.floor(cell/4),col:cell%4};
  if(theme.id==='tropik')manifest.scenes[theme.id]={file:'assets/scenes/tropical-island.webp',single:true};
  if(theme.id==='kahvalti'&&sources.breakfastGen)manifest.scenes[theme.id]={file:'assets/scenes/breakfast-table.webp',single:true};
  theme.items.forEach((it,itemIndex)=>{const page=Math.floor(themeIndex/4),index=(themeIndex%4)*10+itemIndex,[width,height]=sizes['itemAtlas'+page];let col=index%8,row=Math.floor(index/8),cols=8,y0=row/5,y1=(row+1)/5;
   // The first atlas's last two rows use 6 and 10 cells; atlas 5 adds two unused props before its final row.
   if(page===0){const cuts=[0,.205,.414,.621,.826,1];if(index>=30){row=4;col=index-30;cols=10;}else if(index>=24){row=3;col=index-24;cols=6;}y0=cuts[row];y1=cuts[row+1];}
   if(page===5&&index>=30){row=4;col=index-30;cols=10;y0=.8;y1=1;}
   const x=Math.round(col/cols*width),y=Math.round(y0*height),right=Math.round((col+1)/cols*width),bottom=Math.round(y1*height);
   manifest.items[it.id]={file:`assets/items/items-${page}.webp`,size:[width,height],rect:[x,y,right-x,bottom-y]};
  });
 });
 fs.writeFileSync(path.join(root,'dist/art-map.js'),'globalThis.ART_MAP='+JSON.stringify(manifest)+';\n');
 fs.writeFileSync(path.join(__dirname,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({themes:catalog.length,items:Object.keys(manifest.items).length,totalMB:Math.round(total/1024/1024*100)/100}));
}
main().catch(e=>{console.error(e);process.exit(1)});
