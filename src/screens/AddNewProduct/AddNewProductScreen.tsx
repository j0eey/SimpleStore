import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';

// Custom hooks and components
import { useAddProduct } from './useAddProduct';
import {
  FormContainer,
  FormHeader,
  ImageUploadSection,
  FormInput,
  LocationSelector,
  FormActions,
} from './AddProductComponents';
import { ADD_PRODUCT_CONSTANTS } from './constants';

const AddNewProductScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Custom hook for all form logic
  const {
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
  } = useAddProduct(navigation);

  return (
    <FormContainer>
      <FormHeader title="Add New Item" />

      <ImageUploadSection
        images={images}
        onImagePick={handleImagePick}
        onCameraCapture={handleCameraCapture}
        onRemoveImage={removeImage}
        isSubmitting={isSubmitting}
      />

      <FormInput
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter product name"
        isSubmitting={isSubmitting}
      />

      <FormInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
        numberOfLines={ADD_PRODUCT_CONSTANTS.DESCRIPTION_LINES}
        isSubmitting={isSubmitting}
      />

      <FormInput
        label="Price (USD)"
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
        isSubmitting={isSubmitting}
      />

      <LocationSelector
        location={location}
        onLocationSelect={handleLocationSelect}
        isSubmitting={isSubmitting}
      />

      <FormActions
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </FormContainer>
  );
};

export default AddNewProductScreen;