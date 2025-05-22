import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Share } from 'react-native';
import { colors } from '../theme/Theme';
import SplashScreen from '../screens/SplashScreen';
import TabsNavigator from './TabsNavigator';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// import SelectLocationScreen from '../screens/SelectLocationScreen';
import AddNewProductScreen from '../screens/AddNewProductScreen';
import { API_BASE_URL } from '../api/apiClient';
import { refreshTokenApi } from '../api/auth.api';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const headerStyle = {
    backgroundColor: theme === 'dark' ? colors.darkHeader : colors.lightHeader,
    shadowColor: theme === 'dark' ? colors.darkHeader : colors.lightHeader,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isSplashVisible ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : isAuthenticated ? (
          <>
            <Stack.Screen
              name="TabsNavigator"
              component={TabsNavigator}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={({ route, navigation }) => ({
                headerShown: true,
                headerTitle: '',
                headerLeft: () => (
                  <Ionicons
                    name="chevron-back"
                    size={28}
                    color={theme === 'dark' ? colors.lightHeader : colors.info}
                    style={{ marginLeft: 16, marginTop: 2 }}
                    onPress={() => navigation.goBack()}
                  />
                ),
                headerRight: () => (
                  <Ionicons
                    name="share-outline"
                    size={28}
                    color={theme === 'dark' ? colors.lightHeader : colors.info}
                    style={{ marginRight: 18 }}
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `${route.params.title}\n\n${route.params.description}\n\nPrice: $${route.params.price}`,
                          url: route.params.image,
                          title: route.params.title,
                        });
                      } catch (error) {
                        console.log('Error sharing:', error);
                      }
                    }}
                  />
                ),
                gestureEnabled: true,
                animation: 'fade',
                headerStyle,
              })}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="AddNewProduct"
              component={AddNewProductScreen}
              options={{ animation: 'fade' }}
            />
            {/* <Stack.Screen
              name="SelectLocation"
              component={SelectLocationScreen}
              options={{ animation: 'fade' }}
            /> */}
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ animation: 'fade' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
