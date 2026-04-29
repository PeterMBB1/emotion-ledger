const CACHE = 'emotion-ledger-v1';
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/logo.png', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => { event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(r => r || caches.match('/')))); });
