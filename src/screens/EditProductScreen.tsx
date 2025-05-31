import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';

import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { updateProductApi, fetchProductByIdApi } from '../api/products.api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, LocationType } from '../types/types';
import { getUpdatedProductSuccessMessage} from '../utils/getSuccessMessage';
import { getErrorMessage } from '../utils/getErrorMessage';
type RouteParams = {
  productId: string;
};

type ImageSource = {
  uri: string;
  type?: string;
  fileName?: string;
};

const MAX_IMAGES = 5;

const EditProductScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { productId } = route.params as RouteParams;
  const { theme } = useTheme();
  
  // State management
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    location: {
      name: '',
      latitude: 0,
      longitude: 0,
    } as LocationType,
  });
  const [images, setImages] = useState<Asset[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Derived values
  const themedStyles = getThemedStyles(theme);
  const availableImageSlots = MAX_IMAGES - (existingImages.length - imagesToDelete.length + images.length);
  const canAddMoreImages = availableImageSlots > 0;
  const isFormValid = Boolean(
    formData.name &&
    formData.description &&
    formData.price &&
    formData.location.name &&
    (existingImages.length - imagesToDelete.length + images.length) > 0
  );

  // Data fetching
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!productId) throw new Error('No product ID provided');
        
        const product = await fetchProductByIdApi(productId);
        
        setFormData({
          name: product.title,
          description: product.description,
          price: product.price.toString(),
          location: product.location,
        });
        setExistingImages(product.images.map(img => img.fullUrl));
        setIsLoading(false);
      } catch (error) {
        Toast.show({ type: 'error', text1: getErrorMessage(error) });
        navigation.goBack();
      }
    };

    fetchProduct();
  }, [productId, navigation]);

  // Image handling
  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: availableImageSlots,
        includeBase64: true,
      });

      if (result.assets?.length) {
        setImages(prev => [...prev, ...result.assets as Asset[]].slice(0, MAX_IMAGES - (existingImages.length - imagesToDelete.length)));
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      showErrorToast(err);
      return false;
    }
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showErrorToast('Camera permission is required to take photos.');
      return;
    }

    try {
      const result = await launchCamera({ mediaType: 'photo' });
      if (result.assets?.length) {
        setImages(prev => [...prev, ...result.assets as Asset[]].slice(0, MAX_IMAGES - (existingImages.length - imagesToDelete.length)));
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete(prev => [...prev, imageToDelete]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async () => {
    if (!isFormValid) {
      showErrorToast('Please fill out all fields and ensure at least one image exists.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = createFormPayload();
      const response = await updateProductApi(productId, formPayload);
      
      Toast.show({ type: 'success', text1: getUpdatedProductSuccessMessage(response) });
      navigation.goBack();
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createFormPayload = () => {
    const formDataPayload = new FormData();
    
    // Add basic fields
    formDataPayload.append('title', formData.name);
    formDataPayload.append('description', formData.description);
    formDataPayload.append('price', formData.price);
    formDataPayload.append('location[name]', formData.location.name);
    formDataPayload.append('location[latitude]', String(formData.location.latitude));
    formDataPayload.append('location[longitude]', String(formData.location.longitude));

    // Add images to delete
    imagesToDelete.forEach(img => {
      formDataPayload.append('imagesToDelete[]', img);
    });

    // Add new images
    images.forEach((img, index) => {
      formDataPayload.append('images', {
        uri: img.uri!,
        type: img.type!,
        name: img.fileName || `photo${index}.jpg`,
      } as ImageSource);
    });

    return formDataPayload;
  };

  // Location handling
  useFocusEffect(
    useCallback(() => {
      const currentRoute = navigation.getState().routes[navigation.getState().index];
      if (currentRoute.params && 'selectedLocation' in currentRoute.params) {
        const { selectedLocation } = currentRoute.params as { selectedLocation?: LocationType };
        if (selectedLocation) {
          setFormData(prev => ({ ...prev, location: selectedLocation }));
        }
      }
    }, [navigation])
  );

  // Helper functions
  const showErrorToast = (error: unknown) => {
    Toast.show({
      type: 'error',
      text1: getErrorMessage(error),
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={themedStyles.container}>
      <Text style={themedStyles.title}>Edit Product</Text>
      
      {/* Image Upload Section */}
      <ImageUploadSection
        themedStyles={themedStyles}
        canAddMoreImages={canAddMoreImages}
        isSubmitting={isSubmitting}
        onGalleryPress={handleImagePick}
        onCameraPress={handleCameraCapture}
      />
      
      {/* Image Preview Section */}
      <ImagePreviewSection
        themedStyles={themedStyles}
        existingImages={existingImages}
        newImages={images}
        isSubmitting={isSubmitting}
        onRemoveExisting={removeExistingImage}
        onRemoveNew={removeImage}
      />
      
      {/* Form Fields */}
      <FormField
        label="Name"
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        placeholder="Enter product name"
        themedStyles={themedStyles}
        editable={!isSubmitting}
      />
      
      <FormField
        label="Description"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        placeholder="Enter description"
        themedStyles={themedStyles}
        multiline
        numberOfLines={4}
        editable={!isSubmitting}
      />
      
      <FormField
        label="Price (USD)"
        value={formData.price}
        onChangeText={(value) => handleInputChange('price', value)}
        placeholder="Enter price"
        themedStyles={themedStyles}
        keyboardType="numeric"
        editable={!isSubmitting}
      />
      
      {/* Location Picker */}
      <LocationPicker
        location={formData.location}
        themedStyles={themedStyles}
        isSubmitting={isSubmitting}
        onPress={() =>
          navigation.navigate('MapsScreen', {
            initialLocation: formData.location,
            onLocationSelected: (selectedLocation: LocationType) => {
              setFormData(prev => ({ ...prev, location: selectedLocation }));
            },
          })
        }
      />
      
      {/* Action Buttons */}
      <SubmitButton
        isSubmitting={isSubmitting}
        themedStyles={themedStyles}
        onPress={handleSubmit}
        disabled={!isFormValid || isSubmitting}
      />
      
      <CancelButton
        themedStyles={themedStyles}
        onPress={() => navigation.goBack()}
        disabled={isSubmitting}
      />
    </ScrollView>
  );
};

// Component Sub-sections
const ImageUploadSection = ({
  themedStyles,
  canAddMoreImages,
  isSubmitting,
  onGalleryPress,
  onCameraPress,
}: {
  themedStyles: any;
  canAddMoreImages: boolean;
  isSubmitting: boolean;
  onGalleryPress: () => void;
  onCameraPress: () => void;
}) => (
  <>
    <Text style={themedStyles.label}>Product Images</Text>
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity
        style={themedStyles.imageUpload}
        onPress={onGalleryPress}
        disabled={isSubmitting || !canAddMoreImages}
      >
        <Ionicons name="image-outline" size={28} color={colors.primary} />
        <Text style={themedStyles.uploadText}>Get from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={themedStyles.imageUpload}
        onPress={onCameraPress}
        disabled={isSubmitting || !canAddMoreImages}
      >
        <Ionicons name="camera-outline" size={28} color={colors.primary} />
        <Text style={themedStyles.uploadText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  </>
);

const ImagePreviewSection = ({
  themedStyles,
  existingImages,
  newImages,
  isSubmitting,
  onRemoveExisting,
  onRemoveNew,
}: {
  themedStyles: any;
  existingImages: string[];
  newImages: Asset[];
  isSubmitting: boolean;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
}) => (
  <ScrollView horizontal style={themedStyles.imagePreviewContainer}>
    {existingImages.map((img, idx) => (
      <View key={`existing-${idx}`} style={themedStyles.imageWrapper}>
        <Image source={{ uri: img }} style={themedStyles.imagePreview} />
        <TouchableOpacity
          style={themedStyles.removeIcon}
          onPress={() => onRemoveExisting(idx)}
          disabled={isSubmitting}
        >
          <Ionicons name="close-circle" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
    ))}
    {newImages.map((img, idx) => (
      <View key={`new-${idx}`} style={themedStyles.imageWrapper}>
        <Image source={{ uri: img.uri }} style={themedStyles.imagePreview} />
        <TouchableOpacity
          style={themedStyles.removeIcon}
          onPress={() => onRemoveNew(idx)}
          disabled={isSubmitting}
        >
          <Ionicons name="close-circle" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
);

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  themedStyles,
  multiline = false,
  numberOfLines,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  themedStyles: any;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: string;
  editable?: boolean;
}) => (
  <>
    <Text style={themedStyles.label}>{label}</Text>
    <TextInput
      style={[
        themedStyles.input,
        multiline && themedStyles.textArea,
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.darkBorder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType as any}
      editable={editable}
    />
  </>
);

const LocationPicker = ({
  location,
  themedStyles,
  isSubmitting,
  onPress,
}: {
  location: LocationType;
  themedStyles: any;
  isSubmitting: boolean;
  onPress: () => void;
}) => (
  <>
    <Text style={themedStyles.label}>Location</Text>
    <TouchableOpacity
      style={[themedStyles.input, { justifyContent: 'center' }]}
      onPress={onPress}
      disabled={isSubmitting}
    >
      <Text style={{ color: location.name ? colors.lightText : colors.darkBorder }}>
        {location.name || 'Select location on map'}
      </Text>
    </TouchableOpacity>
  </>
);

const SubmitButton = ({
  isSubmitting,
  themedStyles,
  onPress,
  disabled,
}: {
  isSubmitting: boolean;
  themedStyles: any;
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity
    style={[
      themedStyles.submitButton,
      { opacity: disabled ? 0.7 : 1 }
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    {isSubmitting ? (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator color={colors.lightHeader} size="small" />
        <Text style={[themedStyles.submitText, { marginLeft: 8 }]}>Updating...</Text>
      </View>
    ) : (
      <Text style={themedStyles.submitText}>Update Product</Text>
    )}
  </TouchableOpacity>
);

const CancelButton = ({
  themedStyles,
  onPress,
  disabled,
}: {
  themedStyles: any;
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity
    style={themedStyles.cancelButton}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={themedStyles.cancelText}>Cancel</Text>
  </TouchableOpacity>
);

// Style helper
const getThemedStyles = (theme: string) => {
  const isDark = theme === 'dark';
  
  return StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 60,
      backgroundColor: isDark ? colors.darkHeader : colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      fontFamily: fonts.semiBold,
      textAlign: 'center',
      marginBottom: 20,
      color: isDark ? colors.lightHeader : colors.darkHeader,
    },
    label: {
      fontSize: 16,
      fontFamily: fonts.semiBold,
      marginBottom: 6,
      color: isDark ? colors.lightHeader : colors.darkHeader,
    },
    input: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: fonts.regular,
      marginBottom: 16,
      backgroundColor: isDark ? colors.darkCard : colors.lightCard,
      color: isDark ? colors.lightText : colors.textPrimary,
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
      backgroundColor: isDark ? colors.darkCard : colors.lightCard,
    },
    uploadText: {
      fontSize: 14,
      fontFamily: fonts.medium,
      marginLeft: 8,
      color: colors.primary,
    },
    imagePreviewContainer: {
      marginBottom: 16,
    },
    imagePreview: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 8,
    },
    submitButton: {
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      backgroundColor: isDark ? colors.primary : colors.primaryDark,
    },
    submitText: {
      color: colors.lightHeader,
      fontSize: 16,
      fontFamily: fonts.semiBold,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: isDark ? colors.darkHeader : colors.background,
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
      backgroundColor: isDark ? colors.darkCard : colors.lightCard,
    },
    cancelText: {
      fontSize: 16,
      fontFamily: fonts.medium,
      color: colors.primaryDark,
    },
  });
};

export default EditProductScreen;