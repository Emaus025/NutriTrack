<template>
  <div class="meals-page">
    <h2>Registro de Comidas</h2>
    
    <div class="add-meal-form">
      <h3>Añadir Nueva Comida</h3>
      
      <div class="form-group">
        <label for="meal-name">Nombre de la Comida</label>
        <input 
          type="text" 
          id="meal-name" 
          v-model="newMeal.name" 
          placeholder="Ej: Desayuno, Almuerzo..."
        >
      </div>
      
      <div class="form-group">
        <label for="meal-date">Fecha</label>
        <input 
          type="date" 
          id="meal-date" 
          v-model="newMeal.date"
        >
      </div>
      
      <div class="food-search">
        <h4>Añadir Alimentos</h4>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar alimento..." 
            @input="searchFoods"
          >
          <button @click="scanBarcode" class="icon-button">
            <span class="material-icons">photo_camera</span>
          </button>
        </div>
        
        <div v-if="searchResults.length > 0" class="search-results">
          <div 
            v-for="food in searchResults" 
            :key="food.id" 
            class="food-item"
            @click="addFoodToMeal(food)"
          >
            <div class="food-name">{{ food.name }}</div>
            <div class="food-calories">{{ food.calories }} kcal</div>
          </div>
        </div>
      </div>
      
      <div v-if="newMeal.foods.length > 0" class="selected-foods">
        <h4>Alimentos Seleccionados</h4>
        <ul class="food-list">
          <li v-for="(food, index) in newMeal.foods" :key="index" class="food-list-item">
            <div class="food-info">
              <div class="food-name">{{ food.name }}</div>
              <div class="food-details">
                {{ food.calories }} kcal | P: {{ food.protein }}g | C: {{ food.carbs }}g | G: {{ food.fat }}g
              </div>
            </div>
            <div class="food-actions">
              <input 
                type="number" 
                v-model="food.quantity" 
                min="1" 
                class="quantity-input"
                @change="updateTotals"
              >
              <button @click="removeFood(index)" class="icon-button">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </li>
        </ul>
        
        <div class="meal-totals">
          <h4>Totales</h4>
          <div class="totals-grid">
            <div class="total-item">
              <span class="total-label">Calorías:</span>
              <span class="total-value">{{ mealTotals.calories }}</span>
            </div>
            <div class="total-item">
              <span class="total-label">Proteínas:</span>
              <span class="total-value">{{ mealTotals.protein }}g</span>
            </div>
            <div class="total-item">
              <span class="total-label">Carbohidratos:</span>
              <span class="total-value">{{ mealTotals.carbs }}g</span>
            </div>
            <div class="total-item">
              <span class="total-label">Grasas:</span>
              <span class="total-value">{{ mealTotals.fat }}g</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button @click="saveMeal" class="primary-button" :disabled="!canSaveMeal">
          Guardar Comida
        </button>
      </div>
    </div>
    
    <div class="meal-history">
      <h3>Historial de Comidas</h3>
      
      <div class="date-selector">
        <button @click="changeDate(-1)" class="icon-button">
          <span class="material-icons">chevron_left</span>
        </button>
        <div class="current-date">{{ formattedSelectedDate }}</div>
        <button @click="changeDate(1)" class="icon-button">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
      
      <div v-if="meals.length === 0" class="empty-state">
        No hay comidas registradas para esta fecha
      </div>
      
      <div v-else class="meals-list">
        <div v-for="meal in meals" :key="meal.id" class="meal-card">
          <div class="meal-header">
            <h4>{{ meal.name }}</h4>
            <div class="meal-actions">
              <button @click="deleteMeal(meal.id)" class="icon-button">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
          
          <div class="meal-details">
            <div class="meal-macros">
              <div class="macro-item">
                <span class="macro-value">{{ meal.calories }}</span>
                <span class="macro-label">kcal</span>
              </div>
              <div class="macro-item">
                <span class="macro-value">{{ meal.protein }}</span>
                <span class="macro-label">P (g)</span>
              </div>
              <div class="macro-item">
                <span class="macro-value">{{ meal.carbs }}</span>
                <span class="macro-label">C (g)</span>
              </div>
              <div class="macro-item">
                <span class="macro-value">{{ meal.fat }}</span>
                <span class="macro-label">G (g)</span>
              </div>
            </div>
            
            <div class="meal-foods">
              <div v-for="(food, index) in meal.foods" :key="index" class="meal-food-item">
                {{ food.quantity }}x {{ food.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para escaneo de código de barras -->
    <div v-if="showBarcodeScanner" class="barcode-modal">
      <div class="barcode-modal-content">
        <h3>Escanea el código de barras</h3>
        <div id="barcode-scanner"></div>
        <button @click="closeBarcodeScanner" class="icon-button">
          <span class="material-icons">close</span>
        </button>
        <p class="scanner-instructions">
          Apunta la cámara al código de barras del producto
        </p>
        <button @click="closeBarcodeScanner" class="secondary-button">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { SyncManager } from '../utils/idb';
import { openCamera } from '../utils/camera';
import { searchProductByBarcode, searchProductsByName } from '../utils/productApi';

export default {
  name: 'Meals',
  setup() {
    // Estado para la nueva comida
    const newMeal = ref({
      name: '',
      date: new Date().toISOString().split('T')[0],
      foods: [],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
    
    // Estado para la búsqueda de alimentos
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    
    // Estado para el historial de comidas
    const selectedDate = ref(new Date());
    const meals = ref([]);
    
    // Estado para el escáner de código de barras
    const showBarcodeScanner = ref(false);
    const videoElement = ref(null);
    const barcodeScanner = ref(null);
    
    // Totales de la comida actual
    const mealTotals = ref({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
    
    // Fecha formateada para mostrar
    const formattedSelectedDate = computed(() => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return selectedDate.value.toLocaleDateString('es-ES', options);
    });
    
    // Verificar si se puede guardar la comida
    const canSaveMeal = computed(() => {
      return newMeal.value.name.trim() !== '' && newMeal.value.foods.length > 0;
    });
    
    // Buscar alimentos
    const searchFoods = async () => {
      if (searchQuery.value.trim() === '') {
        searchResults.value = [];
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:3001/foodDatabase?q=${searchQuery.value}`);
        searchResults.value = response.data;
      } catch (error) {
        console.error('Error al buscar alimentos:', error);
        // Intentar buscar en IndexedDB si falla la API
      }
    };
    
    // Añadir alimento a la comida
    const addFoodToMeal = (food) => {
      const foodWithQuantity = {
        ...food,
        quantity: 1
      };
      
      newMeal.value.foods.push(foodWithQuantity);
      searchQuery.value = '';
      searchResults.value = [];
      updateTotals();
    };
    
    // Eliminar alimento de la comida
    const removeFood = (index) => {
      newMeal.value.foods.splice(index, 1);
      updateTotals();
    };
    
    // Actualizar totales de la comida
    const updateTotals = () => {
      mealTotals.value = newMeal.value.foods.reduce((totals, food) => {
        return {
          calories: totals.calories + (food.calories * food.quantity),
          protein: totals.protein + (food.protein * food.quantity),
          carbs: totals.carbs + (food.carbs * food.quantity),
          fat: totals.fat + (food.fat * food.quantity)
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      // Actualizar los totales en el objeto newMeal
      newMeal.value.calories = mealTotals.value.calories;
      newMeal.value.protein = mealTotals.value.protein;
      newMeal.value.carbs = mealTotals.value.carbs;
      newMeal.value.fat = mealTotals.value.fat;
    };
    
    // Guardar comida
    const saveMeal = async () => {
      try {
        const mealToSave = { ...newMeal.value };
        
        // Intentar guardar en el servidor
        if (navigator.onLine) {
          await axios.post('http://localhost:3001/meals', mealToSave);
        } else {
          // Si no hay conexión, guardar offline
          await SyncManager.saveMealOffline(mealToSave);
        }
        
        // Resetear el formulario
        newMeal.value = {
          name: '',
          date: new Date().toISOString().split('T')[0],
          foods: [],
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
        
        // Recargar las comidas
        loadMeals();
        
        alert('Comida guardada correctamente');
      } catch (error) {
        console.error('Error al guardar la comida:', error);
        alert('Error al guardar la comida. Se guardará localmente para sincronizar más tarde.');
        
        // Guardar offline en caso de error
        await SyncManager.saveMealOffline(newMeal.value);
      }
    };
    
    // Cargar comidas para la fecha seleccionada
    const loadMeals = async () => {
      try {
        const dateStr = selectedDate.value.toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:3001/meals?date=${dateStr}`);
        meals.value = response.data;
      } catch (error) {
        console.error('Error al cargar comidas:', error);
        // Intentar cargar desde IndexedDB si falla la API
      }
    };
    
    // Cambiar fecha seleccionada
    const changeDate = (days) => {
      const newDate = new Date(selectedDate.value);
      newDate.setDate(newDate.getDate() + days);
      selectedDate.value = newDate;
      loadMeals();
    };
    
    // Eliminar comida
    const deleteMeal = async (id) => {
      if (!confirm('¿Estás seguro de que deseas eliminar esta comida?')) {
        return;
      }
      
      try {
        await axios.delete(`http://localhost:3001/meals/${id}`);
        loadMeals();
      } catch (error) {
        console.error('Error al eliminar la comida:', error);
      }
    };
    
    // Escanear código de barras
    const scanBarcode = async () => {
      try {
        showBarcodeScanner.value = true;
        const barcode = await openCamera();
        if (barcode) {
          isSearching.value = true;
          const product = await searchProductByBarcode(barcode);
          if (product) {
            addFoodToMeal(product);
          }
          isSearching.value = false;
        }
      } catch (error) {
        console.error('Error al escanear código de barras:', error);
        isSearching.value = false;
      } finally {
        showBarcodeScanner.value = false;
      }
    };
    
    // Eliminar la función searchFoods duplicada que está aquí
    
    const closeBarcodeScanner = () => {
      showBarcodeScanner.value = false;
    };
    
    // Buscar alimento por código de barras
    const searchFoodByBarcode = async (barcode) => {
      try {
        // En una aplicación real, aquí consultaríamos una API de alimentos por código de barras
        // Por simplicidad, simulamos una búsqueda exitosa
        searchQuery.value = 'Producto escaneado';
        await searchFoods();
      } catch (error) {
        console.error('Error al buscar alimento por código de barras:', error);
      }
    };
    
    onMounted(() => {
      loadMeals();
    });
    
    onUnmounted(() => {
      // Asegurarse de detener la cámara si el componente se desmonta
      if (videoElement.value && videoElement.value.srcObject) {
        videoElement.value.srcObject.getTracks().forEach(track => track.stop());
      }
    });
    
    return {
      newMeal,
      searchQuery,
      searchResults,
      selectedDate,
      formattedSelectedDate,
      meals,
      mealTotals,
      canSaveMeal,
      showBarcodeScanner,
      videoElement,
      searchFoods,
      addFoodToMeal,
      removeFood,
      updateTotals,
      saveMeal,
      changeDate,
      deleteMeal,
      scanBarcode,
      closeBarcodeScanner
    };
  }
}
</script>

<style scoped>
.meals-page {
  max-width: 800px;
  margin: 0 auto;
}

.add-meal-form, .meal-history {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input[type="text"],
input[type="date"],
input[type="number"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-container {
  display: flex;
  gap: 0.5rem;
}

.search-container input {
  flex: 1;
}

.search-results {
  margin-top: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.food-item {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.food-item:hover {
  background-color: #f5f5f5;
}

.food-list {
  list-style: none;
  padding: 0;
}

.food-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.food-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input {
  width: 60px;
  text-align: center;
}

.meal-totals {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.total-item {
  display: flex;
  justify-content: space-between;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.primary-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}

.primary-button:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #9E9E9E;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
}

.icon-button:hover {
  background-color: #f5f5f5;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.current-date {
  font-weight: 500;
}

.empty-state {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #757575;
}

.meal-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.meal-macros {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.macro-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.macro-value {
  font-weight: bold;
}

.macro-label {
  font-size: 0.8rem;
  color: #757575;
}

.meal-foods {
  font-size: 0.9rem;
  color: #616161;
}

.barcode-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.barcode-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  text-align: center;
}

#barcode-scanner {
  width: 100%;
  height: 300px;
  margin: 20px 0;
  overflow: hidden;
  position: relative;
}

.scanner-instructions {
  margin: 15px 0;
  font-size: 14px;
  color: #666;
}
</style>