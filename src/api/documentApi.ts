export type UploadedDocument = {
  documentId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  storageKey: string;
  status: string;
};

const DOCUMENT_SERVICE_BASE_URL =
  (import.meta.env.VITE_DOCUMENT_SERVICE_URL as string | undefined)?.trim() ||
  '';

export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;

  try {
    response = await fetch(`${DOCUMENT_SERVICE_BASE_URL}/api/v1/documents`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    const detail = error instanceof Error && error.message ? ` (${error.message})` : '';
    throw new Error(
      `无法连接到文档服务 ${DOCUMENT_SERVICE_BASE_URL}。请先启动后端服务，或检查 VITE_DOCUMENT_SERVICE_URL 配置。${detail}`
    );
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Upload failed with status ${response.status}`);
  }

  return (await response.json()) as UploadedDocument;
}
