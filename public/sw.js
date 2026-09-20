const CACHE_NAME = 'kazechronik-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia básica de red primero con paso a caché si no hay conexión
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});