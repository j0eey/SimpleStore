import { Product } from "../../types/Product";

export interface ProductItemProps {
  item: Product;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product, position: {x: number, y: number, width: number, height: number}) => void;
  isOwner: boolean;
}

export interface CategoryListProps {
  loading: boolean;
  onCategoryPress: (categoryName: string) => void;
}

export interface LocationSelectorProps {
  selectedLocation: string;
  onSelect: (location: string) => void;
}

export interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

export interface HomeHeaderProps {
  onProfilePress: () => void;
}