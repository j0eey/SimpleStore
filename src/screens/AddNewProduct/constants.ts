export const ADD_PRODUCT_CONSTANTS = {
  MAX_IMAGES: 5,
  IMAGE_PREVIEW_SIZE: 80,
  CONTAINER_PADDING: 16,
  BOTTOM_PADDING: 60,
  DESCRIPTION_LINES: 4,
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: 'Please fill out all fields and add at least one image.',
  CAMERA_PERMISSION: 'Camera permission is required to take photos.',
} as const;