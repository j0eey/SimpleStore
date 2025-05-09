import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  signup: () => Promise<void>;
  verify: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load saved auth state on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('@auth');
        if (savedState !== null) {
          setIsAuthenticated(JSON.parse(savedState));
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      }
    };
    loadAuthState();
  }, []);

  // Unified auth state updater
  const setAuthState = async (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    await AsyncStorage.setItem('@auth', JSON.stringify(authenticated));
  };

  const login = async () => {
    await setAuthState(true);
  };

  const signup = async () => {
    await setAuthState(false);
  };

  const verify = async () => {
    await setAuthState(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@auth');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, verify, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};