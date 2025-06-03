import { Asset } from "react-native-image-picker";
import { LocationType } from "../../types/types";


export interface LoadingScreenProps {}

export interface FormHeaderProps {
  title: string;
}

export interface ImageUploadSectionProps {
  canAddMoreImages: boolean;
  isSubmitting: boolean;
  onGalleryPress: () => void;
  onCameraPress: () => void;
}

export interface ImagePreviewSectionProps {
  existingImages: string[];
  imagesToDelete: string[];
  newImages: Asset[];
  isSubmitting: boolean;
  onRemoveExisting: (imageUrl: string) => void;
  onRemoveNew: (index: number) => void;
}

export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric';
  editable?: boolean;
}

export interface LocationPickerProps {
  location: LocationType;
  isSubmitting: boolean;
  onPress: () => void;
}

export interface FormActionsProps {
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  disabled: boolean;
}
