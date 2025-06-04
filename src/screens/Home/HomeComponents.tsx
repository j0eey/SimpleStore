import React, { memo, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Animated, Easing, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '../../contexts/ThemeContext';
import { Product } from '../../types/Product';
import { categories } from '../../types/categories';
import { fonts, colors } from '../../theme/Theme';
import { getTimeAgo } from '../../utils/getTimeAgo';
import { LAYOUT, scaleFont, getTimeOfDay } from './constants';
import DeepLinkingService from '../../services/UniversalLinkingService';

// Types
interface ProductItemProps {
  item: Product;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product, position: {x: number, y: number, width: number, height: number}) => void;
  isOwner: boolean;
}

interface CategoryListProps {
  loading: boolean;
  onCategoryPress: (categoryName: string) => void;
}

interface LocationSelectorProps {
  selectedLocation: string;
  onSelect: (location: string) => void;
}

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

interface HomeHeaderProps {
  onProfilePress: () => void;
}

// Home Header Component
export const HomeHeader = memo<HomeHeaderProps>(({ onProfilePress }) => {
  const { theme } = useTheme();
  
  const headerStyles = useMemo(() => ({
    header: {
      paddingHorizontal: LAYOUT.HORIZONTAL_PADDING,
      paddingTop: 10,
      paddingBottom: 16,
    },
    headerContent: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    greetingText: {
      fontSize: scaleFont(14),
      fontFamily: fonts.regular,
      opacity: 0.8,
      color: theme === 'dark' ? colors.lightText : colors.darkSearchbar,
    },
    titleText: {
      fontSize: scaleFont(22),
      fontFamily: fonts.Bold,
      marginTop: 2,
      color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      elevation: 2,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
    },
  }), [theme]);

  return (
    <View style={headerStyles.header}>
      <View style={headerStyles.headerContent}>
        <View>
          <Text style={headerStyles.greetingText}>Good {getTimeOfDay()},</Text>
          <Text style={headerStyles.titleText}>Find Great Deals Nearby</Text>
        </View>
        <TouchableOpacity onPress={onProfilePress} style={headerStyles.profileButton}>
          <Ionicons
            name="person-outline"
            size={20}
            color={theme === 'dark' ? colors.primaryDark : colors.primaryDark}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Location Selector Component
export const LocationSelector = memo<LocationSelectorProps>(({ selectedLocation, onSelect }) => {
  const { theme } = useTheme();

  const selectorStyles = useMemo(() => ({
    container: {
      paddingHorizontal: LAYOUT.HORIZONTAL_PADDING,
      marginBottom: 8,
    },
    selector: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.textPrimary,
    },
    text: {
      fontSize: scaleFont(14),
      fontFamily: fonts.semiBold,
      marginLeft: 8,
      flex: 1,
      color: theme === 'dark' ? colors.lightText : colors.darkText,
    },
  }), [theme]);

  const handlePress = useCallback(() => {
    onSelect(selectedLocation);
  }, [onSelect, selectedLocation]);

  return (
    <View style={selectorStyles.container}>
      <TouchableOpacity style={selectorStyles.selector} onPress={handlePress}>
        <Ionicons name="location-outline" size={16} color={theme === 'dark' ? colors.primary : colors.darkText} />
        <Text style={selectorStyles.text}>{selectedLocation}</Text>
        <Ionicons name="chevron-down-outline" size={16} color={theme === 'dark' ? colors.lightText : colors.darkText} />
      </TouchableOpacity>
    </View>
  );
});

// FIXED: Product Item Component - Optimized for 28.4ms TouchableOpacity issue
export const ProductItem = memo<ProductItemProps>(({ item, onPress, onAddToCart, isOwner }) => {
  const { theme } = useTheme();
  const imageRef = useRef<View>(null);

  // PERFORMANCE FIX: Simplified handlers to reduce TouchableOpacity render time
  const handlePress = useCallback(() => {
    onPress(item);
  }, [onPress, item]);

  const handleAddToCart = useCallback(() => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      onAddToCart(item, {x, y, width, height});
    });
  }, [onAddToCart, item]);

  // PERFORMANCE FIX: Simplified share handler
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
      // Handle error silently
    }
  }, [item._id, item.title, item.price, item.images]);

  // PERFORMANCE FIX: Static styles - moved outside component or memoized properly
  const cardStyle = useMemo(() => ({
    width: LAYOUT.CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
  }), [theme]);

  const buttonStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 8,
    backgroundColor: theme === 'dark' ? colors.cartIconBgDarkColor : colors.cartIconBgLightColor,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }), [theme]);

  // PERFORMANCE FIX: Pre-compute values outside render
  const imageUri = item.images[0]?.fullUrl;
  const locationName = item.location?.name ?? 'Unknown Location';
  const timeAgo = useMemo(() => getTimeAgo(item.createdAt), [item.createdAt]);
  const formattedPrice = useMemo(() => `${item.price.toFixed(2)}`, [item.price]);

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View ref={imageRef} style={{
        width: '100%',
        height: LAYOUT.CARD_WIDTH * 0.9,
        position: 'relative',
      }}>
        {imageUri ? (
          <FastImage
            source={{
              uri: imageUri,
              priority: FastImage.priority.normal,
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? colors.darkHeader : colors.imageBackground,
          }}>
            <Ionicons
              name="image-outline"
              size={32}
              color={theme === 'dark' ? colors.lightText : colors.darkText}
            />
          </View>
        )}
        
        <TouchableOpacity 
          style={[buttonStyle, { left: 8 }]} 
          onPress={handleSharePress}
          activeOpacity={0.9}
        >
          <Ionicons name="share-outline" size={20} color={theme === 'dark' ? colors.primaryLight : colors.primaryDark} />
        </TouchableOpacity>

        {!isOwner && (
          <TouchableOpacity
            style={[buttonStyle, { right: 8 }]}
            onPress={handleAddToCart}
            activeOpacity={0.9}
          >
            <Ionicons name="cart-outline" size={20} color={theme === 'dark' ? colors.primaryLight : colors.primaryDark} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={{ padding: 10 }}>
        <Text style={{
          fontSize: scaleFont(14),
          fontFamily: fonts.semiBold,
          marginBottom: 6,
          color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
        }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{
          fontSize: scaleFont(15),
          fontFamily: fonts.Bold,
          color: theme === 'dark' ? colors.priceDark : colors.icon,
        }}>
          {formattedPrice}
        </Text>
        <Text style={{
          fontSize: scaleFont(10),
          fontFamily: fonts.regular,
          color: theme === 'dark' ? colors.lightText : colors.darkBorder,
          marginTop: 2,
        }} numberOfLines={1}>
          {locationName}
        </Text>
        <Text style={{
          fontSize: scaleFont(10),
          fontFamily: fonts.regular,
          opacity: 0.7,
          marginTop: 4,
          color: theme === 'dark' ? colors.lightText : colors.darkBorder,
        }}>
          {timeAgo}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // PERFORMANCE FIX: Better comparison function
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.isOwner === nextProps.isOwner
  );
});

