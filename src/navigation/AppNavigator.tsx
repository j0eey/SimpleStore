import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, Share } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer, NavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import LoginScreen from '../screens/Login/LoginScreen';
import SignupScreen from '../screens/Signup/SignupScreen';
import VerificationScreen from '../screens/Verification/VerificationScreen';
import ProductDetailsScreen from '../screens/ProductDetails/ProductDetailsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LottieSplashScreen from '../screens/LottieSplashScreen';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Theme';
import TabsNavigator from './TabsNavigator';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPasswordScreen';
import MapsScreen from '../screens/Maps/MapsScreen';
import AddNewProductScreen from '../screens/AddNewProduct/AddNewProductScreen';
import EditProfileScreen from '../screens/EditProfile/EditProfileScreen';
import EditProductScreen from '../screens/EditProduct/EditProductScreen';
import CartScreen from '../screens/Cart/CartScreen';
import DeepLinkingService from '../services/UniversalLinkingService';
import HomeScreen from '../screens/Home/HomeScreen';
import { OneSignal } from 'react-native-onesignal';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [showLottieSplash, setShowLottieSplash] = useState(true);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  
  // Store notification data when app is killed and navigation isn't ready
  const pendingNotificationRef = useRef<any>(null);

  const headerStyle = {
    backgroundColor: theme === 'dark' ? colors.darkHeader : colors.lightHeader,
    shadowColor: theme === 'dark' ? colors.darkHeader : colors.lightHeader,
  };

  const handleAnimationFinish = () => {
    setShowLottieSplash(false);
  };

  // Update authentication state for deep linking
  useEffect(() => {
    DeepLinkingService.updateAuthenticationState(isAuthenticated);
  }, [isAuthenticated]);

  // Initialize deep linking after splash screen
  useEffect(() => {
    let urlListener: any;
    
    const initDeepLinking = async () => {
      if (navigationRef.current && !showLottieSplash) {
        DeepLinkingService.setNavigationRef(navigationRef.current);
        urlListener = await DeepLinkingService.initialize(isAuthenticated);
      }
    };

    if (!showLottieSplash && navigationRef.current?.isReady()) {
      initDeepLinking();
    }

    return () => {
      if (urlListener) {
        urlListener.remove();
      }
    };
  }, [isAuthenticated, showLottieSplash]);

  // Set up OneSignal notification click handler
  useEffect(() => {
    // Only set up after splash screen and when authenticated
    if (!showLottieSplash && isAuthenticated && navigationRef.current?.isReady()) {
      // Handle notification click events
      const handleNotificationClick = (event: any) => {
        const notificationData = event.notification.additionalData as any;
        
        // Check if this is a product notification
        if (notificationData?.type === 'product_added' && notificationData?.productId) {
          const navigationParams = {
            id: notificationData.productId as string,
            title: (notificationData.productTitle as string) || 'Product Details',
            description: '', // Not available in notification data
            image: '', // Not available in notification data  
            price: parseFloat(notificationData.price as string) || 0,
          };
          
          // Navigate to ProductDetails screen
          if (navigationRef.current?.isReady()) {
            navigationRef.current.navigate('ProductDetails', navigationParams);
          } else {
            // Store the notification data to handle after app loads
            pendingNotificationRef.current = navigationParams;
          }
        }
      };
      
      OneSignal.Notifications.addEventListener('click', handleNotificationClick);
      
      // Clean up listener
      return () => {
        const cleanupHandler = (event: any) => {};
        OneSignal.Notifications.removeEventListener('click', cleanupHandler);
      };
    }
  }, [showLottieSplash, isAuthenticated]);

  // Handle pending notification when navigation becomes ready (for killed app scenario)
  useEffect(() => {
    if (navigationRef.current?.isReady() && pendingNotificationRef.current && !showLottieSplash && isAuthenticated) {
      const params = pendingNotificationRef.current;
      
      // Delay to ensure app is fully loaded
      setTimeout(() => {
        if (navigationRef.current?.isReady()) {
          navigationRef.current.navigate('ProductDetails', params);
          pendingNotificationRef.current = null; // Clear the pending notification
        }
      }, 1000);
    }
  }, [showLottieSplash, isAuthenticated, navigationRef.current?.isReady()]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // Initialize deep linking when navigation is ready
        if (navigationRef.current && !showLottieSplash) {
          DeepLinkingService.setNavigationRef(navigationRef.current);
          DeepLinkingService.initialize(isAuthenticated);
        }
      }}
      linking={!showLottieSplash ? DeepLinkingService.getLinkingConfig() : undefined}
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
                      } catch (error) {
                        // Handle Share error silently
                      }
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
            <Stack.Screen name="MapsScreen" component={MapsScreen} 
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                gestureEnabled: true,
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={({ navigation }) => ({
                headerShown: true,
                headerTitle: '',
                headerLeft: () => (
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
                    style={{ position: 'absolute', left: 16, top: 20, zIndex: 1 }}
                    onPress={() => navigation.goBack()}
                  />
                ),
                headerStyle,
              })}
            />
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

export default AppNavigator;