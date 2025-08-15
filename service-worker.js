const CACHE_NAME = "lpo-cache-v1";
const ASSETS = ["./","./index.html","./manifest.json","./icon-512.png"];
self.addEventListener("install",(event)=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",(event)=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null))));self.clients.claim();});
self.addEventListener("fetch",(event)=>{event.respondWith(caches.match(event.request).then(c=>c||fetch(event.request).then(resp=>{const url=new URL(event.request.url);if(event.request.method==='GET'&&url.origin===location.origin){const cp=resp.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,cp));}return resp;}).catch(()=>caches.match('./index.html'))));});