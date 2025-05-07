import React from 'react';
import Navigation from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
};

export default App;