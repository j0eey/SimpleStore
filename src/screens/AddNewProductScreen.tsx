import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { addProductApi } from '../api/products.api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, LocationType } from '../types/types';
import { useFocusEffect } from '@react-navigation/native';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getProductSuccessMessage } from '../utils/getSuccessMessage';
import { getFailureMessage, getProductFailureCreationMessage } from '../utils/getFailureMessage';
import OneSignalService from '../services/OneSignalService';

const AddNewProductScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const themedColor = theme === 'dark';
  
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

  /**
   * Handle image selection from gallery
   */
  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
        includeBase64: true
      });

      if (Array.isArray(result.assets)) {
        const assets = result.assets as Asset[];
        setImages(prev => [...prev, ...assets].slice(0, 5));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    }
  };

  /**
   * Request camera permission on Android
   */
  const requestCameraPermission = async (): Promise<boolean> => {
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
  };

  /**
   * Handle camera capture
   */
  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: getFailureMessage('Camera permission is required to take photos.'),
      });
      return;
    }

    try {
      const result = await launchCamera({ mediaType: 'photo' });

      if (Array.isArray(result.assets)) {
        const assets = result.assets as Asset[];
        setImages(prev => [...prev, ...assets].slice(0, 5));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    }
  };

  /**
   * Remove image from selection
   */
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!name || !description || !price || !location.name || images.length === 0) {
      Toast.show({
        type: 'error',
        text1: getFailureMessage('Please fill out all fields and add at least one image.'),
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
  };

  /**
   * Handle location selection from map
   */
  useFocusEffect(
    React.useCallback(() => {
      const currentRoute = navigation.getState().routes[navigation.getState().index];
      if (currentRoute.params && 'selectedLocation' in currentRoute.params) {
        const params = currentRoute.params as { selectedLocation?: LocationType };

        if (params.selectedLocation) {
          setLocation(params.selectedLocation);
        }
      }
    }, [navigation])
  );

  /**
   * Reset form and navigate back
   */
  const handleCancel = () => {
    setName('');
    setDescription('');
    setPrice('');
    setLocation({ name: '', latitude: 0, longitude: 0 });
    setImages([]);
    navigation.goBack();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: themedColor ? colors.darkHeader : colors.background },
      ]}
    >
      <Text style={[styles.title, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>
        Add New Item
      </Text>
      
      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>
        Product Images
      </Text>
      
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.imageUpload, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
          onPress={handleImagePick}
          disabled={isSubmitting}
        >
          <Ionicons name="image-outline" size={28} color={colors.primary} />
          <Text style={[styles.uploadText, { color: colors.primary }]}>Get from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.imageUpload, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
          onPress={handleCameraCapture}
          disabled={isSubmitting}
        >
          <Ionicons name="camera-outline" size={28} color={colors.primary} />
          <Text style={[styles.uploadText, { color: colors.primary }]}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.imagePreviewContainer}>
        {images.map((img, idx) => (
          <View key={idx} style={styles.imageWrapper}>
            <Image source={{ uri: img.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeIcon}
              onPress={() => removeImage(idx)}
              disabled={isSubmitting}
            >
              <Ionicons name="close-circle" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Name</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: themedColor ? colors.darkCard : colors.lightCard,
            color: themedColor ? colors.lightText : colors.textPrimary  
          }
        ]}
        placeholder="Enter product name"
        placeholderTextColor={colors.darkBorder}
        value={name}
        onChangeText={setName}
        editable={!isSubmitting}
      />

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Description</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: themedColor ? colors.darkCard : colors.lightCard,
            color: themedColor ? colors.lightText : colors.textPrimary  
          }
        ]}
        placeholder="Enter description"
        placeholderTextColor={colors.darkBorder}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        editable={!isSubmitting}
      />

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Price (USD)</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: themedColor ? colors.darkCard : colors.lightCard,
            color: themedColor ? colors.lightText : colors.textPrimary  
          }
        ]}
        placeholder="Enter price"
        placeholderTextColor={colors.darkBorder}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        editable={!isSubmitting}
      />

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Location</Text>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center', backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
        onPress={() =>
          navigation.navigate('MapsScreen', {
            onLocationSelected: (selectedLocation: LocationType) => {
              setLocation(selectedLocation);
            },
          })
        }
        disabled={isSubmitting}
      >
        <Text style={{ color: location.name ? colors.lightText  : colors.darkBorder }}>
          {location.name || 'Select location on map'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitButton, 
          { 
            backgroundColor: isSubmitting 
              ? (themedColor ? colors.darkBorder : colors.lightText)
              : (themedColor ? colors.primary : colors.primaryDark),
            opacity: isSubmitting ? 0.7 : 1
          }
        ]}
        onPress={handleSubmit}
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
        style={[styles.cancelButton, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
        onPress={handleCancel}
        disabled={isSubmitting}
      >
        <Text style={[styles.cancelText, { color: colors.primaryDark }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
   padding: 16, 
   paddingBottom: 60 
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
    marginBottom: 6 
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
    textAlignVertical: 'top' 
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
    marginBottom: 16 
  },
  imagePreview: { 
    width: 80, 
    height: 80, 
    borderRadius: 8, 
    marginRight: 8 
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
    fontFamily: fonts.semiBold
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
});

export default AddNewProductScreen;