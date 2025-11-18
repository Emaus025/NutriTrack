#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${1:-ghcr.io/owner/repo:latest}"

# Paths Nginx
UPSTREAM_DIR="/etc/nginx/conf.d"
ACTIVE_LINK="${UPSTREAM_DIR}/nutritrack_upstream_active.conf"
BLUE_CONF="${UPSTREAM_DIR}/nutritrack_upstream_blue.conf"
GREEN_CONF="${UPSTREAM_DIR}/nutritrack_upstream_green.conf"

# Detección del color activo
ACTIVE_COLOR="none"
if [ -L "$ACTIVE_LINK" ]; then
  TARGET="$(readlink -f "$ACTIVE_LINK" || true)"
  if [[ "$TARGET" == "$BLUE_CONF" ]]; then
    ACTIVE_COLOR="blue"
  elif [[ "$TARGET" == "$GREEN_CONF" ]]; then
    ACTIVE_COLOR="green"
  fi
fi

# Decidir color de despliegue (el inactivo)
if [ "$ACTIVE_COLOR" == "blue" ]; then
  DEPLOY_COLOR="green"
  FRONT_PORT=4000
  API_PORT=4001
  CONTAINER_NAME="nutritrack-green"
elif [ "$ACTIVE_COLOR" == "green" ]; then
  DEPLOY_COLOR="blue"
  FRONT_PORT=3000
  API_PORT=3001
  CONTAINER_NAME="nutritrack-blue"
else
  # Primer despliegue: usar blue
  DEPLOY_COLOR="blue"
  FRONT_PORT=3000
  API_PORT=3001
  CONTAINER_NAME="nutritrack-blue"
fi

echo "Activo: $ACTIVE_COLOR, desplegando: $DEPLOY_COLOR, contenedor: $CONTAINER_NAME"

# Login a GHCR (requiere $REGISTRY_USER y $REGISTRY_TOKEN en entorno)
echo "$REGISTRY_TOKEN" | docker login ghcr.io -u "$REGISTRY_USER" --password-stdin

# Pull de la imagen
docker pull "$IMAGE_TAG"

# Parar/eliminar previo del color de despliegue si existe
docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

# Ejecutar nuevo contenedor del color de despliegue
docker run -d --name "$CONTAINER_NAME" --restart=always \
  -p 127.0.0.1:${FRONT_PORT}:${FRONT_PORT} \
  -p 127.0.0.1:${API_PORT}:${API_PORT} \
  "$IMAGE_TAG"

# Health-check frontend
for i in {1..30}; do
  if curl -fs "http://127.0.0.1:${FRONT_PORT}" >/dev/null; then
    echo "Health-check OK en puerto ${FRONT_PORT}"
    break
  fi
  echo "Esperando servicio en puerto ${FRONT_PORT} (intento ${i})..."
  sleep 2
done

# Alternar upstream activo
if [ "$DEPLOY_COLOR" == "blue" ]; then
  ln -sfn "$BLUE_CONF" "$ACTIVE_LINK"
else
  ln -sfn "$GREEN_CONF" "$ACTIVE_LINK"
fi

# Recargar Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "Blue-Green alternado a ${DEPLOY_COLOR}. Nginx recargado."
# Opcional: parar contenedor del color anterior (rollback más difícil si se detiene)
# docker stop "nutritrack-${ACTIVE_COLOR}" || true