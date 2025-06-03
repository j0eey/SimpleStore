import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, colors } from '../../theme/Theme';
import { ProfileImageProps, EditFormProps, ImagePickerModalProps, ProfileSectionProps, MainContainerProps } from './types';
import { EDIT_PROFILE_CONSTANTS } from './constants';

// Types
interface LoadingSkeletonProps {}

// Loading Skeleton Component
export const LoadingSkeleton = memo<LoadingSkeletonProps>(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const skeletonConfig = useMemo(() => ({
    borderRadius: 4,
    backgroundColor: isDark ? colors.darkPlaceholder : colors.lightPlaceholder,
    highlightColor: isDark ? colors.darkHighlight : colors.lightHighlight,
  }), [isDark]);

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  const profileSectionStyle = useMemo(() => ({
    alignItems: 'center' as const,
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: isDark ? colors.darkCard : colors.lightCard,
  }), [isDark]);

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      <SkeletonPlaceholder {...skeletonConfig}>
        <SkeletonPlaceholder.Item {...profileSectionStyle}>
          {/* Avatar Skeleton */}
          <SkeletonPlaceholder.Item
            width={EDIT_PROFILE_CONSTANTS.AVATAR_SIZE}
            height={EDIT_PROFILE_CONSTANTS.AVATAR_SIZE}
            borderRadius={EDIT_PROFILE_CONSTANTS.AVATAR_SIZE / 2}
            marginBottom={20}
          />

          {/* Form Fields Container */}
          <SkeletonPlaceholder.Item width="100%">
            {/* First Name Input Skeleton */}
            <SkeletonPlaceholder.Item marginBottom={16}>
              <SkeletonPlaceholder.Item width={80} height={14} marginBottom={8} />
              <SkeletonPlaceholder.Item width="100%" height={48} borderRadius={8} />
            </SkeletonPlaceholder.Item>

            {/* Last Name Input Skeleton */}
            <SkeletonPlaceholder.Item marginBottom={16}>
              <SkeletonPlaceholder.Item width={75} height={14} marginBottom={8} />
              <SkeletonPlaceholder.Item width="100%" height={48} borderRadius={8} />
            </SkeletonPlaceholder.Item>

            {/* Button Row Skeleton */}
            <SkeletonPlaceholder.Item
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginTop={16}
            >
              <SkeletonPlaceholder.Item
                flex={1}
                height={46}
                borderRadius={8}
                marginRight={6}
              />
              <SkeletonPlaceholder.Item
                flex={1}
                height={46}
                borderRadius={8}
                marginLeft={6}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </ScrollView>
  );
});

// Profile Image Component
export const ProfileImage = memo<ProfileImageProps>(({ imageUrl, onPress }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const placeholderStyle = useMemo(() => [
    styles.avatarPlaceholder,
    { backgroundColor: isDark ? colors.darkHeader : colors.lightSearch }
  ], [isDark]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.imageContainer}
      accessibilityLabel="Change profile picture"
      accessibilityRole="button"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={placeholderStyle}>
          <Ionicons
            name="person"
            size={60}
            color={isDark ? colors.lightHeader : colors.darkHeader}
          />
        </View>
      )}
      
      <View style={styles.cameraIconContainer}>
        <Ionicons name="camera" size={20} color={colors.lightHeader} />
      </View>
    </TouchableOpacity>
  );
});

// Edit Form Component
export const EditForm = memo<EditFormProps>(({
  editedProfile,
  onProfileChange,
  onSave,
  onCancel,
  updating,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labelStyle = useMemo(() => [
    styles.inputLabel,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  const inputStyle = useMemo(() => [
    styles.textInput,
    {
      backgroundColor: isDark ? colors.darkHeader : colors.background,
      color: isDark ? colors.lightHeader : colors.darkHeader,
      borderColor: isDark ? colors.border : colors.lightSearch,
    }
  ], [isDark]);

  const placeholderColor = isDark ? colors.darkSearch : colors.lightSearch;

  return (
    <View style={styles.editForm}>
      <View style={styles.inputContainer}>
        <Text style={labelStyle}>First Name</Text>
        <TextInput
          style={inputStyle}
          value={editedProfile.firstName}
          onChangeText={(text) => onProfileChange({ ...editedProfile, firstName: text })}
          placeholder="Enter first name"
          placeholderTextColor={placeholderColor}
          accessibilityLabel="First name input"
          testID="first-name-input"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={labelStyle}>Last Name</Text>
        <TextInput
          style={inputStyle}
          value={editedProfile.lastName}
          onChangeText={(text) => onProfileChange({ ...editedProfile, lastName: text })}
          placeholder="Enter last name"
          placeholderTextColor={placeholderColor}
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
});

// Image Picker Modal Component
export const ImagePickerModal = memo<ImagePickerModalProps>(({
  visible,
  onClose,
  onSelectFromCamera,
  onSelectFromLibrary,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const modalContentStyle = useMemo(() => [
    styles.modalContent,
    { backgroundColor: isDark ? colors.darkCard : colors.lightCard }
  ], [isDark]);

  const modalTitleStyle = useMemo(() => [
    styles.modalTitle,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  const modalOptionTextStyle = useMemo(() => [
    styles.modalOptionText,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={modalContentStyle}>
          <Text style={modalTitleStyle}>Select Photo</Text>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={onSelectFromCamera}
            accessibilityLabel="Take photo with camera"
            accessibilityRole="button"
          >
            <Ionicons name="camera" size={24} color={colors.info} />
            <Text style={modalOptionTextStyle}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={onSelectFromLibrary}
            accessibilityLabel="Choose photo from library"
            accessibilityRole="button"
          >
            <Ionicons name="images" size={24} color={colors.info} />
            <Text style={modalOptionTextStyle}>Choose from Library</Text>
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
});

// Profile Section Container
export const ProfileSection = memo<ProfileSectionProps>(({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sectionStyle = useMemo(() => [
    styles.profileSection,
    { backgroundColor: isDark ? colors.darkCard : colors.lightCard }
  ], [isDark]);

  return <View style={sectionStyle}>{children}</View>;
});

// Main Container Component
export const MainContainer = memo<MainContainerProps>(({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: EDIT_PROFILE_CONSTANTS.CONTAINER_PADDING,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: EDIT_PROFILE_CONSTANTS.PROFILE_SECTION_MARGIN,
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
    width: EDIT_PROFILE_CONSTANTS.AVATAR_SIZE,
    height: EDIT_PROFILE_CONSTANTS.AVATAR_SIZE,
    borderRadius: EDIT_PROFILE_CONSTANTS.AVATAR_SIZE / 2,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: EDIT_PROFILE_CONSTANTS.AVATAR_SIZE,
    height: EDIT_PROFILE_CONSTANTS.AVATAR_SIZE,
    borderRadius: EDIT_PROFILE_CONSTANTS.AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.info,
    width: EDIT_PROFILE_CONSTANTS.CAMERA_ICON_SIZE,
    height: EDIT_PROFILE_CONSTANTS.CAMERA_ICON_SIZE,
    borderRadius: EDIT_PROFILE_CONSTANTS.CAMERA_ICON_SIZE / 2,
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