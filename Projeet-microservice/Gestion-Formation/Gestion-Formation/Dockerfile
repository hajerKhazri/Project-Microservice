# 1. Image Java (JDK 17)
FROM amazoncorretto:17

# 2. Dossier de travail
WORKDIR /app

# 3. Copier le fichier JAR généré
COPY target/gestion-formation-0.0.1-SNAPSHOT.jar app.jar

# 4. Exposer le port du microservice
EXPOSE 8083

# 5. Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]