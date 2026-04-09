PROJET MICROservices - VERSION MYSQL
================================

Contenu :
1) eurekaserver
2) getwayserver
3) microservice (skills-service)

Liaison faite entre les 3 projets :
- Eureka Server : port 8761
- API Gateway : port 8081
- Skills Service : port 8085

Base de donnees MySQL du microservice :
- Nom : microservice
- URL : jdbc:mysql://localhost:3306/microservice?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
- Username par defaut : root
- Password par defaut : vide

IMPORTANT :
Si votre mot de passe MySQL n'est pas vide, modifiez ce fichier :
microservice/microservice/src/main/resources/application.yaml

Ordre de lancement :
1. Lancer eurekaserver
2. Lancer getwayserver
3. Lancer microservice

Commandes Windows (dans chaque projet) :
- .\mvnw.cmd spring-boot:run

Verification :
- Eureka Dashboard : http://localhost:8761
- Skills via Gateway : http://localhost:8081/skills/all
- Front Angular : http://localhost:4200/skills

Exemples API :
GET    http://localhost:8081/skills/all
GET    http://localhost:8081/skills/1
POST   http://localhost:8081/skills/add
PUT    http://localhost:8081/skills/update
DELETE http://localhost:8081/skills/delete/1

Exemple JSON POST/PUT :
{
  "name": "Java",
  "level": "ADVANCED",
  "yearsOfExperience": 3,
  "description": "Good experience with Spring Boot",
  "certificateType": "CERTIFICATE",
  "certificateName": "Oracle Java Certification",
  "certificateExpiresAt": "2027-04-09"
}

Logique metier ajoutee dans skills-service :
- certificateStatus calcule automatiquement : NO_CERTIFICATE, VALID, EXPIRING_SOON, EXPIRED
- score calcule automatiquement a partir du niveau, des annees et du certificat
- badge calcule automatiquement : BEGINNER, ADVANCED, EXPERT, CERTIFIED_EXPERT
- le front Skills n'utilise plus proofs/portfolio et se concentre sur une seule entite skills enrichie
- RabbitMQ est desactive temporairement pour simplifier les tests front skills

Front Angular :
- Dossier : ..\front
- Installation : npm install
- Lancement : npm start
- API consommee par le front : http://localhost:8081/skills

Ordre complet recommande :
1. eurekaserver sur 8761
2. getwayserver sur 8081
3. microservice skills-service sur 8085
4. front Angular sur 4200
