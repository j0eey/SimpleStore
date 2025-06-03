export const CART_CONSTANTS = {
  SUMMARY_COLLAPSED_HEIGHT: 135,
  SUMMARY_EXPANDED_HEIGHT: 380,
  ANIMATION_DURATION: 300,
  CART_ITEM_IMAGE_SIZE: 80,
  QUANTITY_BADGE_SIZE: 24,
  QUANTITY_BUTTON_SIZE: 32,
  SWIPE_THRESHOLD: 40,
  FRICTION: 2,
} as const;

export const CART_MESSAGES = {
  MINIMUM_QUANTITY: 'Minimum quantity reached',
  SWIPE_TO_REMOVE: 'Use swipe to remove item',
  CART_CLEARED: 'Cart cleared! All items have been removed',
  PROCEEDING_CHECKOUT: 'Proceeding to checkout...',
} as const;