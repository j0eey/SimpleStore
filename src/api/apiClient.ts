import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { refreshTokenApi } from '../api/auth.api';
import Config from 'react-native-config';

export const API_BASE_URL = Config.API_BASE_URL;
export const GOOGLE_PLACES_API_BASE_URL = Config.GOOGLE_PLACES_API_BASE_URL;
export const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY;

const ACCESS_TOKEN_SERVICE = 'ecommerce_access_token';
const REFRESH_TOKEN_SERVICE = 'ecommerce_refresh_token';

const getAccessToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ACCESS_TOKEN_SERVICE,
    });
    if (credentials && credentials.password) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving access token in API client:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_SERVICE,
    });
    if (credentials && credentials.password) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving refresh token in API client:', error);
    return null;
  }
};

const storeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await Promise.all([
      Keychain.setGenericPassword('access_token', accessToken, {
        service: ACCESS_TOKEN_SERVICE,
      }),
      Keychain.setGenericPassword('refresh_token', refreshToken, {
        service: REFRESH_TOKEN_SERVICE,
      })
    ]);
  } catch (error) {
    console.error('Error storing tokens in API client:', error);
    throw error;
  }
};

const clearAllTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      // Clear secure tokens from Keychain
      Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE }),
      Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE }),
      AsyncStorage.multiRemove([
        '@auth',
        '@userEmail',
        '@isVerified',
        '@userId'
      ])
    ]);
  } catch (error) {
    console.error('Error clearing tokens in API client:', error);
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error adding auth token to request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          // User is logged out, just reject the original error
          return Promise.reject(error);
        }

        const newTokens = await refreshTokenApi(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = newTokens.data;

        await storeTokens(accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await clearAllTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;