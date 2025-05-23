# Dockerfile para Backend Spring Boot
FROM openjdk:17-jdk-slim as builder

# Establecer directorio de trabajo
WORKDIR /app

COPY zscaler.crt /usr/local/share/ca-certificates/zscaler.crt

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copiar archivos de Gradle
COPY gradle/ gradle/
COPY gradlew .
COPY gradlew.bat .
COPY build.gradle .
COPY settings.gradle .

# Dar permisos de ejecución al gradlew
RUN chmod +x gradlew

# Copiar código fuente
COPY src/ src/

# Construir la aplicación
RUN ./gradlew clean build -x test

# Etapa final
FROM openjdk:17-jdk-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar el JAR construido desde la etapa anterior
COPY --from=builder /app/build/libs/*.jar app.jar

# Exponer el puerto 8080
EXPOSE 8080

# Comando de entrada
ENTRYPOINT ["java", "-jar", "app.jar"]