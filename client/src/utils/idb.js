// Utilidades para trabajar con IndexedDB

const DB_NAME = 'nutritrack';
const DB_VERSION = 1;

// Función para abrir la conexión a la base de datos
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Almacén para comidas pendientes de sincronización
      if (!db.objectStoreNames.contains('pendingMeals')) {
        db.createObjectStore('pendingMeals', { keyPath: 'id', autoIncrement: true });
      }
      
      // Almacén para ejercicios pendientes de sincronización
      if (!db.objectStoreNames.contains('pendingWorkouts')) {
        db.createObjectStore('pendingWorkouts', { keyPath: 'id', autoIncrement: true });
      }
      
      // Almacén para caché de alimentos
      if (!db.objectStoreNames.contains('foodCache')) {
        db.createObjectStore('foodCache', { keyPath: 'id' });
      }
      
      // Almacén para datos del usuario
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'id' });
      }
    };
  });
}

// Función para guardar datos en IndexedDB
export async function saveData(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Función para obtener todos los datos de un almacén
export async function getAllData(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Función para obtener un elemento por su ID
export async function getById(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Función para actualizar datos
export async function updateData(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Función para eliminar datos
export async function deleteData(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Clase para manejar la sincronización
export class SyncManager {
  constructor(apiBaseUrl = 'http://localhost:3001') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Sincronizar comidas pendientes
  async syncPendingMeals() {
    try {
      const pendingMeals = await getAllData('pendingMeals');
      
      if (pendingMeals.length === 0) return { success: true, message: 'No hay comidas pendientes' };
      
      const results = [];
      
      for (const meal of pendingMeals) {
        try {
          // Intentar enviar al servidor
          const response = await fetch(`${this.apiBaseUrl}/meals`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(meal)
          });
          
          if (response.ok) {
            // Si se sincronizó correctamente, eliminar de pendientes
            await deleteData('pendingMeals', meal.id);
            results.push({ id: meal.id, success: true });
          } else {
            results.push({ id: meal.id, success: false, error: 'Error en la respuesta del servidor' });
          }
        } catch (error) {
          results.push({ id: meal.id, success: false, error: error.message });
        }
      }
      
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sincronizar ejercicios pendientes
  async syncPendingWorkouts() {
    try {
      const pendingWorkouts = await getAllData('pendingWorkouts');
      
      if (pendingWorkouts.length === 0) return { success: true, message: 'No hay ejercicios pendientes' };
      
      const results = [];
      
      for (const workout of pendingWorkouts) {
        try {
          // Intentar enviar al servidor
          const response = await fetch(`${this.apiBaseUrl}/workouts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
          });
          
          if (response.ok) {
            // Si se sincronizó correctamente, eliminar de pendientes
            await deleteData('pendingWorkouts', workout.id);
            results.push({ id: workout.id, success: true });
          } else {
            results.push({ id: workout.id, success: false, error: 'Error en la respuesta del servidor' });
          }
        } catch (error) {
          results.push({ id: workout.id, success: false, error: error.message });
        }
      }
      
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Guardar comida offline y sincronizar si es posible
  async saveMealOffline(mealData) {
    try {
      // 1. Guardar en IndexedDB inmediatamente
      const id = await saveData('pendingMeals', mealData);
      
      // 2. Intentar enviar al servidor
      try {
        const response = await fetch(`${this.apiBaseUrl}/meals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mealData)
        });
        
        if (response.ok) {
          // Si éxito, eliminar de pendientes
          await deleteData('pendingMeals', id);
          return { success: true, synced: true, id: (await response.json()).id };
        }
        
        return { success: true, synced: false, id };
      } catch (error) {
        // Error de red, mantener como pendiente
        return { success: true, synced: false, id, error: error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Actualizar caché de alimentos
  async updateFoodCache(foods) {
    try {
      for (const food of foods) {
        await updateData('foodCache', food);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}