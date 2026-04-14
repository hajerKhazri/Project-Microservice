# 1. Image Java (JDK)
FROM amazoncorretto:17
# 2. Dossier de travail
WORKDIR /app
# 3. Copier le jar
COPY target/config-server-0.0.1-SNAPSHOT.jar app.jar
# 4. Exposer le port
EXPOSE 8888
# 5. Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