// OPTIMIZED: Category Components with simplified animations
const CategoryItem = memo<{category: {name: string, icon: string}, onPress: (name: string) => void}>(({ category, onPress }) => {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    onPress(category.name);
  }, [onPress, category.name]);

  const styles = useMemo(() => ({
    categoryCard: {
      width: 85,
      height: 100,
      borderRadius: 10,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: 12,
      padding: 8,
      elevation: 2,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
      shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
    },
    categoryText: {
      fontSize: scaleFont(12),
      fontFamily: fonts.semiBold,
      marginTop: 8,
      textAlign: 'center' as const,
      color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
    },
  }), [theme]);

  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={category.icon}
        size={24}
        color={theme === 'dark' ? colors.primary : colors.primaryDark}
      />
      <Text style={styles.categoryText}>{category.name}</Text>
    </TouchableOpacity>
  );
});

const CategorySkeleton = memo(() => {
  const { theme } = useTheme();
  
  const skeletonConfig = useMemo(() => ({
    borderRadius: 4,
    backgroundColor: theme === 'dark' ? colors.darkPlaceholder : colors.lightPlaceholder,
    highlightColor: theme === 'dark' ? colors.darkHighlight : colors.lightHighlight,
  }), [theme]);

  const styles = useMemo(() => ({
    categoryCard: {
      width: 85,
      height: 100,
      borderRadius: 10,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: 12,
      padding: 8,
      elevation: 2,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
      shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
    },
  }), [theme]);

  return (
    <View style={styles.categoryCard}>
      <SkeletonPlaceholder {...skeletonConfig}>
        <SkeletonPlaceholder.Item width={24} height={24} borderRadius={12} />
        <SkeletonPlaceholder.Item width={60} height={scaleFont(12)} marginTop={8} />
      </SkeletonPlaceholder>
    </View>
  );
});

