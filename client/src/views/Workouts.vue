<template>
  <div class="workouts-container">
    <h1>Registro de Ejercicios</h1>
    
    <div v-if="offlineAlert" class="offline-alert">
      Estás en modo offline. Los datos se sincronizarán cuando vuelvas a estar online.
    </div>
    
    <div class="actions">
      <button @click="showForm = true" class="add-btn">
        <span class="icon">+</span> Añadir Ejercicio
      </button>
    </div>
    
    <div v-if="isLoading" class="loading">
      Cargando ejercicios...
    </div>
    
    <div v-else-if="workouts.length === 0" class="empty-state">
      <p>No hay ejercicios registrados todavía.</p>
      <p>¡Comienza a registrar tu actividad física!</p>
    </div>
    
    <div v-else class="workouts-list">
      <div v-for="workout in workouts" :key="workout.id" class="workout-card">
        <div class="workout-header">
          <h3>{{ workout.name }}</h3>
          <span class="date">{{ formatDate(workout.dateTime) }}</span>
        </div>
        
        <div class="workout-details">
          <div class="detail">
            <span class="label">Duración:</span>
            <span class="value">{{ workout.duration }} minutos</span>
          </div>
          
          <div class="detail">
            <span class="label">Calorías quemadas:</span>
            <span class="value">{{ workout.caloriesBurned }} kcal</span>
          </div>
          
          <div class="detail">
            <span class="label">Tipo:</span>
            <span class="value">{{ workout.type }}</span>
          </div>
        </div>
        
        <div class="workout-notes" v-if="workout.notes">
          <p>{{ workout.notes }}</p>
        </div>
        
        <div class="workout-actions">
          <button @click="editWorkout(workout)" class="edit-btn">Editar</button>
          <button @click="deleteWorkout(workout.id)" class="delete-btn">Eliminar</button>
        </div>
        
        <div class="sync-status" v-if="!workout.synced">
          <span class="pending-sync">Pendiente de sincronizar</span>
        </div>
      </div>
    </div>
    
    <!-- Modal para añadir/editar ejercicio -->
    <div v-if="showForm" class="modal">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio' }}</h2>
        
        <form @submit.prevent="saveWorkout">
          <div class="form-group">
            <label for="name">Nombre del ejercicio:</label>
            <input 
              type="text" 
              id="name" 
              v-model="currentWorkout.name" 
              required
              placeholder="Ej: Correr, Natación, Yoga..."
            >
          </div>
          
          <div class="form-group">
            <label for="type">Tipo de ejercicio:</label>
            <select id="type" v-model="currentWorkout.type" required>
              <option value="cardio">Cardio</option>
              <option value="fuerza">Entrenamiento de fuerza</option>
              <option value="flexibilidad">Flexibilidad</option>
              <option value="deportes">Deportes</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="duration">Duración (minutos):</label>
            <input 
              type="number" 
              id="duration" 
              v-model.number="currentWorkout.duration" 
              required
              min="1"
            >
          </div>
          
          <div class="form-group">
            <label for="caloriesBurned">Calorías quemadas:</label>
            <input 
              type="number" 
              id="caloriesBurned" 
              v-model.number="currentWorkout.caloriesBurned" 
              required
              min="0"
            >
          </div>
          
          <div class="form-group">
            <label for="dateTime">Fecha y hora:</label>
            <input 
              type="datetime-local" 
              id="dateTime" 
              v-model="currentWorkout.dateTime" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="notes">Notas:</label>
            <textarea 
              id="notes" 
              v-model="currentWorkout.notes" 
              placeholder="Notas adicionales sobre el ejercicio..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="primary-btn">Guardar</button>
            <button type="button" @click="showForm = false" class="secondary-btn">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import syncManager from '../utils/syncManager';

