import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserProfile } from '../../api/user.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { UserProfile } from '../../types/types';
import DeepLinkingService from '../../services/UniversalLinkingService';

// Profile Data Hook
export const useProfileData = () => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    photoUrl: '',
  });
  const [loading, setLoading] = useState(true);

  const getImageUrl = useCallback((imageData: any): string => {
    if (!imageData) return '';
    if (typeof imageData === 'string') return imageData;
    if (imageData.uri) return imageData.uri;
    if (imageData.url) return imageData.url;
    return '';
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchUserProfile();
      const user = response.data.user;

      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        photoUrl: getImageUrl(user.profileImage),
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [getImageUrl]);

  return {
    profile,
    loading,
    loadProfile,
  };
};

// Main Profile Hook
export const useProfile = (navigation: any) => {
  const { isAuthenticated, logout } = useAuth();
  const { profile, loading, loadProfile } = useProfileData();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load profile when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // Logout handler with deep linking cleanup
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    
    try {
      // Update deep linking service
      DeepLinkingService.updateAuthenticationState(false);
      DeepLinkingService.removeListener();
      DeepLinkingService.reset();
      
      // Perform logout
      await logout();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  return {
    // State
    profile,
    loading,
    isLoggingOut,
    isAuthenticated,
    
    // Handlers
    handleLogout,
    handleGoBack,
    handleEditProfile,
  };
};