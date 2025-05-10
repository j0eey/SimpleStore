import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions, PixelRatio, TouchableOpacity } from 'react-native';
import { Product } from '../types/Product';
import { fetchProductsApi } from '../api/products.api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fonts, colors } from '../theme/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

// Type for navigation prop
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

// Helper function to scale font sizes based on device settings
const scaleFont = (size: number) => size * PixelRatio.getFontScale();

// Layout constants
const HORIZONTAL_PADDING = 20;
const CARD_GAP = 16;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const HomeScreen = () => {
  // State management
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [latestLoading, setLatestLoading] = useState(false);

  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();

  // Fetch products on initial render
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update displayed products when showAllProducts or allProducts change
  useEffect(() => {
    if (allProducts.length > 0) {
      setDisplayedProducts(showAllProducts ? allProducts : allProducts.slice(0, 4));
    }
  }, [showAllProducts, allProducts]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const data = await fetchProductsApi();
      setAllProducts(data);
      setFeaturedProducts(data.slice(0, 4));
      setDisplayedProducts(data.slice(0, 4));
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle errors during fetching
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage('An unknown error occurred.');
    }
  };

  // Toggle between showing all products and a few
  const toggleShowAllProducts = () => {
    if (!showAllProducts) {
      setLatestLoading(true);
      setTimeout(() => {
        setShowAllProducts(true);
        setLatestLoading(false);
      }, 1000); // Simulated loading for UX
    } else {
      setShowAllProducts(false);
    }
  };

  // Render a single product card
  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
        shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
      }]}
      onPress={() => navigation.navigate('ProductDetails', {
        id: item._id,
        title: item.title,
        description: item.description,
        image: item.images[0].url,
        price: item.price,
      })}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.image}
          resizeMode="contain"
        />
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
        <Text
          style={[styles.price, {
            color: theme === 'dark' ? colors.priceDark : colors.info
          }]}
        >
          ${item.price.toFixed(2)}
        </Text>
        <TouchableOpacity style={styles.addToCartBtn}>
          <Feather
            name="shopping-cart"
            size={16}
            color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render header: featured products, categories, and latest section
  const renderListHeader = () => {
    const renderFeaturedItem = ({ item }: { item: Product }) => (
      <TouchableOpacity
        style={[styles.featuredCard, {
          backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
          shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
        }]}
        onPress={() => navigation.navigate('ProductDetails', {
          id: item._id,
          title: item.title,
          description: item.description,
          image: item.images[0].url,
          price: item.price,
        })}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.featuredPrice}>
            ${item.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <>
        {/* Featured Products List */}
        {featuredProducts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme === 'dark' ? colors.nameCardDark : colors.darkHeader }]}>
              Featured Products
            </Text>
            <FlatList
              data={featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.featuredList}
            />
          </>
        )}

        {/* Static Categories */}
        <Text style={[styles.sectionTitle, { color: theme === 'dark' ? colors.nameCardDark : colors.darkHeader }]}>
          Categories
        </Text>
        <View style={styles.categoriesContainer}>
          {['Smartphones', 'Tablets', 'Accessories', 'Wearables'].map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, {
                backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
                shadowColor: theme === 'dark' ? colors.darkHeader : colors.border,
              }]}
            >
              <Text style={[styles.categoryText, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Latest Products Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme === 'dark' ? colors.nameCardDark : colors.darkHeader }]}>
            Latest Products
          </Text>
          <TouchableOpacity onPress={toggleShowAllProducts}>
            <Text style={[styles.seeAllText, { color: theme === 'dark' ? colors.priceDark : colors.info }]}>
              {showAllProducts ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // Show loader while fetching data
  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? colors.lightHeader : colors.primary} />
      </View>
    );
  }

  // Main screen content
  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }]}>
      {/* Header greeting and profile button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingText, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
              Hello,
            </Text>
            <Text style={[styles.titleText, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
              Welcome User
            </Text>
          </View>
          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={[styles.iconButton, { backgroundColor: theme === 'dark' ? colors.nameCardLight : colors.lightSearchbar }]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={theme === 'dark' ? colors.priceDark : colors.nameCardLight}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Error message or products list */}
      {errorMessage ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="emoticon-sad-outline"
            size={60}
            color={theme === 'dark' ? colors.notFoundDark : colors.notFoundLight}
          />
          <Text style={[styles.emptyText, { color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight }]}>
            {errorMessage}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderListHeader()}
        />
      )}

      {/* Small loader when switching product lists */}
      {latestLoading && (
        <ActivityIndicator size="small" color={theme === 'dark' ? colors.lightHeader : colors.primary} style={{ marginVertical: 10 }} />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: scaleFont(16),
    fontFamily: fonts.medium,
  },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.regular,
    opacity: 0.8,
  },
  titleText: {
    fontSize: scaleFont(22),
    fontFamily: fonts.Bold,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  
  sectionTitle: {
    fontSize: scaleFont(20),
    fontFamily: fonts.Bold,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.medium,
  },
  listContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  imageWrapper: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
    backgroundColor: colors.imageBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 12,
    position: 'relative',
  },
  productTitle: {
    fontSize: scaleFont(14),
    fontFamily: fonts.semiBold,
    marginBottom: 5,
  },
  price: {
    fontSize: scaleFont(16),
    fontFamily: fonts.Bold,
  },
  addToCartBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredList: {
    paddingBottom: 5,
  },
  featuredCard: {
    width: width * 0.8,
    height: 180,
    borderRadius: 16,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredTitle: {
    color: colors.lightHeader,
    fontSize: scaleFont(18),
    fontFamily: fonts.Bold,
    marginBottom: 5,
  },
  featuredPrice: {
    color: colors.lightHeader,
    fontSize: scaleFont(16),
    fontFamily: fonts.semiBold,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: (width - HORIZONTAL_PADDING * 2 - 15) / 2,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryText: {
    fontSize: scaleFont(16),
    fontFamily: fonts.semiBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: scaleFont(18),
    fontFamily: fonts.medium,
    marginTop: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.lightHeader,
    fontSize: scaleFont(16),
    fontFamily: fonts.semiBold,
  },
});

export default HomeScreen;