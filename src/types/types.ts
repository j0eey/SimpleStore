import { Product } from '../types/Product';

export type RootStackParamList = {
  LottieSplash: undefined;
  Login: undefined;
  Signup: undefined;
  Verification: { email: string };
  Home: undefined;
  ProductDetails: {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    location?: string;
    postedDate?: string;
  };
  Profile: undefined;
  Category: { category: string };
  TabsNavigator: undefined;
  ForgotPassword: undefined;
  Notifications: undefined;
  Search: undefined;
  ViewAll: undefined;
  MapsScreen: {
    initialLocation?: LocationType;
    onLocationSelected: (location: LocationType) => void;
  };
  AddNewProduct: {
    selectedLocation?: {
      name: string;
      latitude: number;
      longitude: number;
    };
  };
  EditProfile: undefined;
  EditProduct: { productId: string };
  Cart: undefined;
  
};

export type LocationType = {
  name: string;
  latitude: number;
  longitude: number;
};

export type Prediction = {
  place_id: string;
  description: string;
};

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string | object;
      updatedAt: string;
    };
  };
}

export interface SelectedImage {
  uri: string;
  type: string;
  fileName: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
}

export interface EditableProfile {
  firstName: string;
  lastName: string;
}

export interface SearchState {
  query: string;
  results: Product[];
  isLoading: boolean;
  hasSearched: boolean;
}

export const CONSTANTS = {
  AVATAR_SIZE: 100,
} as const;

export type RouteParams = {
  productId: string;
};




