# 1. Image Java (JDK)
FROM openjdk:corretto-17.0.12

# 2. Dossier de travail
WORKDIR /app

# 3. Copier le jar et le renommer
ADD service-projet-0.0.1-SNAPSHOT.jar app.jar

# 4. Exposer le port du microservice
EXPOSE 8086

# 5. Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]