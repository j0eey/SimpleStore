import React, { useState, FC, useEffect, useCallback  } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { fonts, colors } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { fetchProductByIdApi } from '../api/products.api';
import { Product } from '../types/Product';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;

type Props = {
  route: ProductDetailsScreenRouteProp;
  navigation: ProductDetailsScreenNavigationProp;
};

const ProductDetailsScreen: FC<Props> = ({ route }) => {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const productData = await fetchProductByIdApi(id);
        setProduct(productData);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => quantity > 1 && setQuantity(prev => prev - 1);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorMessage(null);
    try {
      const productData = await fetchProductByIdApi(id);
      setProduct(productData);
      setQuantity(1);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load product details');
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  if (loading || refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}>
        <ActivityIndicator size="large" color={isDark ? colors.lightHeader : colors.darkHeader} />
      </View>
    );
  }

  if (errorMessage) {
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
  const mainImage = product.images[0]?.fullUrl;

  return (
    <ScrollView 
      contentContainerStyle={styles.contentContainer} 
      style={[styles.scrollContainer, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageWrapper}>
        {mainImage ? (
          <Image 
            source={{ uri: mainImage }} 
            style={styles.image} 
            resizeMode="contain" 
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? colors.darkCard : colors.light }]}>
            <Text style={{ color: isDark ? colors.lightHeader : colors.darkHeader }}>No Image Available</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
        {product.title}
      </Text>

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
      <Text style={[styles.detailText, { color: isDark ? colors.border : colors.text }]}>
        {product.user.email}
      </Text>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  image: {
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
  title: {
    fontSize: 25,
    marginBottom: 16,
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
});

export default ProductDetailsScreen;