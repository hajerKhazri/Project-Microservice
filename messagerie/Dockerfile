# 1. Image Java (JDK)
FROM openjdk:corretto-17.0.12

# 2. Dossier de travail
WORKDIR /app

# 3. Copier le jar et le renommer
ADD target/messagerie-0.0.1-SNAPSHOT.jar app.jar

# 4. Expose le port du microservice
EXPOSE 8085

# 5. Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
