import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions, PixelRatio, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getErrorMessage } from '../utils/getErrorMessage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fonts, colors } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { Product } from '../types/Product';
import { categories } from '../navigation/categories';
import { fetchProductsApi } from '../api/products.api';
import { getTimeAgo } from '../utils/getTimeAgo';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const scaleFont = (size: number) => size * PixelRatio.getFontScale();
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};

// Memoized Product Item Component with optimized props
const ProductItem = memo(({ item, theme, onPress }: {
  item: Product;
  theme: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
        shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
      }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        {item.images[0]?.fullUrl ? (
          <Image
            source={{ uri: item.images[0].fullUrl }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={300}
          />
        ) : (
          <View style={[styles.imagePlaceholder, {
            backgroundColor: theme === 'dark' ? colors.darkHeader : colors.imageBackground
          }]}>
            <Ionicons
              name="image-outline"
              size={32}
              color={theme === 'dark' ? colors.lightText : colors.darkText}
            />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text
          style={[styles.productTitle, {
            color: theme === 'dark' ? colors.lightHeader : colors.darkHeader
          }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View style={styles.priceLocationContainer}>
          <Text
            style={[styles.price, {
              color: theme === 'dark' ? colors.priceDark : colors.icon
            }]}
          >
            ${item.price.toFixed(2)}
          </Text>
        </View>
        <Text
          style={[styles.locationText, {
            color: theme === 'dark' ? colors.lightText : colors.darkBorder,
            marginTop: 2
          }]}
          numberOfLines={1}
        >
          {item.location?.name ?? 'Unknown Location'}
        </Text>
        <Text
          style={[styles.postedDate, {
            color: theme === 'dark' ? colors.lightText : colors.darkBorder
          }]}
        >
          {getTimeAgo(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the item data or theme actually changed
  return prevProps.item._id === nextProps.item._id && 
         prevProps.theme === nextProps.theme;
});

// Memoized Location Selector Component
const LocationSelector = memo(({ selectedLocation, onSelect, theme }: {
  selectedLocation: string;
  onSelect: (location: string) => void;
  theme: string;
}) => (
  <TouchableOpacity
    style={[styles.locationSelector, {
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.textPrimary
    }]}
    onPress={() => onSelect(selectedLocation)}
  >
    <Ionicons name="location-outline" size={16} color={theme === 'dark' ? colors.primary : colors.darkText} />
    <Text style={[styles.alllocationText, {
      color: theme === 'dark' ? colors.lightText : colors.darkText
    }]}>
      {selectedLocation}
    </Text>
    <Ionicons name="chevron-down-outline" size={16} color={theme === 'dark' ? colors.lightText : colors.darkText} />
  </TouchableOpacity>
));

// Memoized Category Item Component
const CategoryItem = memo(({ category, theme, onPress }: {
  category: { name: string; icon: string };
  theme: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.categoryCard, {
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
      shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
    }]}
    onPress={onPress}
  >
    <Ionicons
      name={category.icon}
      size={24}
      color={theme === 'dark' ? colors.primary : colors.primaryDark}
    />
    <Text style={[styles.categoryText, {
      color: theme === 'dark' ? colors.lightHeader : colors.darkHeader
    }]}>
      {category.name}
    </Text>
  </TouchableOpacity>
));

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

  // Prevent duplicate fetches for the same page
  const fetchedPages = useRef<Set<number>>(new Set());

  // Fetch products for a specific page, append if not first page
  const fetchProducts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    // Avoid fetching the same page twice
    if (fetchedPages.current.has(pageNum)) return;
    fetchedPages.current.add(pageNum);

    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const data = await fetchProductsApi(pageNum);
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setAllProducts(prev => append ? [...prev, ...data] : data);
        setErrorMessage('');
        setPage(pageNum);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch first page only once on mount
  useEffect(() => {
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh handler resets everything
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    setErrorMessage('');
    fetchedPages.current.clear();
    try {
      const data = await fetchProductsApi(1);
      setAllProducts(data);
      setPage(1);
      setHasMore(true);
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

  // Load more products (next page only, never refetch previous)
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      fetchProducts(nextPage, true);
    }
  }, [loadingMore, hasMore, page, fetchProducts]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetails', {
      id: product._id,
      title: product.title,
      description: product.description,
      image: product.images[0].fullUrl,
      price: product.price,
      location: product.location.name,
      postedDate: product.createdAt,
    });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductItem 
      item={item} 
      theme={theme} 
      onPress={() => handleProductPress(item)} 
    />
  ), [theme, handleProductPress]);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator
            size="small"
            color={theme === 'dark' ? colors.primary : colors.primaryDark}
          />
          <Text style={[styles.loadingMoreText, {
            color: theme === 'dark' ? colors.lightText : colors.textPrimary,
            marginTop: 8
          }]}>
            Loading more listings...
          </Text>
        </View>
      );
    }

    if (!hasMore && allProducts.length > 0) {
      return (
        <Text style={[styles.noMoreItemsText, {
          color: theme === 'dark' ? colors.lightText : colors.textPrimary,
          textAlign: 'center',
          paddingVertical: 16
        }]}>
          No more listings
        </Text>
      );
    }

    return null;
  }, [loadingMore, hasMore, allProducts.length, theme]);

  const renderListHeader = useMemo(() => (
    <>
      <View style={styles.locationSection}>
        <LocationSelector 
          selectedLocation={selectedLocation}
          onSelect={setSelectedLocation}
          theme={theme}
        />
      </View>

      <Text style={[styles.sectionTitle, {
        color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
        marginTop: 20
      }]}>
        Browse Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <CategoryItem
            key={category.name}
            category={category}
            theme={theme}
            onPress={() => navigation.navigate('Category', { category: category.name })}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {
          color: theme === 'dark' ? colors.lightHeader : colors.darkHeader
        }]}>
          Latest Listings
        </Text>
      </View>
    </>
  ), [selectedLocation, theme, navigation]);

  const keyExtractor = useCallback((item: Product) => item._id, []);

  if (loading && !refreshing) {
    return (
      <View style={[styles.loader, {
        backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background
      }]}>
        <ActivityIndicator
          size="large"
          color={theme === 'dark' ? colors.primary : colors.primaryDark}
        />
        <Text style={[styles.loadingText, {
          color: theme === 'dark' ? colors.lightText : colors.darkText,
          marginTop: 16
        }]}>
          Loading listings...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, {
        backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background
      }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greetingText, {
                color: theme === 'dark' ? colors.lightText : colors.nameCardLight
              }]}>
                Good {getTimeOfDay()},
              </Text>
              <Text style={[styles.titleText, {
                color: theme === 'dark' ? colors.lightHeader : colors.darkHeader
              }]}>
                Find Great Deals Nearby
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={[styles.profileButton, {
                backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard
              }]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={theme === 'dark' ? colors.primaryDark : colors.primaryDark}
              />
            </TouchableOpacity>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="emoticon-sad-outline"
              size={60}
              color={theme === 'dark' ? colors.notFoundDark : colors.notFoundLight}
            />
            <Text style={[styles.emptyText, {
              color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight
            }]}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, {
                backgroundColor: theme === 'dark' ? colors.primary : colors.primaryDark
              }]}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={21}
            removeClippedSubviews={true}
          />
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
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: scaleFont(14),
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  priceLocationContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    padding: 20,
  },
  emptyText: {
    fontSize: scaleFont(16),
    fontFamily: fonts.medium,
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.lightHeader,
    fontSize: scaleFont(14),
    fontFamily: fonts.semiBold,
  },
  footerLoader: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.regular,
  },
  noMoreItemsText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.medium,
    opacity: 0.7,
  },
});

export default HomeScreen;