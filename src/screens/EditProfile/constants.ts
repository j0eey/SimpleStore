import { ImageLibraryOptions, MediaType } from 'react-native-image-picker';

export const EDIT_PROFILE_CONSTANTS = {
  IMAGE_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB
  IMAGE_QUALITY: 0.8,
  MAX_IMAGE_DIMENSION: 1000,
  AVATAR_SIZE: 100,
  CAMERA_ICON_SIZE: 32,
  CONTAINER_PADDING: 20,
  PROFILE_SECTION_MARGIN: 30,
} as const;

export const IMAGE_PICKER_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo' as MediaType,
  quality: EDIT_PROFILE_CONSTANTS.IMAGE_QUALITY,
  maxWidth: EDIT_PROFILE_CONSTANTS.MAX_IMAGE_DIMENSION,
  maxHeight: EDIT_PROFILE_CONSTANTS.MAX_IMAGE_DIMENSION,
  includeExtra: true,
};

export const EDIT_PROFILE_MESSAGES = {
  FILL_REQUIRED_FIELDS: 'Please fill in both first name and last name',
  IMAGE_SIZE_ERROR: 'Image size should be less than 5MB',
  IMAGE_SELECTION_FAILED: 'Image selection failed',
  CAMERA_PERMISSION_DENIED: 'Camera access is required to take a photo.',
  PROFILE_UPDATED_SUCCESS: 'Profile updated successfully',
} as const;