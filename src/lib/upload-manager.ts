import { useRef } from 'react';
import type { RushFile } from '@/lib/types.js';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadTask {
  file: File;
  controller: AbortController;
}

export class UploadManager {
  private activeUploads: Map<File, UploadTask> = new Map();

  async uploadFile(
    file: File,
    folderId: number | undefined,
    onProgress: (pct: number) => void
  ): Promise<RushFile> {
    const controller = new AbortController();
    this.activeUploads.set(file, { file, controller });

    try {
      // 1. Initial POST to get session
      const sessionRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: file.name,
          total_bytes: file.size,
          mime_type: file.type,
          folder_id: folderId,
        }),
        signal: controller.signal,
      });

      if (!sessionRes.ok) throw new Error('Failed to initiate upload session');
      const { session_id } = await sessionRes.json() as { session_id: string };

      // 2. Upload chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const parts: { partNumber: number; etag: string }[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const partRes = await fetch(`/api/upload/${session_id}/part?partNumber=${i + 1}`, {
          method: 'PUT',
          body: chunk,
          signal: controller.signal,
        });

        if (!partRes.ok) throw new Error(`Failed to upload chunk ${i + 1}`);
        const etag = partRes.headers.get('ETag');
        if (!etag) throw new Error('Missing ETag from chunk upload');
        
        parts.push({ partNumber: i + 1, etag });
        
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      // 3. Complete upload
      const completeRes = await fetch(`/api/upload/${session_id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts }),
        signal: controller.signal,
      });

      if (!completeRes.ok) throw new Error('Failed to complete upload');
      const rushFile: RushFile = await completeRes.json();

      this.activeUploads.delete(file);
      return rushFile;
    } catch (error) {
      this.activeUploads.delete(file);
      throw error;
    }
  }

  cancelUpload(file: File) {
    const task = this.activeUploads.get(file);
    if (task) {
      task.controller.abort();
      this.activeUploads.delete(file);
    }
  }
}

// Singleton instance
export const uploadManager = new UploadManager();
