import React, { FC, useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { colors } from '../../theme/Theme';
import Toast from 'react-native-toast-message';
import { getProductDeleteFailureMessage } from '../../utils/getFailureMessage';
import { getDeletedSuccessMessage } from '../../utils/getSuccessMessage';
import { useProductDetails } from './useProductDetails';
import { ProductDetailsSkeleton, ProductImages, ProductInfo, SellerInfo, LocationMap, OwnerMenu, ErrorDisplay, ActionButton } from './ProductDetailsComponents';
import { PRODUCT_DETAILS_CONSTANTS } from './constants';

type ProductDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;

type Props = {
  route: ProductDetailsScreenRouteProp;
  navigation: ProductDetailsScreenNavigationProp;
};

const ProductDetailsScreen: FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { theme } = useTheme();
  const { userId } = useAuth();
  const { addToCart } = useCart();
  const isDark = theme === 'dark';

  // Custom hook for product details logic
  const {
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
  } = useProductDetails(id);

  // Styles
  const scrollContainerStyle = useMemo(() => [
    { flex: 1 },
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  const contentContainerStyle = useMemo(() => ({
    padding: PRODUCT_DETAILS_CONSTANTS.CONTENT_PADDING,
    paddingBottom: PRODUCT_DETAILS_CONSTANTS.BOTTOM_PADDING,
  }), []);

  // Handlers
  const handleEdit = useCallback(() => {
    if (!product) {
      Toast.show({
        type: 'error',
        text1: 'Product data not loaded',
      });
      return;
    }

    setShowMenu(false);
    navigation.navigate('EditProduct', {
      productId: product._id
    });
  }, [product, navigation, setShowMenu]);

  const handleDelete = useCallback(async () => {
    if (!product) {
      Toast.show({
        type: 'error',
        text1: getProductDeleteFailureMessage('Failed to delete product'),
      });
      return;
    }

    const success = await deleteProduct();
    if (success) {
      Toast.show({
        type: 'success',
        text1: getDeletedSuccessMessage('Product deleted successfully'),
      });
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: getProductDeleteFailureMessage('Failed to delete product'),
      });
    }
  }, [product, deleteProduct, navigation]);

  const handleAddToCart = useCallback(() => {
    if (product) {
      addToCart(product, quantity);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Cannot add to cart. Product data not available.',
      });
    }
  }, [product, quantity, addToCart]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Check ownership
  const isOwner = product && userId && product.user._id === userId;

  // Loading state
  if (loading || refreshing) {
    return <ProductDetailsSkeleton theme={theme} />;
  }

  // Error states
  if (isNotFound || errorMessage || !product) {
    return (
      <ErrorDisplay
        isNotFound={isNotFound}
        errorMessage={errorMessage}
        onRetry={handleRefresh}
        onGoBack={handleGoBack}
      />
    );
  }

  // Main content
  return (
    <>
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        style={scrollContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ 
          width: '100%', 
          height: PRODUCT_DETAILS_CONSTANTS.IMAGE_HEIGHT, 
          marginBottom: 20 
        }}>
          <ProductImages product={product} />
        </View>

        <ProductInfo
          product={product}
          quantity={quantity}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          isOwner={!!isOwner}
          onMenuPress={() => setShowMenu(true)}
        />

        <SellerInfo
          product={product}
          isOwner={!!isOwner}
        />

        <LocationMap product={product} />

        <ActionButton
          product={product}
          quantity={quantity}
          onAddToCart={handleAddToCart}
          isOwner={!!isOwner}
        />
      </ScrollView>

      {isOwner && (
        <OwnerMenu
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default ProductDetailsScreen;