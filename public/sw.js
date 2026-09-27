const CACHE_NAME = 'kazechronik-pwa-v1';

// Recursos críticos de la interfaz (App Shell) para precachear al instalar
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/search',
  '/reviews',
  '/analytics',
  '/settings',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/placeholder.jpg'
];

// 1. Evento Install: Guardar recursos estáticos en la caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precacheando App Shell de KazeChronik');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Evento Activate: Limpiar versiones antiguas de la caché si actualizamos CACHE_NAME
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Eliminando caché obsoleta:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Evento Fetch: Estrategia Network-First con fallback a Caché para navegación y assets
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET (como POST de Supabase o auth)
  if (event.request.method !== 'GET') return;

  // Ignorar llamadas a la API de Supabase o endpoints dinámicos no estáticos en el SW
  const url = new URL(event.request.url);
  if (url.origin.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la respuesta de red es válida, clonar y actualizar la caché en segundo plano
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Si falla la red (Modo Offline), buscar en la caché
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback si intenta navegar a una página HTML offline no guardada
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/dashboard') || caches.match('/');
        }
      })
  );
});