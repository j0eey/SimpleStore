import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, fonts } from '../../theme/Theme';
import { LoadingScreenProps, FormHeaderProps, ImageUploadSectionProps, ImagePreviewSectionProps, FormFieldProps, LocationPickerProps, FormActionsProps } from './types';
import { EDIT_PRODUCT_CONSTANTS } from './constants';


// Loading Screen Component
export const LoadingScreen = memo<LoadingScreenProps>(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.loadingContainer,
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  return (
    <View style={containerStyle}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
});

// Form Header Component
export const FormHeader = memo<FormHeaderProps>(({ title }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const titleStyle = useMemo(() => [
    styles.title,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  return (
    <Text style={titleStyle}>
      {title}
    </Text>
  );
});

// Image Upload Section Component
export const ImageUploadSection = memo<ImageUploadSectionProps>(({
  canAddMoreImages,
  isSubmitting,
  onGalleryPress,
  onCameraPress,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labelStyle = useMemo(() => [
    styles.label,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  const uploadButtonStyle = useMemo(() => [
    styles.imageUpload,
    { backgroundColor: isDark ? colors.darkCard : colors.lightCard }
  ], [isDark]);

  return (
    <>
      <Text style={labelStyle}>Product Images</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={uploadButtonStyle}
          onPress={onGalleryPress}
          disabled={isSubmitting || !canAddMoreImages}
        >
          <Ionicons name="image-outline" size={28} color={colors.primary} />
          <Text style={styles.uploadText}>Get from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={uploadButtonStyle}
          onPress={onCameraPress}
          disabled={isSubmitting || !canAddMoreImages}
        >
          <Ionicons name="camera-outline" size={28} color={colors.primary} />
          <Text style={styles.uploadText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </>
  );
});

// Image Preview Section Component
export const ImagePreviewSection = memo<ImagePreviewSectionProps>(({
  existingImages,
  imagesToDelete,
  newImages,
  isSubmitting,
  onRemoveExisting,
  onRemoveNew,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const displayedExistingImages = existingImages.filter(img => !imagesToDelete.includes(img));

  const containerStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    backgroundColor: isDark ? colors.darkHeader : colors.background,
    padding: 5,
  }), [isDark]);

  return (
    <View style={containerStyle}>
      {/* Render existing images */}
      {displayedExistingImages.map((img) => (
        <View key={`existing-${img}`} style={styles.imageWrapper}>
          <Image source={{ uri: img }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeIcon}
            onPress={() => onRemoveExisting(img)}
            disabled={isSubmitting}
          >
            <Ionicons name="close-circle" size={22} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>
      ))}
      
      {/* Render new images */}
      {newImages.map((img, idx) => {
        const imageSource = img.base64 
          ? { uri: `data:${img.type || 'image/jpeg'};base64,${img.base64}` }
          : { uri: img.uri || '' };
        
        return (
          <View key={`new-${idx}`} style={styles.imageWrapper}>
            <Image source={imageSource} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeIcon}
              onPress={() => onRemoveNew(idx)}
              disabled={isSubmitting}
            >
              <Ionicons name="close-circle" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
});

// Form Field Component
export const FormField = memo<FormFieldProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  editable = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labelStyle = useMemo(() => [
    styles.label,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  const inputStyle = useMemo(() => [
    styles.input,
    multiline && styles.textArea,
    {
      backgroundColor: isDark ? colors.darkCard : colors.lightCard,
      color: isDark ? colors.lightText : colors.textPrimary
    }
  ], [isDark, multiline]);

  return (
    <>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        style={inputStyle}
        placeholder={placeholder}
        placeholderTextColor={colors.darkBorder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        editable={editable}
      />
    </>
  );
});

// Location Picker Component
export const LocationPicker = memo<LocationPickerProps>(({
  location,
  isSubmitting,
  onPress,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labelStyle = useMemo(() => [
    styles.label,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  const pickerStyle = useMemo(() => [
    styles.input,
    styles.locationPicker,
    {
      backgroundColor: isDark ? colors.darkCard : colors.lightCard,
    }
  ], [isDark]);

  const textStyle = useMemo(() => ({
    color: location.name ? colors.lightText : colors.darkBorder
  }), [location.name]);

  return (
    <>
      <Text style={labelStyle}>Location</Text>
      <TouchableOpacity
        style={pickerStyle}
        onPress={onPress}
        disabled={isSubmitting}
      >
        <Text style={textStyle}>
          {location.name || 'Select location on map'}
        </Text>
      </TouchableOpacity>
    </>
  );
});

// Form Actions Component
export const FormActions = memo<FormActionsProps>(({
  isSubmitting,
  onSubmit,
  onCancel,
  disabled,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const submitButtonStyle = useMemo(() => [
    styles.submitButton,
    {
      backgroundColor: isDark ? colors.primary : colors.primaryDark,
      opacity: disabled ? 0.7 : 1
    }
  ], [isDark, disabled]);

  const cancelButtonStyle = useMemo(() => [
    styles.cancelButton,
    { backgroundColor: isDark ? colors.darkCard : colors.lightCard }
  ], [isDark]);

  return (
    <>
      <TouchableOpacity
        style={submitButtonStyle}
        onPress={onSubmit}
        disabled={disabled}
      >
        {isSubmitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.lightHeader} size="small" />
            <Text style={[styles.submitText, { marginLeft: 8 }]}>Updating...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Update Product</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={cancelButtonStyle}
        onPress={onCancel}
        disabled={isSubmitting}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </>
  );
});

// Main Container Component
export const FormContainer = memo<{
  children: React.ReactNode;
}>(({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  return (
    <ScrollView contentContainerStyle={containerStyle}>
      {children}
    </ScrollView>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    padding: EDIT_PRODUCT_CONSTANTS.CONTAINER_PADDING,
    paddingBottom: EDIT_PRODUCT_CONSTANTS.BOTTOM_PADDING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationPicker: {
    justifyContent: 'center',
  },
  imageUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    marginRight: 10,
  },
  uploadText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    marginLeft: 8,
    color: colors.primary,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginTop: 10,
    width: EDIT_PRODUCT_CONSTANTS.IMAGE_PREVIEW_SIZE,
    height: EDIT_PRODUCT_CONSTANTS.IMAGE_PREVIEW_SIZE,
    flexShrink: 0,
  },
  imagePreview: {
    width: EDIT_PRODUCT_CONSTANTS.IMAGE_PREVIEW_SIZE,
    height: EDIT_PRODUCT_CONSTANTS.IMAGE_PREVIEW_SIZE,
    borderRadius: 8,
  },
  removeIcon: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: colors.semitransparentwhite,
    borderRadius: 20,
    zIndex: 1,
  },
  submitButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.primaryDark,
  },
});