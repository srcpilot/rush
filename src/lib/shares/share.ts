export interface Share {
  id: string;
  creator_id: string;
  target_id: string;
  target_type: ShareType;
  access: ShareAccess;
  password_hash?: string;
  expires_at?: Date;
  max_downloads?: number;
  download_count: number;
  token: string;
  created_at: Date;
}