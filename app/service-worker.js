const CACHE_NAME = 'typing-master-v1';
const urlsToCache = [
  './',
  './index.html',
  './assets/liquid-glass.css',
  './assets/main-bKJS0KDZ.js',
  './assets/main-DGYqncut.css',
  './assets/main-3yv0nJp-.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.svg',
  './images/logo.png',
  './images/dragon-bg.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});