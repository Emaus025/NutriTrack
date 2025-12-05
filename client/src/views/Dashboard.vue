<template>
  <div class="dashboard">
    <h2>Dashboard</h2>
    
    <div class="stats-container">
      <div class="stat-card">
        <h3>Calorías Hoy</h3>
        <div class="stat-value">{{ dailyStats.calories }} / {{ userGoals.calories }}</div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: caloriesPercentage + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <h3>Proteínas</h3>
        <div class="stat-value">{{ dailyStats.protein }}g / {{ userGoals.protein }}g</div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: proteinPercentage + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <h3>Carbohidratos</h3>
        <div class="stat-value">{{ dailyStats.carbs }}g / {{ userGoals.carbs }}g</div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: carbsPercentage + '%' }"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <h3>Grasas</h3>
        <div class="stat-value">{{ dailyStats.fat }}g / {{ userGoals.fat }}g</div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: fatPercentage + '%' }"></div>
        </div>
      </div>
    </div>
    
    <div class="recent-entries">
      <h3>Comidas Recientes</h3>
      <div v-if="recentMeals.length === 0" class="empty-state">
        No hay comidas registradas hoy
      </div>
      <ul v-else class="entry-list">
        <li v-for="meal in recentMeals" :key="meal.id" class="entry-item">
          <div class="entry-name">{{ meal.name }}</div>
          <div class="entry-details">{{ meal.calories }} kcal</div>
        </li>
      </ul>
      
      <h3>Ejercicios Recientes</h3>
      <div v-if="recentWorkouts.length === 0" class="empty-state">
        No hay ejercicios registrados hoy
      </div>
      <ul v-else class="entry-list">
        <li v-for="workout in recentWorkouts" :key="workout.id" class="entry-item">
          <div class="entry-name">{{ workout.name }}</div>
          <div class="entry-details">{{ workout.duration }} min | {{ workout.calories }} kcal</div>
        </li>
      </ul>
    </div>
    
    <div class="quick-actions">
      <button @click="$router.push('/meals/add')" class="action-button">
        Añadir Comida
      </button>
      <button @click="$router.push('/workouts/add')" class="action-button">
        Registrar Ejercicio
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { getById } from '../utils/idb';

export default {
  name: 'Dashboard',
  setup() {
    const userGoals = ref({
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70
    });
    
    const dailyStats = ref({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
    
    const recentMeals = ref([]);
    const recentWorkouts = ref([]);
    
    // Calcular porcentajes para barras de progreso
    const caloriesPercentage = computed(() => {
      return Math.min(100, (dailyStats.value.calories / userGoals.value.calories) * 100);
    });
    
    const proteinPercentage = computed(() => {
      return Math.min(100, (dailyStats.value.protein / userGoals.value.protein) * 100);
    });
    
    const carbsPercentage = computed(() => {
      return Math.min(100, (dailyStats.value.carbs / userGoals.value.carbs) * 100);
    });
    
    const fatPercentage = computed(() => {
      return Math.min(100, (dailyStats.value.fat / userGoals.value.fat) * 100);
    });
    
    // Cargar datos del usuario
    const loadUserData = async () => {
      try {
        // Intentar cargar desde IndexedDB primero
        const userData = await getById('userData', 1);
        
        if (userData && userData.dailyGoals) {
          userGoals.value = userData.dailyGoals;
        } else {
          // Si no hay datos locales, cargar desde la API
          const response = await axios.get('http://localhost:3001/users/1');
          userGoals.value = response.data.dailyGoals;
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    };
    
    // Cargar comidas del día
    const loadTodayMeals = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:3001/meals?date=${today}`);
        recentMeals.value = response.data;
        
        // Calcular estadísticas
        dailyStats.value.calories = recentMeals.value.reduce((sum, meal) => sum + meal.calories, 0);
        dailyStats.value.protein = recentMeals.value.reduce((sum, meal) => sum + meal.protein, 0);
        dailyStats.value.carbs = recentMeals.value.reduce((sum, meal) => sum + meal.carbs, 0);
        dailyStats.value.fat = recentMeals.value.reduce((sum, meal) => sum + meal.fat, 0);
      } catch (error) {
        console.error('Error al cargar comidas:', error);
        // Intentar cargar desde IndexedDB si falla la API
      }
    };
    
    // Cargar ejercicios del día
    const loadTodayWorkouts = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:3001/workouts?date=${today}`);
        recentWorkouts.value = response.data;
      } catch (error) {
        console.error('Error al cargar ejercicios:', error);
        // Intentar cargar desde IndexedDB si falla la API
      }
    };
    
    onMounted(() => {
      loadUserData();
      loadTodayMeals();
      loadTodayWorkouts();
    });
    
    return {
      userGoals,
      dailyStats,
      recentMeals,
      recentWorkouts,
      caloriesPercentage,
      proteinPercentage,
      carbsPercentage,
      fatPercentage
    };
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
}

.recent-entries {
  margin-bottom: 2rem;
}

.entry-list {
  list-style: none;
  padding: 0;
}

.entry-item {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
}

.empty-state {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #757575;
  margin-bottom: 1rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  flex: 1;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.action-button:hover {
  background-color: #388E3C;
}
</style>