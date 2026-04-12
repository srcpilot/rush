export interface RushUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  avatar_url?: string;
  storage_used: number;
  storage_limit: number;
  created_at: string;
  updated_at: string;
}