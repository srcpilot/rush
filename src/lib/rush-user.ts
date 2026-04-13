export interface RushUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  storage_used: number;
  storage_quota: number;
  created_at: string;
  updated_at: string;
}