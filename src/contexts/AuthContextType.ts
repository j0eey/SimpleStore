export interface AuthContextType {
  isAuthenticated: boolean;
  isVerified: boolean;
  email: string;
  token: string;
  refreshAccessToken: () => Promise<string>;
  login: (tokens: Tokens) => Promise<void>;
  signup: (newEmail: string) => Promise<void>;
  verify: () => Promise<void>;
  logout: () => Promise<void>;
  setEmail: (newEmail: string) => Promise<void>;
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};
