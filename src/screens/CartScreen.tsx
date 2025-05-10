import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CartScreen = () => {
  const { theme } = useTheme(); // Access current theme (light/dark)

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background } // Dynamic background based on theme
    ]}>
      <View style={styles.emptyCartContainer}>
        <Ionicons
          name="cart-outline"
          size={80}
          color={theme === 'dark' ? colors.darkSearch : colors.lightSearch} // Dynamic icon color based on theme
        />
        <Text style={[
          styles.emptyCartText,
          { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader } // Dynamic text color
        ]}>
          Empty Cart
        </Text>
        <Text style={[
          styles.emptyCartSubtext,
          { color: theme === 'dark' ? colors.darkSearch : colors.lightSearch } // Dynamic subtext color
        ]}>
          Your cart is currently empty
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 24,
    fontFamily: fonts.Bold,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 16,
    fontFamily: fonts.regular,
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default CartScreen;
