I've reviewed your project based on our previous discussions. Here is a complete README for your NutriTrack Pro repository.

# NutriTrack Pro - PWA de Seguimiento Nutricional

**NutriTrack Pro** es una **Progressive Web App (PWA)** completa para el seguimiento de nutrición y ejercicio, permitiendo a los usuarios registrar su alimentación, controlar su actividad física y recibir notificaciones personalizadas.

## Características Principales

| Categoría | Características |
| :--- | :--- |
| ** Arquitectura PWA** | App Shell, Service Worker para funcionamiento offline, Web App Manifest |
| ** Interfaz de Usuario** | Vue.js 3, Vue Router, Pinia, Diseño responsive |
| ** Gestión de Datos** | JSON Server (API simulada), IndexedDB (almacenamiento local), Sincronización offline |
| ** Funcionalidades Avanzadas** | Notificaciones push, Cámara para códigos de barras, Geolocalización |

## Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework principal
- **Vue Router** - Navegación entre vistas
- **Pinia** - Gestión de estado
- **CSS3** - Estilos y diseño responsive

### Backend & Almacenamiento
- **JSON Server** - API REST simulada
- **IndexedDB** - Base de datos local para funcionamiento offline
- **Service Worker** - Caching y proxy de red

### Características PWA
- **Web App Manifest** - Instalación y metadatos
- **Service Worker** - Estrategias de caching offline
- **APIs del Navegador** - Cámara, Geolocalización, Notificaciones

## Estructura del Proyecto

```
NutriTrack/
├── client/                     # Aplicación Vue.js
│   ├── public/
│   │   ├── index.html
│   │   ├── sw.js              # Service Worker
│   │   ├── manifest.json      # Configuración PWA
│   │   └── icons/             # Íconos de la aplicación
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppMenu.vue
│   │   │   └── AppFooter.vue
│   │   ├── views/             # Vistas principales
│   │   │   ├── Splash.vue
│   │   │   ├── Home.vue
│   │   │   ├── Diary.vue
│   │   │   └── Settings.vue
│   │   ├── stores/            # Gestión de estado (Pinia)
│   │   ├── router/            # Configuración de rutas
│   │   └── utils/
│   │       ├── idb.js         # Utilidades IndexedDB
│   │       ├── api.js         # Cliente HTTP
│   │       └── sync.js        # Sincronización offline
│   └── package.json
├── server/                    # JSON Server
│   ├── db.json               # Base de datos JSON
│   └── package.json
└── package.json              # Configuración raíz
```

## Instalación y Ejecución

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Instalación Completa

```bash
# Clonar el repositorio
git clone https://github.com/Emaus025/NutriTrack.git
cd NutriTrack

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente  
cd ../client
npm install

# Volver a la raíz
cd ..
```

### Ejecución en Desarrollo

```bash
# Ejecutar servidor y cliente simultáneamente (desde la raíz)
npm run dev

# O ejecutar por separado:
# Terminal 1 - Servidor (puerto 3001)
cd server
npm run dev

# Terminal 2 - Cliente (puerto 5173)  
cd client
npm run dev
```

### Build de Producción

```bash
# Build del cliente
cd client
npm run build

# El build estará en client/dist/
```

## Configuración PWA

### Service Worker
El service worker implementa estrategias de caching para el funcionamiento offline:
- **App Shell Cache**: Elementos estáticos de la interfaz
- **Dynamic Content**: Datos de la aplicación
- **Offline Fallback**: Página personalizada sin conexión

### Web App Manifest
```json
{
  "name": "NutriTrack Pro",
  "short_name": "NutriTrack",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#22c55e",
  "theme_color": "#22c55e",
  "icons": [...]
}
```

## Gestión de Datos

### JSON Server (API Simulada)
La aplicación utiliza JSON Server para simular una API REST completa:

**Endpoints disponibles:**
- `GET /user` - Perfil de usuario
- `GET /meals` - Lista de comidas
- `POST /meals` - Agregar comida
- `GET /foodDatabase` - Base de datos de alimentos
- `GET /workouts` - Ejercicios registrados

### IndexedDB (Offline)
Para el funcionamiento offline, se implementa IndexedDB:
- **Almacenamiento local** de comidas y ejercicios
- **Sincronización** cuando recupera conexión
- **Operaciones CRUD** completas

## Vistas y Componentes

### App Shell
- **AppHeader**: Encabezado con navegación y acciones
- **AppMenu**: Menú lateral deslizante
- **AppFooter**: Pie de página con estado de conexión
- **SplashScreen**: Pantalla de inicio

### Vistas Principales
1. **Home**: Dashboard con resumen nutricional
2. **Diary**: Diario de alimentos y ejercicios
3. **AddMeal**: Formulario para agregar comidas
4. **Workout**: Registro de actividad física
5. **Settings**: Configuración de la aplicación

## Funcionalidades Offline

### Estrategias de Caching
1. **Cache First**: Para el App Shell (HTML, CSS, JS)
2. **Network First**: Para datos de APIs
3. **Stale-While-Revalidate**: Para contenido dinámico

### Sincronización
- **Cola de operaciones** pendientes
- **Sincronización automática** al recuperar conexión
- **Gestión de conflictos**

## Testing y Desarrollo

### Probar Funcionalidad Offline
1. **Abrir DevTools** (F12)
2. **Ir a Application → Service Workers**
3. **Marcar "Offline" en la pestaña Network**
4. **Recargar la página** - Debe cargar desde cache

### Verificar Caching
1. **DevTools → Application → Cache Storage**
2. **Verificar** `nutritrack-shell-v1` y `nutritrack-content-v1`
3. **Inspeccionar** archivos cacheados

### Auditoría PWA
```bash
# Ejecutar Lighthouse
npm run build
# Usar extensión Lighthouse o PageSpeed Insights
```

## Usuario Demo

La aplicación utiliza un usuario predefinido para demostración:
- **Nombre**: Alex García
- **Email**: alex@ejemplo.com  
- **Objetivos**: 2200 calorías diarias, 150g proteína

## Instalación como PWA

1. **Abrir** la aplicación en el navegador
2. **Buscar** el icono de instalación en la barra de URL
3. **Hacer clic** en "Instalar NutriTrack Pro"
4. **La aplicación** se instalará como una app nativa

## Ciclo de Vida del Service Worker

1. **Registro**: Descarga e inicialización
2. **Instalación**: Caching de recursos críticos
3. **Activación**: Limpieza y toma de control
4. **Fetch**: Interceptación de peticiones de red

## Solución de Problemas

### Service Worker No Se Registra
- Verificar que el archivo `sw.js` esté en `public/`
- Revisar la consola para errores de sintaxis

### No Funciona Offline
- Verificar que los recursos estén en la lista de caching
- Revisar la pestaña Cache Storage en DevTools

### Datos No Persisten
- Verificar conexión con JSON Server
- Revisar operaciones de IndexedDB en la consola

## Scripts Disponibles

**En la raíz:**
- `npm run dev` - Ejecutar cliente y servidor
- `npm run install:all` - Instalar todas las dependencias

**En /client:**
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Previsualizar build

**En /server:**
- `npm run dev` - Ejecutar JSON Server



**¡Disfruta usando NutriTrack Pro! 🎉**
