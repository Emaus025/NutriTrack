<template>
  <div class="meal-form">
    <h2>Registrar Comida</h2>
    
    <div v-if="offlineAlert" class="offline-alert">
      Estás en modo offline. Los datos se sincronizarán cuando vuelvas a estar online.
    </div>
    
    <form @submit.prevent="saveMeal">
      <div class="form-group">
        <label for="name">Nombre de la comida:</label>
        <input 
          type="text" 
          id="name" 
          v-model="meal.name" 
          required
          placeholder="Ej: Ensalada César"
        >
      </div>
      
      <div class="form-group">
        <label for="calories">Calorías:</label>
        <input 
          type="number" 
          id="calories" 
          v-model.number="meal.calories" 
          required
          min="0"
        >
      </div>
      
      <div class="form-group">
        <label for="protein">Proteínas (g):</label>
        <input 
          type="number" 
          id="protein" 
          v-model.number="meal.protein" 
          required
          min="0"
          step="0.1"
        >
      </div>
      
      <div class="form-group">
        <label for="carbs">Carbohidratos (g):</label>
        <input 
          type="number" 
          id="carbs" 
          v-model.number="meal.carbs" 
          required
          min="0"
          step="0.1"
        >
      </div>
      
      <div class="form-group">
        <label for="fat">Grasas (g):</label>
        <input 
          type="number" 
          id="fat" 
          v-model.number="meal.fat" 
          required
          min="0"
          step="0.1"
        >
      </div>
      
      <div class="form-group">
        <label for="date">Fecha y hora:</label>
        <input 
          type="datetime-local" 
          id="date" 
          v-model="meal.dateTime" 
          required
        >
      </div>
      
      <div class="form-group">
        <button type="button" @click="scanBarcode" class="scan-btn">
          <span class="icon">📷</span> Escanear código de barras
        </button>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="primary-btn">Guardar</button>
        <button type="button" @click="$router.push('/meals')" class="secondary-btn">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script>
import syncManager from '../utils/syncManager';
import { openCamera } from '../utils/camera';

export default {
  name: 'MealForm',
  data() {
    return {
      meal: {
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        dateTime: this.formatDateTime(new Date())
      },
      offlineAlert: !navigator.onLine
    }
  },
  mounted() {
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
    },
    formatDateTime(date) {
      // Formato YYYY-MM-DDThh:mm requerido para input datetime-local
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
    },
    async saveMeal() {
      try {
        // Añadir timestamp para ordenar cronológicamente
        const mealData = {
          ...this.meal,
          timestamp: new Date().toISOString(),
          synced: false
        };
        
        const result = await syncManager.saveMeal(mealData);
        
        if (result.success) {
          this.$router.push('/meals');
        }
      } catch (error) {
        console.error('Error al guardar la comida:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    },
    async scanBarcode() {
      try {
        const barcodeData = await openCamera();
        if (barcodeData) {
          // Aquí podrías buscar información nutricional basada en el código de barras
          // Por ejemplo, usando una API externa o datos cacheados
          console.log('Código de barras escaneado:', barcodeData);
          // Por ahora solo actualizamos el nombre como ejemplo
          this.meal.name = `Producto escaneado (${barcodeData})`;
        }
      } catch (error) {
        console.error('Error al escanear código de barras:', error);
      }
    }
  }
}
</script>

<style scoped>
.meal-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
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

button {
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

.scan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2196F3;
  color: white;
  width: 100%;
}

.icon {
  margin-right: 0.5rem;
}

.offline-alert {
  background-color: #FFC107;
  color: #333;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
}
</style>