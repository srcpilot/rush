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