import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Product } from '../../types/Product';
import { fetchProductsApi } from '../../api/products.api';
import { getErrorMessage } from '../../utils/getErrorMessage';

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fetchedPages = useRef<Set<number>>(new Set());

  const fetchProducts = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (pageNum === 1 && !append) {
        fetchedPages.current.clear();
        setAllProducts([]);
        setHasMore(true);
      }

      if (fetchedPages.current.has(pageNum)) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      fetchedPages.current.add(pageNum);

      try {
        if (pageNum === 1 && !append) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const data = await fetchProductsApi(pageNum);

        if (data.length === 0) {
          setHasMore(false);
        } else {
          setAllProducts((prev) => (append ? [...prev, ...data] : data));
          setErrorMessage('');
          setPage(pageNum);
        }
      } catch (error) {
        const message = getErrorMessage(error);
        setErrorMessage(message);
        setHasMore(false);
        fetchedPages.current.delete(pageNum);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    setHasMore(true);
    setErrorMessage('');
    fetchedPages.current.clear();
    setAllProducts([]);

    try {
      const data = await fetchProductsApi(1);
      setAllProducts(data);
      setPage(1);
      setHasMore(data.length > 0);
      setErrorMessage('');
      fetchedPages.current.add(1);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      fetchProducts(nextPage, true);
    }
  }, [loadingMore, hasMore, page, loading, fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setAllProducts([]);
      setHasMore(true);
      setErrorMessage('');
      fetchedPages.current.clear();
      fetchProducts(1, false);
    }, [fetchProducts])
  );

  return {
    allProducts,
    loading,
    errorMessage,
    refreshing,
    loadingMore,
    hasMore,
    handleRefresh,
    loadMoreProducts,
  };
};