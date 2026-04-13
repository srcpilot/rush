export type UploadProgress = {
  fileName: string;
  loaded: number;
  total: number;
  percent: number;
  status: 'uploading' | 'complete' | 'error';
};

export class UploadManager {
  private token: string;
  private baseUrl: string;
  private chunkSize: number;

  constructor(token: string, baseUrl: string, chunkSize: number = 5 * 1024 * 1024) {
    this.token = token;
    this.baseUrl = baseUrl;
    this.chunkSize = chunkSize;
  }

  async upload(
    file: File,
    folderId?: number,
    onProgress?: (p: UploadProgress) => void
  ): Promise<import('./rush-file').RushFile> {
    const fileName = file.name;
    let loaded = 0;
    const total = file.size;

    try {
      // 1. Initialize upload session
      const initRes = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          fileName,
          mimeType: file.type,
          size: total,
          folderId
        })
      });

      if (!initRes.ok) throw new Error('Failed to initialize upload');
      const { uploadId } = await initRes.json();

      // 2. Upload chunks
      const totalChunks = Math.ceil(total / this.chunkSize);
      const parts: { partNumber: number; etag: string }[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * this.chunkSize;
        const end = Math.min(start + this.chunkSize, total);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        const formData = new FormData();
        formData.append('chunk', chunk);

        const partRes = await fetch(`${this.baseUrl}/api/upload/${uploadId}/part?part_number=${partNumber}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: chunk // Using raw body for binary upload as per spec
        });

        if (!partRes.ok) throw new Error(`Failed to upload part ${partNumber}`);
        
        const etag = partRes.headers.get('ETag');
        if (!etag) throw new Error('No ETag returned from part upload');
        parts.push({ partNumber, etag: etag.replace(/"/g, '') });

        loaded = end;
        if (onProgress) {
          onProgress({
            fileName,
            loaded,
            total,
            percent: Math.round((loaded / total) * 100),
            status: 'uploading'
          });
        }
      }

      // 3. Complete upload
      const completeRes = await fetch(`${this.baseUrl}/api/upload/${uploadId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ parts })
      });

      if (!completeRes.ok) throw new Error('Failed to complete upload');
      const fileData = await completeRes.json();

      if (onProgress) {
        onProgress({
          fileName,
          loaded: total,
          total,
          percent: 100,
          status: 'complete'
        });
      }

      return fileData as import('./rush-file').RushFile;
    } catch (error) {
      if (onProgress) {
        onProgress({
          fileName,
          loaded,
          total,
          percent: Math.round((loaded / total) * 100),
          status: 'error'
        });
      }
      throw error;
    }
  }
}
