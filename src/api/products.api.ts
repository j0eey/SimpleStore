  import apiClient, { API_BASE_URL } from './apiClient';
  import { Product, ApiResponse, ProductImage, ProductData } from '../types/Product';

export const fetchProductsApi = async (page: number = 1): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse>(`/api/products?page=${page}`);

  return response.data.data.map((product: Product) => ({
    ...product,
    images: product.images.map((image: ProductImage) => ({
      ...image,
      fullUrl: `${API_BASE_URL}${image.url}`,
    })),
  }));
};

export const addProductApi = async (formData: FormData): Promise<Product> => {
  const response = await apiClient.post('/api/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const product = response.data.data;

  // Type cast the images from the API response to ProductImage type
  const typedImages = product.images as ProductImage[];

  return {
    ...product,
    images: typedImages.map((image) => ({
      ...image,
      fullUrl: `${API_BASE_URL}${image.url}`,
    })),
  };
};

export const searchProductsApi = async (query: string): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse>(`/api/products/search?query=${encodeURIComponent(query)}`);

  return response.data.data.map((product: Product) => ({
    ...product,
    images: product.images.map((image: ProductImage) => ({
      ...image,
      fullUrl: `${API_BASE_URL}${image.url}`,
    })),
  }));
};

export const fetchProductByIdApi = async (id: string): Promise<Product> => {
  const response = await apiClient.get<{ data: Product }>(`/api/products/${id}`);
  
  // Ensure the response has the expected structure
  if (!response.data.data) {
    throw new Error('Invalid product data structure');
  }

  const product = response.data.data;
  
  return {
    ...product,
    images: product.images?.map((image: ProductImage) => ({
      ...image,
      fullUrl: `${API_BASE_URL}${image.url}`,
    })) || [],
  };
};

export const updateProductApi = async (productId: string, formData: FormData): Promise<Product> => {
  const response = await apiClient.put(`/api/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const product = response.data.data;

  // Type cast the images from the API response to ProductImage type
  const typedImages = product.images as ProductImage[];

  return {
    ...product,
    images: typedImages.map((image) => ({
      ...image,
      fullUrl: `${API_BASE_URL}${image.url}`,
    })),
  };
};

export const deleteProductApi = async (productId: string): Promise<void> => {
  await apiClient.delete(`/api/products/${productId}`);
};
