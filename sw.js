/* ============================================================
   HabitFly — service worker (ISSUE-00)
   Caches the app shell so HabitFly opens with no network.
   Strategy: cache-first for shell assets; navigations fall
   back to the cached index.html when offline.
   Bump CACHE when shell assets change to retire old caches.
   ============================================================ */

const CACHE = 'habitfly-shell-v1';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './habitfly_logo.png',
  './fonts/inter-400.woff2',
  './fonts/inter-600.woff2',
  './fonts/inter-700.woff2',
  './fonts/D-DIN-Bold.otf'
];

// Install: precache the whole shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete any older caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first; fall back to network.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        // Offline and not cached: for page navigations, show the app shell.
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
