export interface UploadSession {
  id: string;
  file_key: string;
  upload_id: string;
  file_name: string;
  mime_type: string;
  total_bytes: number;
  completed_parts: number;
  folder_id?: string;
  user_id: string;
}