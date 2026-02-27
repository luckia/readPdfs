package com.readpdfs.extraction.api;

import java.util.Arrays;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/extractions")
public class ExtractionController {

  @GetMapping("/skeleton")
  public Map<String, String> skeleton() {
    return Map.of("service", "extraction-service", "status", "ready");
  }

  @PostMapping("/text-layer")
  public ExtractionResponse extractTextLayer(@RequestBody ExtractionRequest request) {
    var content = request.textLayerContent() == null ? "" : request.textLayerContent();
    var wordCount = (int) Arrays.stream(content.trim().split("\\s+"))
        .filter(token -> !token.isBlank())
        .count();
    return new ExtractionResponse(request.documentId(), request.taskId(), wordCount, "EXTRACTED");
  }

  public record ExtractionRequest(Long documentId, Long taskId, String textLayerContent) {}

  public record ExtractionResponse(Long documentId, Long taskId, int wordCount, String status) {}
}
