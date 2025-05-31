import api, { API_BASE_URL } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UpdateProfileResponse } from '../types/types';

  export const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('@accessToken');
      if (!token) throw new Error('No access token found');

      const response = await api.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      if (
        userData.data?.user?.profileImage?.url &&
        userData.data.user.profileImage.url.startsWith('/')
      ) {
        userData.data.user.profileImage.url = `${API_BASE_URL}${userData.data.user.profileImage.url}`;
      }
      return userData;
    } catch (error) {
      throw error;
    }
  };



  export const updateUserProfile = async (profileData: {
    firstName: string;
    lastName: string;
    profileImage?: any;
  }): Promise<UpdateProfileResponse> => {
    try {
      const token = await AsyncStorage.getItem('@accessToken');
      if (!token) throw new Error('No access token found');

      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);

      if (profileData.profileImage) {
        // Fix: Create a proper FormData file object
        formData.append('profileImage', {
          uri: profileData.profileImage.uri,
          type: profileData.profileImage.type || 'image/jpeg',
          name: profileData.profileImage.fileName || `profile-${Date.now()}.jpg`,
        });
      }

      const response = await api.put('/api/user/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  };