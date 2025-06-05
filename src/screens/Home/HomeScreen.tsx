import React, { useState, useCallback, useMemo } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { Product } from '../../types/Product';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFlyingCart } from '../../contexts/FlyingCartContext';
import { colors } from '../../theme/Theme';
import Toast from 'react-native-toast-message';
import { useProducts } from './useProducts';
import { HomeHeader, LocationSelector, SectionHeader, CategoryList, ProductGrid, ErrorDisplay } from './HomeComponents';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  
  // Hooks
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();
  const { userId } = useAuth();
  const { addToCart } = useCart();
  const { triggerFlyingAnimation } = useFlyingCart();
  
  // Custom hook for products data
  const {
    allProducts,
    loading,
    errorMessage,
    refreshing,
    loadingMore,
    hasMore,
    handleRefresh,
    loadMoreProducts,
  } = useProducts();

  // Styles
  const containerStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background,
    }),
    [theme]
  );

  // Navigation handlers
  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetails', {
        id: product._id,
        title: product.title,
        description: product.description,
        image: product.images[0]?.fullUrl || '',
        price: product.price,
        location: product.location?.name || 'Unknown Location',
        postedDate: product.createdAt,
      });
    },
    [navigation]
  );

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      navigation.navigate('Category', { category: categoryName });
    },
    [navigation]
  );

  // Cart handler
  const handleAddToCart = useCallback(
    (product: Product, position: {x: number, y: number, width: number, height: number}) => {
      if (product) {
        addToCart(product, 1);
        if (product.images[0]?.fullUrl) {
          triggerFlyingAnimation(position, product.images[0].fullUrl);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Cannot add to cart. Product data not available.',
        });
      }
    },
    [addToCart, triggerFlyingAnimation]
  );

  // Location handler
  const handleLocationSelect = useCallback((location: string) => {
    setSelectedLocation(location);
  }, []);

  // Error retry handler
  const handleRetry = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={containerStyle}>
        <HomeHeader onProfilePress={handleProfilePress} />

        {errorMessage ? (
          <ErrorDisplay
            errorMessage={errorMessage}
            onRetry={handleRetry}
          />
        ) : (
          <ProductGrid
            products={allProducts}
            loading={loading}
            refreshing={refreshing}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onRefresh={handleRefresh}
            onLoadMore={loadMoreProducts}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            userId={userId}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            onCategoryPress={handleCategoryPress}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(HomeScreen);