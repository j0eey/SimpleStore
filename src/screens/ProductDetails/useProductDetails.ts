import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Product } from '../../types/Product';
import { fetchProductByIdApi, deleteProductApi } from '../../api/products.api';
import { useCart } from '../../contexts/CartContext';
import { getErrorMessage } from '../../utils/getErrorMessage';

export const useProductDetails = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const { cart } = useCart();

  // Update quantity when product or cart changes
  useEffect(() => {
    if (product && cart.length > 0) {
      const existingCartItem = cart.find(item => item._id === product._id);
      if (existingCartItem) {
        setQuantity(existingCartItem.quantity);
      } else {
        setQuantity(1);
      }
    } else {
      setQuantity(1);
    }
  }, [product, cart]);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);
      const productData = await fetchProductByIdApi(productId);
      setProduct(productData);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 500) {
        setIsNotFound(true);
        setErrorMessage(null);
      } else {
        setIsNotFound(false);
        setErrorMessage(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorMessage(null);
    setIsNotFound(false);
    try {
      const productData = await fetchProductByIdApi(productId);
      setProduct(productData);
      const existingCartItem = cart.find(item => item._id === productData._id);
      setQuantity(existingCartItem ? existingCartItem.quantity : 1);
      setErrorMessage(null);
      setIsNotFound(false);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 500) {
        setIsNotFound(true);
        setErrorMessage(null);
      } else {
        setIsNotFound(false);
        setErrorMessage(getErrorMessage(err));
      }
    } finally {
      setRefreshing(false);
    }
  }, [productId, cart]);

  const deleteProduct = useCallback(async () => {
    if (!product) return false;
    
    try {
      await deleteProductApi(product._id);
      return true;
    } catch (error) {
      return false;
    }
  }, [product]);

  // Load product on focus
  useFocusEffect(
    useCallback(() => {
      handleRefresh();
      setShowMenu(false);
      return () => {
        setShowMenu(false);
      };
    }, [productId])
  );

  // Initial load
  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleIncrease = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const handleDecrease = useCallback(() => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  }, []);

  return {
    product,
    loading,
    isNotFound,
    errorMessage,
    refreshing,
    quantity,
    showMenu,
    setShowMenu,
    handleRefresh,
    handleIncrease,
    handleDecrease,
    deleteProduct,
  };
};