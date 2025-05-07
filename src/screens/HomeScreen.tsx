import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TextInput, Dimensions, PixelRatio, TouchableOpacity } from 'react-native';
import { Product } from '../types/Product';
import { fetchProductsApi, searchProductsApi } from '../api/products.api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Type declarations
type RootStackParamList = {
  Home: undefined;
  ProductDetails: { id: string; title: string; description: string; image: string; price: number };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Responsive helpers
const { width } = Dimensions.get('window');
const scaleFont = (size: number) => size * PixelRatio.getFontScale();

const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation<HomeScreenNavigationProp>();

  const fetchProducts = async () => {
    try {
      const products = await fetchProductsApi();
      setProducts(products);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    try {
      if (query.trim() === '') {
        const allProducts = await fetchProductsApi();
        setProducts(allProducts);
        setErrorMessage('');
      } else {
        const searchedProducts = await searchProductsApi(query);
        setProducts(searchedProducts);
        setErrorMessage(searchedProducts.length === 0 ? 'No products found!' : '');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred.');
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ProductDetails', {
          id: item._id,
          title: item.title,
          description: item.description,
          image: item.images[0].url,
          price: item.price,
        })
      }
    >
      <Image source={{ uri: item.images[0].url }} style={styles.image} resizeMode="cover" />
      <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.price}>${item.price}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Simple Store</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search Mobiles..."
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {errorMessage ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Latest Mobiles</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

export default HomeScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: width * 0.1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: scaleFont(26),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
  },
  searchInput: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    fontSize: scaleFont(16),
  },
  sectionTitle: {
    fontSize: scaleFont(22),
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'left',
    marginLeft: 2,
  },
  listContainer: {
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  card: {
    backgroundColor: '#f9f9f9',
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
  },
  productTitle: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    marginHorizontal: 8,
    marginTop: 8,
    color: '#333',
  },
  price: {
    fontSize: scaleFont(14),
    color: '#007AFF',
    marginHorizontal: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: scaleFont(18),
    color: '#999',
  },
});
