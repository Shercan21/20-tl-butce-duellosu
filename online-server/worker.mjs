/* RULES */
const TTL=24*60*60*1000;
const SITE='https://yirmi-tl-sepet-oyunu.dependablepin4.chatgpt.site';
const ORIGINS=new Set(['https://shercan21.github.io',SITE,'http://127.0.0.1:4187','http://localhost:4187']);
class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new ApiError(status,message);};
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const hash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const code=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
const roundKey=r=>`${r.index}:${r.game.round}:${r.game.stage}`;
function equal(a,b){if(!a||!b||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function freshGame(id,count=2){return rules.createGame('online',random,catalog.find(t=>t.id===id),count);}
function freshRoom(theme,order,hostHash,maxPlayers=2){const ids=catalog.map(t=>t.id),idx=ids.indexOf(theme);return {status:'waiting',tokens:[hostHash],maxPlayers,index:0,order,startTheme:theme,queue:order==='random'?[theme,...shuffle(ids.filter(id=>id!==theme))]:[...ids.slice(idx),...ids.slice(0,idx)],results:[],game:freshGame(theme),ready:[false,false]};}
export function view(room,role,roomCode,rev){const g=room.game;return {code:roomCode,rev,role,status:room.status,maxPlayers:room.maxPlayers,joinedCount:room.tokens.length,expiresAt:room.expiresAt,index:room.index,order:room.order,queue:room.queue,results:room.results,ready:room.ready,submitted:g.bids.map(b=>b!==null),turnKey:roundKey(room),game:{version:g.version,mode:'online',themeId:g.themeId,round:g.round,deck:g.deck.map((x,i)=>i<=g.round?x:null),players:g.players,history:g.history,stage:g.stage,bids:g.stage==='reveal'?[...g.bids]:Array(g.players.length).fill(null)}};}
export function applyAction(room,role,action,body){
 if(room.status==='closed')fail(410,'Bu oda kapatıldı. Yeni bir oda açabilirsin.');
 if(action==='leave'){room.status='closed';return;}
 if(action==='start'){if(role!==0)fail(403,'Oyunu sadece odayı açan başlatabilir.');if(room.status==='active')return;if(room.tokens.length<2)fail(409,'En az iki oyuncu gerekli.');room.status='active';room.game=freshGame(room.queue[room.index],room.tokens.length);room.ready=Array(room.tokens.length).fill(false);return;}
 if(room.status!=='active')fail(409,'Oyuncuların katılması bekleniyor.');
 const g=room.game;
 if(body.turnKey!==roundKey(room))return; // Delayed retries cannot affect a later round.
 if(action==='bid'){
  if(g.stage!=='bid')return;
  const b=body.bid;if(!Number.isInteger(b)||b<0||b>g.players[role].money)fail(400,'Teklifin kalan bütçeni aşamaz.');
  if(g.bids[role]!==null){if(g.bids[role]!==b)fail(409,'Onaylanan teklif değiştirilemez.');return;}
  g.bids[role]=b;
  if(g.bids.every(x=>x!==null)){rules.resolveRound(g,g.bids);room.ready=Array(room.tokens.length).fill(false);}
 }else if(action==='advance'){
  if(!['reveal','finished'].includes(g.stage))fail(409,'Önce bütün teklifler tamamlanmalı.');
  room.ready[role]=true;if(!room.ready.every(Boolean))return;
  room.ready=Array(room.tokens.length).fill(false);
  if(g.stage==='reveal'){
   rules.nextRound(g);
   if(g.stage==='finished')room.results.push({theme:g.themeId,winner:rules.winner(g)});
  }else{
   room.index++;
   if(room.index>=room.queue.length){const fresh=freshRoom(room.startTheme,room.order,room.tokens[0],room.maxPlayers);room.queue=fresh.queue;room.index=0;room.results=[];}
   room.game=freshGame(room.queue[room.index],room.tokens.length);
  }
 }else fail(404,'İşlem bulunamadı.');
}
async function bodyJSON(request){if(Number(request.headers.get('Content-Length'))>2048)fail(413,'İstek çok büyük.');const text=await request.text();if(text.length>2048)fail(413,'İstek çok büyük.');try{return JSON.parse(text);}catch{fail(400,'Geçersiz istek.');}}
async function readRoom(db,key){const row=await db.prepare('SELECT payload, rev, expires_at FROM online_rooms WHERE code = ?').bind(key).first();if(!row||row.expires_at<Date.now())fail(404,'Oda bulunamadı veya süresi doldu. Kodu kontrol et.');return {row,room:JSON.parse(row.payload)};}
async function handle(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/health')return {ok:true,version:'online-1'};
 if(!env.DB)fail(503,'Oyun sunucusu hazırlanıyor. Biraz sonra tekrar dene.');
 if(path==='/v1/rooms'&&request.method==='POST'){
  const b=await bodyJSON(request);if(!catalog.some(t=>t.id===b.theme)||!['random','ordered'].includes(b.order))fail(400,'Geçerli bir kategori seç.');
  const maxPlayers=b.maxPlayers??2;if(!Number.isInteger(maxPlayers)||maxPlayers<2||maxPlayers>8)fail(400,'Oda kapasitesi 2–8 kişi olabilir.');
  const secret=token(),hostHash=await hash(secret);const now=Date.now(),room=freshRoom(b.theme,b.order,hostHash,maxPlayers);room.expiresAt=now+TTL;
  await env.DB.prepare('DELETE FROM online_rooms WHERE code IN (SELECT code FROM online_rooms WHERE expires_at < ? LIMIT 100)').bind(now).run();
  for(let attempt=0;attempt<5;attempt++){const key=code();const result=await env.DB.prepare('INSERT OR IGNORE INTO online_rooms(code,payload,rev,expires_at) VALUES(?,?,0,?)').bind(key,JSON.stringify(room),room.expiresAt).run();if(result.meta.changes)return {token:secret,state:view(room,0,key,0)};}
  fail(503,'Oda açılamadı. Tekrar dene.');
 }
 const match=path.match(/^\/v1\/rooms\/([A-Z2-9]{8})(?:\/(join|start|bid|advance|leave))?$/);if(!match)fail(404,'Adres bulunamadı.');
 const [,key,action]=match;
 if((!action&&request.method!=='GET')||(action&&request.method!=='POST'))fail(405,'Geçersiz işlem.');
 const b=action?await bodyJSON(request):{};
 const secret=action==='join'?b.token:request.headers.get('Authorization')?.replace(/^Bearer /,'');
 if(typeof secret!=='string'||!/^[0-9a-f]{64}$/.test(secret))fail(401,'Oturum bulunamadı. Odaya tekrar katıl.');
 const digest=await hash(secret);
 for(let attempt=0;attempt<8;attempt++){
  const {row,room}=await readRoom(env.DB,key);let role;
  if(action==='join'){
   if(room.status==='closed')fail(410,'Bu oda kapatıldı.');
   role=room.tokens.findIndex(t=>equal(t,digest));
   if(role<0){if(room.status!=='waiting')fail(409,'Oyun başladı. Yeni bir oda açabilirsin.');if(room.tokens.length>=room.maxPlayers)fail(409,'Bu oda dolu. Yeni bir oda açabilirsin.');room.tokens.push(digest);role=room.tokens.length-1;}
  }else{
   role=room.tokens.findIndex(t=>equal(t,digest));
   if(role<0)fail(401,'Bu odaya erişimin yok. Kodu kullanarak katıl.');
   if(!action)return {state:view(room,role,key,row.rev)};
   applyAction(room,role,action,b);
  }
  const update=await env.DB.prepare('UPDATE online_rooms SET payload = ?, rev = rev + 1 WHERE code = ? AND rev = ?').bind(JSON.stringify(room),key,row.rev).run();
  if(update.meta.changes)return {state:view(room,role,key,row.rev+1)};
 }
 fail(409,'Oyun güncellendi. Bir kez daha dene.');
}
export default {async fetch(request,env){
 const origin=request.headers.get('Origin');const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
 if(origin&&ORIGINS.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, Authorization';headers['Access-Control-Max-Age']='86400';}
 if(origin&&!ORIGINS.has(origin))return new Response(JSON.stringify({error:'Bu adrese izin verilmiyor.'}),{status:403,headers});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(new URL(request.url).pathname==='/')return Response.redirect('https://shercan21.github.io/20-tl-butce-duellosu/',302);
 try{return new Response(JSON.stringify(await handle(request,env)),{headers});}catch(e){if(!(e instanceof ApiError))console.error('room_request_failed',e.name);return new Response(JSON.stringify({error:e instanceof ApiError?e.message:'Bağlantı kurulamadı. Biraz sonra tekrar dene.'}),{status:e instanceof ApiError?e.status:503,headers});}
}};
