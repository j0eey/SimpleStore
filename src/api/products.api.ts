import apiClient, { API_BASE_URL } from './apiClient';
import { Product, ApiResponse, ProductImage, ProductData } from '../types/Product';
import { AxiosResponse } from 'axios';

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


export const addProductApi = async (product: ProductData): Promise<any> => {
  const formData = new FormData();

  console.log('Preparing FormData for product:');

  formData.append('title', product.title);
  console.log('title:', product.title);

  formData.append('description', product.description);
  console.log('description:', product.description);

  formData.append('price', product.price.toString());
  console.log('price:', product.price);

  formData.append('location', JSON.stringify(product.location));
  console.log('Clean location:', product.location);
  console.log('Location string:', JSON.stringify(product.location));


  product.images.forEach((image, index) => {
    if (image.uri) {
      const imageData = {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `image_${index}.jpg`,
      };

      formData.append('images', imageData as any);
      console.log(`image[${index}]:`, imageData);
    }
  });

  try {
    const response: AxiosResponse = await apiClient.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('API error:', error.response?.data || error.message);
    throw error;
  }
};






