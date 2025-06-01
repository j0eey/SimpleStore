import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, Tokens } from '../types/AuthContextType';
import { refreshTokenApi } from '../api/auth.api';
import { fetchUserProfile } from '../api/user.api';
import { AuthProviderProps } from '../types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmailState] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const startTime = Date.now();
        
        const [
          savedAuth,
          savedEmail,
          savedAccessToken,
          savedRefreshToken,
          savedVerified,
          savedUserId,
        ] = await Promise.all([
          AsyncStorage.getItem('@auth'),
          AsyncStorage.getItem('@userEmail'),
          AsyncStorage.getItem('@accessToken'),
          AsyncStorage.getItem('@refreshToken'),
          AsyncStorage.getItem('@isVerified'),
          AsyncStorage.getItem('@userId'),
        ]);

        if (savedAuth !== null) {
          setIsAuthenticated(JSON.parse(savedAuth));
        }
        if (savedEmail) {
          setEmailState(savedEmail);
        }
        if (savedAccessToken) {
          setAccessToken(savedAccessToken);
        }
        if (savedRefreshToken) {
          setRefreshToken(savedRefreshToken);
        }
        if (savedVerified) {
          setIsVerified(savedVerified === 'true');
        }
        if (savedUserId) {
          setUserId(savedUserId);
        }

        // If authenticated but no userId, fetch user profile
        if (savedAuth === 'true' && savedAccessToken && !savedUserId) {
          try {
            const userProfile = await fetchUserProfile();
            
            if (userProfile.data?.user?.id) {
              setUserId(userProfile.data.user.id);
              await AsyncStorage.setItem('@userId', userProfile.data.user.id);
            }
          } catch (error) {
          }
        }
      } catch (error) {
      } finally {
        setIsInitialized(true);
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

  const setUserIdAsync = async (id: string) => {
    setUserId(id);
    await AsyncStorage.setItem('@userId', id);
  };

  const login = async (tokens: Tokens) => {
    await setTokens(tokens);
    await setAuthState(true);
    
    // Fetch user profile to get user ID
    try {
      const userProfile = await fetchUserProfile();
      if (userProfile.data?.user?.id) {
        await setUserIdAsync(userProfile.data.user.id);
      }
    } catch (error) {
    }
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
      AsyncStorage.removeItem('@userId'),
    ]);
    setIsAuthenticated(false);
    setEmailState('');
    setAccessToken('');
    setRefreshToken('');
    setIsVerified(false);
    setUserId('');
  };

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const result = await refreshTokenApi(refreshToken);
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.data;
      await setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      return newAccessToken;
    } catch (err) {
      await logout();
      throw new Error('Session expired');
    }
  };

  // Don't render children until auth state is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isVerified,
        email,
        token: accessToken,
        userId,
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