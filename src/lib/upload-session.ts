export interface UploadSession {
  id: string;
  user_id: number;
  filename: string;
  size: number;
  mime_type: string;
  r2_upload_id: string;
  parts_completed: number;
  total_parts: number;
  status: 'pending' | 'active' | 'complete' | 'aborted';
  created_at: Date;
  updated_at: Date;
}