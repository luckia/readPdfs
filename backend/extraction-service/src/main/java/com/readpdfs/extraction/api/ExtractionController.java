package com.readpdfs.extraction.api;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/extractions")
public class ExtractionController {

  @GetMapping("/skeleton")
  public Map<String, String> skeleton() {
    return Map.of("service", "extraction-service", "status", "ready");
  }
}
