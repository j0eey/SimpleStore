import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { searchProductsApi } from '../api/products.api';
import { getErrorMessage } from '../utils/getErrorMessage';
import { Product } from '../types/Product';
import { RootStackParamList, SearchState } from '../types/types';

const SEARCH_MIN_LENGTH = 2;
const SEARCH_PLACEHOLDER = 'Search products...';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    hasSearched: false,
  });

  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background,
    },
    searchContainer: {
      backgroundColor: theme === 'dark' ? colors.darkSearchbar : colors.lightSearchbar,
    },
    searchInput: {
      color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
    },
    productCard: {
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
    },
    productTitle: {
      color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
    },
    productPrice: {
      color: theme === 'dark' ? colors.priceDark : colors.info,
    },
    emptyText: {
      color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight,
    },
    iconColor: theme === 'dark' ? colors.darkSearch : colors.lightSearch,
    loadingColor: theme === 'dark' ? colors.lightHeader : colors.primary,
  }), [theme]);

  // Handlers
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
      const errorMessage = getErrorMessage('Failed to search products');
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

  // Render functions
  const renderProductItem: ListRenderItem<Product> = useCallback(({ item }) => {
    const imageUrl = item.images[0]?.fullUrl;


    return (
      <TouchableOpacity
        style={[styles.productCard, dynamicStyles.productCard]}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.productInfo}>
          <Text
            style={[styles.productTitle, dynamicStyles.productTitle]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={[styles.productPrice, dynamicStyles.productPrice]}>
            ${item.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [dynamicStyles, handleProductPress]);

  const renderEmptyState = useCallback(() => {
    let message = SEARCH_PLACEHOLDER;
    
    if (searchState.query.length > 0 && searchState.query.length < SEARCH_MIN_LENGTH) {
      message = `Type at least ${SEARCH_MIN_LENGTH} characters and press search...`;
    } else if (searchState.hasSearched && searchState.results.length === 0) {
      message = 'No products found';
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
          {message}
        </Text>
      </View>
    );
  }, [searchState, dynamicStyles.emptyText]);

  const renderContent = useCallback(() => {
    if (searchState.isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dynamicStyles.loadingColor} />
        </View>
      );
    }

    if (searchState.results.length > 0) {
      return (
        <FlatList
          data={searchState.results}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      );
    }

    return renderEmptyState();
  }, [searchState, dynamicStyles.loadingColor, renderProductItem, renderEmptyState]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
        <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
          <Ionicons
            name="search"
            size={20}
            color={dynamicStyles.iconColor}
          />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.searchInput, dynamicStyles.searchInput]}
          placeholder={SEARCH_PLACEHOLDER}
          placeholderTextColor={dynamicStyles.iconColor}
          value={searchState.query}
          onChangeText={handleTextChange}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {searchState.query.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearIconContainer}>
            <Ionicons
              name="close"
              size={20}
              color={dynamicStyles.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
  },
  searchIconContainer: {
    marginRight: 10,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  clearIconContainer: {
    marginLeft: 10,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: fonts.Bold,
  },
});

export default SearchScreen;