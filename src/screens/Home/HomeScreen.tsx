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
import { HomeHeader, ErrorDisplay } from './HomeComponents';
import { OptimizedProductGrid } from './OptimizedProductGrid'; // NEW COMPONENT

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
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

  // Styles - SIMPLIFIED
  const containerStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background,
    }),
    [theme]
  );

  // SIMPLIFIED Navigation handlers - Remove unnecessary dependencies
  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, []);

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
    []
  );

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      navigation.navigate('Category', { category: categoryName });
    },
    []
  );

  // SIMPLIFIED Cart handler
  const handleAddToCart = useCallback(
    (product: Product, position: {x: number, y: number, width: number, height: number}) => {
      addToCart(product, 1);
      if (product.images[0]?.fullUrl) {
        triggerFlyingAnimation(position, product.images[0].fullUrl);
      }
    },
    []
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={containerStyle}>
        <HomeHeader onProfilePress={handleProfilePress} />

        {errorMessage ? (
          <ErrorDisplay
            errorMessage={errorMessage}
            onRetry={handleRefresh}
          />
        ) : (
          <OptimizedProductGrid
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
            onCategoryPress={handleCategoryPress}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(HomeScreen);