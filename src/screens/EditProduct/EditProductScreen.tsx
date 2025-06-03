import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RouteParams } from '../../types/types';
import { useEditProduct } from './useEditProduct';
import { FormContainer, LoadingScreen, FormHeader, ImageUploadSection, ImagePreviewSection, FormField, LocationPicker, FormActions } from './EditProductComponents';
import { EDIT_PRODUCT_CONSTANTS } from './constants';

const EditProductScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { productId } = route.params as RouteParams;

  // Custom hook for all edit product logic
  const {
    formData,
    images,
    existingImages,
    imagesToDelete,
    isSubmitting,
    isLoading,
    
    // Derived values
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
  } = useEditProduct(productId, navigation);

  // Show loading screen while fetching product data
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <FormContainer>
      <FormHeader title="Edit Product" />

      <ImageUploadSection
        canAddMoreImages={canAddMoreImages}
        isSubmitting={isSubmitting}
        onGalleryPress={handleImagePick}
        onCameraPress={handleCameraCapture}
      />

      <ImagePreviewSection
        existingImages={existingImages}
        imagesToDelete={imagesToDelete}
        newImages={images}
        isSubmitting={isSubmitting}
        onRemoveExisting={removeExistingImage}
        onRemoveNew={removeImage}
      />

      <FormField
        label="Name"
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        placeholder="Enter product name"
        editable={!isSubmitting}
      />

      <FormField
        label="Description"
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        placeholder="Enter description"
        multiline
        numberOfLines={EDIT_PRODUCT_CONSTANTS.DESCRIPTION_LINES}
        editable={!isSubmitting}
      />

      <FormField
        label="Price (USD)"
        value={formData.price}
        onChangeText={(value) => handleInputChange('price', value)}
        placeholder="Enter price"
        keyboardType="numeric"
        editable={!isSubmitting}
      />

      <LocationPicker
        location={formData.location}
        isSubmitting={isSubmitting}
        onPress={handleLocationSelect}
      />

      <FormActions
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        disabled={!isFormValid || isSubmitting}
      />
    </FormContainer>
  );
};

export default EditProductScreen;