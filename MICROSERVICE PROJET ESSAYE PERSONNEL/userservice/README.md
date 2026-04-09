# User Service

Microservice Django REST pour la gestion generale des utilisateurs.

## Stack

- Django
- Django REST Framework
- PostgreSQL
- Docker

## Endpoints

- `GET /api/health/`
- `GET /api/users/`
- `POST /api/users/`
- `GET /api/users/{id}/`
- `PUT /api/users/{id}/`
- `PATCH /api/users/{id}/`
- `DELETE /api/users/{id}/`

## Lancement avec Docker

```powershell
cd "C:\Users\user\Desktop\projet microservice\MICROSERVICE_PROJET_LIAISON_MYSQL\MICROSERVICE PROJET ESSAYE PERSONNEL\userservice"
docker compose up --build
```

Le service sera disponible sur `http://localhost:8000/api/users/`.
