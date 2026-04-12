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