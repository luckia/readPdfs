package com.readpdfs.document;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.readpdfs.document.domain.DocumentRepository;
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
@SpringBootTest
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

  @Test
  void shouldUploadAndQueryDocument() throws Exception {
    var file = new MockMultipartFile(
        "file",
        "sample.pdf",
        MediaType.APPLICATION_PDF_VALUE,
        "%PDF-1.7 sample".getBytes());

    var uploadResponse = mockMvc.perform(multipart("/api/v1/documents").file(file))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.documentId").isNumber())
        .andExpect(jsonPath("$.fileName").value("sample.pdf"))
        .andExpect(jsonPath("$.contentType").value(MediaType.APPLICATION_PDF_VALUE))
        .andExpect(jsonPath("$.storageKey", containsString("documents/")))
        .andReturn();

    var json = uploadResponse.getResponse().getContentAsString();
    var id = Long.parseLong(json.replaceAll(".*\"documentId\":(\\d+).*", "$1"));

    mockMvc.perform(get("/api/v1/documents/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.documentId").value(id))
        .andExpect(jsonPath("$.uploadStatus").value("UPLOADED"));
  }

  @Test
  void shouldRejectNonPdfFile() throws Exception {
    var file = new MockMultipartFile("file", "sample.txt", MediaType.TEXT_PLAIN_VALUE, "abc".getBytes());

    mockMvc.perform(multipart("/api/v1/documents").file(file))
        .andExpect(status().isBadRequest())
        .andExpect(content().string(containsString("Only PDF files are supported.")));
  }

  @Test
  void shouldPersistUploadedMetadata() throws Exception {
    var file = new MockMultipartFile("file", "persist.pdf", MediaType.APPLICATION_PDF_VALUE, "%PDF".getBytes());

    mockMvc.perform(multipart("/api/v1/documents").file(file))
        .andExpect(status().isCreated());

    var all = repository.findAll();
    org.assertj.core.api.Assertions.assertThat(all).isNotEmpty();
    org.assertj.core.api.Assertions.assertThat(all.get(0).getStorageKey()).contains("documents/");
  }
}
