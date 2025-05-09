import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TextInput, Dimensions, PixelRatio, TouchableOpacity } from 'react-native';
import { Product } from '../types/Product';
import { fetchProductsApi, searchProductsApi } from '../api/products.api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fonts, colors } from '../theme/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import CustomModal from '../components/CustomModal';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
  Home: undefined;
  ProductDetails: { id: string; title: string; description: string; image: string; price: number };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const scaleFont = (size: number) => size * PixelRatio.getFontScale();

const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2.5 - CARD_GAP) / 2;

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await fetchProductsApi();
      setProducts(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchProducts();
      return;
    }
    try {
      const result = await searchProductsApi(query);
      setProducts(result);
      setErrorMessage(result.length ? '' : 'No products found!');
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage('An unknown error occurred.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLogoutModalVisible(false);
      // No need to manually navigate to Login — AppNavigator handles it automatically
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard }]}
      onPress={() => navigation.navigate('ProductDetails', {
        id: item._id,
        title: item.title,
        description: item.description,
        image: item.images[0].url,
        price: item.price,
      })}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.images[0].url }} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={[styles.productTitle, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
        {item.title}
      </Text>
      <Text style={[styles.price, { color: theme === 'dark' ? colors.priceDark : colors.info }]}>
        ${item.price}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.titleText, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
          Simple Store
        </Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            <Ionicons name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={24} color={theme === 'dark' ? colors.priceDark : colors.nameCardLight} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={24} color={theme === 'dark' ? colors.priceDark : colors.nameCardLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: theme === 'dark' ? colors.darkSearchbar : colors.lightSearchbar,
            color: theme === 'dark' ? colors.nameCardDark : colors.darkHeader,
          },
        ]}
        placeholder="Search Mobiles..."
        placeholderTextColor={theme === 'dark' ? colors.darkSearch : colors.lightSearch}
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {errorMessage ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'dark' ? colors.notFoundDark : colors.notFoundLight }]}>
            {errorMessage}
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: theme === 'dark' ? colors.nameCardDark : colors.darkHeader }]}>
            Latest Mobiles
          </Text>
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

      {/* Custom Logout Modal */}
      <CustomModal
        isVisible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        buttons={[
          { label: 'Cancel', onPress: () => setLogoutModalVisible(false), type: 'secondary' },
          { label: 'Log Out', onPress: handleLogout, type: 'primary' },
        ]}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: width * 0.13,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
  },
  titleText: {
    fontSize: scaleFont(26),
    fontWeight: '600',
    fontFamily: fonts.Bold,
  },
  searchInput: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: scaleFont(16),
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: scaleFont(22),
    fontWeight: '400',
    marginBottom: 10,
    fontFamily: fonts.Bold,
  },
  listContainer: {
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.darkHeader,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: CARD_GAP,
  },
  imageWrapper: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  productTitle: {
    fontSize: scaleFont(14),
    marginHorizontal: 8,
    marginTop: 8,
    fontFamily: fonts.semiBold,
  },
  price: {
    fontSize: scaleFont(14),
    marginHorizontal: 8,
    marginBottom: 8,
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: scaleFont(18),
  },
});
