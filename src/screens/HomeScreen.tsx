import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import { Product } from '../types/Product';
import { fetchProductsApi, searchProductsApi } from '../api/products.api';

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

        if (searchedProducts.length === 0) {
          setErrorMessage('No products found!');
        } else {
          setErrorMessage('');
        }
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
    <View style={styles.card}>
      <Image source={{ uri: item.images[0].url }} style={styles.image} resizeMode="cover" />
      <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.price}>${item.price}</Text>
    </View>
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
        placeholder="Search Products..."
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {errorMessage ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16; // same as container paddingHorizontal
const CARD_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f9f9f9',
    width: CARD_WIDTH,
    borderRadius: 12,
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
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 14,
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
    fontSize: 18,
    color: '#999',
  },
});
