export interface Folder {
  id: number;
  user_id: number;
  parent_id?: number;
  name: string;
  path: string;
  created_at: Date;
}