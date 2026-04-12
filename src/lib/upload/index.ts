export * from './chunker';
export * from './types';

/**
 * Main entry point for the upload library.
 * Provides high-level orchestration for chunked uploads.
 */
export class UploadManager {
  constructor(private apiBase: string) {}

  async initUpload(file: File, options: { folderId?: string } = {}) {
    const response = await fetch(`${this.apiBase}/upload/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        ...options
      }),
    });
    return response.json();
  }

  async getPartUrl(uploadId: string, partNumber: number) {
    const response = await fetch(`${this.apiBase}/upload/${uploadId}/part?partNumber=${partNumber}`);
    return response.json();
  }

  async completeUpload(uploadId: string, parts: { partNumber: number; etag: string }[]) {
    const response = await fetch(`${this.apiBase}/upload/${uploadId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parts }),
    });
    return response.json();
  }

  async abortUpload(uploadId: string) {
    await fetch(`${this.apiBase}/upload/${uploadId}`, { method: 'DELETE' });
  }

  async getUploadStatus(uploadId: string) {
    const response = await fetch(`${this.apiBase}/upload/${uploadId}`);
    return response.json();
  }
}
