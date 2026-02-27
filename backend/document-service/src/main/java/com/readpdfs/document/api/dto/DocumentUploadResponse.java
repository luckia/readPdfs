package com.readpdfs.document.api.dto;

public record DocumentUploadResponse(
    Long documentId,
    Long taskId,
    String fileName,
    long fileSize,
    String contentType,
    String storageKey,
    String status
) {
}
