import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { searchProductsApi } from '../../api/products.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { Product } from '../../types/Product';
import { RootStackParamList, SearchState } from '../../types/types';
import { useTheme } from '../../contexts/ThemeContext';
import { SEARCH_MIN_LENGTH, MESSAGES } from './constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Hook for search state management and API calls
export const useSearchState = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    hasSearched: false,
  });

  const handleSearch = useCallback(async () => {
    const { query } = searchState;
    
    if (query.length < SEARCH_MIN_LENGTH) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        hasSearched: false,
      }));
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isLoading: true,
      hasSearched: true,
    }));

    try {
      const results = await searchProductsApi(query);
      setSearchState(prev => ({
        ...prev,
        results,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = getErrorMessage(MESSAGES.searchErrorMessage);
      Toast.show({
        type: 'error',
        text1: errorMessage,
      });
      
      setSearchState(prev => ({
        ...prev,
        results: [],
        isLoading: false,
      }));
    }
  }, [searchState.query]);

  const handleTextChange = useCallback((text: string) => {
    setSearchState(prev => ({
      ...prev,
      query: text,
      hasSearched: false,
      ...(text.length < SEARCH_MIN_LENGTH && { results: [] }),
    }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchState({
      query: '',
      results: [],
      isLoading: false,
      hasSearched: false,
    });
  }, []);

  return {
    searchState,
    handleSearch,
    handleTextChange,
    handleClearSearch,
  };
};

// Main search hook with navigation and theme integration
export const useSearch = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  
  const {
    searchState,
    handleSearch,
    handleTextChange,
    handleClearSearch,
  } = useSearchState();

  const handleProductPress = useCallback((product: Product) => {
    const imageUrl = product.images[0]?.fullUrl;
    
    navigation.navigate('ProductDetails', {
      id: product._id,
      title: product.title,
      description: product.description,
      image: imageUrl,
      price: product.price,
    });
  }, [navigation]);

  return {
    searchState,
    theme,
    handleSearch,
    handleTextChange,
    handleClearSearch,
    handleProductPress,
  };
};