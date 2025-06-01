import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions, PixelRatio, TouchableOpacity, ScrollView, SafeAreaView, Animated, Easing, Share } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { getErrorMessage } from '../utils/getErrorMessage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fonts, colors } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/Product';
import { categories } from '../types/categories';
import { fetchProductsApi } from '../api/products.api';
import { getTimeAgo } from '../utils/getTimeAgo';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import { useFlyingCart } from '../contexts/FlyingCartContext';
import DeepLinkingService from '../services/UniversalLinkingService';


type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const scaleFont = (size: number) => size * PixelRatio.getFontScale();
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

/**
 * @returns {string}
 */
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};


const ProductItem = memo(
  ({
    item,
    theme,
    onPress,
    onAddToCart,
    isOwner,
  }: {
    item: Product;
    theme: string;
    onPress: () => void;
    onAddToCart: (product: Product, position: {x: number, y: number, width: number, height: number}) => void;
    isOwner: boolean;
  }) => {
    const imageRef = useRef<View>(null);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cartIconScaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handleAddToCartPressIn = useCallback(() => {
      Animated.timing(cartIconScaleAnim, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [cartIconScaleAnim]);

    const handleAddToCartPressOut = useCallback(() => {
      Animated.sequence([
        Animated.timing(cartIconScaleAnim, {
          toValue: 0.8,
          duration: 80,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cartIconScaleAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        imageRef.current?.measureInWindow((x, y, width, height) => {
          onAddToCart(item, {x, y, width, height});
        });
      });
    }, [cartIconScaleAnim, onAddToCart, item, imageRef]);

    const handleSharePress = useCallback(async () => {
      try {
        const shareContent = DeepLinkingService.generateShareContent({
          id: item._id,
          title: item.title,
          price: `${item.price}`,
          image: item.images[0]?.fullUrl || '',
        });
        await Share.share({
          title: shareContent.title,
          message: shareContent.message,
          url: shareContent.url,
        });
      } catch (error) {
      }
    }, [item]);

    const cardStyle = useMemo(
      () => [
        styles.card,
        {
          backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
          shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
          transform: [{ scale: scaleAnim }],
        },
      ],
      [theme, scaleAnim]
    );

    const titleStyle = useMemo(
      () => [styles.productTitle, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }],
      [theme]
    );

    const priceStyle = useMemo(
      () => [styles.price, { color: theme === 'dark' ? colors.priceDark : colors.icon }],
      [theme]
    );

    const locationStyle = useMemo(
      () => [
        styles.locationText,
        {
          color: theme === 'dark' ? colors.lightText : colors.darkBorder,
          marginTop: 2,
        },
      ],
      [theme]
    );

    const dateStyle = useMemo(
      () => [styles.postedDate, { color: theme === 'dark' ? colors.lightText : colors.darkBorder }],
      [theme]
    );

    const placeholderStyle = useMemo(
      () => [
        styles.imagePlaceholder,
        { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.imageBackground },
      ],
      [theme]
    );

    const cartIconColor = theme === 'dark' ? colors.primaryLight : colors.primaryDark;
    const cartIconBgColor = theme === 'dark' ? colors.cartIconBgDarkColor : colors.cartIconBgLightColor;
    const shareIconColor = theme === 'dark' ? colors.primaryLight : colors.primaryDark;
    const shareIconBgColor = theme === 'dark' ? colors.cartIconBgDarkColor : colors.cartIconBgLightColor;

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View ref={imageRef} style={styles.imageWrapper}>
          {item.images[0]?.fullUrl ? (
            <FastImage
              source={{
                uri: item.images[0].fullUrl,
                priority: FastImage.priority.normal,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={placeholderStyle}>
              <Ionicons
                name="image-outline"
                size={32}
                color={theme === 'dark' ? colors.lightText : colors.darkText}
              />
            </View>
          )}
          {/* Share Icon */}
          <TouchableOpacity
              style={[
                styles.shareButton,
                {
                  backgroundColor: shareIconBgColor,
                },
              ]}
              onPress={handleSharePress}
            >
              <Ionicons name="share-outline" size={20} color={shareIconColor} />
            </TouchableOpacity>
          {/* Conditional rendering for Add to Cart Icon: ONLY show if NOT the owner */}
          {!isOwner && (
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                {
                  backgroundColor: cartIconBgColor,
                  transform: [{ scale: cartIconScaleAnim }],
                },
              ]}
              onPressIn={handleAddToCartPressIn}
              onPressOut={handleAddToCartPressOut}
              activeOpacity={1}
            >
              <Ionicons name="cart-outline" size={20} color={cartIconColor} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={titleStyle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={priceStyle}>${item.price.toFixed(2)}</Text>
          <Text style={locationStyle} numberOfLines={1}>
            {item.location?.name ?? 'Unknown Location'}
          </Text>
          <Text style={dateStyle}>{getTimeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item._id === nextProps.item._id &&
      prevProps.theme === nextProps.theme &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.item.price === nextProps.item.price &&
      prevProps.item.createdAt === nextProps.item.createdAt &&
      prevProps.item.location?.name === nextProps.item.location?.name &&
      prevProps.item.images[0]?.fullUrl === nextProps.item.images[0]?.fullUrl &&
      prevProps.isOwner === nextProps.isOwner
    );
  }
);


const ProductSkeletonItem = memo(({ theme }: { theme: string }) => {
  const skeletonStyle = useMemo(
    () => [
      styles.card,
      {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
        shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
      },
    ],
    [theme]
  );

  const skeletonConfig = useMemo(
    () => ({
      borderRadius: 4,
      backgroundColor: theme === 'dark' ? colors.darkPlaceholder : colors.lightPlaceholder,
      highlightColor: theme === 'dark' ? colors.darkHighlight : colors.lightHighlight,
    }),
    [theme]
  );

  return (
    <View style={skeletonStyle}>
      <SkeletonPlaceholder {...skeletonConfig}>
        <SkeletonPlaceholder.Item style={styles.imageWrapper} />
        <SkeletonPlaceholder.Item style={styles.productInfo}>
          <SkeletonPlaceholder.Item width={CARD_WIDTH * 0.8} height={scaleFont(14)} marginBottom={6} />
          <SkeletonPlaceholder.Item width={CARD_WIDTH * 0.5} height={scaleFont(15)} marginBottom={2} />
          <SkeletonPlaceholder.Item width={CARD_WIDTH * 0.7} height={scaleFont(10)} marginTop={2} />
          <SkeletonPlaceholder.Item width={CARD_WIDTH * 0.4} height={scaleFont(10)} marginTop={4} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
});


const LocationSelector = memo(
  ({
    selectedLocation,
    onSelect,
    theme,
  }: {
    selectedLocation: string;
    onSelect: (location: string) => void;
    theme: string;
  }) => {
    const selectorStyle = useMemo(
      () => [
        styles.locationSelector,
        { backgroundColor: theme === 'dark' ? colors.darkCard : colors.textPrimary },
      ],
      [theme]
    );

    const textStyle = useMemo(
      () => [styles.alllocationText, { color: theme === 'dark' ? colors.lightText : colors.darkText }],
      [theme]
    );

    const handlePress = useCallback(() => {
      onSelect(selectedLocation);
    }, [onSelect, selectedLocation]);

    return (
      <TouchableOpacity style={selectorStyle} onPress={handlePress}>
        <Ionicons name="location-outline" size={16} color={theme === 'dark' ? colors.primary : colors.darkText} />
        <Text style={textStyle}>{selectedLocation}</Text>
        <Ionicons name="chevron-down-outline" size={16} color={theme === 'dark' ? colors.lightText : colors.darkText} />
      </TouchableOpacity>
    );
  }
);


const CategorySkeletonItem = memo(({ theme }: { theme: string }) => {
  const skeletonStyle = useMemo(
    () => [
      styles.categoryCard,
      {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
        shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
      },
    ],
    [theme]
  );

  const skeletonConfig = useMemo(
    () => ({
      borderRadius: 4,
      backgroundColor: theme === 'dark' ? colors.darkPlaceholder : colors.lightPlaceholder,
      highlightColor: theme === 'dark' ? colors.darkHighlight : colors.lightHighlight,
    }),
    [theme]
  );

  return (
    <View style={skeletonStyle}>
      <SkeletonPlaceholder {...skeletonConfig}>
        <SkeletonPlaceholder.Item width={24} height={24} borderRadius={12} />
        <SkeletonPlaceholder.Item width={60} height={scaleFont(12)} marginTop={8} />
      </SkeletonPlaceholder>
    </View>
  );
});


const CategoryItem = memo(
  ({
    category,
    theme,
    onPress,
  }: {
    category: { name: string; icon: string };
    theme: string;
    onPress: () => void;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const cardStyle = useMemo(
      () => [
        styles.categoryCard,
        {
          backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
          shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
          transform: [{ scale: scaleAnim }],
        },
      ],
      [theme, scaleAnim]
    );

    const textStyle = useMemo(
      () => [styles.categoryText, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }],
      [theme]
    );

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Ionicons
          name={category.icon}
          size={24}
          color={theme === 'dark' ? colors.primary : colors.primaryDark}
        />
        <Text style={textStyle}>{category.name}</Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.category.name === nextProps.category.name &&
      prevProps.category.icon === nextProps.category.icon &&
      prevProps.theme === nextProps.theme
    );
  }
);


const HomeScreen = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userId } = useAuth();
  const fetchedPages = useRef<Set<number>>(new Set());
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorTranslateY = useRef(new Animated.Value(20)).current;
  const { triggerFlyingAnimation } = useFlyingCart();

  const animateErrorIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(errorTranslateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [errorOpacity, errorTranslateY]);

  useEffect(() => {
    if (errorMessage) {
      animateErrorIn();
    } else {
      errorOpacity.setValue(0);
      errorTranslateY.setValue(20);
    }
  }, [errorMessage, animateErrorIn, errorOpacity, errorTranslateY]);

  /**
   * @param {number} pageNum
   * @param {boolean} append
   */
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

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setAllProducts([]);
      setHasMore(true);
      setErrorMessage('');
      fetchedPages.current.clear();
      fetchProducts(1, false);

      return () => {
      };
    }, [fetchProducts])
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

  /**
   * @param {Product} product
   */
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

  const { addToCart } = useCart();

  /**
   * @param {Product} product
   * @param {object} position
   */
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

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductItem
        item={item}
        theme={theme}
        onPress={() => handleProductPress(item)}
        onAddToCart={handleAddToCart}
        isOwner={item.user._id === userId}
      />
    ),
    [theme, handleProductPress, handleAddToCart, userId]
  );

  const renderSkeletonItem = useCallback(
    ({ index }: { index: number }) => <ProductSkeletonItem key={`skeleton-${index}`} theme={theme} />,
    [theme]
  );

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={theme === 'dark' ? colors.primary : colors.primaryDark} />
          <Text
            style={[
              styles.loadingMoreText,
              {
                color: theme === 'dark' ? colors.lightText : colors.textPrimary,
                marginTop: 8,
              },
            ]}
          >
            Loading more listings...
          </Text>
        </View>
      );
    }

    if (!hasMore && allProducts.length > 0) {
      return (
        <Text
          style={[
            styles.noMoreItemsText,
            {
              color: theme === 'dark' ? colors.lightText : colors.textPrimary,
              textAlign: 'center',
              paddingVertical: 16,
            },
          ]}
        >
          No more listings
        </Text>
      );
    }

    return null;
  }, [loadingMore, hasMore, allProducts.length, theme]);

  /**
   * @param {string} categoryName
   */
  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      navigation.navigate('Category', { category: categoryName });
    },
    [navigation]
  );

  const renderListHeader = useMemo(
    () => (
      <>
        <View style={styles.locationSection}>
          <LocationSelector selectedLocation={selectedLocation} onSelect={setSelectedLocation} theme={theme} />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
              marginTop: 20,
            },
          ]}
        >
          Browse Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <CategorySkeletonItem key={`cat-skeleton-${index}`} theme={theme} />
            ))
          ) : (
            categories.map((category) => (
              <CategoryItem
                key={category.name}
                category={category}
                theme={theme}
                onPress={() => handleCategoryPress(category.name)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
              },
            ]}
          >
            Latest Listings
          </Text>
        </View>
      </>
    ),
    [selectedLocation, theme, loading, handleCategoryPress]
  );


  const keyExtractor = useCallback((item: Product, index: number) => item?._id || `product-${index}`, []);
  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }],
    [theme]
  );

  const skeletonData = useMemo(() => Array.from({ length: 6 }), []);

  const renderProductList = useCallback(() => {
    if (loading && allProducts.length === 0) {
      return (
        <FlatList
          data={skeletonData}
          keyExtractor={(_, index) => `skeleton-${index}`}
          renderItem={renderSkeletonItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderListHeader}
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          initialNumToRender={6}
          windowSize={10}
        />
      );
    }
    return (
      <FlatList
        data={allProducts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.3}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={15}
        removeClippedSubviews={true}
      />
    );
  }, [
    loading,
    allProducts,
    skeletonData,
    renderSkeletonItem,
    renderListHeader,
    keyExtractor,
    renderItem,
    renderFooter,
    refreshing,
    handleRefresh,
    loadMoreProducts,
  ]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const headerStyles = useMemo(
    () => ({
      greeting: [
        styles.greetingText,
        {
          color: theme === 'dark' ? colors.lightText : colors.darkSearchbar,
        },
      ],
      title: [
        styles.titleText,
        {
          color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
        },
      ],
      profileButton: [
        styles.profileButton,
        {
          backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
        },
      ],
    }),
    [theme]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={containerStyle}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={headerStyles.greeting}>Good {getTimeOfDay()},</Text>
              <Text style={headerStyles.title}>Find Great Deals Nearby</Text>
            </View>
            <TouchableOpacity onPress={handleProfilePress} style={headerStyles.profileButton}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme === 'dark' ? colors.primaryDark : colors.primaryDark}
              />
            </TouchableOpacity>
          </View>
        </View>

        {errorMessage ? (
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: errorOpacity,
                transform: [{ translateY: errorTranslateY }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="emoticon-sad-outline"
              size={60}
              color={theme === 'dark' ? colors.notFoundDark : colors.notFoundLight}
            />
            <Text
              style={[
                styles.emptyText,
                {
                  color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight,
                },
              ]}
            >
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                {
                  backgroundColor: theme === 'dark' ? colors.primary : colors.primaryDark,
                },
              ]}
              onPress={() => {
                setLoading(true);
                handleRefresh();
              }}
            >
              <Text style={styles.retryButtonText}>Reload</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          renderProductList()
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleFont(16),
    fontFamily: fonts.medium,
  },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.regular,
    opacity: 0.8,
  },
  titleText: {
    fontSize: scaleFont(22),
    fontFamily: fonts.Bold,
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  locationSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  alllocationText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
  locationText: {
    fontSize: scaleFont(10),
    fontFamily: fonts.regular,
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontFamily: fonts.Bold,
    marginBottom: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 75,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  imageWrapper: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.cartIconBgLightColor,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.darkHeader,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: scaleFont(14),
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  price: {
    fontSize: scaleFont(15),
    fontFamily: fonts.Bold,
  },
  postedDate: {
    fontSize: scaleFont(10),
    fontFamily: fonts.regular,
    opacity: 0.7,
    marginTop: 4,
  },
  categoriesContainer: {
    paddingLeft: HORIZONTAL_PADDING,
    paddingRight: 8,
    paddingBottom: 8,
  },
  categoryCard: {
    width: 85,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryText: {
    fontSize: scaleFont(12),
    fontFamily: fonts.semiBold,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: scaleFont(16),
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.lightHeader,
    fontSize: scaleFont(16),
    fontFamily: fonts.semiBold,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: scaleFont(13),
    fontFamily: fonts.regular,
  },
  noMoreItemsText: {
    fontSize: scaleFont(13),
    fontFamily: fonts.regular,
  },
  shareButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.cartIconBgLightColor,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.darkHeader,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default HomeScreen;