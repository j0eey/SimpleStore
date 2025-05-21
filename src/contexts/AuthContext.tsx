import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, Tokens } from './AuthContextType';
import { refreshTokenApi } from '../api/auth.api';
import api from '../api/apiClient';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmailState] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [
          savedAuth,
          savedEmail,
          savedAccessToken,
          savedRefreshToken,
          savedVerified,
        ] = await Promise.all([
          AsyncStorage.getItem('@auth'),
          AsyncStorage.getItem('@userEmail'),
          AsyncStorage.getItem('@accessToken'),
          AsyncStorage.getItem('@refreshToken'),
          AsyncStorage.getItem('@isVerified'),
        ]);

        if (savedAuth !== null) setIsAuthenticated(JSON.parse(savedAuth));
        if (savedEmail) setEmailState(savedEmail);
        if (savedAccessToken) setAccessToken(savedAccessToken);
        if (savedRefreshToken) setRefreshToken(savedRefreshToken);
        if (savedVerified) setIsVerified(savedVerified === 'true');
      } catch (error) {
        console.error('Failed to load auth state', error);
      }
    };

    loadAuthState();
  }, []);

  const setAuthState = async (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    await AsyncStorage.setItem('@auth', JSON.stringify(authenticated));
  };

  const setEmail = async (newEmail: string) => {
    setEmailState(newEmail);
    await AsyncStorage.setItem('@userEmail', newEmail);
  };

  const setTokens = async (tokens: Tokens) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    await AsyncStorage.setItem('@accessToken', tokens.accessToken);
    await AsyncStorage.setItem('@refreshToken', tokens.refreshToken);
  };

  const login = async (tokens: Tokens) => {
    await setTokens(tokens);
    await setAuthState(true);
  };

  const signup = async (newEmail: string) => {
    await setEmail(newEmail);
    await AsyncStorage.setItem('@isVerified', 'false');
    setIsVerified(false);
  };

  const verify = async () => {
    await AsyncStorage.setItem('@isVerified', 'true');
    setIsVerified(true);
    await setAuthState(true);
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('@auth'),
      AsyncStorage.removeItem('@userEmail'),
      AsyncStorage.removeItem('@accessToken'),
      AsyncStorage.removeItem('@refreshToken'),
      AsyncStorage.removeItem('@isVerified'),
    ]);
    setIsAuthenticated(false);
    setEmailState('');
    setAccessToken('');
    setRefreshToken('');
    setIsVerified(false);
  };

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const result = await refreshTokenApi(refreshToken);
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.data;
      await setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      return newAccessToken;
    } catch (err) {
      console.error('Token refresh failed', err);
      await logout();
      throw new Error('Session expired');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isVerified,
        email,
        token: accessToken,
        login,
        signup,
        verify,
        logout,
        setEmail,
        refreshAccessToken,
      }}
    >
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
