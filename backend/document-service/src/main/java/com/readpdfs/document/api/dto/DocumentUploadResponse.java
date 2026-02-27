package com.readpdfs.document.api.dto;

public record DocumentUploadResponse(
    Long documentId,
    String fileName,
    long fileSize,
    String contentType,
    String storageKey,
    String status
) {
}
