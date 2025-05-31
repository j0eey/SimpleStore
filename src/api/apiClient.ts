import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokenApi } from '../api/auth.api';
import Config from 'react-native-config';

export const API_BASE_URL = Config.API_BASE_URL;
export const GOOGLE_PLACES_API_BASE_URL = Config.GOOGLE_PLACES_API_BASE_URL;
export const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@accessToken');
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
        const refreshToken = await AsyncStorage.getItem('@refreshToken');
        if (!refreshToken) throw new Error('Missing refresh token');

        const newTokens = await refreshTokenApi(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = newTokens.data;

        await AsyncStorage.setItem('@accessToken', accessToken);
        await AsyncStorage.setItem('@refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove([
          '@accessToken',
          '@refreshToken',
          '@auth',
          '@userEmail',
          '@isVerified',
        ]);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
