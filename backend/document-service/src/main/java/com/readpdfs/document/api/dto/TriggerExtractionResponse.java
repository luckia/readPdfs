package com.readpdfs.document.api.dto;

public record TriggerExtractionResponse(
    Long documentId,
    Long taskId,
    String documentStatus,
    int progress,
    int extractedWordCount
) {
}
