export const LOGIN_CONSTANTS = {
  CONTAINER_PADDING: 24,
  TITLE_MARGIN_BOTTOM: 32,
  INPUT_MARGIN_BOTTOM: 12,
  ERROR_MARGIN_BOTTOM: 8,
  BUTTON_MARGIN_TOP: 8,
  TEXT_MARGIN_TOP: 20,
  FORGOT_PASSWORD_MARGIN_TOP: 16,
  TOAST_SUCCESS_DURATION: 2500,
  TOAST_ERROR_DURATION: 3000,
  LOGIN_DELAY: 1000,
  EYE_ICON_SIZE: 22,
  PASSWORD_MIN_LENGTH: 6,
} as const;

export const LOGIN_MESSAGES = {
  TITLE: 'Login',
  EMAIL_PLACEHOLDER: 'Email',
  PASSWORD_PLACEHOLDER: 'Password',
  LOGIN_BUTTON: 'Login',
  NO_ACCOUNT: "Don't have an account?",
  SIGNUP_LINK: 'Sign up here',
  FORGOT_PASSWORD: 'Forgot password?',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_VERIFICATION_REQUIRED: 'Please verify your email before logging in',
  TOGGLE_PASSWORD_VISIBILITY: 'Toggle password visibility',
} as const;

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;