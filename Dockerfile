FROM node:18-alpine

WORKDIR /app

# Copiamos package.json de raíz y del cliente para instalar deps en caché
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

# Instalación de dependencias
RUN npm ci && cd client && npm ci

# Copiamos el resto del código
COPY . .

# Build del cliente (genera client/dist)
RUN npm run build

# Exponemos puertos: 3000 (cliente) y 3001 (API json-server)
EXPOSE 3000 3001

# Arrancamos ambos servicios en paralelo
CMD ["npm", "start"]