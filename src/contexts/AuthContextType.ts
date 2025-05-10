export interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  signup: () => Promise<void>;
  verify: () => Promise<void>;
  logout: () => Promise<void>;
}