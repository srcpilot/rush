export interface RushUser {
  id: number;
  email: string;
  name: string;
  hashed_password: string;
  storage_used: number;
  storage_quota: number;
  created_at: Date;
}