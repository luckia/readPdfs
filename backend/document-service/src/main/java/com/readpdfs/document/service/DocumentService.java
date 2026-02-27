package com.readpdfs.document.service;

import com.readpdfs.document.api.dto.DocumentDetailsResponse;
import com.readpdfs.document.api.dto.DocumentUploadResponse;
import com.readpdfs.document.api.dto.TaskStatusResponse;
import com.readpdfs.document.api.dto.TriggerExtractionResponse;
import com.readpdfs.document.domain.DocumentEntity;
import com.readpdfs.document.domain.DocumentRepository;
import com.readpdfs.document.domain.TaskEntity;
import com.readpdfs.document.domain.TaskRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {

  private static final String SOURCE_UPLOAD = "UPLOAD";
  private static final String STATUS_PENDING = "PENDING";
  private static final String STATUS_EXTRACTING = "EXTRACTING";
  private static final String STATUS_READY = "READY";
  private static final String UPLOAD_STATUS_UPLOADED = "UPLOADED";

  private final DocumentRepository repository;
  private final TaskRepository taskRepository;
  private final RestClient restClient;

  public DocumentService(
      DocumentRepository repository,
      TaskRepository taskRepository,
      @Value("${services.extraction.base-url:http://localhost:8082}") String extractionBaseUrl) {
    this.repository = repository;
    this.taskRepository = taskRepository;
    this.restClient = RestClient.builder().baseUrl(extractionBaseUrl).build();
  }

  public DocumentUploadResponse upload(MultipartFile file) {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("Uploaded file is empty.");
    }

    var contentType = file.getContentType();
    if (contentType == null || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(contentType)) {
      throw new IllegalArgumentException("Only PDF files are supported.");
    }

    var now = OffsetDateTime.now(ZoneOffset.UTC);
    var entity = new DocumentEntity();
    entity.setFileName(file.getOriginalFilename() == null ? "unknown.pdf" : file.getOriginalFilename());
    entity.setFileSize(file.getSize());
    entity.setContentType(contentType);
    entity.setStorageKey(buildStorageKey(entity.getFileName()));
    entity.setSource(SOURCE_UPLOAD);
    entity.setUploadStatus(UPLOAD_STATUS_UPLOADED);
    entity.setStatus(STATUS_PENDING);
    entity.setCreatedAt(now);
    entity.setUpdatedAt(now);
    var saved = repository.save(entity);

    var task = new TaskEntity();
    task.setDocumentId(saved.getId());
    task.setStatus(STATUS_PENDING);
    task.setProgress(0);
    task.setMessage("Waiting for extraction");
    task.setCreatedAt(now);
    task.setUpdatedAt(now);
    var savedTask = taskRepository.save(task);

    return new DocumentUploadResponse(
        saved.getId(),
        savedTask.getId(),
        saved.getFileName(),
        saved.getFileSize(),
        saved.getContentType(),
        saved.getStorageKey(),
        saved.getUploadStatus());
  }

  public DocumentDetailsResponse getById(long id) {
    var entity = repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
    return map(entity);
  }

  public TaskStatusResponse getTask(long taskId) {
    var task = taskRepository.findById(taskId)
        .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
    return mapTask(task);
  }

  public TriggerExtractionResponse triggerExtraction(long documentId) {
    var document = repository.findById(documentId)
        .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
    var task = taskRepository.findByDocumentId(documentId)
        .orElseThrow(() -> new IllegalArgumentException("Task not found for document: " + documentId));

    updateTask(task, STATUS_EXTRACTING, 15, "Text-layer extraction started");
    document.setStatus(STATUS_EXTRACTING);
    document.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
    repository.save(document);

    var extractionResponse = restClient.post()
        .uri("/api/v1/extractions/text-layer")
        .contentType(MediaType.APPLICATION_JSON)
        .body(new ExtractionRequest(documentId, task.getId(), document.getFileName()))
        .retrieve()
        .body(ExtractionResponse.class);

    var extractedWordCount = extractionResponse == null ? 0 : extractionResponse.wordCount();

    updateTask(task, STATUS_READY, 100, "Text-layer extraction completed");
    document.setStatus(STATUS_READY);
    document.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
    repository.save(document);

    return new TriggerExtractionResponse(document.getId(), task.getId(), document.getStatus(), task.getProgress(), extractedWordCount);
  }

  private void updateTask(TaskEntity task, String status, int progress, String message) {
    task.setStatus(status);
    task.setProgress(progress);
    task.setMessage(message);
    task.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
    taskRepository.save(task);
  }

  private static String buildStorageKey(String fileName) {
    var normalized = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    return "documents/" + UUID.randomUUID() + "-" + normalized;
  }

  private static DocumentDetailsResponse map(DocumentEntity entity) {
    return new DocumentDetailsResponse(
        entity.getId(),
        entity.getFileName(),
        entity.getFileSize(),
        entity.getContentType(),
        entity.getStorageKey(),
        entity.getSource(),
        entity.getUploadStatus(),
        entity.getStatus(),
        entity.getCreatedAt(),
        entity.getUpdatedAt());
  }

  private static TaskStatusResponse mapTask(TaskEntity task) {
    return new TaskStatusResponse(task.getId(), task.getDocumentId(), task.getStatus(), task.getProgress(), task.getMessage());
  }

  private record ExtractionRequest(Long documentId, Long taskId, String textLayerContent) {}
  private record ExtractionResponse(Long documentId, Long taskId, int wordCount, String status) {}
}