export default {
  name: 'Workouts',
  data() {
    return {
      workouts: [],
      isLoading: true,
      showForm: false,
      isEditing: false,
      offlineAlert: !navigator.onLine,
      currentWorkout: this.getEmptyWorkout()
    }
  },
  mounted() {
    this.loadWorkouts();
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      this.offlineAlert = !navigator.onLine;
      if (navigator.onLine) {
        // Intentar sincronizar cuando volvemos a estar online
        syncManager.syncPendingWorkouts().then(() => {
          this.loadWorkouts(); // Recargar después de sincronizar
        });
      }
    },
    getEmptyWorkout() {
      return {
        name: '',
        type: 'cardio',
        duration: 30,
        caloriesBurned: 0,
        dateTime: this.formatDateTime(new Date()),
        notes: '',
        synced: false
      };
    },
    formatDateTime(date) {
      // Formato YYYY-MM-DDThh:mm requerido para input datetime-local
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
    },
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    async loadWorkouts() {
      this.isLoading = true;
      try {
        // Primero intentamos cargar desde el servidor
        if (navigator.onLine) {
          const response = await fetch('http://localhost:3001/workouts');
          if (response.ok) {
            const serverWorkouts = await response.json();
            this.workouts = serverWorkouts;
          }
        }
        
        // Luego cargamos los pendientes de IndexedDB y los mezclamos
        const pendingWorkouts = await syncManager.getPendingWorkouts();
        if (pendingWorkouts && pendingWorkouts.length > 0) {
          // Filtrar para evitar duplicados
          const serverIds = this.workouts.map(w => w.id);
          const uniquePending = pendingWorkouts.filter(w => !serverIds.includes(w.id));
          this.workouts = [...this.workouts, ...uniquePending];
        }
      } catch (error) {
        console.error('Error al cargar ejercicios:', error);
      } finally {
        this.isLoading = false;
      }
    },
    editWorkout(workout) {
      this.isEditing = true;
      this.currentWorkout = { ...workout };
      this.showForm = true;
    },
    async deleteWorkout(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
        try {
          if (navigator.onLine) {
            await fetch(`http://localhost:3001/workouts/${id}`, {
              method: 'DELETE'
            });
          } else {
            // En modo offline, marcar para eliminar cuando vuelva online
            await syncManager.markForDeletion('workouts', id);
          }
          
          // Actualizar UI inmediatamente
          this.workouts = this.workouts.filter(w => w.id !== id);
        } catch (error) {
          console.error('Error al eliminar ejercicio:', error);
        }
      }
    },
    async saveWorkout() {
      try {
        const workoutData = {
          ...this.currentWorkout,
          timestamp: new Date().toISOString()
        };
        
        let result;
        if (this.isEditing) {
          result = await syncManager.updateWorkout(workoutData);
        } else {
          result = await syncManager.saveWorkout(workoutData);
        }
        
        if (result.success) {
          this.showForm = false;
          this.loadWorkouts(); // Recargar la lista
          this.currentWorkout = this.getEmptyWorkout();
          this.isEditing = false;
        }
      } catch (error) {
        console.error('Error al guardar ejercicio:', error);
      }
    }
  }
}
</script>

<style scoped>
.workouts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #388E3C;
  margin-bottom: 1.5rem;
}

.actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.workouts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.workout-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem;
  position: relative;
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.workout-header h3 {
  margin: 0;
  color: #388E3C;
}

.date {
  font-size: 0.8rem;
  color: #666;
}

.workout-details {
  margin-bottom: 1rem;
}

.detail {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: bold;
  color: #555;
}

.workout-notes {
  background-color: #f9f9f9;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-style: italic;
  color: #666;
}

.workout-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.delete-btn {
  background-color: #F44336;
  color: white;
}

.sync-status {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.pending-sync {
  background-color: #FFC107;
  color: #333;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.offline-alert {
  background-color: #FFC107;
  color: #333;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input, select, textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.primary-btn, .secondary-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.primary-btn {
  background-color: #4CAF50;
  color: white;
}

.secondary-btn {
  background-color: #f5f5f5;
  color: #333;
}

@media (max-width: 600px) {
  .workouts-list {
    grid-template-columns: 1fr;
  }
}
</style>