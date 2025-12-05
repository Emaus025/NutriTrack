import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

const app = createApp(App)

app.use(createPinia())
app.use(router)

async function applyTheme() {
  const root = document.documentElement;
  try {
    const resp = await fetch('/api/deployColor');
    const data = await resp.json();
    const color = (data?.color || 'green').toLowerCase();
    if (color === 'blue') {
      root.style.setProperty('--primary-header-bg', '#1976D2');     // azul
      root.style.setProperty('--status-bg', '#64B5F6');             // azul claro
      root.style.setProperty('--offline-bg', '#F44336');            // rojo (offline)
      root.style.setProperty('--nav-bg', '#1565C0');                // azul oscuro
      root.style.setProperty('--nav-active-bg', '#0D47A1');         // azul más oscuro
      root.style.setProperty('--text-color', '#333333');
      root.style.setProperty('--body-bg', '#f5f5f5');
      root.style.setProperty('--link-color', '#ffffff');
      root.style.setProperty('--footer-bg', 'var(--nav-bg)');
    } else {
      // Verde por defecto
      root.style.setProperty('--primary-header-bg', '#4CAF50');
      root.style.setProperty('--status-bg', '#8BC34A');
      root.style.setProperty('--offline-bg', '#F44336');
      root.style.setProperty('--nav-bg', '#388E3C');
      root.style.setProperty('--nav-active-bg', '#2E7D32');
      root.style.setProperty('--text-color', '#333333');
      root.style.setProperty('--body-bg', '#f5f5f5');
      root.style.setProperty('--link-color', '#ffffff');
      root.style.setProperty('--footer-bg', 'var(--nav-bg)');
    }
  } catch (e) {
    // Si falla, usamos verde por defecto
  }
}

applyTheme();

app.mount('#app')