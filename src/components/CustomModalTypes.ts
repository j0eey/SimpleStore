export type ButtonProps = {
  label: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'text';
};

export type CustomModalProps = {
  isVisible: boolean;
  title: string;
  message: string;
  buttons?: ButtonProps[];
  onClose?: () => void;
};