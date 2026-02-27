CREATE TABLE IF NOT EXISTS tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL,
  progress INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_tasks_document FOREIGN KEY (document_id) REFERENCES documents(id)
);
