export interface Share {
  id: string;
  token: string;
  file_id?: string;
  folder_id?: string;
  access: ShareAccess;
  password_hash?: string;
  expires_at?: Date;
  max_downloads?: number;
  downloads: number;
  created_at: Date;
}