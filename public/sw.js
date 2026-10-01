const CACHE_NAME = 'kazechronik-pwa-v3';

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/search',
  '/goals',
  '/lists',
  '/profile',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/placeholder.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Usar Promise.allSettled para evitar que una ruta rompa la instalación del SW
      await Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(err => console.warn(`Error precacheando ${url}:`, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar consultas directas a la base de datos Supabase o endpoints API dinámicos
  if (url.origin.includes('supabase.co') || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // Fallback de navegación HTML para cuando la red se cae
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return (await caches.match('/dashboard')) || (await caches.match('/'));
        }
      })
  );
});