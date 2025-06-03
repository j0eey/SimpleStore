import { Asset } from "react-native-image-picker";
import { LocationType } from "../../types/types";

export interface FormHeaderProps {
  title: string;
}

export interface ImageUploadSectionProps {
  images: Asset[];
  onImagePick: () => void;
  onCameraCapture: () => void;
  onRemoveImage: (index: number) => void;
  isSubmitting: boolean;
}

export interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric';
  isSubmitting: boolean;
}

export interface LocationSelectorProps {
  location: LocationType;
  onLocationSelect: () => void;
  isSubmitting: boolean;
}

export interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}