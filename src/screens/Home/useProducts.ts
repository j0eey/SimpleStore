import { useState, useCallback, useRef, useMemo } from 'react';
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
  
  // Add refs to prevent infinite loops
  const isInitialized = useRef(false);
  const lastFetchAttempt = useRef<number>(0);
  const RETRY_DELAY = 5000;

  const fetchProducts = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      const isInitialOrRefreshLoad = pageNum === 1 && !append;
      if (isInitialOrRefreshLoad && !refreshing) {
        setLoading(true);
      } else if (append) {
        setLoadingMore(true);
      }

      if (fetchedPages.current.has(pageNum) && !refreshing && allProducts.length > 0) {
        if (isInitialOrRefreshLoad) setLoading(false);
        if (append) setLoadingMore(false);
        return;
      }

      // Clear states relevant to a fresh start BEFORE fetching, only if it's an initial load.
      if (isInitialOrRefreshLoad) {
        setErrorMessage('');
        fetchedPages.current.clear();
        if (!append) {
          setAllProducts([]);
        }
        setHasMore(true);
      }

      try {
        const data = await fetchProductsApi(pageNum);

        if (data.length === 0) {
          setHasMore(false);
        } else {
          setAllProducts((prev) => {
            const newProducts = append
              ? [...prev, ...data.filter(item => !prev.some(p => p._id === item._id))]
              : data;
            return newProducts;
          });
          setErrorMessage('');
          setPage(pageNum);
          fetchedPages.current.add(pageNum);
          setHasMore(true);
        }
        
        // Mark as initialized after first successful fetch
        isInitialized.current = true;
        
      } catch (error) {
        const message = getErrorMessage(error);
        setErrorMessage(message);
        setHasMore(false);
        fetchedPages.current.delete(pageNum);
        
        if (allProducts.length === 0) {
          setAllProducts([]);
        }
      } finally {
        if (isInitialOrRefreshLoad) setLoading(false);
        if (append) setLoadingMore(false);
      }
    },
    [refreshing] 
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true); 
    isInitialized.current = false;
    lastFetchAttempt.current = 0;
    
    try {
      await fetchProducts(1, false);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [fetchProducts]); 

  // Function to handle loading more products (pagination)
  const loadMoreProducts = useCallback(() => {
    if (!loading && !loadingMore && hasMore && allProducts.length > 0) {
      const nextPage = page + 1;
      fetchProducts(nextPage, true); // Fetch and append the next page
    }
  }, [loading, loadingMore, hasMore, page, allProducts.length, fetchProducts]);

  // Effect to trigger initial data fetch - prevent infinite loops
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      
      if (!isInitialized.current && 
          allProducts.length === 0 && 
          (now - lastFetchAttempt.current) > RETRY_DELAY) {
        
        lastFetchAttempt.current = now;
        fetchProducts(1, false);
      }
      
      return undefined;
    }, [])
  );

  // Memoize the return object for performance, preventing unnecessary re-renders of consuming components
  const memoizedReturn = useMemo(() => ({
    allProducts,
    loading,
    errorMessage,
    refreshing,
    loadingMore,
    hasMore,
    handleRefresh,
    loadMoreProducts,
  }), [allProducts, loading, errorMessage, refreshing, loadingMore, hasMore, handleRefresh, loadMoreProducts]);

  return memoizedReturn;
};