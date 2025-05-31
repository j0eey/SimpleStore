import { Product } from './Product';

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}


export interface CartItemType {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  images?: { fullUrl: string }[];
}