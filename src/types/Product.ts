export type Product = {
  location: { name: string; longitude: number; latitude: number };
  _id: string;
  title: string;
  description: string;
  price: number;
  images: ProductImageWithFullUrl[];
  user: string | { _id: string; email: string }; // Allow both string and object
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// For API responses that return arrays of products
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

// For API responses that return a single product
export interface SingleProductApiResponse {
  success: boolean;
  data: Product;
}

export interface ProductImage {
  url: string;
  _id: string;
}

export interface ProductImageWithFullUrl extends ProductImage {
  fullUrl: string;
}