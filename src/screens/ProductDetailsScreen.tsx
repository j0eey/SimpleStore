import React, { useState, FC } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { fonts, colors } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;

type Props = {
  route: ProductDetailsScreenRouteProp;
  navigation: ProductDetailsScreenNavigationProp;
};

const ProductDetailsScreen: FC<Props> = ({ route }) => {
  const { id, title, description, image, price } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const totalPrice = (price * quantity).toFixed(2);

  return (
    <ScrollView 
      contentContainerStyle={styles.contentContainer} 
      style={[styles.scrollContainer, { backgroundColor: isDark ?  colors.darkHeader : colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: image }} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>

      <Text style={[styles.title, { color: isDark ?  colors.lightHeader :  colors.darkHeader }]}>{title}</Text>

      <View style={styles.row}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: isDark ?  colors.nameCardLight : colors.light }]} 
            onPress={handleDecrease}
          >
            <Text style={[styles.quantityButtonText, { color: isDark ?  colors.lightHeader :  colors.darkHeader }]}>-</Text>
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: isDark ?  colors.lightHeader :  colors.darkHeader }]}>{quantity}</Text>

          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: isDark ?  colors.nameCardLight : colors.light }]} 
            onPress={handleIncrease}
          >
            <Text style={[styles.quantityButtonText, { color: isDark ?  colors.lightHeader :  colors.darkHeader }]}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.price, { color: isDark ?  colors.priceDarkDetails : colors.info }]} >
          ${totalPrice}
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: isDark ?  colors.lineDark :  colors.nameCardDark }]} />

      <Text style={[styles.sectionTitle, { color: isDark ?  colors.lightHeader :  colors.darkHeader }]}>Description</Text>
      <Text style={[styles.description, { color: isDark ?  colors.border : colors.text }]}>{description}</Text>

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
  },
  title: {
    fontSize: 25,
    marginBottom: 16,
    textAlign: 'left',
    fontFamily: fonts.Bold,
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
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color:  colors.lightHeader,
  },
});


export default ProductDetailsScreen;