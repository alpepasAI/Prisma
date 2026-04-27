const CACHE_NAME = 'prisma-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
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
  '/components/header.html',
  '/components/footer.html',
  '/assets/logo.png',
  '/assets/favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
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

  // Stale-while-revalidate for JSON data
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => 
        cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        })
      )
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // Cache new assets dynamically
        if (event.request.method === 'GET' && !url.pathname.startsWith('/browser-sync')) {
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
