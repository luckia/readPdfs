package com.readpdfs.document;

import static org.assertj.core.api.Assertions.assertThat;

import com.readpdfs.document.domain.DocumentEntity;
import com.readpdfs.document.domain.DocumentRepository;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest
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
  private DocumentRepository repository;

  @Test
  void shouldPersistDocumentEntity() {
    var entity = new DocumentEntity();
    entity.setFileName("sample.pdf");
    entity.setFileSize(1024L);
    entity.setStatus("PENDING");
    entity.setCreatedAt(OffsetDateTime.now());
    entity.setUpdatedAt(OffsetDateTime.now());

    var saved = repository.save(entity);

    assertThat(saved.getId()).isNotNull();
    assertThat(repository.findById(saved.getId())).isPresent();
  }
}
