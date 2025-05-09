import React from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

const ThemedApp = () => {
  const { theme } = useTheme();
  
  const backgroundColor = theme === 'dark' ? 'black' : 'white';
  const barStyle: StatusBarStyle = theme === 'dark' ? 'light-content' : 'dark-content';

  return (
    <>
      <StatusBar 
        backgroundColor={backgroundColor}
        barStyle={barStyle}
      />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;