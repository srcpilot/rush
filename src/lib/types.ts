export type FileStatus = 'active' | 'trashed' | 'deleted';

export type ShareAccess = 'public' | 'password';

export interface RushUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  storage_used: number;
  storage_quota: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id?: number;
  owner_id: number;
  path: string;
  depth: number;
  created_at: string;
  updated_at: string;
}

export interface RushFile {
  id: number;
  name: string;
  folder_id?: number;
  owner_id: number;
  r2_key: string;
  size: number;
  mime_type: string;
  status: FileStatus;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: number;
  file_id: number;
  owner_id: number;
  token: string;
  access: ShareAccess;
  password_hash?: string;
  expires_at?: string;
  download_count: number;
  created_at: string;
}

export interface UploadSession {
  id: number;
  file_name: string;
  file_key: string;
  upload_id: string;
  mime_type: string;
  parts_completed: number;
  total_parts: number;
  total_bytes: number;
  folder_id?: number;
  owner_id: number;
  status: 'pending' | 'complete' | 'aborted';
  created_at: string;
}
