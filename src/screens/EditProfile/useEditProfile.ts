import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { fetchUserProfile, updateUserProfile } from '../../api/user.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { UserProfile, SelectedImage, EditableProfile } from '../../types/types';
import { EDIT_PROFILE_CONSTANTS, IMAGE_PICKER_OPTIONS, EDIT_PROFILE_MESSAGES } from './constants';

// Image Picker Hook
export const useImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const validateAndSetImage = useCallback((asset: any) => {
    if (asset.fileSize && asset.fileSize > EDIT_PROFILE_CONSTANTS.IMAGE_SIZE_LIMIT) {
      Alert.alert('Error', EDIT_PROFILE_MESSAGES.IMAGE_SIZE_ERROR);
      return false;
    }

    const imageData: SelectedImage = {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      fileName: asset.fileName || `profile-${Date.now()}.jpg`,
    };

    setSelectedImage(imageData);
    return true;
  }, []);

  const handleImagePickerResponse = useCallback(
    (response: ImagePickerResponse) => {
      setShowImagePicker(false);
      
      if (response.didCancel) return;
      
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || EDIT_PROFILE_MESSAGES.IMAGE_SELECTION_FAILED);
        return;
      }

      if (response.assets?.[0]) {
        validateAndSetImage(response.assets[0]);
      }
    },
    [validateAndSetImage]
  );

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  }, []);

  const selectFromLibrary = useCallback(() => {
    launchImageLibrary(IMAGE_PICKER_OPTIONS, handleImagePickerResponse);
  }, [handleImagePickerResponse]);

  const selectFromCamera = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', EDIT_PROFILE_MESSAGES.CAMERA_PERMISSION_DENIED);
      return;
    }

    launchCamera(IMAGE_PICKER_OPTIONS, handleImagePickerResponse);
  }, [requestCameraPermission, handleImagePickerResponse]);

  const openImagePicker = useCallback(() => {
    setShowImagePicker(true);
  }, []);

  const closeImagePicker = useCallback(() => {
    setShowImagePicker(false);
  }, []);

  const resetSelectedImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return {
    selectedImage,
    showImagePicker,
    openImagePicker,
    closeImagePicker,
    selectFromLibrary,
    selectFromCamera,
    resetSelectedImage,
  };
};

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

  const updateProfile = useCallback(async (
    editedProfile: EditableProfile,
    selectedImage: SelectedImage | null
  ) => {
    const response = await updateUserProfile({
      firstName: editedProfile.firstName.trim(),
      lastName: editedProfile.lastName.trim(),
      profileImage: selectedImage,
    });

    const newImageUrl = response.data.user.profileImage
      ? getImageUrl(response.data.user.profileImage)
      : selectedImage?.uri;

    setProfile(prev => ({
      ...prev,
      firstName: editedProfile.firstName.trim(),
      lastName: editedProfile.lastName.trim(),
      photoUrl: newImageUrl || prev.photoUrl,
    }));

    return response;
  }, [getImageUrl]);

  return {
    profile,
    loading,
    loadProfile,
    updateProfile,
  };
};

// Main Edit Profile Hook
export const useEditProfile = (navigation: any) => {
  const { profile, loading, loadProfile, updateProfile } = useProfileData();
  const {
    selectedImage,
    showImagePicker,
    openImagePicker,
    closeImagePicker,
    selectFromLibrary,
    selectFromCamera,
    resetSelectedImage,
  } = useImagePicker();

  const [editedProfile, setEditedProfile] = useState<EditableProfile>({
    firstName: '',
    lastName: '',
  });
  const [updating, setUpdating] = useState(false);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update form when profile loads
  useEffect(() => {
    setEditedProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  }, [profile]);

  // Form validation
  const validateProfileData = useCallback((data: EditableProfile): boolean => {
    if (!data.firstName.trim() || !data.lastName.trim()) {
      Alert.alert('Error', EDIT_PROFILE_MESSAGES.FILL_REQUIRED_FIELDS);
      return false;
    }
    return true;
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateProfileData(editedProfile)) return;

    setUpdating(true);
    try {
      await updateProfile(editedProfile, selectedImage);
      resetSelectedImage();
      
      // Refetch the latest profile data from server
      await loadProfile();
      
      Toast.show({
        type: 'success',
        text1: EDIT_PROFILE_MESSAGES.PROFILE_UPDATED_SUCCESS,
      });
      
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    } finally {
      setUpdating(false);
    }
  }, [editedProfile, selectedImage, validateProfileData, updateProfile, resetSelectedImage, loadProfile, navigation]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    resetSelectedImage();
    navigation.goBack();
  }, [navigation, resetSelectedImage]);

  // Get display image
  const getDisplayImage = useCallback(() => {
    return selectedImage ? selectedImage.uri : profile.photoUrl;
  }, [selectedImage, profile.photoUrl]);

  return {
    // State
    profile,
    editedProfile,
    loading,
    updating,
    
    // Image picker state
    selectedImage,
    showImagePicker,
    
    // Handlers
    setEditedProfile,
    handleSave,
    handleCancel,
    openImagePicker,
    closeImagePicker,
    selectFromLibrary,
    selectFromCamera,
    getDisplayImage,
  };
};