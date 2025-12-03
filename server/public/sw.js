/**
 * SERVICE WORKER - Cache et Fallback
 * 
 * Ce Service Worker gère:
 * 1. Le cache des assets (fallback, images, vidéos)
 * 2. L'affichage du fallback lors d'une perte de connexion
 * 3. La synchronisation en arrière-plan
 */

const CACHE_NAME = 'ipad-display-v1';
const ASSETS_TO_CACHE = [
  '/display.html',
  '/assets/fallback.svg',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).then(() => {
        self.skipWaiting();
      }).catch((err) => {
        console.warn('⚠ Cache addAll failed (some assets might not exist yet):', err);
        self.skipWaiting();
      });
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✓ Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Pour les navigations et assets locaux, utiliser le cache
  if (event.request.mode === 'navigate' || event.request.destination === 'image' || event.request.destination === 'video') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Si en cache, le retourner
        if (response) {
          return response;
        }

        // Sinon, essayer de fetcher depuis le réseau
        return fetch(event.request).then((response) => {
          // Clone la réponse
          const responseClone = response.clone();

          // Ajouter au cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        }).catch(() => {
          // En cas d'erreur réseau, utiliser le cache ou le fallback
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Retourner le fallback pour les images
            if (event.request.destination === 'image') {
              return caches.match('/assets/fallback.svg');
            }

            throw new Error('Network request failed and no cache available');
          });
        });
      })
    );
  }
});
