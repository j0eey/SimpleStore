import React, { memo, useRef, useCallback, useMemo, useState } from 'react';
import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import { Product } from '../../types/Product';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, fonts } from '../../theme/Theme';
import { LAYOUT, scaleFont } from './constants';
import { OptimizedProductItem } from './OptimizedProductItem'; // NEW COMPONENT
import { ProductSkeleton, LocationSelector, SectionHeader, CategoryList } from './HomeComponents';

interface OptimizedProductGridProps {
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
  onCategoryPress: (categoryName: string) => void;
}

// SEPARATED Header Component
const ListHeader = memo<{
  loading: boolean;
  onCategoryPress: (categoryName: string) => void;
}>(({ loading, onCategoryPress }) => {
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  const handleLocationSelect = useCallback((location: string) => {
    setSelectedLocation(location);
  }, []);

  return (
    <>
      <LocationSelector
        selectedLocation={selectedLocation}
        onSelect={handleLocationSelect}
      />
      <SectionHeader title="Browse Categories" marginTop={20} />
      <CategoryList
        loading={loading}
        onCategoryPress={onCategoryPress}
      />
      <SectionHeader title="Latest Listings" marginTop={8} />
    </>
  );
});

// SEPARATED Footer Component
const ListFooter = memo<{
  loadingMore: boolean;
  hasMore: boolean;
  productsLength: number;
  loading: boolean;
}>(({ loadingMore, hasMore, productsLength, loading }) => {
  const { theme } = useTheme();

  if (loadingMore && productsLength > 0) {
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

  if (!hasMore && productsLength > 0 && !loadingMore && !loading) {
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
});

export const OptimizedProductGrid = memo<OptimizedProductGridProps>(({ 
  products, 
  loading, 
  refreshing, 
  loadingMore, 
  hasMore, 
  onRefresh, 
  onLoadMore, 
  onProductPress, 
  onAddToCart, 
  userId,
  onCategoryPress 
}) => {
  const hasScrolledRef = useRef(false);

  // SIMPLIFIED callbacks
  const handleLoadMore = useCallback(() => {
    if (hasScrolledRef.current && hasMore && !loadingMore && !loading && products.length > 0) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, loading, products.length, onLoadMore]);

  const handleScroll = useCallback(() => {
    hasScrolledRef.current = true;
  }, []);

  // MEMOIZED render functions
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <OptimizedProductItem
        item={item}
        onPress={onProductPress}
        onAddToCart={onAddToCart}
        isOwner={item.user._id === userId}
      />
    ),
    [onProductPress, onAddToCart, userId]
  );

  const renderSkeletonItem = useCallback(
    () => <ProductSkeleton />,
    []
  );

  const renderListHeader = useCallback(() => (
    <ListHeader
      loading={loading}
      onCategoryPress={onCategoryPress}
    />
  ), [loading, onCategoryPress]);

  const renderFooter = useCallback(() => (
    <ListFooter
      loadingMore={loadingMore}
      hasMore={hasMore}
      productsLength={products.length}
      loading={loading}
    />
  ), [loadingMore, hasMore, products.length, loading]);

  // SIMPLIFIED styles
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

  const keyExtractor = useCallback((item: Product) => item._id, []);
  const skeletonData = useMemo(() => Array.from({ length: 6 }), []);

  // LOADING STATE
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
        ListHeaderComponent={renderListHeader}
        scrollEnabled={false}
        // REMOVED HEAVY OPTIMIZATIONS FOR LOADING STATE
      />
    );
  }

  // MAIN LIST
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
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      onScroll={handleScroll}
      scrollEventThrottle={200}
      // SIMPLIFIED OPTIMIZATIONS
      initialNumToRender={6}
      maxToRenderPerBatch={4}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
});