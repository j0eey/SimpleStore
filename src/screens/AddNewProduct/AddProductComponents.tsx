import React, { memo, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, fonts } from '../../theme/Theme';
import { FormHeaderProps, ImageUploadSectionProps, FormInputProps, LocationSelectorProps, FormActionsProps } from './types';
import { ADD_PRODUCT_CONSTANTS } from './constants';

// Form Header Component
export const FormHeader = memo<FormHeaderProps>(({ title }) => {
  const { theme } = useTheme();
  const themedColor = theme === 'dark';

  const titleStyle = useMemo(() => [
    styles.title,
    { color: themedColor ? colors.lightHeader : colors.darkHeader }
  ], [themedColor]);

  return (
    <Text style={titleStyle}>
      {title}
    </Text>
  );
});

// Image Upload Section Component
export const ImageUploadSection = memo<ImageUploadSectionProps>(({
  images,
  onImagePick,
  onCameraCapture,
  onRemoveImage,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const themedColor = theme === 'dark';

  const labelStyle = useMemo(() => [
    styles.label,
    { color: themedColor ? colors.lightHeader : colors.darkHeader }
  ], [themedColor]);

  const uploadButtonStyle = useMemo(() => [
    styles.imageUpload,
    { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }
  ], [themedColor]);

  return (
    <>
      <Text style={labelStyle}>
        Product Images
      </Text>
      
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={uploadButtonStyle}
          onPress={onImagePick}
          disabled={isSubmitting}
        >
          <Ionicons name="image-outline" size={28} color={colors.primary} />
          <Text style={[styles.uploadText, { color: colors.primary }]}>
            Get from Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={uploadButtonStyle}
          onPress={onCameraCapture}
          disabled={isSubmitting}
        >
          <Ionicons name="camera-outline" size={28} color={colors.primary} />
          <Text style={[styles.uploadText, { color: colors.primary }]}>
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.imagePreviewContainer}>
        {images.map((img, idx) => (
          <View key={idx} style={styles.imageWrapper}>
            <Image source={{ uri: img.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeIcon}
              onPress={() => onRemoveImage(idx)}
              disabled={isSubmitting}
            >
              <Ionicons name="close-circle" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </>
  );
});

// Form Input Component
export const FormInput = memo<FormInputProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const themedColor = theme === 'dark';

  const labelStyle = useMemo(() => [
    styles.label,
    { color: themedColor ? colors.lightHeader : colors.darkHeader }
  ], [themedColor]);

  const inputStyle = useMemo(() => [
    styles.input,
    multiline && styles.textArea,
    {
      backgroundColor: themedColor ? colors.darkCard : colors.lightCard,
      color: themedColor ? colors.lightText : colors.textPrimary
    }
  ], [themedColor, multiline]);

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
        editable={!isSubmitting}
      />
    </>
  );
});

// Location Selector Component
export const LocationSelector = memo<LocationSelectorProps>(({
  location,
  onLocationSelect,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const themedColor = theme === 'dark';

  const labelStyle = useMemo(() => [
    styles.label,
    { color: themedColor ? colors.lightHeader : colors.darkHeader }
  ], [themedColor]);

  const selectorStyle = useMemo(() => [
    styles.locationSelector,
    {
      backgroundColor: themedColor ? colors.darkCard : colors.lightCard
    }
  ], [themedColor]);

  const textStyle = useMemo(() => ({
    color: location.name ? colors.lightText : colors.darkBorder
  }), [location.name]);

  return (
    <>
      <Text style={labelStyle}>Location</Text>
      <TouchableOpacity
        style={selectorStyle}
        onPress={onLocationSelect}
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
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const themedColor = theme === 'dark';

  const submitButtonStyle = useMemo(() => [
    styles.submitButton,
    {
      backgroundColor: isSubmitting 
        ? (themedColor ? colors.darkBorder : colors.lightText)
        : (themedColor ? colors.primary : colors.primaryDark),
      opacity: isSubmitting ? 0.7 : 1
    }
  ], [themedColor, isSubmitting]);

  const cancelButtonStyle = useMemo(() => [
    styles.cancelButton,
    { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }
  ], [themedColor]);

  return (
    <>
      <TouchableOpacity
        style={submitButtonStyle}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.lightHeader} size="small" />
            <Text style={[styles.submitText, { marginLeft: 8 }]}>Submitting...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Submit Product</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={cancelButtonStyle}
        onPress={onCancel}
        disabled={isSubmitting}
      >
        <Text style={[styles.cancelText, { color: colors.primaryDark }]}>Cancel</Text>
      </TouchableOpacity>
    </>
  );
});

// Main Form Container Component
export const FormContainer = memo<{
  children: React.ReactNode;
}>(({ children }) => {
  const { theme } = useTheme();
  const themedColor = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: themedColor ? colors.darkHeader : colors.background }
  ], [themedColor]);

  return (
    <ScrollView contentContainerStyle={containerStyle}>
      {children}
    </ScrollView>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    padding: ADD_PRODUCT_CONSTANTS.CONTAINER_PADDING,
    paddingBottom: ADD_PRODUCT_CONSTANTS.BOTTOM_PADDING,
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
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreview: {
    width: ADD_PRODUCT_CONSTANTS.IMAGE_PREVIEW_SIZE,
    height: ADD_PRODUCT_CONSTANTS.IMAGE_PREVIEW_SIZE,
    borderRadius: 8,
    marginRight: 8,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginTop: 10,
  },
  removeIcon: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: colors.semitransparentwhite,
    borderRadius: 20,
    zIndex: 1,
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
  },
  locationSelector: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 16,
    justifyContent: 'center' as const,
  },
});