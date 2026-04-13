export interface AuthContext {
  user?: RushUser;
  token?: string;
  loading: boolean;
  login: string;
  register: string;
  logout: string;
}