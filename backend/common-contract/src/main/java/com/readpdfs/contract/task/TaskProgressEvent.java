package com.readpdfs.contract.task;

import java.time.Instant;

public record TaskProgressEvent(
    String taskId,
    String status,
    int progress,
    String message,
    Instant timestamp
) {
}
