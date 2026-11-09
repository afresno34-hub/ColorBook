/**
 * COLOR BOOK - Service Worker (PWA Offline & Standalone Engine)
 * Versión 2.1.0 - Estrategia Network-First para scripts y lógica en vivo
 */

const CACHE_NAME = 'colorbook-v2.4.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/db.js',
  '/js/voice-engine.js',
  '/js/audio-effects.js',
  '/images/colorbook-logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [COLOR BOOK PWA] Pre-cacheando recursos para uso offline...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Advertencia pre-cacheando recursos:', err);
      });
    })
  );
});

// Activación y limpieza inmediata de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 [COLOR BOOK PWA] Eliminando cache antiguo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptor de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Peticiones a la API: SIEMPRE a la red
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Modo sin conexión - Usando base de datos local' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
    return;
  }

  // 2. Scripts (.js), estilos (.css) y páginas (.html): NETWORK FIRST
  // Esto garantiza que cualquier actualización en el código se aplique de inmediato sin quedar pegado en la versión vieja
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // 3. Imágenes y otros recursos estáticos: Cache primero, actualizar en fondo
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
