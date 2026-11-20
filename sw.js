// Nur den Cache dieser Produktiv-App verwalten; Test-Caches nicht anfassen.
const CACHE='wichtelzauber-prod-v9-6-0';
const FILES=['./','./index.html','./sync.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('wichtelzauber-prod-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  if(!new URL(request.url).pathname.startsWith('/wichtelzauber/'))return;
  const path=new URL(request.url).pathname;
  // JS und HTML bevorzugt aktuell vom Netz laden, bei Offline-Nutzung Cache verwenden.
  if(path.endsWith('/index.html')||path.endsWith('/sync.js')||path.endsWith('/wichtelzauber/')||path.endsWith('/')){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
      return response;
    }).catch(()=>caches.match(request)));
  }else{
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
  }
});
