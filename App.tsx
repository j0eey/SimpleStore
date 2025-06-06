import React, { useEffect } from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BootSplash from "react-native-bootsplash";
import Config from 'react-native-config';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { CartProvider } from './src/contexts/CartContext';
import Toast from 'react-native-toast-message';
import toastConfig from './src/components/toastConfig';
import { FlyingCartProvider } from './src/contexts/FlyingCartContext';
import { OneSignal } from 'react-native-onesignal';

const ThemedApp = () => {
  const { theme } = useTheme();

  const backgroundColor = theme === 'dark' ? 'black' : 'white';
  const barStyle: StatusBarStyle = theme === 'dark' ? 'light-content' : 'dark-content';

  useEffect(() => {
    const hideSplash = async () => {
      await BootSplash.hide({ fade: true });
    };
    
    hideSplash();
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
  useEffect(() => {
    const oneSignalAppId = Config.ONESIGNAL_APP_ID;
    
    if (oneSignalAppId) {
      OneSignal.initialize(oneSignalAppId);
      OneSignal.Notifications.requestPermission(true);
    } else {
      console.error('OneSignal App ID not found in environment variables');
    }
  }, []);

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