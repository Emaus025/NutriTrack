// Utilidades para sincronización de datos offline-online
import * as idb from './idb.js';
import { API_BASE } from './api';

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Guardar una comida localmente y sincronizar si es posible
  async saveMeal(mealData) {
    // Generar ID temporal para identificación local
    const tempId = `local_${Date.now()}`;
    const dataToSave = { ...mealData, tempId, synced: false };
    
    // Guardar en IndexedDB inmediatamente
    await idb.saveData('pendingMeals', dataToSave);
    
    // Intentar sincronizar si estamos online
    if (this.isOnline) {
      return this.syncPendingMeals();
    }
    
    return { success: true, offline: true, data: dataToSave };
  }

  // Guardar un ejercicio localmente y sincronizar si es posible
  async saveWorkout(workoutData) {
    // Generar ID temporal para identificación local
    const tempId = `local_${Date.now()}`;
    const dataToSave = { ...workoutData, tempId, synced: false };
    
    // Guardar en IndexedDB inmediatamente
    await idb.saveData('pendingWorkouts', dataToSave);
    
    // Intentar sincronizar si estamos online
    if (this.isOnline) {
      return this.syncPendingWorkouts();
    }
    
    return { success: true, offline: true, data: dataToSave };
  }

  // Sincronizar todas las comidas pendientes
  async syncPendingMeals() {
    if (!this.isOnline) return { success: false, reason: 'offline' };
    try {
      const pendingMeals = await idb.getAllData('pendingMeals');
      const syncedItems = [];
      for (const meal of pendingMeals) {
        if (meal.synced) continue;
        const response = await fetch(`${API_BASE}/meals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meal)
        });
        if (response.ok) {
          const serverData = await response.json();
          // Actualizar con ID del servidor y marcar como sincronizado
          await idb.updateData('pendingMeals', { 
            ...meal, 
            id: serverData.id, 
            synced: true 
          });
          syncedItems.push(serverData);
        }
      }
      return { success: true, syncedItems };
    } catch (error) {
      console.error('Error al sincronizar comidas:', error);
      return { success: false, error };
    }
  }

  // Sincronizar todos los ejercicios pendientes
  async syncPendingWorkouts() {
    if (!this.isOnline) return { success: false, reason: 'offline' };
    try {
      const pendingWorkouts = await idb.getAllData('pendingWorkouts');
      const syncedItems = [];
      for (const workout of pendingWorkouts) {
        if (workout.synced) continue;
        const response = await fetch(`${API_BASE}/workouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workout)
        });
        if (response.ok) {
          const serverData = await response.json();
          // Actualizar con ID del servidor y marcar como sincronizado
          await idb.updateData('pendingWorkouts', { 
            ...workout, 
            id: serverData.id, 
            synced: true 
          });
          syncedItems.push(serverData);
        }
      }
      return { success: true, syncedItems };
    } catch (error) {
      console.error('Error al sincronizar ejercicios:', error);
      return { success: false, error };
    }
  }

  // Sincronizar todos los datos pendientes
  async syncPendingData() {
    const mealSync = await this.syncPendingMeals();
    const workoutSync = await this.syncPendingWorkouts();
    
    return {
      meals: mealSync,
      workouts: workoutSync,
      allSynced: mealSync.success && workoutSync.success
    };
  }
}

// Exportar una instancia única para toda la aplicación
export default new SyncManager();