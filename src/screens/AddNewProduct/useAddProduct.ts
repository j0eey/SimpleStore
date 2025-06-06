import { useState, useCallback, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { LocationType } from '../../types/types';
import { addProductApi } from '../../api/products.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getProductSuccessMessage } from '../../utils/getSuccessMessage';
import { getFailureMessage, getProductFailureCreationMessage } from '../../utils/getFailureMessage';
import OneSignalService from '../../services/OneSignalService';
import { ADD_PRODUCT_CONSTANTS, VALIDATION_MESSAGES } from './constants';
import { locationCallbackManager } from '../Maps/LocationCallbackManager';

export const useAddProduct = (navigation: any) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState<LocationType>({
    name: '',
    latitude: 0,
    longitude: 0,
  });
  const [images, setImages] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique callback ID
  const callbackId = `add_product_location_${Date.now()}_${Math.random()}`;

  // Register location callback
  useEffect(() => {
    const handleLocationSelected = (selectedLocation: LocationType) => {
      setLocation(selectedLocation);
    };

    locationCallbackManager.register(callbackId, handleLocationSelected);

    // Cleanup when component unmounts
    return () => {
      locationCallbackManager.unregister(callbackId);
    };
  }, [callbackId]);

  // Handle location selection from map (keep this for backward compatibility if needed)
  useFocusEffect(
    useCallback(() => {
      const currentRoute = navigation.getState().routes[navigation.getState().index];
      if (currentRoute.params && 'selectedLocation' in currentRoute.params) {
        const params = currentRoute.params as { selectedLocation?: LocationType };

        if (params.selectedLocation) {
          setLocation(params.selectedLocation);
        }
      }
    }, [navigation])
  );

  // Image handling
  const handleImagePick = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: ADD_PRODUCT_CONSTANTS.MAX_IMAGES,
        includeBase64: true
      });

      if (Array.isArray(result.assets)) {
        const assets = result.assets as Asset[];
        setImages(prev => [...prev, ...assets].slice(0, ADD_PRODUCT_CONSTANTS.MAX_IMAGES));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    }
  }, []);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: getErrorMessage(err),
        });
        return false;
      }
    }
    return true;
  }, []);

  const handleCameraCapture = useCallback(async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: getFailureMessage(VALIDATION_MESSAGES.CAMERA_PERMISSION),
      });
      return;
    }

    try {
      const result = await launchCamera({ mediaType: 'photo' });

      if (Array.isArray(result.assets)) {
        const assets = result.assets as Asset[];
        setImages(prev => [...prev, ...assets].slice(0, ADD_PRODUCT_CONSTANTS.MAX_IMAGES));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    }
  }, [requestCameraPermission]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!name || !description || !price || !location.name || images.length === 0) {
      Toast.show({
        type: 'error',
        text1: getFailureMessage(VALIDATION_MESSAGES.REQUIRED_FIELDS),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('location[name]', location.name);
      formData.append('location[latitude]', String(location.latitude));
      formData.append('location[longitude]', String(location.longitude));

      images.forEach((img, index) => {
        formData.append('images', {
          uri: img.uri!,
          type: img.type!,
          name: img.fileName || `photo${index}.jpg`,
        });
      });

      const response = await addProductApi(formData);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: getProductSuccessMessage(response),
      });

      // Trigger OneSignal notification
      try {
        await OneSignalService.showProductAddedNotification(response);
      } catch (notificationError) {
        // Don't fail the entire operation if notification fails
      }

      // Navigate back
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getProductFailureCreationMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, price, location, images, navigation]);

  // Reset form and navigate back
  const handleCancel = useCallback(() => {
    setName('');
    setDescription('');
    setPrice('');
    setLocation({ name: '', latitude: 0, longitude: 0 });
    setImages([]);
    navigation.goBack();
  }, [navigation]);

  // ✅ FIXED: Now uses callback system instead of passing function
  const handleLocationSelect = useCallback(() => {
    navigation.navigate('MapsScreen', {
      callbackId: callbackId, // Pass string ID instead of function
    });
  }, [navigation, callbackId]);

  return {
    // Form state
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    location,
    images,
    isSubmitting,
    
    // Handlers
    handleImagePick,
    handleCameraCapture,
    removeImage,
    handleSubmit,
    handleCancel,
    handleLocationSelect,
  };
};