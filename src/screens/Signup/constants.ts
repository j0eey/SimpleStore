import { z } from 'zod';

// Validation schema
export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Form default values
export const FORM_DEFAULTS: SignupFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

// UI measurements
export const UI_MEASUREMENTS = {
  containerPadding: 24,
  titleMarginBottom: 32,
  inputMarginBottom: 12,
  errorMarginBottom: 10,
  errorMarginLeft: 4,
  buttonMarginTop: 12,
  linkMarginTop: 20,
  eyeButtonPadding: 10,
  inputPadding: 16,
  inputVerticalPadding: 12,
  borderRadius: 10,
} as const;

// Typography
export const TEXT_CONFIG = {
  titleFontSize: 28,
  inputFontSize: 16,
  buttonFontSize: 18,
  linkFontSize: 16,
  errorFontSize: 13,
} as const;

// Form configuration
export const FORM_CONFIG = {
  validationMode: 'onChange' as const,
  successDelayMs: 3000,
  passwordMinLength: 6,
} as const;

// Icon configuration
export const ICONS = {
  eyeOpen: 'eye' as const,
  eyeClosed: 'eye-off' as const,
  size: 22,
} as const;

// Messages
export const MESSAGES = {
  title: 'Create Account',
  submitButton: 'Sign Up',
  loginPrompt: 'Already have an account? ',
  loginLink: 'Login',
  firstNamePlaceholder: 'First Name',
  lastNamePlaceholder: 'Last Name',
  emailPlaceholder: 'Email',
  passwordPlaceholder: 'Password',
} as const;

// Accessibility labels
export const ACCESSIBILITY = {
  passwordToggle: 'Toggle password visibility',
  submitButton: 'button',
  loginLink: 'link',
} as const;