const CACHE_NAME = 'chat-cache-v1';
const urlsToCache = [
    '/',
    '/app_messagerie.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/icon/icon-512.png',
    '/favicon.png',
    '/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // Forces the waiting service worker to become the active service worker
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Become available to all pages
    );
});

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/offline.html'))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => response || fetch(event.request))
        );
    }
});

self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
