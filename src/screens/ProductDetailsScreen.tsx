import React, { useState, FC, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  Modal
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { fonts, colors } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { fetchProductByIdApi, deleteProductApi } from '../api/products.api';
import { Product } from '../types/Product';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Swiper from 'react-native-swiper';
import MapView, { Marker } from 'react-native-maps';
import { productInquiryTemplate } from '../utils/emailTemplates';
import Toast from 'react-native-toast-message';
import { getProductDeleteFailureMessage } from '../utils/getFailureMessage';
import { getDeletedSuccessMessage } from '../utils/getSuccessMessage';
import { getErrorMessage, getProductErrorMessage } from '../utils/getErrorMessage';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;

type Props = {
  route: ProductDetailsScreenRouteProp;
  navigation: ProductDetailsScreenNavigationProp;
};

const ProductDetailsSkeleton = ({ theme }: { theme: string }) => {
  const isDark = theme === 'dark';
  const skeletonConfig = {
    borderRadius: 4,
    backgroundColor: isDark ? colors.darkPlaceholder : colors.lightPlaceholder,
    highlightColor: isDark ? colors.darkHighlight : colors.lightHighlight,
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={[styles.scrollContainer, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <SkeletonPlaceholder {...skeletonConfig}>
        {/* Image Skeleton */}
        <SkeletonPlaceholder.Item
          width={SCREEN_WIDTH - 40}
          height={SCREEN_WIDTH * 0.8}
          borderRadius={8}
          marginBottom={20}
        />

        {/* Title Skeleton */}
        <SkeletonPlaceholder.Item
          width={SCREEN_WIDTH * 0.7}
          height={30}
          marginBottom={16}
        />

        {/* Price/Location Row Skeleton */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={16}
        >
          <SkeletonPlaceholder.Item width={100} height={20} />
          <SkeletonPlaceholder.Item width={120} height={20} />
        </SkeletonPlaceholder.Item>

        {/* Quantity/Pricing Row Skeleton */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={16}
        >
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={30} height={30} marginRight={10} />
            <SkeletonPlaceholder.Item width={20} height={20} marginHorizontal={10} />
            <SkeletonPlaceholder.Item width={30} height={30} marginLeft={10} />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={80} height={25} />
        </SkeletonPlaceholder.Item>

        {/* Separator */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={1}
          marginVertical={12}
        />

        {/* Section Title */}
        <SkeletonPlaceholder.Item
          width={120}
          height={20}
          marginBottom={10}
        />

        {/* Description Skeleton */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={60}
          marginBottom={20}
        />

        {/* Separator */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={1}
          marginVertical={12}
        />

        {/* Section Title */}
        <SkeletonPlaceholder.Item
          width={150}
          height={20}
          marginBottom={10}
        />

        {/* Seller Info Skeleton */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
          marginBottom={16}
        >
          <SkeletonPlaceholder.Item width={24} height={24} borderRadius={12} />
          <SkeletonPlaceholder.Item width={150} height={20} marginLeft={8} />
        </SkeletonPlaceholder.Item>

        {/* Contact Button Skeleton */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={50}
          borderRadius={8}
          marginBottom={16}
        />

        {/* Separator */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={1}
          marginVertical={12}
        />

        {/* Section Title */}
        <SkeletonPlaceholder.Item
          width={100}
          height={20}
          marginBottom={10}
        />

        {/* Map Skeleton */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={200}
          borderRadius={8}
          marginBottom={20}
        />

        {/* Add to Cart Button Skeleton */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={50}
          borderRadius={10}
          marginTop={20}
        />
      </SkeletonPlaceholder>
    </ScrollView>
  );
};

const ProductDetailsScreen: FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { theme } = useTheme();
  const { userId } = useAuth();
  const { addToCart, cart } = useCart();
  const isDark = theme === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Check if the current product is already in the cart to update initial quantity display
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

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
      setShowMenu(false);
      return () => {
        setShowMenu(false);
      };
    }, [id])
  );

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        setIsNotFound(false);
        const productData = await fetchProductByIdApi(id);
        setProduct(productData);
      } catch (err: any) {
        // Check if it's a 404 or 500 error (product not found)
        if (err?.response?.status === 404 || err?.response?.status === 500) {
          setIsNotFound(true);
          setErrorMessage(null);
        } else {
          // For other errors, use the error message utility
          setIsNotFound(false);
          setErrorMessage(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleIncrease = () => {
    setQuantity(prev => {
      const newQuantity = prev + 1;
      return newQuantity;
    });
  };

  const handleDecrease = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorMessage(null);
    setIsNotFound(false);
    try {
      const productData = await fetchProductByIdApi(id);
      setProduct(productData);
      const existingCartItem = cart.find(item => item._id === productData._id);
      setQuantity(existingCartItem ? existingCartItem.quantity : 1);
      setErrorMessage(null);
      setIsNotFound(false);
    } catch (err: any) {
      // Check if it's a 404 or 500 error (product not found)
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
  }, [id, cart]);

  const handleEmailPress = () => {
    if (product?.user?.email) {
      const { subject, body } = productInquiryTemplate(product.title);

      Linking.openURL(`mailto:${product.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
        .catch(() => Alert.alert('Error', 'Unable to open email client'));
    }
  };

  const handleEdit = () => {
    if (!product) {
      Toast.show({
        type: 'error',
        text1: 'Product data not loaded',
      });
      return;
    }

    navigation.navigate('EditProduct', {
      productId: product._id
    });
  };

  const handleDelete = async () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!product) {
              Toast.show({
                type: 'error',
                text1: getProductDeleteFailureMessage('Failed to delete product'),
              });
              return;
            }
            try {
              const response = await deleteProductApi(product._id);
              Toast.show({
                type: 'success',
                text1: getDeletedSuccessMessage(response),
              });
              navigation.goBack();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: getProductDeleteFailureMessage('Failed to delete product'),
              });
            }
          },
        },
      ]
    );
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Cannot add to cart. Product data not available.',
      });
    }
  };

  const isOwner = product && userId && product.user._id === userId;

  if (loading || refreshing) {
    return <ProductDetailsSkeleton theme={theme} />;
  }

  // Show "Product Not Found" for 404/500 errors
  if (isNotFound) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}>
        <MaterialCommunityIcons
          name="package-variant-closed-remove"
          size={80}
          color={isDark ? colors.notFoundDark : colors.notFoundLight}
        />
        <Text style={[styles.emptyText, {
          color: isDark ? colors.notFoundDark : colors.notFoundLight
        }]}>
          {getProductErrorMessage('Product not found')}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, {
            backgroundColor: isDark ? colors.primary : colors.primaryDark
          }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show other errors
  if (errorMessage) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={60}
          color={isDark ? colors.notFoundDark : colors.notFoundLight}
        />
        <Text style={[styles.emptyText, {
          color: isDark ? colors.notFoundDark : colors.notFoundLight
        }]}>
          {errorMessage}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, {
            backgroundColor: isDark ? colors.primary : colors.primaryDark
          }]}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}>
        <MaterialCommunityIcons
          name="emoticon-sad-outline"
          size={60}
          color={isDark ? colors.notFoundDark : colors.notFoundLight}
        />
        <Text style={[styles.emptyText, {
          color: isDark ? colors.notFoundDark : colors.notFoundLight
        }]}>
          Product not found
        </Text>
      </View>
    );
  }

  const totalPrice = (product.price * quantity).toFixed(2);
  const hasImages = product.images && product.images.length > 0;

  const renderImages = () => {
    if (!hasImages) {
      return (
        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? colors.darkCard : colors.light }]}>
          <Text style={{ color: isDark ? colors.lightHeader : colors.darkHeader }}>No Image Available</Text>
        </View>
      );
    }

    return (
      <Swiper
        style={styles.swiper}
        showsButtons={false}
        showsPagination={true}
        dotColor={isDark ? colors.border : colors.light}
        activeDotColor={isDark ? colors.primary : colors.primaryDark}
        paginationStyle={{ bottom: 10 }}
        loop={false}
      >
        {product.images.map((image, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={{ uri: image.fullUrl }}
              style={styles.swiperImage}
              resizeMode="contain"
            />
          </View>
        ))}
      </Swiper>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={[styles.scrollContainer, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {isOwner && (
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={[styles.menuContainer, {
              backgroundColor: isDark ? colors.darkCard : colors.light,
              shadowColor: isDark ? colors.lightHeader : colors.darkHeader
            }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEdit}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color={isDark ? colors.border : colors.text}
                />
                <Text style={[styles.menuItemText, { color: isDark ? colors.border : colors.text }]}>
                  Edit
                </Text>
              </TouchableOpacity>
              <View style={[styles.menuSeparator, { backgroundColor: isDark ? colors.lineDark : colors.nameCardDark }]} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color={colors.error}
                />
                <Text style={[styles.menuItemText, { color: colors.error }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <View style={styles.imageWrapper}>
        {renderImages()}
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
          {product.title}
        </Text>
        {isOwner && (
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={isDark ? colors.border : colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailRow}>
        <Text style={[styles.detailText, { color: isDark ? colors.border : colors.text }]}>
          ${product.price.toFixed(2)}
        </Text>
        <Text style={[styles.detailText, { color: isDark ? colors.border : colors.text }]}>
          {product.location.name}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: isDark ? colors.nameCardLight : colors.light }]}
            onPress={handleDecrease}
          >
            <Text style={[styles.quantityButtonText, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>-</Text>
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>{quantity}</Text>

          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: isDark ? colors.nameCardLight : colors.light }]}
            onPress={handleIncrease}
          >
            <Text style={[styles.quantityButtonText, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.price, { color: isDark ? colors.priceDarkDetails : colors.info }]}>
          ${totalPrice}
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: isDark ? colors.lineDark : colors.nameCardDark }]} />

      <Text style={[styles.sectionTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
        Description
      </Text>
      <Text style={[styles.description, { color: isDark ? colors.border : colors.text }]}>
        {product.description}
      </Text>

      <View style={[styles.separator, { backgroundColor: isDark ? colors.lineDark : colors.nameCardDark }]} />

      <Text style={[styles.sectionTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
        Seller Information
      </Text>

      <View style={styles.sellerContainer}>
        <View style={styles.sellerInfo}>
          <MaterialCommunityIcons
            name="account-circle"
            size={24}
            color={isDark ? colors.border : colors.text}
          />
          <Text style={[styles.sellerText, { color: isDark ? colors.border : colors.text }]}>
            {product.user.email}
          </Text>
        </View>

        {!isOwner && (
          <TouchableOpacity
            style={[styles.emailButton, { backgroundColor: isDark ? colors.primary : colors.primaryDark }]}
            onPress={handleEmailPress}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={colors.lightHeader}
            />
            <Text style={styles.emailButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.separator, { backgroundColor: isDark ? colors.lineDark : colors.nameCardDark }]} />

      <Text style={[styles.sectionTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
        Location
      </Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: product.location.latitude,
            longitude: product.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: product.location.latitude,
              longitude: product.location.longitude,
            }}
            title={product.title}
            description={product.location.name}
          />
        </MapView>
      </View>

      {!isOwner && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.success }]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  imageWrapper: {
    width: '100%',
    height: SCREEN_WIDTH * 0.8,
    marginBottom: 20,
  },
  swiper: {
    flex: 0,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiperImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 25,
    flex: 1,
    textAlign: 'left',
    fontFamily: fonts.Bold,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: fonts.semiBold,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
  sellerContainer: {
    marginBottom: 16,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerText: {
    fontSize: 16,
    marginLeft: 8,
    fontFamily: fonts.regular,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  emailButtonText: {
    color: colors.lightHeader,
    fontSize: 16,
    marginLeft: 8,
    fontFamily: fonts.semiBold,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addButton: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightHeader,
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
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: fonts.Bold,
  },
  notFoundDescription: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: fonts.regular,
    paddingHorizontal: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: 150,
    borderRadius: 8,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: fonts.regular,
  },
  menuSeparator: {
    height: 1,
    marginVertical: 4,
  },
});

export default ProductDetailsScreen;