import type { FileStatus } from './types.js';

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
  updated_at: string;
}