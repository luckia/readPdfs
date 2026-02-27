export type UploadedDocument = {
  documentId: number;
  taskId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  storageKey: string;
  status: string;
};

export type TaskStatus = {
  taskId: number;
  documentId: number;
  status: string;
  progress: number;
  message: string;
};

const DOCUMENT_SERVICE_BASE_URL =
  (import.meta.env.VITE_DOCUMENT_SERVICE_URL as string | undefined)?.trim() ||
  'http://localhost:8081';

export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${DOCUMENT_SERVICE_BASE_URL}/api/v1/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Upload failed with status ${response.status}`);
  }

  return (await response.json()) as UploadedDocument;
}

export async function triggerExtraction(documentId: number): Promise<void> {
  const response = await fetch(`${DOCUMENT_SERVICE_BASE_URL}/api/v1/documents/${documentId}/extract-text`, {
    method: 'POST',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Extraction trigger failed with status ${response.status}`);
  }
}

export async function getTaskStatus(taskId: number): Promise<TaskStatus> {
  const response = await fetch(`${DOCUMENT_SERVICE_BASE_URL}/api/v1/tasks/${taskId}`);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Task query failed with status ${response.status}`);
  }
  return (await response.json()) as TaskStatus;
}
