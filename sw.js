/* ============================================================
   HabitFly — service worker (sw.js)
   Strategy: STALE-WHILE-REVALIDATE for same-origin GETs.
   - Serve the cached copy instantly (fast, works offline).
   - In the background, fetch the network copy and update the cache.
   - So a deploy auto-propagates: users see the new version on their
     NEXT launch, with no manual cache-version bump needed.
   Navigations fall back to cached index.html when offline.

   Bump CACHE only to force a full purge of old entries — routine
   content changes no longer require it.
   ============================================================ */

const CACHE = 'habitfly-shell-v7';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './store.js',
  './app.js',
  './manifest.webmanifest',
  './habitfly_logo.png',
  './fonts/inter-400.woff2',
  './fonts/inter-600.woff2',
  './fonts/inter-700.woff2',
  './fonts/D-DIN-Bold.otf'
];

// Install: precache the shell so the very first offline load works.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: drop any older caches, take control immediately.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for same-origin GETs.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((res) => {
          // Only cache good, complete responses.
          if (res && res.ok && res.type === 'basic') cache.put(request, res.clone());
          return res;
        }).catch(function () { return null; });

        // Keep the SW alive long enough to finish the background update.
        event.waitUntil(networkFetch);

        // Serve cache now if we have it; otherwise wait for the network,
        // and for offline page navigations fall back to the app shell.
        return cached || networkFetch.then((res) =>
          res || (request.mode === 'navigate' ? cache.match('./index.html') : Response.error())
        );
      })
    )
  );
});
