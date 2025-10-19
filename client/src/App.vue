<template>
  <div class="app-container">
    <header class="app-header">
      <h1>NutriTrack</h1>
      <div class="connection-status" :class="{ 'offline': !isOnline }">
        {{ isOnline ? 'Online' : 'Offline' }}
      </div>
    </header>
    
    <nav class="app-nav">
      <router-link to="/">Dashboard</router-link>
      <router-link to="/meals">Comidas</router-link>
      <router-link to="/workouts">Ejercicios</router-link>
      <router-link to="/profile">Perfil</router-link>
    </nav>
    
    <main class="app-content">
      <Suspense>
        <template #default>
          <router-view />
        </template>
        <template #fallback>
          <div class="skeleton-content">
            <div class="skeleton-line" style="width: 60%"></div>
            <div class="skeleton-line" style="width: 40%"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
          </div>
        </template>
      </Suspense>
    </main>
    
    <footer class="app-footer">
      <p>NutriTrack PWA - Versión 1.0</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isOnline: navigator.onLine
    }
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; color: #333; }
.app-container { display: flex; flex-direction: column; min-height: 100vh; }
.app-header { background-color: #4CAF50; color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
.connection-status { font-size: 0.8rem; padding: 0.3rem 0.6rem; border-radius: 1rem; background-color: #8BC34A; }
.connection-status.offline { background-color: #F44336; }
.app-nav { background-color: #388E3C; display: flex; overflow-x: auto; }
.app-nav a { color: white; text-decoration: none; padding: 1rem; white-space: nowrap; }
.app-nav a.router-link-active { background-color: #2E7D32; }
.app-content { flex: 1; padding: 1rem; }
.app-footer { background-color: #388E3C; color: white; text-align: center; padding: 1rem; font-size: 0.8rem; }

/* Skeleton styles para App Shell */
.skeleton-content { display: grid; gap: 12px; }
.skeleton-line { height: 14px; border-radius: 8px; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 37%, #e0e0e0 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
.skeleton-card { height: 120px; border-radius: 12px; background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 37%, #e0e0e0 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>