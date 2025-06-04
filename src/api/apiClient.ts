import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { refreshTokenApi } from '../api/auth.api';
import Config from 'react-native-config';

export const API_BASE_URL = Config.API_BASE_URL;
export const GOOGLE_PLACES_API_BASE_URL = Config.GOOGLE_PLACES_API_BASE_URL;
export const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY;

// Keychain service name (should match what you used in AuthContext)
const KEYCHAIN_SERVICE = 'com.simplestore';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Helper function to get token from Keychain
const getTokenFromKeychain = async (tokenKey: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    if (credentials && credentials.username === tokenKey) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error getting token from Keychain:', error);
    return null;
  }
};

api.interceptors.request.use(
  async (config) => {
    const token = await getTokenFromKeychain('@accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
        const refreshToken = await getTokenFromKeychain('@refreshToken');
        if (!refreshToken) throw new Error('Missing refresh token');

        const newTokens = await refreshTokenApi(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = newTokens.data;

        // Store new tokens in Keychain
        await Keychain.setGenericPassword('@accessToken', accessToken, {
          service: KEYCHAIN_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        await Keychain.setGenericPassword('@refreshToken', newRefreshToken, {
          service: KEYCHAIN_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear all credentials from Keychain on refresh failure
        await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;