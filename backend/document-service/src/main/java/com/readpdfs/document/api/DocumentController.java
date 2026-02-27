package com.readpdfs.document.api;

import com.readpdfs.document.api.dto.DocumentDetailsResponse;
import com.readpdfs.document.api.dto.DocumentUploadResponse;
import com.readpdfs.document.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

  private final DocumentService documentService;

  public DocumentController(DocumentService documentService) {
    this.documentService = documentService;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public DocumentUploadResponse upload(@RequestParam("file") MultipartFile file) {
    return documentService.upload(file);
  }

  @GetMapping("/{id}")
  public DocumentDetailsResponse getById(@PathVariable long id) {
    return documentService.getById(id);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String handleBadRequest(IllegalArgumentException exception) {
    return exception.getMessage();
  }
}
