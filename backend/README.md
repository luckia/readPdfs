# Backend Task A Skeleton

## Modules
- common-contract
- bff-service (WebFlux + SSE)
- document-service (Spring Web + JPA + MyBatis + Flyway)
- extraction-service (Spring Web + JPA + MyBatis + Flyway)
- ocr-worker-service

## Run locally
```bash
cd backend
mvn clean test
mvn -pl bff-service,document-service,extraction-service,ocr-worker-service -am spring-boot:run
```

## Docker Compose
```bash
cd backend
docker compose up --build
```

SSE endpoint:
- `GET http://localhost:8080/api/v1/tasks/{taskId}/events`
