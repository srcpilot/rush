export type UploadMetadata = {
  r2Key: string;
  uploadId: string;
  totalParts: number;
  completedParts: number[];
  userId: string;
  createdAt: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export type PartInfo = {
  partNumber: number;
  etag: string;
};

export type UploadResponse = {
  uploadId: string;
  partSize: number;
  totalParts: number;
};
