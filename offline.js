const CACHE_NAME = 'v2';
const FILES_TO_CACHE = [
    '/index.html',
    '/fs.js',
    '/wfs.js',
    '/jszip.js',
    '/target.json',
    '/'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching files...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log('Serving from cache:', event.request.url);
                return response;
            }

            console.log('Fetching from network:', event.request.url);
            return fetch(event.request).catch(() => {
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                } else {
                    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                }
            });
        })
    );
});