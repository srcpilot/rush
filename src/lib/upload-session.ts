export interface UploadSession {
  id: number;
  file_name: string;
  file_key: string;
  upload_id: string;
  total_parts: number;
  completed_parts: number;
  total_bytes: number;
  folder_id?: number;
  status: 'pending' | 'uploading' | 'completing' | 'done' | 'failed';
  owner_id: number;
  created_at: string;
  updated_at: string;
}