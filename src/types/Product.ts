
export type Product = {
  location: {
    name: string;
    longitude: number;
    latitude: number;
  };
  _id: string;
  title: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    _id: string;
    fullUrl: string;
  }>;
  user: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface ApiResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems: number;
    limit: number;
  };
}

export interface ProductImage {
  url: string;
  _id: string;
}

export type ProductData = {
  title: string;
  description: string;
  price: number;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  images: Asset[];
};
export type Asset = {
  uri: string;         
  type?: string;        
  fileName?: string; 
};

export interface ProductDeepLink {
  id: string;
  title?: string;
  price?: string;
  image?: string;
};

export interface ProductNotificationData {
  _id: string;
  title: string;
  price: number;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  images: Array<{
    url: string;
    _id: string;
    fullUrl: string;
  }>;
}



