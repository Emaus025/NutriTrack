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
      <router-view />
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #4CAF50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connection-status {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 1rem;
  background-color: #8BC34A;
}

.connection-status.offline {
  background-color: #F44336;
}

.app-nav {
  background-color: #388E3C;
  display: flex;
  overflow-x: auto;
}

.app-nav a {
  color: white;
  text-decoration: none;
  padding: 1rem;
  white-space: nowrap;
}

.app-nav a.router-link-active {
  background-color: #2E7D32;
}

.app-content {
  flex: 1;
  padding: 1rem;
}

.app-footer {
  background-color: #388E3C;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;
}
</style>