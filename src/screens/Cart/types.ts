import { Animated } from "react-native";
import { CartItemType } from "../../types/Cart";

export interface CartHeaderProps {
  itemCount: number;
}

export interface EmptyCartProps {
  onStartShopping: () => void;
}

export interface CartItemProps {
  item: CartItemType;
  onIncreaseQuantity: (itemId: string, currentQuantity: number) => void;
  onDecreaseQuantity: (itemId: string, currentQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export interface CartSummaryProps {
  cart: CartItemType[];
  summaryExpanded: boolean;
  summaryHeight: Animated.Value;
  onToggleSummary: () => void;
  onCheckout: () => void;
  onClearCart: () => void;
  calculateTotal: () => string;
}

export interface CartListProps {
  cart: CartItemType[];
  onIncreaseQuantity: (itemId: string, currentQuantity: number) => void;
  onDecreaseQuantity: (itemId: string, currentQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}