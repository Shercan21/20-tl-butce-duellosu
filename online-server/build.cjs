const fs=require('node:fs'),path=require('node:path');
const frontend=path.resolve(__dirname,'../dist');
const wrap=file=>`(()=>{const module={exports:{}};\n${fs.readFileSync(path.join(frontend,file),'utf8')}\nreturn module.exports;})()`;
const source=fs.readFileSync(path.join(__dirname,'worker.mjs'),'utf8').replace('/* RULES */',`const catalog=${wrap('catalog.js')};\nconst rules=${wrap('game.js')};`);
const target=process.argv[2]?path.resolve(process.argv[2]):path.join(__dirname,'build');
fs.mkdirSync(path.join(target,'dist/server'),{recursive:true});fs.writeFileSync(path.join(target,'dist/server/index.js'),source);
console.log('Built online room server.');
