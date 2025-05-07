import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';  // Import useRoute hook
import { fetchProductDetailsApi } from '../api/products.api';  // Import the API to fetch product details

const ProductDetailsScreen = () => {
  const [product, setProduct] = useState<any>(null);  // Product state
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Get the productId from route params
  const route = useRoute();
  const { productId } = route.params as { productId: string };

  const fetchProductDetails = async () => {
    try {
      const productDetails = await fetchProductDetailsApi(productId);  // Fetch product details using the productId
      setProduct(productDetails);
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

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Share button handler (you can later implement actual share functionality)
  const handleShare = () => {
    Alert.alert('Share', 'Share functionality not implemented yet!');
  };

  // Add to cart button handler (you can later implement actual add to cart functionality)
  const handleAddToCart = () => {
    Alert.alert('Add to Cart', 'Add to cart functionality not implemented yet!');
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {product && (
        <>
          <Image source={{ uri: product.images[0].url }} style={styles.image} resizeMode="cover" />
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Text style={styles.price}>${product.price}</Text>

          {/* Buttons */}
          <TouchableOpacity style={styles.button} onPress={handleShare}>
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  price: {
    fontSize: 20,
    color: '#007AFF',
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
});
