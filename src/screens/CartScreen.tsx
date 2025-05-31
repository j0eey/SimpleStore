import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { CartItemType } from '../types/Cart';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
const CartScreen = () => {
  const { theme } = useTheme();
  const { cart, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const isDark = theme === 'dark';
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const summaryHeight = useRef(new Animated.Value(135)).current;

  useEffect(() => {
    Animated.timing(summaryHeight, {
      toValue: summaryExpanded ? 380 : 135,
      duration: 300, 
      useNativeDriver: false, 
    }).start(); 
  }, [summaryExpanded]); 

  const CartItem = ({ item }: { item: CartItemType }) => {
    const itemTotalPrice = ((item.price || 0) * (item.quantity || 0)).toFixed(2);

    const handleIncreaseQuantity = () => {
      updateCartItemQuantity(item._id, (item.quantity || 0) + 1);
    };

    const handleDecreaseQuantity = () => {
      if ((item.quantity || 0) > 1) {
        updateCartItemQuantity(item._id, (item.quantity || 0) - 1);
      } else {
        Toast.show({
          type: 'info',
          text1: 'Minimum quantity reached',
          text2: 'Use swipe to remove item',
        });
      }
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <RectButton style={styles.rightAction} onPress={() => removeFromCart(item._id)}>
          <Animated.View style={[styles.trashIconContainer, { transform: [{ scale }] }]}>
            <MaterialCommunityIcons name="trash-can-outline" size={25} color={colors.lightHeader} />
            <Text style={styles.removeText}>Remove</Text>
          </Animated.View>
        </RectButton>
      );
    };

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
      >
        <View style={[
          styles.cartItemContainer,
          {
            backgroundColor: isDark ? colors.darkCard : colors.light,
          }
        ]}>
          <View style={styles.itemImageContainer}>
            {item.images && item.images.length > 0 ? (
              <Image source={{ uri: item.images[0].fullUrl }} style={styles.cartItemImage} />
            ) : (
              <View style={[styles.cartItemImagePlaceholder, { backgroundColor: isDark ? colors.darkBackground : colors.placeholderBackground }]}>
                <MaterialCommunityIcons name="image-off-outline" size={30} color={isDark ? colors.border : colors.text} />
              </View>
            )}
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityBadgeText}>{item.quantity || 0}</Text>
            </View>
          </View>

          <View style={styles.cartItemDetails}>
            <Text style={[styles.cartItemTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }]} numberOfLines={2}>
              {item.title || 'Unknown Product'}
            </Text>
            <Text style={[styles.cartItemPrice, { color: isDark ? colors.priceDarkDetails : colors.info }]}>
              ${(item.price || 0).toFixed(2)} each
            </Text>

            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={handleDecreaseQuantity}
                style={[styles.quantityButton, styles.decreaseButton, { backgroundColor: isDark ? colors.nameCardLight : colors.light }]}
              >
                <MaterialCommunityIcons name="minus" size={16} color={isDark ? colors.lightHeader : colors.darkHeader} />
              </TouchableOpacity>

              <View style={[styles.quantityDisplay, { backgroundColor: colors.primaryDark }]}>
                <Text style={styles.quantityDisplayText}>{item.quantity || 0}</Text>
              </View>

              <TouchableOpacity
                onPress={handleIncreaseQuantity}
                style={[styles.quantityButton, styles.increaseButton, { backgroundColor: colors.primaryDark }]}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.lightHeader} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cartItemActions}>
            <Text style={[styles.cartItemTotalPrice, { color: colors.primaryDark }]}>
              ${itemTotalPrice}
            </Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => (
    <CartItem item={item} />
  );

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0).toFixed(2);
  };

  const toggleSummary = () => {
    setSummaryExpanded(prev => !prev);
  };

  if (cart.length === 0) {
    return (
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.darkHeader : colors.background,
        }
      ]}>
        <View style={styles.emptyCartContainer}>
          <View style={styles.emptyCartIconContainer}>
            <MaterialCommunityIcons
              name="cart-outline"
              size={100}
              color={isDark ? colors.darkSearch : colors.lightSearch}
            />
            <View style={styles.emptyCartIconOverlay}>
              <MaterialCommunityIcons
                name="emoticon-sad-outline"
                size={30}
                color={colors.error}
              />
            </View>
          </View>

          <Text style={[
            styles.emptyCartText,
            { color: isDark ? colors.lightHeader : colors.darkHeader }
          ]}>
            Your Cart is Empty
          </Text>
          <Text style={[
            styles.emptyCartSubtext,
            { color: isDark ? colors.darkSearch : colors.lightSearch }
          ]}>
            Add some products to get started with your shopping journey
          </Text>

          <TouchableOpacity
            style={[styles.shopNowButton, { backgroundColor: colors.primaryDark }]}
            onPress={() => navigation.navigate('Home')}
          >
            <MaterialCommunityIcons name="shopping" size={20} color={colors.lightHeader} />
            <Text style={styles.shopNowButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? colors.darkHeader : colors.background,
      }
    ]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
          Shopping Cart
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? colors.darkSearch : colors.lightSearch }]}>
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item._id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.cartListContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      <Animated.View style={[
        styles.cartSummary,
        {
          backgroundColor: isDark ? colors.darkCard : colors.light,
          height: summaryHeight,
        }
      ]}>
        <TouchableOpacity onPress={toggleSummary} style={styles.summaryHeader}>
          <View style={styles.summaryDragIndicator} />
          <View style={styles.summaryTopRow}>
            <Text style={[styles.summaryTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
              Order Summary
            </Text>
            <MaterialCommunityIcons
              name={summaryExpanded ? "chevron-down" : "chevron-up"}
              size={24}
              color={isDark ? colors.lightHeader : colors.darkHeader}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
              Subtotal ({cart.length} items)
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primaryDark }]}>
              ${calculateTotal()}
            </Text>
          </View>

          {summaryExpanded && (
            <View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryText, { color: isDark ? colors.darkSearch : colors.lightSearch }]}>
                  Shipping
                </Text>
                <Text style={[styles.summaryValue, { color: colors.success || colors.primaryDark }]}>
                  Free
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryTotalText, { color: isDark ? colors.lightHeader : colors.darkHeader }]}>
                  Total
                </Text>
                <Text style={[styles.summaryTotalValue, { color: colors.primaryDark }]}>
                  ${calculateTotal()}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.primaryDark }]}
              onPress={() => Toast.show({ type: 'success', text1: 'Proceeding to checkout...' })}
            >
              <MaterialCommunityIcons name="credit-card" size={20} color={colors.lightHeader} />
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.clearCartButton, { borderColor: colors.error }]}
              onPress={() => {
                clearCart();
                Toast.show({ type: 'success', text1: 'Cart cleared! All items have been removed' });
              }}
            >
              <MaterialCommunityIcons name="delete-sweep" size={16} color={colors.error} />
              <Text style={[styles.clearCartButtonText, { color: colors.error }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.Bold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCartIconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  emptyCartIconOverlay: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: colors.lightHeader,
    borderRadius: 20,
    padding: 5,
  },
  emptyCartText: {
    fontSize: 24,
    fontFamily: fonts.Bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyCartSubtext: {
    fontSize: 16,
    fontFamily: fonts.regular,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
    marginBottom: 30,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  shopNowButtonText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  cartListContent: {
    paddingHorizontal: 15,
    paddingBottom: 150,
  },
  itemSeparator: {
    height: 12,
  },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  cartItemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.lightHeader,
  },
  quantityBadgeText: {
    color: colors.lightHeader,
    fontSize: 12,
    fontFamily: fonts.Bold,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginBottom: 6,
    lineHeight: 20,
  },
  cartItemPrice: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decreaseButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  increaseButton: {
  },
  quantityDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  quantityDisplayText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  cartItemTotalPrice: {
    fontSize: 18,
    fontFamily: fonts.Bold,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.lightHeader + '20',
  },
  rightAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    borderRadius: 16,
    marginLeft: 12,
  },
  trashIconContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.lightHeader,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    marginTop: 4,
  },
  cartSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  summaryHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  summaryDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  summaryContent: {
    paddingHorizontal: 20,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  summaryTotalText: {
    fontSize: 18,
    fontFamily: fonts.Bold,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontFamily: fonts.Bold,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontFamily: fonts.Bold,
  },
  clearCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  clearCartButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
});

export default CartScreen;