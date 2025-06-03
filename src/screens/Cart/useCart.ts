import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { useCart as useCartContext } from '../../contexts/CartContext';
import { CART_CONSTANTS, CART_MESSAGES } from './constants';

export const useCartScreen = () => {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart } = useCartContext();
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const summaryHeight = useRef(new Animated.Value(CART_CONSTANTS.SUMMARY_COLLAPSED_HEIGHT)).current;

  // Animate summary height when expanded/collapsed
  useEffect(() => {
    Animated.timing(summaryHeight, {
      toValue: summaryExpanded 
        ? CART_CONSTANTS.SUMMARY_EXPANDED_HEIGHT 
        : CART_CONSTANTS.SUMMARY_COLLAPSED_HEIGHT,
      duration: CART_CONSTANTS.ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [summaryExpanded, summaryHeight]);

  // Toggle summary expanded state
  const toggleSummary = useCallback(() => {
    setSummaryExpanded(prev => !prev);
  }, []);

  // Calculate cart total
  const calculateTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0).toFixed(2);
  }, [cart]);

  // Handle quantity increase
  const handleIncreaseQuantity = useCallback((itemId: string, currentQuantity: number) => {
    updateCartItemQuantity(itemId, currentQuantity + 1);
  }, [updateCartItemQuantity]);

  // Handle quantity decrease
  const handleDecreaseQuantity = useCallback((itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItemQuantity(itemId, currentQuantity - 1);
    } else {
      Toast.show({
        type: 'info',
        text1: CART_MESSAGES.MINIMUM_QUANTITY,
        text2: CART_MESSAGES.SWIPE_TO_REMOVE,
      });
    }
  }, [updateCartItemQuantity]);

  // Handle item removal
  const handleRemoveItem = useCallback((itemId: string) => {
    removeFromCart(itemId);
  }, [removeFromCart]);

  // Handle clear cart
  const handleClearCart = useCallback(() => {
    clearCart();
    Toast.show({ 
      type: 'success', 
      text1: CART_MESSAGES.CART_CLEARED 
    });
  }, [clearCart]);

  // Handle checkout
  const handleCheckout = useCallback(() => {
    Toast.show({ 
      type: 'success', 
      text1: CART_MESSAGES.PROCEEDING_CHECKOUT 
    });
  }, []);

  return {
    // State
    cart,
    summaryExpanded,
    summaryHeight,
    
    // Actions
    toggleSummary,
    calculateTotal,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleRemoveItem,
    handleClearCart,
    handleCheckout,
  };
};