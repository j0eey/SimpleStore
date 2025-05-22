import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  PermissionsAndroid, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { launchCamera, launchImageLibrary, Asset} from 'react-native-image-picker';
import { addProductApi } from '../api/products.api';
import { ProductData } from '../types/Product';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';


type NavigationProp = StackNavigationProp<RootStackParamList, 'AddNewProduct'>;
type AddNewProductRouteProp = RouteProp<RootStackParamList, 'AddNewProduct'>;



const AddNewProductScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddNewProductRouteProp>();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.selectedLocation) {
        setLocation(route.params.selectedLocation);

        // Clear param so it won't trigger again when navigating back
        navigation.setParams({ selectedLocation: undefined });
      }
    }, [route.params?.selectedLocation])
  );



  const [images, setImages] = useState<Asset[]>([]);

  const handleImagePick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 });

    if (Array.isArray(result.assets)) {
      const assets = result.assets as Asset[];
      setImages(prev => [...prev, ...assets].slice(0, 5));
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs permission to access your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required to take photos.');
      return;
    }

    try {
      const result = await launchCamera({ mediaType: 'photo' });

      if (Array.isArray(result.assets)) {
        const assets = result.assets as Asset[];
        setImages(prev => [...prev, ...assets].slice(0, 5));
      } else if (result.didCancel) {
      } else if (result.errorCode || result.errorMessage) {
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async () => {
  if (!name || !description || !price || !location.name || images.length === 0) {
    Alert.alert('Missing Fields', 'Please fill in all fields and upload at least one image.');
    return;
  }

  try {
    const productData: ProductData = {
      title: name,
      description,
      price: Number(price),
      location,
      images: images
        .filter((img): img is Asset & { uri: string } => typeof img.uri === 'string')
        .map(img => ({
          ...img,
          uri: img.uri as string,
        })),
    };

    const res = await addProductApi(productData);
    Toast.show({ type: 'success', text1: 'Product added successfully!' });
    navigation.goBack();
  } catch (error: any) {
    console.error('Submit Error:', error);
    Toast.show({ type: 'error', text1: 'Failed to add product' });
  }
};




  const themedColor = theme === 'dark';
  

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
        >
          <Ionicons name="image-outline" size={28} color={colors.primary} />
          <Text style={[styles.uploadText, { color: colors.primary }]}>Get from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.imageUpload, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
          onPress={handleCameraCapture}
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
            >
              <Ionicons name="close-circle" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
        placeholder="Enter product name"
        placeholderTextColor={colors.darkBorder}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
        placeholder="Enter description"
        placeholderTextColor={colors.darkBorder}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Price</Text>
      <TextInput
        style={[styles.input, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
        placeholder="Enter price"
        placeholderTextColor={colors.darkBorder}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Text style={[styles.label, { color: themedColor ? colors.lightHeader : colors.darkHeader }]}>Location</Text>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center' }]}
        onPress={() => navigation.navigate('SelectLocation')}
      >
        <Text style={{ color: location.name ? colors.text : colors.darkBorder }}>
          {location.name || 'Select Location from Map'}
        </Text>
      </TouchableOpacity>




      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: themedColor ? colors.primary : colors.primaryDark }]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Submit Product</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.cancelButton, { backgroundColor: themedColor ? colors.darkCard : colors.lightCard }]}
        onPress={() => {
          setName('');
          setDescription('');
          setPrice('');
          setLocation({ name: '', latitude: 0, longitude: 0 });
          setImages([]);
          navigation.goBack();
        }}
      >
        <Text style={[styles.cancelText, { color: colors.primaryDark }]}>Cancel</Text>
      </TouchableOpacity>

      

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 60 },
    title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  label: { fontSize: 16, fontFamily: fonts.semiBold, marginBottom: 6 },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    marginRight: 10,
  },
  uploadText: { fontSize: 14, fontFamily: fonts.medium, marginLeft: 8 },
  imagePreviewContainer: { marginBottom: 16 },
  imagePreview: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
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
