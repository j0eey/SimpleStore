import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, CartContextType } from '../types/Cart';
import { Product } from '../types/Product';
import Toast from 'react-native-toast-message';


const CART_STORAGE_KEY = '@myMarket_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); 

  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to load shopping cart.',
          text2: 'Please restart the app if issues persist.'
        });
      } finally {
        setIsLoaded(true);
      }
    };
    loadCart();
  }, []);

  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
      }
    };
    if (isLoaded) {
      saveCart();
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item._id === product._id);

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const currentQuantity = updatedCart[existingItemIndex].quantity;
        const newQuantity = currentQuantity + 1;
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQuantity,
        };
        Toast.show({
          type: 'info',
          text1: `Quantity for "${product.title}" updated!`,
          text2: `New quantity: ${newQuantity}`,
        });
        return updatedCart;
      } else {
        const newItem: CartItem = { ...product, quantity: quantityToAdd };
        Toast.show({
          type: 'success',
          text1: `"${product.title}" added to cart!`,
          text2: `Quantity: ${quantityToAdd}`,
        });
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item._id !== productId);
      Toast.show({
        type: 'success',
        text1: 'Item removed from cart.',
      });
      return updatedCart;
    });
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item._id !== productId);
      }

      const updatedCart = prevCart.map(item =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      );
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    Toast.show({
      type: 'info',
      text1: 'Cart cleared!',
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
