const CACHE_NAME = 'v2';
const FILES_TO_CACHE = [
    'index.html',
    'fs.js',
    'wfs.js',
    'jszip.js',
    'target.json'
];

console.log('<i> Service Worker loaded, version ' + CACHE_NAME);

async function checkForUpdate() {
    try {
        const response = await fetch('target.json', { cache: 'no-store' });
        const data = await response.json();
        if (data.worker !== CACHE_NAME) {
            console.log('<i> Updating worker...');
            await self.registration.unregister();
            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.navigate(client.url));
            });
        }
    } catch (error) {
        console.error('<i> Failed to check for update:', error);
    }
}

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "stop") {
        console.log("<i> Goodbye, cruel world");
        self.registration.unregister().then(() => {
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => client.navigate(client.url));
            });
        });
    } else if (event.data && event.data.type === "hello") {
        console.log(ver);
        event.source.postMessage({ type: ver });
    } else if (event.data && event.data.type === "update") {
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
            })
        );
    }
});

self.addEventListener('install', (event) => {
    console.log('<i> Service Worker installing...');
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
    console.log('<i> Service Worker activating...');
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
    const url = new URL(event.request.url);
    const cachedFiles = ['index.html', 'fs.js', 'wfs.js', 'jszip.js', 'target.json'];

    if (cachedFiles.includes(url.pathname.split('/').pop())) {
        console.log('<i> Fetching from cache:', event.request.url);
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    console.log('<i> Serving from cache:', event.request.url);
                    return response;
                }

                return fetch(event.request).catch(() => {
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/index.html');
                    } else {
                        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                    }
                });
            })
        );
    } else {
        console.log('<i> Bypassing service worker for:', event.request.url);
        event.respondWith(fetch(event.request));
    }
});