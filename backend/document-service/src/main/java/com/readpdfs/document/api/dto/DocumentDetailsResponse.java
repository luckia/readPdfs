package com.readpdfs.document.api.dto;

import java.time.OffsetDateTime;

public record DocumentDetailsResponse(
    Long documentId,
    String fileName,
    long fileSize,
    String contentType,
    String storageKey,
    String source,
    String uploadStatus,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
