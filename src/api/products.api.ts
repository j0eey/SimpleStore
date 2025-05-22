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






