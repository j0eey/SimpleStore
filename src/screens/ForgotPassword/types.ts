import { Control, FieldErrors } from "react-hook-form";

export interface FormData {
  email: string;
}

export interface FormHeaderProps {
  title: string;
}

export interface EmailInputProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
}

export interface SubmitButtonProps {
  onPress: () => void;
  loading: boolean;
}

export interface LoginLinkProps {
  onPress: () => void;
}

export interface MainContainerProps {
  children: React.ReactNode;
}