x#!/bin/bash

# Script para ejecutar Docker Compose con variables de entorno de Amadeus
# Uso: ./run-docker.sh [comando]
# Ejemplos:
#   ./run-docker.sh up -d
#   ./run-docker.sh build
#   ./run-docker.sh down

# Verificar que las variables estén definidas
if [ -z "$AMADEUS_CLIENT_ID" ] || [ -z "$AMADEUS_CLIENT_SECRET" ]; then
    echo "❌ Error: Las variables AMADEUS_CLIENT_ID y AMADEUS_CLIENT_SECRET deben estar definidas"
    echo "Ejecuta primero:"
    echo "export AMADEUS_CLIENT_ID=tu_client_id"
    echo "export AMADEUS_CLIENT_SECRET=tu_client_secret"
    echo ""
    echo "O crea un archivo .env en la raíz del proyecto con:"
    echo "AMADEUS_CLIENT_ID=tu_client_id"
    echo "AMADEUS_CLIENT_SECRET=tu_client_secret"
    exit 1
fi

echo "✅ Variables de entorno detectadas:"
echo "AMADEUS_CLIENT_ID: ${AMADEUS_CLIENT_ID:0:8}..."
echo "AMADEUS_CLIENT_SECRET: ${AMADEUS_CLIENT_SECRET:0:8}..."

# Ejecutar docker-compose con las variables de entorno
AMADEUS_CLIENT_ID=$AMADEUS_CLIENT_ID AMADEUS_CLIENT_SECRET=$AMADEUS_CLIENT_SECRET docker-compose "$@"