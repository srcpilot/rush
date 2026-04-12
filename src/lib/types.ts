export type FileStatus = 'active' | 'trashed' | 'deleted';
export type ShareAccess = 'public' | 'password';

export interface RushUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  avatar_url?: string;
  storage_used: number;
  storage_limit: number;
  created_at: string;
  updated_at?: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id?: number;
  owner_id: number;
  path: string;
  depth: number;
  created_at: string;
  updated_at?: string;
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
  sha256?: string;
  thumbnail_key?: string;
  versions: number;
  created_at: string;
  updated_at?: string;
}

export interface Share {
  id: number;
  file_id?: number;
  folder_id?: number;
  token: string;
  access: ShareAccess;
  password_hash?: string;
  expires_at?: string;
  downloads: number;
  max_downloads?: number;
  created_by: number;
  created_at: string;
}

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
  updated_at?: string;
}
