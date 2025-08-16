// service-worker.js — v5 (network-first p/ HTML)
const CACHE_STATIC = 'lpo-static-v5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// Instala e pré-cacheia arquivos estáticos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_STATIC).then((c) => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia:
//  - HTML/navegações: NETWORK-FIRST (garante pegar o index.html novo)
//  - outros GET: CACHE-FIRST com atualização em segundo plano
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const accept = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || accept.includes('text/html');

  if (isHTML) {
    // Network-first p/ HTML
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_STATIC).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first p/ estáticos/API GET simples
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Atualiza em segundo plano
        fetch(req).then((res) =>
          caches.open(CACHE_STATIC).then((c) => c.put(req, res))
        ).catch(()=>{});
        return cached;
      }
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_STATIC).then((c) => c.put(req, copy));
        return res;
      });
    })
  );
});
