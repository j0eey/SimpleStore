import React, { useEffect } from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { CartProvider } from './src/contexts/CartContext';
import Toast from 'react-native-toast-message';
import toastConfig from './src/components/toastConfig';
import { FlyingCartProvider } from './src/contexts/FlyingCartContext';

const ThemedApp = () => {
  const { theme } = useTheme();

  const backgroundColor = theme === 'dark' ? 'black' : 'white';
  const barStyle: StatusBarStyle = theme === 'dark' ? 'light-content' : 'dark-content';

  useEffect(() => {
    // Hide the native splash screen immediately when React Native is ready
    // Your custom Lottie splash will handle the transition
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 100); // Very short delay to ensure smooth transition

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={barStyle}
      />
      <AppNavigator />
      <Toast config={toastConfig} topOffset={50} />
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FlyingCartProvider>
              <ThemedApp />
            </FlyingCartProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;