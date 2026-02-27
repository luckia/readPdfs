# Backend Task A/B Skeleton

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
mvn -pl document-service -am spring-boot:run
```

## Task B API smoke test
```bash
# Upload PDF metadata (document-service on 8081)
curl -X POST http://localhost:8081/api/v1/documents \
  -F "file=@/absolute/path/to/sample.pdf;type=application/pdf"

# Query by id
curl http://localhost:8081/api/v1/documents/{id}
```

## Frontend integration
Set optional frontend env to point to document-service:
```bash
VITE_DOCUMENT_SERVICE_URL=http://localhost:8081
```

## Docker Compose
```bash
cd backend
docker compose up --build
```

SSE endpoint:
- `GET http://localhost:8080/api/v1/tasks/{taskId}/events`
