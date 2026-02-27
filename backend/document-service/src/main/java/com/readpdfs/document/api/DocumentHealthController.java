package com.readpdfs.document.api;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentHealthController {

  @GetMapping("/skeleton")
  public Map<String, String> skeleton() {
    return Map.of("service", "document-service", "status", "ready");
  }
}
