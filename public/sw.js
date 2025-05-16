self.addEventListener('install', event => {
  console.log('SW installed');
});

self.addEventListener('fetch', event => {
  // Basic cache-first strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
