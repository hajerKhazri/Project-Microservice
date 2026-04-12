# 1. Image Java
FROM eclipse-temurin:17-jre

# 2. Dossier de travail
WORKDIR /app

# 3. Copier le jar genere et le renommer dans le conteneur
COPY target/microservice-0.0.1-SNAPSHOT.jar app.jar

# 4. Exposer le port du microservice
EXPOSE 8085

# 5. Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
