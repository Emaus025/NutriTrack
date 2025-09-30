# NutriTrack - Aplicación Web Progresiva

## Descripción
NutriTrack es una aplicación web progresiva (PWA) para el seguimiento y control de la nutrición personal. Permite a los usuarios registrar sus comidas diarias, escanear códigos de barras de productos alimenticios, consultar información nutricional y mantener un registro de su consumo calórico y de macronutrientes, incluso en condiciones sin conexión a internet.

## Características Principales

### Pantallas de Splash y Home
- **Splash Screen**: Pantalla de carga inicial con el logo de la aplicación
- **Home**: Interfaz principal con acceso a todas las funcionalidades

### Vistas Generadas
- **Cliente**: Interfaz de usuario desarrollada con Vue.js
- **Servidor**: API REST para gestión de datos nutricionales

### Gestión de Datos
- **Datos Locales**: Almacenamiento en IndexedDB para funcionamiento offline
- **Datos Remotos**: Comunicación con API REST y Open Food Facts
- **Modo Offline**: Sincronización automática cuando se recupera la conexión

### Notificaciones
- Sistema de notificaciones push para recordatorios de comidas
- Alertas sobre el estado de sincronización de datos

### Uso de Elementos Físicos del Dispositivo
- **Cámara**: Escaneo de códigos de barras de productos alimenticios
- **Geolocalización**: Sugerencias de alimentos basadas en ubicación

## Tecnologías Utilizadas
- **Frontend**: Vue.js 3, Vite, Pinia, Service Workers
- **Backend**: Node.js, JSON Server
- **Almacenamiento**: IndexedDB, JSON
- **Escaneo de Códigos**: QuaggaJS
- **API Externa**: Open Food Facts

## Instalación y Ejecución

### Requisitos Previos
- Node.js (v14 o superior)
- NPM (v6 o superior)

### Cliente
```bash
# Navegar al directorio del cliente
cd client

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Servidor
```bash
# Navegar al directorio del servidor
cd server

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

## Funcionalidades Principales

### Registro de Comidas
- Añadir comidas con nombre, fecha y alimentos
- Cálculo automático de calorías y macronutrientes
- Visualización de historial por fecha

### Búsqueda de Alimentos
- Búsqueda por nombre en base de datos local y remota
- Escaneo de códigos de barras para identificación rápida
- Información nutricional detallada

### Funcionamiento Offline
- Almacenamiento local de datos
- Cola de sincronización para operaciones pendientes
- Sincronización automática al recuperar conexión

## Documentación
Para más detalles sobre la implementación técnica, consulta el [Manual Técnico](./manual_tecnico_nutritrack.pdf) incluido en este repositorio.

## Autor
Alfonso Esaú Leyva Pérez

## Licencia
Este proyecto es parte de un trabajo académico para la Universidad Tecnológica de Querétaro.
