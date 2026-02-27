package com.readpdfs.ocrworker;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ocr")
public class OcrWorkerController {

  @GetMapping("/skeleton")
  public Map<String, String> skeleton() {
    return Map.of("service", "ocr-worker-service", "status", "ready");
  }
}
