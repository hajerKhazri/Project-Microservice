# FreeLink Front

Angular front-end for the skills microservice project.

## Architecture

- Front: `http://localhost:4200`
- Gateway: `http://localhost:8081`
- Eureka: `http://localhost:8761`
- Skills service: registered in Eureka as `skills-service`

The Angular service calls the gateway at `http://localhost:8081/skills`. The gateway route forwards `/skills/**` to `lb://skills-service` through Eureka.

The advanced skills page now works with a single enriched `skills` entity:

- certificate type, name and expiration are stored directly in `skills`
- certificate status is computed automatically
- score is computed automatically
- badge is computed automatically
- PDF export uses the computed skill summary

## Start

From this folder:

```powershell
npm install
npm start
```

Start the backend first:

```powershell
cd "..\MICROSERVICE PROJET ESSAYE PERSONNEL\eurekaserver\eurekaserver"
.\mvnw.cmd spring-boot:run

cd "..\..\getwayserver\getwayserver"
.\mvnw.cmd spring-boot:run

cd "..\..\microservice\microservice"
.\mvnw.cmd spring-boot:run
```

Then open `http://localhost:4200/skills`.
