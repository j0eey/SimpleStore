export interface AuthContextType {
  isAuthenticated: boolean;
  isVerified: boolean;
  email: string;
  token: string;
  userId: string;
  refreshAccessToken: () => Promise<string>;
  login: (tokens: Tokens) => Promise<void>;
  signup: (newEmail: string) => Promise<void>;
  verify: () => Promise<void>;
  logout: () => Promise<void>;
  setEmail: (newEmail: string) => Promise<void>;
   isProfileLoading?: boolean;
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export const STORAGE_KEYS = {
  AUTH: '@auth',
  EMAIL: '@userEmail',
  ACCESS_TOKEN: '@accessToken',
  REFRESH_TOKEN: '@refreshToken',
  VERIFIED: '@isVerified',
  USER_ID: '@userId',
  THEME: '@theme',
} as const;

export const DELAYS = {
  STATE_UPDATE: 100, 
  SPLASH_HIDE: 1000, // 1 second for native splash
} as const;


export type AuthState = {
  isAuthenticated: boolean;
  isVerified: boolean;
  email: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
};