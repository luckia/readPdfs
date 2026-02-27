# Backend Task A/B/C Skeleton

## Modules
- common-contract
- bff-service (WebFlux + SSE)
- document-service (Spring Web + JPA + MyBatis + Flyway)
- extraction-service (Spring Web + JPA + MyBatis + Flyway)
- ocr-worker-service

## Environment
- Java 21+
- Maven 3.9+
- MySQL 8.4
- Optional frontend env:
  - `VITE_DOCUMENT_SERVICE_URL=http://localhost:8081`

## Run locally (Task C path)
```bash
cd backend
mvn -pl extraction-service -am spring-boot:run
mvn -pl document-service -am spring-boot:run
```

Default ports:
- document-service: `8081`
- extraction-service: `8082`

## Task C API flow
```bash
# 1) Upload PDF metadata
curl -X POST http://localhost:8081/api/v1/documents \
  -F "file=@/absolute/path/to/sample.pdf;type=application/pdf"

# response includes documentId + taskId

# 2) Trigger text-layer extraction
curl -X POST http://localhost:8081/api/v1/documents/{documentId}/extract-text

# 3) Query extraction task progress
curl http://localhost:8081/api/v1/tasks/{taskId}

# 4) Query document status
curl http://localhost:8081/api/v1/documents/{documentId}
```

## Testing
```bash
# frontend build
npm run build

# document-service integration tests (Testcontainers)
cd backend
mvn -pl document-service test
```

## Docker Compose
```bash
cd backend
docker compose up --build
```
