import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '../../contexts/ThemeContext';
import { categories } from '../../types/categories';
import { fonts, colors } from '../../theme/Theme';
import { CategoryListProps, LocationSelectorProps, ErrorDisplayProps, HomeHeaderProps } from './types';
import { LAYOUT, scaleFont, getTimeOfDay } from './constants';

// Home Header Component
export const HomeHeader = memo<HomeHeaderProps>(({ onProfilePress }) => {
  const { theme } = useTheme();

  const headerStyles = useMemo(() => StyleSheet.create({
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

// Category Components
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

// Product Skeleton Component
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

// Error Display Component
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

  const handleReload = useCallback(() => {
    onRetry();
  }, [onRetry]);

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
        onPress={handleReload}
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