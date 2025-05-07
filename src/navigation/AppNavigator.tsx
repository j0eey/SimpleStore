import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VerificationScreen from '../screens/VerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import { useAuth } from '../contexts/AuthContext';
import { Text, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';



const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={({ route, navigation }) => ({
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerBackground: () => null,
                headerLeft: () => (
                  <Ionicons
                    name="chevron-back"
                    size={28}
                    color="#007AFF"
                    style={{ marginLeft: 16, marginTop: 2 }}
                    onPress={() => navigation.goBack()}
                  />
                ),
                headerRight: () => (
                  <Ionicons
                    name="share-outline"
                    size={28}
                    color="#007AFF"
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
              })}
            />


          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{
                animation: 'fade',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
