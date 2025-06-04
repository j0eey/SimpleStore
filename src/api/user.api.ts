import api, { API_BASE_URL } from './apiClient';
import { UpdateProfileResponse } from '../types/types';

export const fetchUserProfile = async () => {
  try {
    // No need to manually add token - apiClient handles this automatically
    const response = await api.get('/api/user/profile');

    const userData = response.data;
    
    // Fix relative URLs for profile images
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
    const formData = new FormData();
    formData.append('firstName', profileData.firstName);
    formData.append('lastName', profileData.lastName);

    if (profileData.profileImage) {
      // Create a proper FormData file object
      formData.append('profileImage', {
        uri: profileData.profileImage.uri,
        type: profileData.profileImage.type || 'image/jpeg',
        name: profileData.profileImage.fileName || `profile-${Date.now()}.jpg`,
      } as any);
    }

    // No need to manually add token or Content-Type - apiClient handles auth
    // multipart/form-data Content-Type is set automatically by axios when using FormData
    const response = await api.put('/api/user/profile', formData);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Additional user API functions you might need
export const getUserOrders = async () => {
  try {
    const response = await api.get('/api/user/orders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserEmail = async (newEmail: string) => {
  try {
    const response = await api.put('/api/user/email', { email: newEmail });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.put('/api/user/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserAccount = async () => {
  try {
    const response = await api.delete('/api/user/account');
    return response.data;
  } catch (error) {
    throw error;
  }
};