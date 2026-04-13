export interface RushFile {
  id: number;
  user_id: number;
  folder_id?: number;
  name: string;
  size: number;
  mime_type: string;
  r2_key: string;
  checksum?: string;
  created_at: Date;
  updated_at: Date;
}