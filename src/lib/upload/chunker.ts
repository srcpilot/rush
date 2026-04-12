export type Chunk = {
  partNumber: number;
  data: Blob;
};

export type UploadStatus = {
  uploadId: string;
  totalParts: number;
  completedParts: number[];
};

export class Chunker {
  private chunkSize: number;
  private parallelLimit: number;
  private maxRetries: number;

  constructor(options: { 
    chunkSize?: number, 
    parallel?: number, 
    maxRetries?: number 
  } = {}) {
    // Min 5MB per R2/S3 spec
    this.chunkSize = options.chunkSize ?? 10 * 1024 * 1024;
    this.parallelLimit = options.parallel ?? 3;
    this.maxRetries = options.maxRetries ?? 3;
  }

  async *getChunks(file: File): AsyncGenerator<Chunk> {
    let offset = 0;
    let partNumber = 1;

    while (offset < file.size) {
      const end = Math.min(offset + this.chunkSize, file.size);
      yield {
        partNumber,
        data: file.slice(offset, end)
      };
      offset = end;
      partNumber++;
    }
  }

  async uploadWithRetry(
    partNumber: number, 
    url: string, 
    chunk: Blob, 
    attempt: number = 0
  ): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: chunk
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      
      const etag = response.headers.get('ETag');
      if (!etag) throw new Error('No ETag returned from R2');
      
      return etag.replace(/"/g, ''); // Remove quotes if present
    } catch (error) {
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.uploadWithRetry(partNumber, url, chunk, attempt + 1);
      }
      throw error;
    }
  }
}
