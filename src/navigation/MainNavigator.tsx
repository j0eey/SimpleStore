import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login/LoginScreen';
import TabsNavigator from './TabsNavigator';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  const isLoggedIn = true;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="MainTabs" component={TabsNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator;
