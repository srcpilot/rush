export type FileStatus = 'pending' | 'active' | 'complete' | 'aborted';

export type ShareAccess = 'read' | 'write';

export interface RushUser {
  id: number;
  email: string;
  name: string | null;
  hashed_password?: string;
  storage_used: number;
  storage_quota: number;
  created_at: string;
}

export interface Folder {
  id: number;
  user_id: number;
  parent_id?: number;
  name: string;
  path: string;
  created_at: string;
}

export interface RushFile {
  id: number;
  user_id: number;
  folder_id?: number;
  name: string | null;
  size: number;
  mime_type: string;
  r2_key: string;
  checksum?: string;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: number;
  user_id: number;
  file_id?: number;
  folder_id?: number;
  token: string;
  password_hash?: string;
  expires_at?: string;
  max_downloads?: number;
  download_count: number;
  created_at: string;
}

export interface UploadSession {
  id: string;
  user_id: number;
  filename: string;
  size: number;
  mime_type: string;
  r2_upload_id: string;
  parts_completed: number;
  total_parts: number;
  status: FileStatus;
  created_at: string;
  updated_at: string;
}

export interface UploadItemState {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'complete' | 'error';
  error?: string;
}
