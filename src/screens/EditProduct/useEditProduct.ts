import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { LocationType } from '../../types/types';
import { updateProductApi, fetchProductByIdApi } from '../../api/products.api';
import { getUpdatedProductSuccessMessage } from '../../utils/getSuccessMessage';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { EDIT_PRODUCT_CONSTANTS, EDIT_PRODUCT_MESSAGES } from './constants';
import { locationCallbackManager } from '../Maps/LocationCallbackManager';

interface FormData {
  name: string;
  description: string;
  price: string;
  location: LocationType;
}

export const useEditProduct = (productId: string, navigation: any) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    location: {
      name: '',
      latitude: 0,
      longitude: 0,
    },
  });
  const [images, setImages] = useState<Asset[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate unique callback ID
  const callbackId = `edit_product_location_${productId}_${Date.now()}_${Math.random()}`;

  // Derived values
  const remainingExistingImages = existingImages.filter(img => !imagesToDelete.includes(img));
  const totalCurrentImages = remainingExistingImages.length + images.length;
  const availableImageSlots = Math.max(0, EDIT_PRODUCT_CONSTANTS.MAX_IMAGES - totalCurrentImages);
  const canAddMoreImages = availableImageSlots > 0;
  const isFormValid = Boolean(
    formData.name &&
    formData.description &&
    formData.price &&
    formData.location.name &&
    totalCurrentImages > 0
  );

  // Register location callback
  useEffect(() => {
    const handleLocationSelected = (selectedLocation: LocationType) => {
      setFormData(prev => ({ ...prev, location: selectedLocation }));
    };

    locationCallbackManager.register(callbackId, handleLocationSelected);

    // Cleanup when component unmounts
    return () => {
      locationCallbackManager.unregister(callbackId);
    };
  }, [callbackId]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!productId) throw new Error(EDIT_PRODUCT_MESSAGES.NO_PRODUCT_ID);
        
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
        showErrorToast(error);
        navigation.goBack();
      }
    };

    fetchProduct();
  }, [productId, navigation]);

  // Handle location selection from map (keep this for backward compatibility if needed)
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

  // Image handling
  const handleImagePick = useCallback(async () => {
    if (availableImageSlots <= 0) {
      showErrorToast(`Maximum ${EDIT_PRODUCT_CONSTANTS.MAX_IMAGES} ${EDIT_PRODUCT_MESSAGES.MAX_IMAGES_EXCEEDED}`);
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: availableImageSlots,
        includeBase64: true,
      });

      if (result.assets?.length) {
        const newAssetsToAdd = result.assets.slice(0, availableImageSlots);
        setImages(prev => [...prev, ...newAssetsToAdd]);
      }
    } catch (error) {
      showErrorToast(error);
    }
  }, [availableImageSlots]);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
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
  }, []);

  const handleCameraCapture = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showErrorToast(EDIT_PRODUCT_MESSAGES.CAMERA_PERMISSION_REQUIRED);
      return;
    }

    if (availableImageSlots <= 0) {
      showErrorToast(`Maximum ${EDIT_PRODUCT_CONSTANTS.MAX_IMAGES} ${EDIT_PRODUCT_MESSAGES.MAX_IMAGES_EXCEEDED}`);
      return;
    }

    try {
      const result = await launchCamera({ mediaType: 'photo' });
      if (result.assets?.length) {
        setImages(prev => [...prev, ...result.assets as Asset[]]);
      }
    } catch (error) {
      showErrorToast(error);
    }
  }, [availableImageSlots, requestCameraPermission]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback((imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
  }, []);

  // Form handling
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const createFormPayload = useCallback(() => {
    const formDataPayload = new FormData();
    
    // Add basic fields
    formDataPayload.append('title', formData.name);
    formDataPayload.append('description', formData.description);
    formDataPayload.append('price', formData.price);
    formDataPayload.append('location[name]', formData.location.name);
    formDataPayload.append('location[latitude]', String(formData.location.latitude));
    formDataPayload.append('location[longitude]', String(formData.location.longitude));

    // Add images to delete
    imagesToDelete.forEach(imgUrl => {
      formDataPayload.append('imagesToDelete[]', imgUrl);
    });

    // Add new images
    images.forEach((img, index) => {
      formDataPayload.append('images', {
        uri: img.uri!,
        type: img.type!,
        name: img.fileName || `photo${index}.jpg`,
      } as any);
    });

    return formDataPayload;
  }, [formData, imagesToDelete, images]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      showErrorToast(EDIT_PRODUCT_MESSAGES.FILL_ALL_FIELDS);
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
  }, [isFormValid, createFormPayload, productId, navigation]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ✅ FIXED: Now uses callback system instead of passing function
  const handleLocationSelect = useCallback(() => {
    navigation.navigate('MapsScreen', {
      initialLocation: formData.location,
      callbackId: callbackId, // Pass string ID instead of function
    });
  }, [navigation, formData.location, callbackId]);

  // Helper functions
  const showErrorToast = useCallback((error: unknown) => {
    Toast.show({
      type: 'error',
      text1: getErrorMessage(error),
    });
  }, []);

  return {
    // State
    formData,
    images,
    existingImages,
    imagesToDelete,
    isSubmitting,
    isLoading,
    
    // Derived values
    remainingExistingImages,
    totalCurrentImages,
    availableImageSlots,
    canAddMoreImages,
    isFormValid,
    
    // Handlers
    handleInputChange,
    handleImagePick,
    handleCameraCapture,
    removeImage,
    removeExistingImage,
    handleSubmit,
    handleCancel,
    handleLocationSelect,
  };
};