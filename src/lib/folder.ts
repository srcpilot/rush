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