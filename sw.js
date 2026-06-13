const APP_CACHE = 'mtg-deck-builder-app-v7';
const SCRYFALL_CACHE = 'mtg-deck-builder-scryfall-v1';
const IMAGE_CACHE = 'mtg-deck-builder-images-v1';

const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/script.js',
  './js/export-formats.js',
  './js/view-modes.js',
  './js/mobile-drag-drop.js',
  './data/seed-cards.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const keep = new Set([APP_CACHE, SCRYFALL_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => !keep.has(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request, APP_CACHE));
    return;
  }

  if (url.hostname === 'api.scryfall.com') {
    event.respondWith(networkFirst(request, SCRYFALL_CACHE));
    return;
  }

  if (url.hostname === 'cards.scryfall.io' || url.hostname.endsWith('.scryfall.io')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response)) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

function isCacheable(response) {
  return response && response.ok && response.status === 200;
}
