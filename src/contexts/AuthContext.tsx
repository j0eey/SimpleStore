import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { AuthContextType, Tokens } from '../types/AuthContextType';
import { refreshTokenApi } from '../api/auth.api';
import { fetchUserProfile } from '../api/user.api';
import { AuthProviderProps } from '../types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ACCESS_TOKEN_SERVICE = 'ecommerce_access_token';
const REFRESH_TOKEN_SERVICE = 'ecommerce_refresh_token';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmailState] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Secure token storage functions
  const storeAccessToken = async (token: string) => {
    try {
      await Keychain.setGenericPassword('access_token', token, {
        service: ACCESS_TOKEN_SERVICE,
      });
      setCurrentToken(token);
    } catch (error) {
      console.error('Error storing access token:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: ACCESS_TOKEN_SERVICE,
      });
      if (credentials && typeof credentials === 'object' && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  };

  const storeRefreshToken = async (token: string) => {
    try {
      await Keychain.setGenericPassword('refresh_token', token, {
        service: REFRESH_TOKEN_SERVICE,
      });
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  };

  const getRefreshToken = async (): Promise<string | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: REFRESH_TOKEN_SERVICE,
      });
      if (credentials && typeof credentials === 'object' && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  };

  const clearTokens = async () => {
    try {
      await Promise.all([
        Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE }),
        Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE })
      ]);
      setCurrentToken(''); // Clear the current token state
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  // Migration function to move tokens from AsyncStorage to Keychain
  const migrateTokensFromAsyncStorage = async () => {
    try {
      const [oldAccessToken, oldRefreshToken] = await Promise.all([
        AsyncStorage.getItem('@accessToken'),
        AsyncStorage.getItem('@refreshToken')
      ]);

      if (oldAccessToken) {
        console.log('Migrating access token to Keychain...');
        await storeAccessToken(oldAccessToken);
        await AsyncStorage.removeItem('@accessToken');
      }

      if (oldRefreshToken) {
        console.log('Migrating refresh token to Keychain...');
        await storeRefreshToken(oldRefreshToken);
        await AsyncStorage.removeItem('@refreshToken');
      }

      if (oldAccessToken || oldRefreshToken) {
        console.log('Token migration completed successfully');
      }
    } catch (error) {
      console.error('Error during token migration:', error);
    }
  };

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // First, migrate tokens from AsyncStorage if they exist
        await migrateTokensFromAsyncStorage();

        // Load non-sensitive data from AsyncStorage
        const [
          savedAuth,
          savedEmail,
          savedVerified,
          savedUserId,
        ] = await Promise.all([
          AsyncStorage.getItem('@auth'),
          AsyncStorage.getItem('@userEmail'),
          AsyncStorage.getItem('@isVerified'),
          AsyncStorage.getItem('@userId'),
        ]);

        // Load access token from Keychain for current state
        const savedAccessToken = await getAccessToken();

        if (savedAuth !== null) {
          setIsAuthenticated(JSON.parse(savedAuth));
        }
        if (savedEmail) {
          setEmailState(savedEmail);
        }
        if (savedAccessToken) {
          setCurrentToken(savedAccessToken);
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
            console.error('Error fetching user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
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
    try {
      await Promise.all([
        storeAccessToken(tokens.accessToken),
        storeRefreshToken(tokens.refreshToken)
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
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
      console.error('Error fetching user profile during login:', error);
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
    try {
      // Clear non-sensitive data from AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem('@auth'),
        AsyncStorage.removeItem('@userEmail'),
        AsyncStorage.removeItem('@isVerified'),
        AsyncStorage.removeItem('@userId'),
      ]);
      
      // Clear sensitive tokens from Keychain
      await clearTokens();
      
      // Reset state
      setIsAuthenticated(false);
      setEmailState('');
      setIsVerified(false);
      setUserId('');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const currentRefreshToken = await getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const result = await refreshTokenApi(currentRefreshToken);
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.data;
      
      await setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      return newAccessToken;
    } catch (err) {
      console.error('Error refreshing token:', err);
      await logout();
      throw new Error('Session expired');
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isVerified,
        email,
        token: currentToken,
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