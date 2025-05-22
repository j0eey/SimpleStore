import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, fonts } from '../theme/Theme';
// import { searchProductsApi } from '../api/products.api';
import { Product } from '../types/Product';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';


const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // setIsLoading(true);
    // setError('');
    // try {
    //   const results = await searchProductsApi(query);
    //   setSearchResults(results);
    // } catch (err) {
    //   setError('Failed to search products');
    //   console.error(err);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        { backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard }
      ]}
      onPress={() => navigation.navigate('ProductDetails', {
        id: item._id,
        title: item.title,
        description: item.description,
        image: item.images[0].url,
        price: item.price,
      })}
    >
      <Image
        source={{ uri: item.images[0].url }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <Text 
          style={[
            styles.productTitle,
            { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={[
          styles.productPrice,
          { color: theme === 'dark' ? colors.priceDark : colors.info }
        ]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }
    ]}>
      {/* Search Bar */}
      <View style={[
        styles.searchContainer,
        { backgroundColor: theme === 'dark' ? colors.darkSearchbar : colors.lightSearchbar }
      ]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={theme === 'dark' ? colors.darkSearch : colors.lightSearch} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
          ]}
          placeholder="Search products..."
          placeholderTextColor={theme === 'dark' ? colors.darkSearch : colors.lightSearch}
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            setSearchResults([]);
          }}>
            <Ionicons 
              name="close" 
              size={20} 
              color={theme === 'dark' ? colors.darkSearch : colors.lightSearch} 
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme === 'dark' ? colors.lightHeader : colors.primary} 
          />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight }]}>
            {error}
          </Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : searchQuery.length >= 2 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight }]}>
            No products found
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight }]}>
            {searchQuery.length === 0 
              ? 'Search for products...' 
              : 'Type at least 2 characters...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  searchIcon: {
    marginRight: 10,
  },
  clearIcon: {
    marginLeft: 10,
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
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: fonts.Bold,
  },
});

export default SearchScreen;