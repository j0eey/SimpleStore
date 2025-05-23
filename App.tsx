import React from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import Toast from 'react-native-toast-message';
import  toastConfig  from './src/components/toastConfig';

const ThemedApp = () => {
  const { theme } = useTheme();
  
  const backgroundColor = theme === 'dark' ? 'black' : 'white';
  const barStyle: StatusBarStyle = theme === 'dark' ? 'light-content' : 'dark-content';

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
          <ThemedApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
