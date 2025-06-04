import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { CartProvider, useCart } from '../CartContext';
import { Product } from '../../types/Product';
import { CartItem } from '../../types/Cart';

// AsyncStorage and Toast are already mocked in jest.setup.js
// No need to mock them again here

// Test component to access cart context
const TestComponent = ({ onRender }: { onRender?: (cartData: any) => void }) => {
  const cartContext = useCart();
  
  React.useEffect(() => {
    if (onRender) {
      onRender(cartContext);
    }
  }, [cartContext, onRender]);

  return (
    <>
      <Text testID="cart-count">{cartContext.cart.length}</Text>
      <Text testID="cart-items">{JSON.stringify(cartContext.cart)}</Text>
    </>
  );
};

// Test component for error boundary testing
const TestComponentWithoutProvider = () => {
  try {
    useCart();
    return <Text testID="no-error">No Error</Text>;
  } catch (error) {
    return <Text testID="error">{(error as Error).message}</Text>;
  }
};

describe('CartContext', () => {
  const mockProduct: Product = {
    _id: 'test-product-1',
    title: 'Test Product',
    price: 29.99,
    description: 'A test product',
    images: [
      {
        url: 'test-image.jpg',
        _id: 'img-1',
        fullUrl: 'https://example.com/test-image.jpg',
      }
    ],
    location: {
      name: 'Test Location',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    user: {
      _id: 'user-1',
      email: 'test@example.com',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    __v: 0,
  };

  const mockProduct2: Product = {
    _id: 'test-product-2',
    title: 'Test Product 2',
    price: 49.99,
    description: 'Another test product',
    images: [
      {
        url: 'test-image-2.jpg',
        _id: 'img-2',
        fullUrl: 'https://example.com/test-image-2.jpg',
      }
    ],
    location: {
      name: 'Test Location 2',
      latitude: 41.8781,
      longitude: -87.6298,
    },
    user: {
      _id: 'user-2',
      email: 'test2@example.com',
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    __v: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  // SNAPSHOT TESTS - for cart state structures
  describe('Cart State Snapshots', () => {
    it('should match snapshot for initial empty cart state', async () => {
      let cartData: any;
      
      const TestWrapper = () => (
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      render(<TestWrapper />);

      await waitFor(() => {
        expect(cartData).toBeDefined();
        expect(cartData.cart).toBeDefined();
      });

      expect({
        cart: cartData.cart,
        cartLength: cartData.cart.length,
        availableMethods: Object.keys(cartData).filter(key => typeof cartData[key] === 'function'),
      }).toMatchSnapshot('initial-empty-cart-state');
    });

    it('should match snapshot for cart with single item', async () => {
      let cartData: any;
      
      const TestWrapper = () => (
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      render(<TestWrapper />);

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });

      // Add item to cart
      act(() => {
        cartData.addToCart(mockProduct, 1);
      });

      await waitFor(() => {
        expect(cartData.cart.length).toBe(1);
      });

      expect({
        cart: cartData.cart,
        cartLength: cartData.cart.length,
        firstItem: cartData.cart[0],
      }).toMatchSnapshot('cart-with-single-item');
    });

    it('should match snapshot for cart with multiple items', async () => {
      let cartData: any;
      
      const TestWrapper = () => (
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      render(<TestWrapper />);

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });

      // Add multiple items
      act(() => {
        cartData.addToCart(mockProduct, 2);
        cartData.addToCart(mockProduct2, 1);
      });

      await waitFor(() => {
        expect(cartData.cart.length).toBe(2);
      });

      expect({
        cart: cartData.cart,
        cartLength: cartData.cart.length,
        totalItems: cartData.cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
        productIds: cartData.cart.map((item: CartItem) => item._id),
      }).toMatchSnapshot('cart-with-multiple-items');
    });

    it('should match snapshot for cart operations sequence', async () => {
      let cartData: any;
      const operations: any[] = [];
      
      const TestWrapper = () => (
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      render(<TestWrapper />);

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });

      // Sequence of operations
      act(() => {
        cartData.addToCart(mockProduct, 1);
      });
      await waitFor(() => expect(cartData.cart.length).toBe(1));
      operations.push({ action: 'add', cart: [...cartData.cart] });

      act(() => {
        cartData.addToCart(mockProduct, 1); // Increase quantity
      });
      await waitFor(() => expect(cartData.cart[0].quantity).toBe(2));
      operations.push({ action: 'add_existing', cart: [...cartData.cart] });

      act(() => {
        cartData.updateCartItemQuantity(mockProduct._id, 5);
      });
      await waitFor(() => expect(cartData.cart[0].quantity).toBe(5));
      operations.push({ action: 'update_quantity', cart: [...cartData.cart] });

      act(() => {
        cartData.addToCart(mockProduct2, 2);
      });
      await waitFor(() => expect(cartData.cart.length).toBe(2));
      operations.push({ action: 'add_second_product', cart: [...cartData.cart] });

      act(() => {
        cartData.removeFromCart(mockProduct._id);
      });
      await waitFor(() => expect(cartData.cart.length).toBe(1));
      operations.push({ action: 'remove_first_product', cart: [...cartData.cart] });

      expect(operations).toMatchSnapshot('cart-operations-sequence');
    });

    it('should match snapshot for quantity update scenarios', async () => {
      let cartData: any;
      
      const TestWrapper = () => (
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      render(<TestWrapper />);

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });

      // Add item first
      act(() => {
        cartData.addToCart(mockProduct, 3);
      });

      await waitFor(() => {
        expect(cartData.cart.length).toBe(1);
      });

      const quantityScenarios = [
        { newQuantity: 5, description: 'increase quantity' },
        { newQuantity: 2, description: 'decrease quantity' },
        { newQuantity: 1, description: 'set to minimum' },
        { newQuantity: 0, description: 'set to zero (should remove)' },
      ];

      const results = [];
      for (const scenario of quantityScenarios) {
        act(() => {
          cartData.updateCartItemQuantity(mockProduct._id, scenario.newQuantity);
        });
        
        await waitFor(() => {
          // Wait for state to update
          if (scenario.newQuantity <= 0) {
            expect(cartData.cart.length).toBe(0);
          } else {
            expect(cartData.cart.length).toBe(1);
          }
        });
        
        results.push({
          scenario: scenario.description,
          newQuantity: scenario.newQuantity,
          cartState: [...cartData.cart],
        });

        // Re-add product for next scenario if it was removed
        if (scenario.newQuantity <= 0) {
          act(() => {
            cartData.addToCart(mockProduct, 3);
          });
          await waitFor(() => expect(cartData.cart.length).toBe(1));
        }
      }

      expect(results).toMatchSnapshot('quantity-update-scenarios');
    });
  });

  describe('Toast Notification Snapshots', () => {
    it('should match snapshot for all toast notification calls', async () => {
      let cartData: any;
      
      const TestWrapper = () => (
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      render(<TestWrapper />);

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });

      // Clear previous calls
      (Toast.show as jest.Mock).mockClear();

      // Perform various operations to trigger toasts
      act(() => {
        cartData.addToCart(mockProduct, 1); // New item toast
        cartData.addToCart(mockProduct, 1); // Update quantity toast
        cartData.addToCart(mockProduct2, 2); // Another new item toast
      });

      await waitFor(() => {
        expect(cartData.cart.length).toBe(2);
      });

      act(() => {
        cartData.removeFromCart(mockProduct._id); // Remove item toast
        cartData.clearCart(); // Clear cart toast
      });

      await waitFor(() => {
        expect(cartData.cart.length).toBe(0);
      });

      const toastCalls = (Toast.show as jest.Mock).mock.calls;
      expect(toastCalls).toMatchSnapshot('toast-notification-calls');
    });
  });

  // UNIT TESTS - for behavior and functionality
  describe('CartProvider Behavior', () => {
    it('should provide initial empty cart', async () => {
      let cartData: any;
      
      render(
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartData).toBeDefined();
        expect(cartData.cart).toEqual([]);
      });
    });

    it('should load cart from AsyncStorage on mount', async () => {
      const storedCart: CartItem[] = [
        { ...mockProduct, quantity: 2 },
        { ...mockProduct2, quantity: 1 },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedCart));

      let cartData: any;
      
      render(
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartData).toBeDefined();
        expect(cartData.cart).toEqual(storedCart);
      });
    });

    it('should handle AsyncStorage loading errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      let cartData: any;
      
      render(
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartData).toBeDefined();
        expect(cartData.cart).toEqual([]);
      });

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Failed to load shopping cart.',
        text2: 'Please restart the app if issues persist.'
      });
    });

    it('should save cart to AsyncStorage when cart changes', async () => {
      let cartData: any;
      
      render(
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });

      act(() => {
        cartData.addToCart(mockProduct, 1);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@myMarket_cart',
          JSON.stringify([{ ...mockProduct, quantity: 1 }])
        );
      });
    });
  });

  describe('Cart Operations', () => {
    let cartData: any;

    beforeEach(async () => {
      render(
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });
    });

    describe('addToCart', () => {
      it('should add new item to cart', async () => {
        act(() => {
          cartData.addToCart(mockProduct, 1);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
          expect(cartData.cart[0]).toEqual({ ...mockProduct, quantity: 1 });
        });
        
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: `"${mockProduct.title}" added to cart!`,
          text2: 'Quantity: 1',
        });
      });

      it('should increase quantity for existing item', async () => {
        act(() => {
          cartData.addToCart(mockProduct, 1);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
        });

        act(() => {
          cartData.addToCart(mockProduct, 1);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
          expect(cartData.cart[0].quantity).toBe(2);
        });
        
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'info',
          text1: `Quantity for "${mockProduct.title}" updated!`,
          text2: 'New quantity: 2',
        });
      });

      it('should add multiple different products', async () => {
        act(() => {
          cartData.addToCart(mockProduct, 2);
          cartData.addToCart(mockProduct2, 1);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(2);
          expect(cartData.cart[0]).toEqual({ ...mockProduct, quantity: 2 });
          expect(cartData.cart[1]).toEqual({ ...mockProduct2, quantity: 1 });
        });
      });

      it('should use default quantity of 1 when not specified', async () => {
        act(() => {
          cartData.addToCart(mockProduct);
        });

        await waitFor(() => {
          expect(cartData.cart[0].quantity).toBe(1);
        });
      });
    });

    describe('removeFromCart', () => {
      it('should remove item from cart', async () => {
        act(() => {
          cartData.addToCart(mockProduct, 1);
          cartData.addToCart(mockProduct2, 1);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(2);
        });

        act(() => {
          cartData.removeFromCart(mockProduct._id);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
          expect(cartData.cart[0]._id).toBe(mockProduct2._id);
        });
        
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Item removed from cart.',
        });
      });

      it('should handle removing non-existent item gracefully', async () => {
        act(() => {
          cartData.addToCart(mockProduct, 1);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
        });

        act(() => {
          cartData.removeFromCart('non-existent-id');
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
          expect(cartData.cart[0]._id).toBe(mockProduct._id);
        });
      });
    });

    describe('updateCartItemQuantity', () => {
      beforeEach(async () => {
        act(() => {
          cartData.addToCart(mockProduct, 3);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
        });
      });

      it('should update item quantity', async () => {
        act(() => {
          cartData.updateCartItemQuantity(mockProduct._id, 5);
        });

        await waitFor(() => {
          expect(cartData.cart[0].quantity).toBe(5);
        });
      });

      it('should remove item when quantity is set to 0', async () => {
        act(() => {
          cartData.updateCartItemQuantity(mockProduct._id, 0);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(0);
        });
      });

      it('should remove item when quantity is negative', async () => {
        act(() => {
          cartData.updateCartItemQuantity(mockProduct._id, -1);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(0);
        });
      });

      it('should handle updating non-existent item gracefully', async () => {
        act(() => {
          cartData.updateCartItemQuantity('non-existent-id', 5);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(1);
          expect(cartData.cart[0].quantity).toBe(3); // Original quantity unchanged
        });
      });
    });

    describe('clearCart', () => {
      it('should clear all items from cart', async () => {
        act(() => {
          cartData.addToCart(mockProduct, 1);
          cartData.addToCart(mockProduct2, 2);
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(2);
        });

        act(() => {
          cartData.clearCart();
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(0);
        });
        
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'info',
          text1: 'Cart cleared!',
        });
      });

      it('should handle clearing empty cart', async () => {
        act(() => {
          cartData.clearCart();
        });

        await waitFor(() => {
          expect(cartData.cart).toHaveLength(0);
        });
      });
    });
  });

  describe('useCart Hook', () => {
    it('should throw error when used outside CartProvider', () => {
      const { getByTestId } = render(<TestComponentWithoutProvider />);
      
      expect(getByTestId('error')).toBeTruthy();
      expect(getByTestId('error').props.children).toBe('useCart must be used within a CartProvider');
    });

    it('should provide cart context when used within CartProvider', async () => {
      let cartData: any;
      
      render(
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartData).toBeDefined();
        expect(cartData.cart).toBeDefined();
        expect(typeof cartData.addToCart).toBe('function');
        expect(typeof cartData.removeFromCart).toBe('function');
        expect(typeof cartData.updateCartItemQuantity).toBe('function');
        expect(typeof cartData.clearCart).toBe('function');
      });
    });
  });

  describe('AsyncStorage Integration', () => {
    it('should not save to storage before initial load completes', async () => {
      (AsyncStorage.setItem as jest.Mock).mockClear();
      
      render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Should not save during initial render
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle AsyncStorage save errors silently', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));
      
      let cartData: any;
      
      render(
        <CartProvider>
          <TestComponent onRender={(data) => { cartData = data; }} />
        </CartProvider>
      );

      await waitFor(() => {
        expect(cartData).toBeDefined();
      });

      // Should not throw error when save fails
      act(() => {
        cartData.addToCart(mockProduct, 1);
      });

      await waitFor(() => {
        expect(cartData.cart).toHaveLength(1);
      });
    });
  });
});