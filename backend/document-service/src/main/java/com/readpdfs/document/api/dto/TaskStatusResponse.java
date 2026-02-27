package com.readpdfs.document.api.dto;

public record TaskStatusResponse(
    Long taskId,
    Long documentId,
    String status,
    int progress,
    String message
) {
}
