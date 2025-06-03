import { Control, FieldErrors } from "react-hook-form";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface FormHeaderProps {
  title: string;
}

export interface EmailInputProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

export interface PasswordInputProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export interface LoginButtonProps {
  onPress: () => void;
  loading: boolean;
}

export interface AuthLinksProps {
  onSignupPress: () => void;
  onForgotPasswordPress: () => void;
}

export interface MainContainerProps {
  children: React.ReactNode;
}