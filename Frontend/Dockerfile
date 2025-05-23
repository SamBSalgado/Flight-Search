# Dockerfile para Frontend React + Vite + TypeScript
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

COPY zscaler.crt /usr/local/share/ca-certificates/zscaler.crt

RUN apk add --no-cache ca-certificates && update-ca-certificates

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar archivos construidos al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando de entrada por defecto
CMD ["nginx", "-g", "daemon off;"]