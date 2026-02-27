package com.readpdfs.document;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.readpdfs.document.domain.DocumentRepository;
import com.readpdfs.document.domain.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(properties = "services.extraction.base-url=http://localhost:65535")
@AutoConfigureMockMvc
class DocumentServiceIntegrationTest {

  @Container
  static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
      .withDatabaseName("readpdfs_document")
      .withUsername("readpdfs")
      .withPassword("readpdfs");

  @DynamicPropertySource
  static void registerProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
    registry.add("spring.datasource.username", MYSQL::getUsername);
    registry.add("spring.datasource.password", MYSQL::getPassword);
  }

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private DocumentRepository repository;

  @Autowired
  private TaskRepository taskRepository;

  @Test
  void shouldUploadAndQueryDocumentAndTask() throws Exception {
    var file = new MockMultipartFile(
        "file",
        "sample.pdf",
        MediaType.APPLICATION_PDF_VALUE,
        "%PDF-1.7 sample".getBytes());

    var upload = mockMvc.perform(multipart("/api/v1/documents").file(file))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.documentId").isNumber())
        .andExpect(jsonPath("$.taskId").isNumber())
        .andExpect(jsonPath("$.fileName").value("sample.pdf"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    var docId = Long.parseLong(upload.replaceAll(".*\"documentId\":(\\d+).*", "$1"));
    var taskId = Long.parseLong(upload.replaceAll(".*\"taskId\":(\\d+).*", "$1"));

    mockMvc.perform(get("/api/v1/documents/{id}", docId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.documentId").value(docId));

    mockMvc.perform(get("/api/v1/tasks/{taskId}", taskId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.taskId").value(taskId))
        .andExpect(jsonPath("$.progress").value(0));
  }

  @Test
  void shouldRejectNonPdfFile() throws Exception {
    var file = new MockMultipartFile("file", "sample.txt", MediaType.TEXT_PLAIN_VALUE, "abc".getBytes());

    mockMvc.perform(multipart("/api/v1/documents").file(file))
        .andExpect(status().isBadRequest())
        .andExpect(content().string(containsString("Only PDF files are supported.")));
  }

  @Test
  void shouldPersistUploadedMetadataAndTask() throws Exception {
    var file = new MockMultipartFile("file", "persist.pdf", MediaType.APPLICATION_PDF_VALUE, "%PDF".getBytes());

    mockMvc.perform(multipart("/api/v1/documents").file(file))
        .andExpect(status().isCreated());

    org.assertj.core.api.Assertions.assertThat(repository.findAll()).isNotEmpty();
    org.assertj.core.api.Assertions.assertThat(taskRepository.findAll()).isNotEmpty();
  }

  @Test
  void shouldFailExtractionWhenServiceUnavailable() throws Exception {
    var file = new MockMultipartFile("file", "a.pdf", MediaType.APPLICATION_PDF_VALUE, "%PDF".getBytes());
    var upload = mockMvc.perform(multipart("/api/v1/documents").file(file))
        .andReturn().getResponse().getContentAsString();
    var docId = Long.parseLong(upload.replaceAll(".*\"documentId\":(\\d+).*", "$1"));

    mockMvc.perform(post("/api/v1/documents/{id}/extract-text", docId))
        .andExpect(status().is5xxServerError());
  }
}
