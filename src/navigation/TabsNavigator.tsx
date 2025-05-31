import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import FlyingCartAnimation from '../components/FlyingCartAnimation';

const Tab = createBottomTabNavigator();
const DummyScreen = () => null;

const CustomTabBarButton = ({ children }: any) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.customButtonContainer}
      onPress={() => navigation.navigate('AddNewProduct')}
      activeOpacity={0.7}
    >
      <View style={styles.customButton}>{children}</View>
    </TouchableOpacity>
  );
};

const TabsNavigator = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { cart } = useCart();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primaryDark,
          tabBarInactiveTintColor: colors.darkSearch,
          tabBarStyle: {
            backgroundColor: isDark ? colors.darkHeader : colors.lightHeader,
            borderTopWidth: 0,
            height: 60,
            position: 'absolute',
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName = '';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
            else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
            else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

            return (
              <View style={{ position: 'relative' }}>
                <Ionicons name={iconName} size={24} color={color} />
                {route.name === 'Cart' && cartItemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen
          name="CreateNewProduct"
          component={DummyScreen}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <Ionicons name="add" size={25} color={colors.background} />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
          }}
        />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      {/* NEW: FlyingCartAnimation component rendered over the tab navigator */}
      <FlyingCartAnimation />
    </View>
  );
};

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: colors.primaryDark,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabsNavigator;