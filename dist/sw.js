const CACHE='butce-duellosu-layouts3';
const ART=['./assets/scenes/scene-0.webp','./assets/scenes/scene-1.webp','./assets/scenes/tropical-island.webp','./assets/scenes/breakfast-table.webp',...Array.from({length:8},(_,i)=>'./assets/items/items-'+i+'.webp')];
const FILES=['./','./index.html','./design.html','./design.js?v=layouts3','./style.css?v=layouts3','./scenes.css?v=layouts3','./catalog.js?v=layouts3','./game.js?v=layouts3','./scoring.js?v=layouts3','./art-map.js?v=layouts3','./scene-plan.js?v=layouts3','./visuals.js?v=layouts3','./world-3d.js?v=layouts3','./photo-world.js','./cinema-film.js','./world-editor.js','./vendor/three.module.js','./vendor/three.core.js','./vendor/OrbitControls.js','./online.js?v=layouts3','./app.js?v=layouts3','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png',...ART];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('butce-duellosu-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 const url=new URL(e.request.url);if(!FILES.some(f=>new URL(f,self.registration.scope).pathname===url.pathname))return;
 e.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(e.request);if(response.ok)await cache.put(e.request,response.clone());return response;}catch{const cached=await cache.match(e.request);if(cached)return cached;if(e.request.mode==='navigate'){const page=await cache.match('./index.html');if(page)return page;}return new Response('Çevrimdışı. Oyunu ilk kez açarken internet gerekir.',{status:503});}})());
});
