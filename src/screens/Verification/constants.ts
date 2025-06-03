import { z } from 'zod';

// Validation schema
export const verificationSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

export type VerificationFormData = z.infer<typeof verificationSchema>;

// Timing constants
export const TIMING = {
  resendCooldownSeconds: 60,
  successDelayMs: 1000,
  toastVisibilityMs: 3000,
} as const;

// UI measurements
export const UI_MEASUREMENTS = {
  containerPadding: 24,
  titleMarginBottom: 32,
  inputMarginBottom: 6,
  errorMarginBottom: 10,
  errorMarginLeft: 4,
  buttonMarginTop: 16,
  resendMarginTop: 16,
  borderRadius: 10,
  inputPadding: 16,
  inputVerticalPadding: 12,
  buttonVerticalPadding: 14,
} as const;

// Typography
export const TEXT_CONFIG = {
  titleFontSize: 28,
  inputFontSize: 16,
  buttonFontSize: 18,
  resendFontSize: 16,
  errorFontSize: 13,
  codeMaxLength: 6,
} as const;

// Form configuration
export const FORM_CONFIG = {
  codeLength: 6,
  keyboardType: 'numeric' as const,
  autoFocus: true,
} as const;

// Toast configuration
export const TOAST_CONFIG = {
  position: 'top' as const,
  visibilityTime: TIMING.toastVisibilityMs,
  autoHide: true,
} as const;

// Messages
export const MESSAGES = {
  title: 'Enter Verification Code',
  codePlaceholder: '6-digit code',
  verifyButton: 'Verify',
  resendButton: 'Resend Code',
  resendCooldown: (seconds: number) => `Resend in ${seconds}s`,
  resendInfoMessage: (seconds: number) => `You can request a new code in ${seconds} seconds.`,
  noEmailError: 'Email not found. Please try again.',
  verificationSuccess: 'Email verified successfully!',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  isVerified: '@isVerified',
} as const;

// Navigation configuration
export const NAVIGATION_CONFIG = {
  resetIndex: 0,
  loginRouteName: 'Login' as const,
} as const;