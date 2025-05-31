import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput, Alert, Modal, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, ImageLibraryOptions } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, colors } from '../theme/Theme';
import { fetchUserProfile, updateUserProfile } from '../api/user.api';
import { getErrorMessage } from '../utils/getErrorMessage';
import { UserProfile, SelectedImage, EditableProfile } from '../types/types';

// Constants
const CONSTANTS = {
  IMAGE_SIZE_LIMIT: 5 * 1024 * 1024,
  IMAGE_QUALITY: 0.8,
  MAX_IMAGE_DIMENSION: 1000,
  AVATAR_SIZE: 100,
  CAMERA_ICON_SIZE: 32,
} as const;

const IMAGE_PICKER_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo' as MediaType,
  quality: CONSTANTS.IMAGE_QUALITY,
  maxWidth: CONSTANTS.MAX_IMAGE_DIMENSION,
  maxHeight: CONSTANTS.MAX_IMAGE_DIMENSION,
  includeExtra: true,
};

// Custom Hooks
const useImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const validateAndSetImage = useCallback((asset: any) => {
    if (asset.fileSize && asset.fileSize > CONSTANTS.IMAGE_SIZE_LIMIT) {
      Alert.alert('Error', 'Image size should be less than 5MB');
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
        Alert.alert('Error', response.errorMessage || 'Image selection failed');
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
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
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

const useProfileData = () => {
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

// Components
const ProfileImage: React.FC<{
  imageUrl?: string;
  onPress?: () => void;
  theme: string;
}> = ({ imageUrl, onPress, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.imageContainer}
    accessibilityLabel="Change profile picture"
    accessibilityRole="button"
  >
    {imageUrl ? (
      <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
    ) : (
      <View style={[
        styles.avatarPlaceholder,
        { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.lightSearch }
      ]}>
        <Ionicons
          name="person"
          size={60}
          color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
        />
      </View>
    )}
    
    <View style={styles.cameraIconContainer}>
      <Ionicons name="camera" size={20} color={colors.lightHeader} />
    </View>
  </TouchableOpacity>
);

const EditForm: React.FC<{
  editedProfile: EditableProfile;
  onProfileChange: (profile: EditableProfile) => void;
  onSave: () => void;
  onCancel: () => void;
  updating: boolean;
  theme: string;
}> = ({ editedProfile, onProfileChange, onSave, onCancel, updating, theme }) => (
  <View style={styles.editForm}>
    <View style={styles.inputContainer}>
      <Text style={[
        styles.inputLabel,
        { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
      ]}>
        First Name
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background,
            color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
            borderColor: theme === 'dark' ? colors.border : colors.lightSearch,
          },
        ]}
        value={editedProfile.firstName}
        onChangeText={(text) => onProfileChange({ ...editedProfile, firstName: text })}
        placeholder="Enter first name"
        placeholderTextColor={theme === 'dark' ? colors.darkSearch : colors.lightSearch}
        accessibilityLabel="First name input"
        testID="first-name-input"
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={[
        styles.inputLabel,
        { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
      ]}>
        Last Name
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background,
            color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
            borderColor: theme === 'dark' ? colors.border : colors.lightSearch,
          },
        ]}
        value={editedProfile.lastName}
        onChangeText={(text) => onProfileChange({ ...editedProfile, lastName: text })}
        placeholder="Enter last name"
        placeholderTextColor={theme === 'dark' ? colors.darkSearch : colors.lightSearch}
        accessibilityLabel="Last name input"
        testID="last-name-input"
      />
    </View>

    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton]}
        onPress={onCancel}
        disabled={updating}
        accessibilityLabel="Cancel editing"
        accessibilityRole="button"
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.saveButton]}
        onPress={onSave}
        disabled={updating}
        accessibilityLabel="Save profile changes"
        accessibilityRole="button"
      >
        {updating ? (
          <ActivityIndicator size="small" color={colors.lightHeader} />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const ImagePickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelectFromCamera: () => void;
  onSelectFromLibrary: () => void;
  theme: string;
}> = ({ visible, onClose, onSelectFromCamera, onSelectFromLibrary, theme }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={[
        styles.modalContent,
        { backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard }
      ]}>
        <Text style={[
          styles.modalTitle,
          { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
        ]}>
          Select Photo
        </Text>

        <TouchableOpacity
          style={styles.modalOption}
          onPress={onSelectFromCamera}
          accessibilityLabel="Take photo with camera"
          accessibilityRole="button"
        >
          <Ionicons name="camera" size={24} color={colors.info} />
          <Text style={[
            styles.modalOptionText,
            { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
          ]}>
            Take Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalOption}
          onPress={onSelectFromLibrary}
          accessibilityLabel="Choose photo from library"
          accessibilityRole="button"
        >
          <Ionicons name="images" size={24} color={colors.info} />
          <Text style={[
            styles.modalOptionText,
            { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
          ]}>
            Choose from Library
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalOption, styles.cancelOption]}
          onPress={onClose}
          accessibilityLabel="Cancel photo selection"
          accessibilityRole="button"
        >
          <Text style={styles.cancelOptionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Main Component
const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setEditedProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  }, [profile]);

  const displayImage = useMemo(() => {
    return selectedImage ? selectedImage.uri : profile.photoUrl;
  }, [selectedImage, profile.photoUrl]);

  const validateProfileData = useCallback((data: EditableProfile): boolean => {
    if (!data.firstName.trim() || !data.lastName.trim()) {
      Alert.alert('Error', 'Please fill in both first name and last name');
      return false;
    }
    return true;
  }, []);

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
        text1: 'Profile updated successfully',
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

  const handleCancel = useCallback(() => {
    resetSelectedImage();
    navigation.goBack();
  }, [navigation, resetSelectedImage]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Content */}
      <View style={[
        styles.profileSection,
        { backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard },
      ]}>
        <ProfileImage
          imageUrl={displayImage}
          onPress={openImagePicker}
          theme={theme}
        />

        <EditForm
          editedProfile={editedProfile}
          onProfileChange={setEditedProfile}
          onSave={handleSave}
          onCancel={handleCancel}
          updating={updating}
          theme={theme}
        />
      </View>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={closeImagePicker}
        onSelectFromCamera={selectFromCamera}
        onSelectFromLibrary={selectFromLibrary}
        theme={theme}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarImage: {
    width: CONSTANTS.AVATAR_SIZE,
    height: CONSTANTS.AVATAR_SIZE,
    borderRadius: CONSTANTS.AVATAR_SIZE / 2,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: CONSTANTS.AVATAR_SIZE,
    height: CONSTANTS.AVATAR_SIZE,
    borderRadius: CONSTANTS.AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.info,
    width: CONSTANTS.CAMERA_ICON_SIZE,
    height: CONSTANTS.CAMERA_ICON_SIZE,
    borderRadius: CONSTANTS.CAMERA_ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.lightHeader,
  },
  editForm: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.info,
  },
  cancelButtonText: {
    color: colors.darkHeader,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  saveButtonText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.Bold,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    marginLeft: 12,
  },
  cancelOption: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelOptionText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.darkHeader,
  },
});

export default EditProfileScreen;