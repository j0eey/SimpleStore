import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { useCartScreen } from './useCart';
import { CartContainer, CartHeader, EmptyCart, CartList, CartSummary } from './CartComponents';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const CartScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // Custom hook for all cart logic
  const {
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
  } = useCartScreen();

  // Navigation handler
  const handleStartShopping = () => {
    navigation.navigate('Home');
  };

  // Empty cart state
  if (cart.length === 0) {
    return <EmptyCart onStartShopping={handleStartShopping} />;
  }

  // Main cart content
  return (
    <CartContainer>
      <CartHeader itemCount={cart.length} />
      
      <CartList
        cart={cart}
        onIncreaseQuantity={handleIncreaseQuantity}
        onDecreaseQuantity={handleDecreaseQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <CartSummary
        cart={cart}
        summaryExpanded={summaryExpanded}
        summaryHeight={summaryHeight}
        onToggleSummary={toggleSummary}
        onCheckout={handleCheckout}
        onClearCart={handleClearCart}
        calculateTotal={calculateTotal}
      />
    </CartContainer>
  );
};

export default CartScreen;