import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer, NavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LottieSplashScreen from '../screens/LottieSplashScreen';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Theme';
import TabsNavigator from './TabsNavigator';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MapsScreen from '../screens/MapsScreen';
import AddNewProductScreen from '../screens/AddNewProductScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditProductScreen from '../screens/EditProductScreen';
import CartScreen from '../screens/CartScreen';
import DeepLinkingService from '../services/DeepLinkingService';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [showLottieSplash, setShowLottieSplash] = useState(true);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  
  const headerStyle = {
    backgroundColor: theme === 'dark' ? colors.darkHeader : colors.lightHeader,
    shadowColor: theme === 'dark' ? colors.darkHeader : colors.lightHeader,
  };

  const handleAnimationFinish = () => {
    setShowLottieSplash(false);
  };

  useEffect(() => {
    DeepLinkingService.updateAuthenticationState(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    let urlListener: any;
    const initDeepLinking = async () => {
      if (navigationRef.current) {
        DeepLinkingService.setNavigationRef(navigationRef.current);
        urlListener = await DeepLinkingService.initialize(isAuthenticated);
      }
    };
    if (navigationRef.current?.isReady()) {
      initDeepLinking();
    }
    return () => {
      if (urlListener) {
        urlListener.remove();
      }
    };
  }, [isAuthenticated]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (navigationRef.current) {
          DeepLinkingService.setNavigationRef(navigationRef.current);
          DeepLinkingService.initialize(isAuthenticated);
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {showLottieSplash ? (
          <Stack.Screen
            name="LottieSplash"
            options={{ cardStyleInterpolator: CardStyleInterpolators.forNoAnimation }}
          >
            {() => <LottieSplashScreen onAnimationFinish={handleAnimationFinish} />}
          </Stack.Screen>
        ) : isAuthenticated ? (
          <>
            <Stack.Screen
              name="TabsNavigator"
              component={TabsNavigator}
              options={{ cardStyleInterpolator: CardStyleInterpolators.forNoAnimation }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ cardStyleInterpolator: CardStyleInterpolators.forNoAnimation }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={({ route, navigation }) => ({
                headerShown: true,
                headerTitle: '',
                headerLeft: () => (
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
                    style={{ position: 'absolute', left: 16, top: 20, zIndex: 1 }}
                    onPress={() => {
                      if (navigation.canGoBack()) {
                        navigation.goBack();
                      } else {
                        navigation.dispatch(StackActions.replace('Home'));
                      }
                    }}
                  />
                ),
                headerRight: () => (
                  <Ionicons
                    name="share-outline"
                    size={24}
                    color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
                    style={{ position: 'absolute', right: 16, top: 20, zIndex: 1 }}
                    onPress={async () => {
                      try {
                        const shareContent = DeepLinkingService.generateShareContent({
                          id: route.params.id,
                          title: route.params.title,
                          price: `${route.params.price}`,
                          image: route.params.image,
                        });
                        await Share.share({
                          title: shareContent.title,
                          message: shareContent.message,
                          url: shareContent.url,
                        });
                      } catch (error) {/* Handle Share error */}
                    }}
                  />
                ),
                headerStyle,
              })}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={({ navigation }) => ({
                headerShown: true,
                headerTitle: () => (
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
                  }}>
                    Profile
                  </Text>
                ),
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ paddingHorizontal: 16 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="back-button"
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
                    />
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditProfile')}
                    style={{ paddingHorizontal: 16 }}
                    accessibilityLabel="Edit profile"
                    accessibilityRole="button"
                    testID="edit-button"
                  >
                    <Ionicons
                      name="create-outline"
                      size={24}
                      color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
                    />
                  </TouchableOpacity>
                ),
                headerStyle: {
                  backgroundColor: theme === 'dark' ? colors.darkHeader : colors.lightHeader,
                  shadowColor: 'transparent',
                },
              })}
            />
            <Stack.Screen
              name="AddNewProduct"
              component={AddNewProductScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="MapsScreen" component={MapsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="EditProduct" component={EditProductScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  headerContainer: {
    zIndex: 10,
    elevation: 10,
  },
});

export default AppNavigator;