// src/api/product.api.ts
import { Product } from '../types/Product';

export const fetchProductsApi = async (): Promise<Product[]> => {
  try {
    const productsData = require('../data/Products.json');
    return productsData.data;
  } catch (error) {
    throw new Error('Failed to load products.');
  }
};

export const searchProductsApi = async (query: string): Promise<Product[]> => {
  try {
    const productsData = require('../data/Products.json');
    const products: Product[] = productsData.data;
    const filteredProducts = products.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );
    return filteredProducts;
  } catch (error) {
    throw new Error('Failed to search products.');
  }
};
