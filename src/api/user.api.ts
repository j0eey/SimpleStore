import api, { API_BASE_URL } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('@accessToken');

    if (!token) throw new Error('No access token found');

    const response = await api.get('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
