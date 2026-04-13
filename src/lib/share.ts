export type ShareAccess = 'public' | 'password';

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