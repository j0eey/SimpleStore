export type RootStackParamList = {
  Splash: undefined;
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
  AddNewProduct: { selectedLocation?: LocationType } | undefined;
  SelectLocation: undefined;
  
};

export type LocationType = {
  name: string;
  latitude: number;
  longitude: number;
};