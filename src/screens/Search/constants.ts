// Search configuration constants
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_PLACEHOLDER = 'Search products...';

// Performance optimization constants
export const FLATLIST_CONFIG = {
  maxToRenderPerBatch: 10,
  windowSize: 10,
  removeClippedSubviews: true,
} as const;

// Skeleton configuration
export const SKELETON_ITEMS_COUNT = 6;

// UI measurements
export const UI_MEASUREMENTS = {
  searchBarHeight: 50,
  searchBarBorderRadius: 12,
  productCardBorderRadius: 12,
  productImageSize: 60,
  productImageBorderRadius: 8,
  containerPadding: 16,
  searchBarPadding: 16,
  productCardPadding: 12,
  iconPadding: 4,
  iconMargin: 10,
  productImageMargin: 12,
  listBottomPadding: 20,
  cardMarginBottom: 12,
} as const;

// Shadow configuration
export const CARD_SHADOW = {
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
} as const;

// Text configuration
export const TEXT_CONFIG = {
  searchInputFontSize: 16,
  emptyTextFontSize: 18,
  emptyTextLineHeight: 24,
  productTitleFontSize: 16,
  productTitleLineHeight: 20,
  productPriceFontSize: 16,
  productTitleLines: 2,
} as const;

// Messages
export const MESSAGES = {
  searchPlaceholder: SEARCH_PLACEHOLDER,
  minLengthMessage: 'Type at least 2 characters and press search...',
  noResultsMessage: 'No products found',
  searchErrorMessage: 'Failed to search products',
} as const;

// Icon configuration
export const ICONS = {
  search: 'search' as const,
  close: 'close' as const,
  size: 20,
} as const;