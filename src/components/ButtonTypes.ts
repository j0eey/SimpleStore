export type ButtonProps = {
  label: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'text';
};