export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Verification: undefined;
  Home: undefined;
  ProductDetails: {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
  };
};
