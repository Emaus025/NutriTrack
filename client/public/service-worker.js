// Service Worker para NutriTrack PWA

const CACHE_NAME = 'nutritrack-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Nota: en dev Vite usa /src/main.js, en build usa /assets/*.js con hash
  // Mantén estos como ejemplo y ajusta si tienes nombres fijos en producción:
  '/assets/main.js',
  '/assets/style.css',
  '/assets/logo.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategias y App Shell
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No interceptar peticiones a la API
  if (request.url.includes('/api/') || request.url.includes('localhost:3001')) {
    return;
  }

  // App Shell: fallback a index.html para navegaciones
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  // Estrategias por tipo de recurso para mismos origenes
  if (url.origin === self.location.origin) {
    // JS/CSS/Workers: Stale-While-Revalidate
    if (request.destination === 'script' || request.destination === 'style' || request.destination === 'worker') {
      event.respondWith(staleWhileRevalidate(request, 'assets-cache'));
      return;
    }

    // Imágenes: Cache-First
    if (request.destination === 'image') {
      event.respondWith(cacheFirst(request, 'images-cache'));
      return;
    }
  }

  // Por defecto: Network-First con fallback a cache
  event.respondWith(networkFirst(request, 'default-cache'));
});

async function handleNavigate(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // Si falla la red, devolver el App Shell
    const cache = await caches.open(CACHE_NAME);
    const cachedShell = await cache.match('/index.html');
    return cachedShell || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cached || new Response('', { status: 404 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || new Response('', { status: 404 });
  }
}

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/logo.png',
    badge: '/assets/badge.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Manejo de clic en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-meals') {
    event.waitUntil(syncMeals());
  } else if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkouts());
  }
});

async function syncMeals() {
  try {
    console.log('Sincronizando comidas en segundo plano');
    return Promise.resolve();
  } catch (error) {
    console.error('Error al sincronizar comidas:', error);
    return Promise.reject(error);
  }
}

async function syncWorkouts() {
  try {
    console.log('Sincronizando ejercicios en segundo plano');
    return Promise.resolve();
  } catch (error) {
    console.error('Error al sincronizar ejercicios:', error);
    return Promise.reject(error);
  }
}