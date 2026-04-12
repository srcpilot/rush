export type UploadProgressEvent =
  | { type: 'part_complete'; partNumber: number; totalParts: number; bytesUploaded: number; totalBytes: number; percent: number }
  | { type: 'upload_complete'; fileId: string; fileName: string; totalBytes: number }
  | { type: 'upload_error'; error: string; partNumber?: number }
  | { type: 'heartbeat'; timestamp: number };

export interface UploadProgressState {
  status: 'uploading' | 'done' | 'failed';
  completedParts: number[];
  totalParts: number;
  totalBytes: number;
  uploadedBytes: number;
}
