import { EditableProfile } from "../../types/types";

export interface ProfileImageProps {
  imageUrl?: string;
  onPress?: () => void;
}

export interface EditFormProps {
  editedProfile: EditableProfile;
  onProfileChange: (profile: EditableProfile) => void;
  onSave: () => void;
  onCancel: () => void;
  updating: boolean;
}

export interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFromCamera: () => void;
  onSelectFromLibrary: () => void;
}

export interface ProfileSectionProps {
  children: React.ReactNode;
}

export interface MainContainerProps {
  children: React.ReactNode;
}