export const CategoryList = memo<CategoryListProps>(({ loading, onCategoryPress }) => {
  const containerStyle = useMemo(() => ({
    paddingLeft: LAYOUT.HORIZONTAL_PADDING,
    paddingRight: 8,
    paddingBottom: 8,
  }), []);

  const renderSkeletons = useCallback(() => 
    Array.from({ length: 5 }).map((_, index) => (
      <CategorySkeleton key={`cat-skeleton-${index}`} />
    )), []);

  const renderCategories = useCallback(() =>
    categories.map((category) => (
      <CategoryItem
        key={category.name}
        category={category}
        onPress={onCategoryPress}
      />
    )), [onCategoryPress]);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={containerStyle}
    >
      {loading ? renderSkeletons() : renderCategories()}
    </ScrollView>
  );
});

// Skeleton Components
export const ProductSkeleton = memo(() => {
  const { theme } = useTheme();

  const skeletonConfig = useMemo(() => ({
    borderRadius: 4,
    backgroundColor: theme === 'dark' ? colors.darkPlaceholder : colors.lightPlaceholder,
    highlightColor: theme === 'dark' ? colors.darkHighlight : colors.lightHighlight,
  }), [theme]);

  const styles = useMemo(() => ({
    card: {
      width: LAYOUT.CARD_WIDTH,
      borderRadius: 12,
      overflow: 'hidden' as const,
      elevation: 2,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
      shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
    },
    imageWrapper: {
      width: '100%' as const,
      height: LAYOUT.CARD_WIDTH * 0.9,
    },
    productInfo: {
      padding: 10,
    },
  }), [theme]);

  return (
    <View style={styles.card}>
      <SkeletonPlaceholder {...skeletonConfig}>
        <SkeletonPlaceholder.Item style={styles.imageWrapper} />
        <SkeletonPlaceholder.Item style={styles.productInfo}>
          <SkeletonPlaceholder.Item width={LAYOUT.CARD_WIDTH * 0.8} height={scaleFont(14)} marginBottom={6} />
          <SkeletonPlaceholder.Item width={LAYOUT.CARD_WIDTH * 0.5} height={scaleFont(15)} marginBottom={2} />
          <SkeletonPlaceholder.Item width={LAYOUT.CARD_WIDTH * 0.7} height={scaleFont(10)} marginTop={2} />
          <SkeletonPlaceholder.Item width={LAYOUT.CARD_WIDTH * 0.4} height={scaleFont(10)} marginTop={4} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
});

// Error Display Component - Simplified animations
export const ErrorDisplay = memo<ErrorDisplayProps>(({ errorMessage, onRetry }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => ({
    container: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: scaleFont(16),
      fontFamily: fonts.medium,
      textAlign: 'center' as const,
      marginTop: 15,
      lineHeight: 24,
      color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight,
    },
    retryButton: {
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: theme === 'dark' ? colors.primary : colors.primaryDark,
    },
    retryButtonText: {
      color: colors.lightHeader,
      fontSize: scaleFont(16),
      fontFamily: fonts.semiBold,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="emoticon-sad-outline"
        size={60}
        color={theme === 'dark' ? colors.notFoundDark : colors.notFoundLight}
      />
      <Text style={styles.errorText}>
        {errorMessage}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Reload</Text>
      </TouchableOpacity>
    </View>
  );
});

// Section Header Component
export const SectionHeader = memo<{title: string, marginTop?: number}>(({ title, marginTop = 0 }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => ({
    sectionTitle: {
      fontSize: scaleFont(18),
      fontFamily: fonts.Bold,
      marginBottom: 12,
      paddingHorizontal: LAYOUT.HORIZONTAL_PADDING,
      marginTop,
      color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
    },
  }), [theme, marginTop]);

  return <Text style={styles.sectionTitle}>{title}</Text>;
});

// OPTIMIZED: Product Grid Component with better FlatList configuration
export const ProductGrid = memo<{
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onProductPress: (product: Product) => void;
  onAddToCart: (product: Product, position: {x: number, y: number, width: number, height: number}) => void;
  userId?: string;
  selectedLocation: string;
  onLocationSelect: (location: string) => void;
  onCategoryPress: (categoryName: string) => void;
}>(({ products, loading, refreshing, loadingMore, hasMore, onRefresh, onLoadMore, onProductPress, onAddToCart, userId, selectedLocation, onLocationSelect, onCategoryPress }) => {
  const { theme } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductItem
        item={item}
        onPress={onProductPress}
        onAddToCart={onAddToCart}
        isOwner={item.user._id === userId}
      />
    ),
    [onProductPress, onAddToCart, userId]
  );

  const renderSkeletonItem = useCallback(
    ({ index }: { index: number }) => <ProductSkeleton key={`skeleton-${index}`} />,
    []
  );

  const renderListHeader = useCallback(() => (
    <>
      <LocationSelector
        selectedLocation={selectedLocation}
        onSelect={onLocationSelect}
      />

      <SectionHeader title="Browse Categories" marginTop={20} />
      <CategoryList
        loading={loading}
        onCategoryPress={onCategoryPress}
      />

      <SectionHeader title="Latest Listings" marginTop={8} />
    </>
  ), [selectedLocation, onLocationSelect, loading, onCategoryPress]);

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={{
          paddingVertical: 20,
          alignItems: 'center',
        }}>
          <ActivityIndicator size="small" color={theme === 'dark' ? colors.primary : colors.primaryDark} />
          <Text style={{
            fontSize: scaleFont(13),
            fontFamily: fonts.regular,
            color: theme === 'dark' ? colors.lightText : colors.textPrimary,
            marginTop: 8,
          }}>
            Loading more listings...
          </Text>
        </View>
      );
    }

    if (!hasMore && products.length > 0) {
      return (
        <Text style={{
          fontSize: scaleFont(13),
          fontFamily: fonts.regular,
          color: theme === 'dark' ? colors.lightText : colors.textPrimary,
          textAlign: 'center',
          paddingVertical: 16,
        }}>
          No more listings
        </Text>
      );
    }

    return null;
  }, [loadingMore, hasMore, products.length, theme]);

  const keyExtractor = useCallback((item: Product, index: number) => item?._id || `product-${index}`, []);
  const skeletonData = useMemo(() => Array.from({ length: 6 }), []);

  // OPTIMIZED: Better layout calculation
  const getItemLayout = useCallback((data: any, index: number) => {
    const itemHeight = LAYOUT.CARD_WIDTH * 0.9 + 80; // image height + padding + text
    return {
      length: itemHeight,
      offset: itemHeight * Math.floor(index / 2),
      index,
    };
  }, []);

  const listStyles = useMemo(() => ({
    listContainer: {
      paddingBottom: 75,
    },
    row: {
      justifyContent: 'space-between' as const,
      paddingHorizontal: LAYOUT.HORIZONTAL_PADDING,
      marginBottom: LAYOUT.CARD_GAP,
    },
  }), []);

  if (loading && products.length === 0) {
    return (
      <FlatList
        data={skeletonData}
        keyExtractor={(_, index) => `skeleton-${index}`}
        renderItem={renderSkeletonItem}
        numColumns={2}
        columnWrapperStyle={listStyles.row}
        contentContainerStyle={listStyles.listContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        initialNumToRender={4}
        windowSize={8}
        ListHeaderComponent={renderListHeader}
      />
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={listStyles.row}
      contentContainerStyle={listStyles.listContainer}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderFooter}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      updateCellsBatchingPeriod={100}
      windowSize={8}
      removeClippedSubviews={true}
      getItemLayout={getItemLayout}
      legacyImplementation={false}
    />
  );
});