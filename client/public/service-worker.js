// Service Worker para NutriTrack PWA

const CACHE_NAME = 'nutritrack-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
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

// Estrategia de caché: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // No interceptar peticiones a la API
  if (event.request.url.includes('/api/') || event.request.url.includes('localhost:3001')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar servir desde caché
        return caches.match(event.request);
      })
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/logo.png',
    badge: '/assets/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejo de clic en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-meals') {
    event.waitUntil(syncMeals());
  } else if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkouts());
  }
});

// Función para sincronizar comidas pendientes
async function syncMeals() {
  try {
    // En un caso real, aquí implementaríamos la lógica para obtener datos de IndexedDB
    // y enviarlos al servidor
    console.log('Sincronizando comidas en segundo plano');
    
    // Ejemplo simplificado:
    // 1. Obtener comidas pendientes de IndexedDB
    // 2. Enviarlas al servidor
    // 3. Actualizar estado en IndexedDB
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error al sincronizar comidas:', error);
    return Promise.reject(error);
  }
}

// Función para sincronizar ejercicios pendientes
async function syncWorkouts() {
  try {
    console.log('Sincronizando ejercicios en segundo plano');
    return Promise.resolve();
  } catch (error) {
    console.error('Error al sincronizar ejercicios:', error);
    return Promise.reject(error);
  }
}