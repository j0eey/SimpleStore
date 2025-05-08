import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <AuthProvider>
      <StatusBar backgroundColor="black"/>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
