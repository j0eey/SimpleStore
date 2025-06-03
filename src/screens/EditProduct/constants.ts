export const EDIT_PRODUCT_CONSTANTS = {
  MAX_IMAGES: 5,
  IMAGE_PREVIEW_SIZE: 80,
  CONTAINER_PADDING: 16,
  BOTTOM_PADDING: 60,
  DESCRIPTION_LINES: 4,
  IMAGE_PREVIEW_HEIGHT: 100,
} as const;

export const EDIT_PRODUCT_MESSAGES = {
  NO_PRODUCT_ID: 'No product ID provided',
  MAX_IMAGES_EXCEEDED: 'images allowed',
  CAMERA_PERMISSION_REQUIRED: 'Camera permission is required to take photos.',
  FILL_ALL_FIELDS: 'Please fill out all fields and ensure at least one image exists.',
} as const;