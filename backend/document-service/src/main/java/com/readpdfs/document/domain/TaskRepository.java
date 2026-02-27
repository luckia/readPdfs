package com.readpdfs.document.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
  Optional<TaskEntity> findByDocumentId(Long documentId);
}
