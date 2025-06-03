import React from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ListRenderItem } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { colors, fonts } from '../../theme/Theme';
import { SearchState } from '../../types/types';
import { Product } from '../../types/Product';
import { UI_MEASUREMENTS, CARD_SHADOW, TEXT_CONFIG, ICONS, MESSAGES, SKELETON_ITEMS_COUNT, FLATLIST_CONFIG, SEARCH_MIN_LENGTH } from './constants';

// Skeleton component for loading state
export const SearchResultItemSkeleton = ({ theme }: { theme: string }) => {
  const isDark = theme === 'dark';
  const skeletonConfig = {
    borderRadius: 4,
    backgroundColor: isDark ? colors.darkPlaceholder : colors.lightPlaceholder,
    highlightColor: isDark ? colors.darkHighlight : colors.lightHighlight,
  };

  return (
    <SkeletonPlaceholder {...skeletonConfig}>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        alignItems="center"
        padding={UI_MEASUREMENTS.productCardPadding}
        borderRadius={UI_MEASUREMENTS.productCardBorderRadius}
        marginBottom={UI_MEASUREMENTS.cardMarginBottom}
        backgroundColor={isDark ? colors.darkCard : colors.lightCard}
      >
        <SkeletonPlaceholder.Item
          width={UI_MEASUREMENTS.productImageSize}
          height={UI_MEASUREMENTS.productImageSize}
          borderRadius={UI_MEASUREMENTS.productImageBorderRadius}
          marginRight={UI_MEASUREMENTS.productImageMargin}
        />
        <SkeletonPlaceholder.Item flex={1}>
          <SkeletonPlaceholder.Item width="85%" height={16} marginBottom={4} />
          <SkeletonPlaceholder.Item width="60%" height={16} marginBottom={4} />
          <SkeletonPlaceholder.Item width="30%" height={16} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

// Main container with theme support
export const MainContainer = ({ 
  children, 
  theme 
}: { 
  children: React.ReactNode; 
  theme: string; 
}) => (
  <View style={[
    styles.container,
    { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }
  ]}>
    {children}
  </View>
);

// Search bar component
export const SearchBar = ({
  query,
  onTextChange,
  onSearch,
  onClear,
  theme,
}: {
  query: string;
  onTextChange: (text: string) => void;
  onSearch: () => void;
  onClear: () => void;
  theme: string;
}) => {
  const isDark = theme === 'dark';
  const iconColor = isDark ? colors.darkSearch : colors.lightSearch;
  
  return (
    <View style={[
      styles.searchContainer,
      { backgroundColor: isDark ? colors.darkSearchbar : colors.lightSearchbar }
    ]}>
      <TouchableOpacity onPress={onSearch} style={styles.searchIconContainer}>
        <Ionicons name={ICONS.search} size={ICONS.size} color={iconColor} />
      </TouchableOpacity>
      
      <TextInput
        style={[
          styles.searchInput,
          { color: isDark ? colors.lightHeader : colors.darkHeader }
        ]}
        placeholder={MESSAGES.searchPlaceholder}
        placeholderTextColor={iconColor}
        value={query}
        onChangeText={onTextChange}
        autoFocus
        returnKeyType="search"
        onSubmitEditing={onSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {query.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearIconContainer}>
          <Ionicons name={ICONS.close} size={ICONS.size} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Product card component
export const ProductCard = ({
  product,
  onPress,
  theme,
}: {
  product: Product;
  onPress: (product: Product) => void;
  theme: string;
}) => {
  const isDark = theme === 'dark';
  const imageUrl = product.images[0]?.fullUrl;

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        { backgroundColor: isDark ? colors.darkCard : colors.lightCard }
      ]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <Text
          style={[
            styles.productTitle,
            { color: isDark ? colors.lightHeader : colors.darkHeader }
          ]}
          numberOfLines={TEXT_CONFIG.productTitleLines}
        >
          {product.title}
        </Text>
        <Text style={[
          styles.productPrice,
          { color: isDark ? colors.priceDark : colors.info }
        ]}>
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Empty state component
export const EmptyState = ({
  searchState,
  theme,
}: {
  searchState: SearchState;
  theme: string;
}) => {
  let message: string = MESSAGES.searchPlaceholder;
  
  if (searchState.query.length > 0 && searchState.query.length < SEARCH_MIN_LENGTH) {
    message = MESSAGES.minLengthMessage;
  } else if (searchState.hasSearched && searchState.results.length === 0) {
    message = MESSAGES.noResultsMessage;
  }

  return (
    <View style={styles.emptyContainer}>
      <Text style={[
        styles.emptyText,
        { color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight }
      ]}>
        {message}
      </Text>
    </View>
  );
};

// Search content renderer
export const SearchContent = ({
  searchState,
  onProductPress,
  theme,
}: {
  searchState: SearchState;
  onProductPress: (product: Product) => void;
  theme: string;
}) => {
  const renderProductItem: ListRenderItem<Product> = React.useCallback(({ item }) => (
    <ProductCard product={item} onPress={onProductPress} theme={theme} />
  ), [onProductPress, theme]);

  if (searchState.isLoading) {
    return (
      <View style={styles.listContainer}>
        {Array.from({ length: SKELETON_ITEMS_COUNT }, (_, index) => (
          <SearchResultItemSkeleton key={index} theme={theme} />
        ))}
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
        {...FLATLIST_CONFIG}
      />
    );
  }

  return <EmptyState searchState={searchState} theme={theme} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: UI_MEASUREMENTS.containerPadding,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: UI_MEASUREMENTS.searchBarBorderRadius,
    paddingHorizontal: UI_MEASUREMENTS.searchBarPadding,
    marginBottom: UI_MEASUREMENTS.containerPadding,
    height: UI_MEASUREMENTS.searchBarHeight,
  },
  searchIconContainer: {
    marginRight: UI_MEASUREMENTS.iconMargin,
    padding: UI_MEASUREMENTS.iconPadding,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: TEXT_CONFIG.searchInputFontSize,
    fontFamily: fonts.medium,
  },
  clearIconContainer: {
    marginLeft: UI_MEASUREMENTS.iconMargin,
    padding: UI_MEASUREMENTS.iconPadding,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: TEXT_CONFIG.emptyTextFontSize,
    fontFamily: fonts.medium,
    textAlign: 'center',
    lineHeight: TEXT_CONFIG.emptyTextLineHeight,
  },
  listContainer: {
    paddingBottom: UI_MEASUREMENTS.listBottomPadding,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_MEASUREMENTS.productCardPadding,
    borderRadius: UI_MEASUREMENTS.productCardBorderRadius,
    marginBottom: UI_MEASUREMENTS.cardMarginBottom,
    shadowColor: colors.border,
    ...CARD_SHADOW,
  },
  productImage: {
    width: UI_MEASUREMENTS.productImageSize,
    height: UI_MEASUREMENTS.productImageSize,
    borderRadius: UI_MEASUREMENTS.productImageBorderRadius,
    marginRight: UI_MEASUREMENTS.productImageMargin,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: TEXT_CONFIG.productTitleFontSize,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
    lineHeight: TEXT_CONFIG.productTitleLineHeight,
  },
  productPrice: {
    fontSize: TEXT_CONFIG.productPriceFontSize,
    fontFamily: fonts.Bold,
  },
});