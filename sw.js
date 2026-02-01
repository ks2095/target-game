// Minimal Service Worker to satisfy PWA installation requirements
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
    console.log('[Service Worker] Activate');
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
    // Basic pass-through for now
    e.respondWith(fetch(e.request));
});
