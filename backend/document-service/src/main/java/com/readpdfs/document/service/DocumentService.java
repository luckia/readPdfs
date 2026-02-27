package com.readpdfs.document.service;

import com.readpdfs.document.api.dto.DocumentDetailsResponse;
import com.readpdfs.document.api.dto.DocumentUploadResponse;
import com.readpdfs.document.domain.DocumentEntity;
import com.readpdfs.document.domain.DocumentRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {

  private static final String SOURCE_UPLOAD = "UPLOAD";
  private static final String STATUS_PENDING = "PENDING";
  private static final String UPLOAD_STATUS_UPLOADED = "UPLOADED";

  private final DocumentRepository repository;

  public DocumentService(DocumentRepository repository) {
    this.repository = repository;
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

    return new DocumentUploadResponse(
        saved.getId(),
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
}
