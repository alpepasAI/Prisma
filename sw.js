// Incrementa este número cada vez que hagas un despliegue.
// Esto invalida la caché del Service Worker automáticamente.
const CACHE_VERSION = 'v31';
const CACHE_NAME = `prisma-cache-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/article.html',
  '/topics.html',
  '/interactive.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/data.js',
  '/js/ui.js',
  '/js/renderer.js',
  '/js/interactive.js',
  '/js/i18n.js',
  '/js/sw-register.js',
  '/components/header.html',
  '/components/footer.html',
  '/assets/logo.png',
  '/assets/favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Force fetching from network to bypass browser HTTP cache during installation
      const requests = STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }));
      return cache.addAll(requests);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Nunca cachear el propio SW ni las páginas HTML
  if (
    url.pathname === '/sw.js' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Stale-while-revalidate para JSON (datos de artículos)
  if (url.pathname.endsWith('.json') || url.pathname.endsWith('.md')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        })
      )
    );
    return;
  }

  // Stale-while-revalidate para JS y CSS:
  // Sirve desde caché inmediatamente, pero actualiza en background.
  // El usuario verá la nueva versión en la SIGUIENTE carga, sin borrar caché.
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => cachedResponse);

          // Devuelve caché al instante, actualiza en background
          return cachedResponse || fetchPromise;
        })
      )
    );
    return;
  }

  // Cache-first para assets estáticos (imágenes, fuentes, etc.)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        if (event.request.method === 'GET' && networkResponse.ok) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
