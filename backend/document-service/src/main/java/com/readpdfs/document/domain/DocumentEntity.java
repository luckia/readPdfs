package com.readpdfs.document.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "documents")
public class DocumentEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String fileName;

  @Column(nullable = false)
  private long fileSize;

  @Column(nullable = false, length = 64)
  private String status;

  @Column(nullable = false, length = 512)
  private String storageKey;

  @Column(nullable = false, length = 128)
  private String contentType;

  @Column(nullable = false, length = 32)
  private String source;

  @Column(nullable = false, length = 32)
  private String uploadStatus;

  @Column(nullable = false)
  private OffsetDateTime createdAt;

  @Column(nullable = false)
  private OffsetDateTime updatedAt;

  public Long getId() { return id; }
  public String getFileName() { return fileName; }
  public void setFileName(String fileName) { this.fileName = fileName; }
  public long getFileSize() { return fileSize; }
  public void setFileSize(long fileSize) { this.fileSize = fileSize; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public String getStorageKey() { return storageKey; }
  public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
  public String getContentType() { return contentType; }
  public void setContentType(String contentType) { this.contentType = contentType; }
  public String getSource() { return source; }
  public void setSource(String source) { this.source = source; }
  public String getUploadStatus() { return uploadStatus; }
  public void setUploadStatus(String uploadStatus) { this.uploadStatus = uploadStatus; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
