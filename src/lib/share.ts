export interface Share {
  id: number;
  user_id: number;
  file_id?: number;
  folder_id?: number;
  token: string;
  password_hash?: string;
  expires_at?: Date;
  max_downloads?: number;
  download_count: number;
  created_at: Date;
}