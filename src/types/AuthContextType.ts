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
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export const STORAGE_KEYS = {
  AUTH: '@auth',
  EMAIL: '@userEmail',
  VERIFIED: '@isVerified',
  USER_ID: '@userId',
  THEME: '@theme',
} as const;

export const KEYCHAIN_SERVICES = {
  ACCESS_TOKEN: 'ecommerce_access_token',
  REFRESH_TOKEN: 'ecommerce_refresh_token',
} as const;

export const DELAYS = {
  STATE_UPDATE: 100, 
  SPLASH_HIDE: 1000, // 1 second for native splash
} as const;


export type AuthState = {
  isAuthenticated: boolean;
  isVerified: boolean;
  email: string;
  userId: string;
};

export const DEPRECATED_STORAGE_KEYS = {
  ACCESS_TOKEN: '@accessToken',
  REFRESH_TOKEN: '@refreshToken',
} as const;

export type SecureStorageKeys = keyof typeof KEYCHAIN_SERVICES;