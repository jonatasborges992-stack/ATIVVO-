const CACHE_PREFIX='ativvo-pwa-';
const CACHE_NAME=CACHE_PREFIX+'v2';
const APP_SHELL=['./','./index.html','./manifest.json','./icon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith(
    fetch(req).then(res=>{
      if(res&&res.ok){
        const copy=res.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
      }
      return res;
    }).catch(()=>caches.match(req).then(c=>c||caches.match('./index.html')))
  );
});