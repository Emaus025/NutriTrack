<template>
  <div class="profile">
    <h2>Perfil de Usuario</h2>
    
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">
          <img v-if="user.avatar" :src="user.avatar" alt="Avatar de usuario">
          <div v-else class="avatar-placeholder">{{ getInitials() }}</div>
        </div>
        <div class="profile-info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
        </div>
      </div>
      
      <div class="profile-section">
        <h4>Objetivos Diarios</h4>
        <form @submit.prevent="saveGoals">
          <div class="form-group">
            <label for="caloriesGoal">Calorías (kcal)</label>
            <input 
              type="number" 
              id="caloriesGoal" 
              v-model.number="user.dailyGoals.calories" 
              min="0"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="proteinGoal">Proteínas (g)</label>
            <input 
              type="number" 
              id="proteinGoal" 
              v-model.number="user.dailyGoals.protein" 
              min="0"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="carbsGoal">Carbohidratos (g)</label>
            <input 
              type="number" 
              id="carbsGoal" 
              v-model.number="user.dailyGoals.carbs" 
              min="0"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="fatGoal">Grasas (g)</label>
            <input 
              type="number" 
              id="fatGoal" 
              v-model.number="user.dailyGoals.fat" 
              min="0"
              required
            >
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
      
      <div class="profile-section">
        <h4>Preferencias de la Aplicación</h4>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="enableNotifications">
            Activar notificaciones
          </label>
        </div>
        
        <div class="form-group">
          <label for="theme">Tema</label>
          <select id="theme" v-model="appTheme">
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
            <option value="system">Sistema</option>
          </select>
        </div>
      </div>
      
      <div class="profile-section">
        <h4>Datos de la Aplicación</h4>
        <div class="data-actions">
          <button @click="exportData" class="btn secondary">Exportar Datos</button>
          <button @click="importData" class="btn secondary">Importar Datos</button>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept=".json" 
            @change="handleFileImport"
          >
        </div>
      </div>
      
      <div class="profile-section">
        <h4>Información de la Aplicación</h4>
        <p><strong>Versión:</strong> 1.0.0</p>
        <p><strong>Estado:</strong> {{ isOnline ? 'En línea' : 'Fuera de línea' }}</p>
        <p v-if="lastSyncDate"><strong>Última sincronización:</strong> {{ formatDate(lastSyncDate) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      user: {
        id: 1,
        name: 'Usuario Demo',
        email: 'demo@nutritrack.com',
        avatar: null,
        dailyGoals: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 70
        }
      },
      enableNotifications: false,
      appTheme: 'light',
      isOnline: navigator.onLine,
      lastSyncDate: null
    }
  },
  async mounted() {
    await this.loadUserData();
    
    // Cargar preferencias desde localStorage
    this.loadPreferences();
    
    // Escuchar cambios de conexión
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
    
    // Solicitar permisos de notificación si están habilitadas
    if (this.enableNotifications) {
      this.requestNotificationPermission();
    }
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    async loadUserData() {
      try {
        // Intentar cargar desde IndexedDB primero
        const cachedUser = await this.getFromIndexedDB('user');
        if (cachedUser) {
          this.user = cachedUser;
          return;
        }
        
        // Si estamos online, intentar cargar desde el servidor
        if (navigator.onLine) {
          const response = await fetch('http://localhost:3001/users/1');
          if (!response.ok) throw new Error('Error al cargar datos de usuario');
          
          const userData = await response.json();
          this.user = userData;
          
          // Guardar en IndexedDB
          await this.saveToIndexedDB('user', userData);
        }
      } catch (error) {
        console.error('Error al cargar datos de usuario:', error);
      }
    },
    
    loadPreferences() {
      // Cargar desde localStorage
      const preferences = JSON.parse(localStorage.getItem('nutritrack_preferences') || '{}');
      
      if (preferences.enableNotifications !== undefined) {
        this.enableNotifications = preferences.enableNotifications;
      }
      
      if (preferences.appTheme) {
        this.appTheme = preferences.appTheme;
      }
      
      if (preferences.lastSyncDate) {
        this.lastSyncDate = new Date(preferences.lastSyncDate);
      }
      
      // Aplicar tema
      this.applyTheme();
    },
    
    savePreferences() {
      const preferences = {
        enableNotifications: this.enableNotifications,
        appTheme: this.appTheme,
        lastSyncDate: this.lastSyncDate ? this.lastSyncDate.toISOString() : null
      };
      
      localStorage.setItem('nutritrack_preferences', JSON.stringify(preferences));
      
      // Aplicar tema
      this.applyTheme();
    },
    
    applyTheme() {
      let theme = this.appTheme;
      
      // Si es "system", detectar preferencia del sistema
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
      }
      
      // Aplicar clase al body
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${theme}`);
    },
    
    async saveGoals() {
      try {
        // Guardar localmente primero
        await this.saveToIndexedDB('user', this.user);
        
        // Si estamos online, guardar en el servidor
        if (navigator.onLine) {
          const response = await fetch(`http://localhost:3001/users/${this.user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              dailyGoals: this.user.dailyGoals
            })
          });
          
          if (!response.ok) throw new Error('Error al guardar objetivos');
          
          // Actualizar fecha de sincronización
          this.lastSyncDate = new Date();
          this.savePreferences();
        } else {
          // Marcar para sincronización posterior
          await this.saveToIndexedDB('pendingUpdates', {
            id: Date.now(),
            type: 'updateUser',
            data: {
              id: this.user.id,
              dailyGoals: this.user.dailyGoals
            }
          });
        }
        
        alert('Objetivos guardados correctamente');
      } catch (error) {
        console.error('Error al guardar objetivos:', error);
        alert('Error al guardar objetivos. Inténtalo de nuevo más tarde.');
      }
    },
    
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
      
      // Si acabamos de conectarnos, intentar sincronizar
      if (this.isOnline) {
        this.syncPendingData();
      }
    },
    
    async syncPendingData() {
      try {
        // Sincronizar comidas pendientes
        const pendingMeals = await this.getFromIndexedDB('pendingMeals') || [];
        for (const meal of pendingMeals) {
          try {
            const response = await fetch('http://localhost:3001/meals', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(meal)
            });
            
            if (!response.ok) throw new Error('Error al sincronizar comida');
          } catch (error) {
            console.error('Error al sincronizar comida:', error);
            // Mantener en pendientes si falla
            continue;
          }
        }
        
        // Sincronizar actualizaciones pendientes
        const pendingUpdates = await this.getFromIndexedDB('pendingUpdates') || [];
        for (const update of pendingUpdates) {
          try {
            if (update.type === 'updateUser') {
              const response = await fetch(`http://localhost:3001/users/${update.data.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(update.data)
              });
              
              if (!response.ok) throw new Error('Error al sincronizar actualización');
            }
          } catch (error) {
            console.error('Error al sincronizar actualización:', error);
            // Mantener en pendientes si falla
            continue;
          }
        }
        
        // Actualizar fecha de sincronización
        this.lastSyncDate = new Date();
        this.savePreferences();
      } catch (error) {
        console.error('Error al sincronizar datos pendientes:', error);
      }
    },
    
    requestNotificationPermission() {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.enableNotifications = true;
          } else {
            this.enableNotifications = false;
          }
          this.savePreferences();
        });
      }
    },
    
    exportData() {
      Promise.all([
        this.getFromIndexedDB('user'),
        this.getFromIndexedDB('meals'),
        this.getFromIndexedDB('foodDatabase')
      ]).then(([user, meals, foodDatabase]) => {
        const exportData = {
          user,
          meals,
          foodDatabase,
          exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'nutritrack_data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      });
    },
    
    importData() {
      this.$refs.fileInput.click();
    },
    
    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // Validar datos importados
          if (!importedData.user || !importedData.meals) {
            throw new Error('Formato de datos inválido');
          }
          
          // Importar datos
          if (importedData.user) {
            await this.saveToIndexedDB('user', importedData.user);
            this.user = importedData.user;
          }
          
          if (importedData.meals) {
            await this.saveToIndexedDB('meals', importedData.meals);
          }
          
          if (importedData.foodDatabase) {
            await this.saveToIndexedDB('foodDatabase', importedData.foodDatabase);
          }
          
          alert('Datos importados correctamente');
          
          // Intentar sincronizar si estamos online
          if (navigator.onLine) {
            this.syncPendingData();
          }
        } catch (error) {
          console.error('Error al importar datos:', error);
          alert('Error al importar datos. Verifica el formato del archivo.');
        }
      };
      reader.readAsText(file);
    },
    
    getInitials() {
      if (!this.user.name) return '?';
      return this.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString();
    },
    
    // Funciones para IndexedDB
    async getFromIndexedDB(storeName) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('NutriTrackDB', 1);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('user')) {
            db.createObjectStore('user', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('meals')) {
            db.createObjectStore('meals', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('foodDatabase')) {
            db.createObjectStore('foodDatabase', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('pendingMeals')) {
            db.createObjectStore('pendingMeals', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('pendingUpdates')) {
            db.createObjectStore('pendingUpdates', { keyPath: 'id' });
          }
        };
        
        request.onsuccess = (event) => {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains(storeName)) {
            resolve(null);
            return;
          }
          
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          
          let request;
          if (storeName === 'user') {
            request = store.get(1); // ID del usuario demo
          } else {
            request = store.getAll();
          }
          
          request.onsuccess = () => {
            resolve(request.result);
          };
          
          request.onerror = (error) => {
            reject(error);
          };
        };
        
        request.onerror = (error) => {
          reject(error);
        };
      });
    },
    
    async saveToIndexedDB(storeName, data) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('NutriTrackDB', 1);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('user')) {
            db.createObjectStore('user', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('meals')) {
            db.createObjectStore('meals', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('foodDatabase')) {
            db.createObjectStore('foodDatabase', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('pendingMeals')) {
            db.createObjectStore('pendingMeals', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('pendingUpdates')) {
            db.createObjectStore('pendingUpdates', { keyPath: 'id' });
          }
        };
        
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          
          let request;
          if (storeName === 'user') {
            request = store.put(data);
          } else if (Array.isArray(data)) {
            // Limpiar el store primero si es un array completo
            store.clear();
            
            // Añadir los nuevos datos
            data.forEach(item => {
              store.add(item);
            });
          } else {
            request = store.add(data);
          }
          
          transaction.oncomplete = () => {
            resolve();
          };
          
          transaction.onerror = (error) => {
            reject(error);
          };
        };
        
        request.onerror = (error) => {
          reject(error);
        };
      });
    }
  }
}
</script>

<style scoped>
.profile {
  padding: 1rem;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.profile-info h3 {
  margin: 0;
  margin-bottom: 0.25rem;
}

.profile-info p {
  margin: 0;
  color: #666;
}

.profile-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.profile-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.checkbox-label input {
  margin-right: 0.5rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.primary {
  background-color: #4CAF50;
  color: white;
}

.secondary {
  background-color: #2196F3;
  color: white;
}

.data-actions {
  display: flex;
  gap: 1rem;
}

@media (max-width: 600px) {
  .data-actions {
    flex-direction: column;
  }
}
</style>