import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PRODUCT_DETAILS_CONSTANTS = {
  IMAGE_HEIGHT: SCREEN_WIDTH * 0.8,
  MAP_HEIGHT: 200,
  CONTENT_PADDING: 20,
  BOTTOM_PADDING: 40,
} as const;