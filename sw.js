// Bump APP_CACHE whenever the local app shell changes.
// Do not tie image caching to this version number.
const APP_CACHE = 'mtg-deck-builder-app-v21';

// API responses are small and can be refreshed separately from the app shell.
const SCRYFALL_CACHE = 'mtg-deck-builder-scryfall-v1';

// Scryfall card images live in their own stable cache.
// Keep this name unchanged unless you intentionally want to clear all cached images.
// This lets downloaded card images survive normal service-worker updates.
const IMAGE_CACHE = 'mtg-deck-builder-images-v1';

const APP_CACHE_PREFIX = 'mtg-deck-builder-app-';

const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/script.js',
  './js/indexeddb-storage.js',
  './js/deck-title.js',
  './js/export-formats.js',
  './js/view-modes.js',
  './js/owned-counts.js',
  './js/commander-card.js',
  './js/scryfall-lazy-loader.js',
  './js/edhrec-synergy.js',
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
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        // Only prune old app-shell caches. Leave IMAGE_CACHE untouched so card images persist
        // when APP_CACHE changes from v7 to v8, v9, etc.
        .filter(key => key.startsWith(APP_CACHE_PREFIX) && key !== APP_CACHE)
        .map(key => caches.delete(key))))
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

  if (isScryfallImageUrl(url)) {
    // Card images are cache-first and stored in IMAGE_CACHE, not APP_CACHE.
    // Browser image requests can return opaque no-cors responses. Those still
    // need to be cached, otherwise the image cache will look empty offline.
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  }
});

function isScryfallImageUrl(url) {
  return url.hostname === 'cards.scryfall.io' || url.hostname.endsWith('.scryfall.io');
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheableForCache(response, cacheName)) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (isCacheableForCache(response, cacheName)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

function isCacheableForCache(response, cacheName) {
  if (cacheName === IMAGE_CACHE) return isImageCacheable(response);
  return isCacheable(response);
}

function isImageCacheable(response) {
  // Cross-origin <img> requests commonly resolve to opaque responses.
  // Opaque responses have status 0 and ok === false, but they are valid to cache.
  return response && (response.ok || response.type === 'opaque');
}

function isCacheable(response) {
  return response && response.ok && response.status === 200;
}
