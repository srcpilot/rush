export interface UploadSession {
  id: number;
  file_name: string;
  file_key: string;
  upload_id: string;
  parts_completed: number;
  total_parts: number;
  total_bytes: number;
  folder_id?: number;
  owner_id: number;
  status: 'pending' | 'complete' | 'aborted';
  created_at: string;
}