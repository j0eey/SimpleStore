import { Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');

export const LAYOUT = {
  HORIZONTAL_PADDING: 16,
  CARD_GAP: 12,
  CARD_WIDTH: (width - 16 * 2 - 12) / 2,
};

export const scaleFont = (size: number) => size * PixelRatio.getFontScale();

export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};