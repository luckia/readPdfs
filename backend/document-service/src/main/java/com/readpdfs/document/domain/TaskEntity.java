package com.readpdfs.document.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tasks")
public class TaskEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long documentId;

  @Column(nullable = false, length = 32)
  private String status;

  @Column(nullable = false)
  private int progress;

  @Column(nullable = false, length = 255)
  private String message;

  @Column(nullable = false)
  private OffsetDateTime createdAt;

  @Column(nullable = false)
  private OffsetDateTime updatedAt;

  public Long getId() { return id; }
  public Long getDocumentId() { return documentId; }
  public void setDocumentId(Long documentId) { this.documentId = documentId; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public int getProgress() { return progress; }
  public void setProgress(int progress) { this.progress = progress; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
