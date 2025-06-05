import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import Toast from 'react-native-toast-message';
import { AuthContextType, Tokens } from '../types/AuthContextType';
import { refreshTokenApi } from '../api/auth.api';
import { fetchUserProfile } from '../api/user.api';
import { AuthProviderProps } from '../types/user';
import { getErrorMessage } from '../utils/getErrorMessage';

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
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to store access token: ${errorMessage}`,
      });
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
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to retrieve access token: ${errorMessage}`,
      });
      return null;
    }
  };

  const storeRefreshToken = async (token: string) => {
    try {
      await Keychain.setGenericPassword('refresh_token', token, {
        service: REFRESH_TOKEN_SERVICE,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to store refresh token: ${errorMessage}`,
      });
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
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to retrieve refresh token: ${errorMessage}`,
      });
      return null;
    }
  };

  const clearTokens = async () => {
    try {
      await Promise.all([
        Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE }),
        Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE })
      ]);
      setCurrentToken('');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to clear tokens: ${errorMessage}`,
      });
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
        await storeAccessToken(oldAccessToken);
        await AsyncStorage.removeItem('@accessToken');
      }

      if (oldRefreshToken) {
        await storeRefreshToken(oldRefreshToken);
        await AsyncStorage.removeItem('@refreshToken');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Migration Error',
        text2: `Failed to migrate tokens: ${errorMessage}`,
      });
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
            const errorMessage = getErrorMessage(error);
            Toast.show({
              type: 'error',
              text1: 'Network Error',
              text2: `Failed to load user profile: ${errorMessage}`,
            });
          }
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        Toast.show({
          type: 'error',
          text1: 'Initialization Error',
          text2: `Failed to load authentication state: ${errorMessage}`,
        });
      } finally {
        setIsInitialized(true);
      }
    };

    loadAuthState();
  }, []);

  const setAuthState = async (authenticated: boolean) => {
    try {
      setIsAuthenticated(authenticated);
      await AsyncStorage.setItem('@auth', JSON.stringify(authenticated));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to save authentication state: ${errorMessage}`,
      });
    }
  };

  const setEmail = async (newEmail: string) => {
    try {
      setEmailState(newEmail);
      await AsyncStorage.setItem('@userEmail', newEmail);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to save email: ${errorMessage}`,
      });
    }
  };

  const setTokens = async (tokens: Tokens) => {
    try {
      await Promise.all([
        storeAccessToken(tokens.accessToken),
        storeRefreshToken(tokens.refreshToken)
      ]);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: `Failed to save authentication tokens: ${errorMessage}`,
      });
      throw error;
    }
  };

  const setUserIdAsync = async (id: string) => {
    try {
      setUserId(id);
      await AsyncStorage.setItem('@userId', id);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: `Failed to save user ID: ${errorMessage}`,
      });
    }
  };

  const login = async (tokens: Tokens) => {
    try {
      await setTokens(tokens);
      await setAuthState(true);
      
      // Fetch user profile to get user ID
      try {
        const userProfile = await fetchUserProfile();
        if (userProfile.data?.user?.id) {
          await setUserIdAsync(userProfile.data.user.id);
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        Toast.show({
          type: 'error',
          text1: 'Profile Error',
          text2: `Failed to load user profile: ${errorMessage}`,
        });
        // Don't throw here - login was successful, just profile fetch failed
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: `Login failed: ${errorMessage}`,
      });
      throw error;
    }
  };

  const signup = async (newEmail: string) => {
    try {
      await setEmail(newEmail);
      await AsyncStorage.setItem('@isVerified', 'false');
      setIsVerified(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Signup Error',
        text2: `Signup failed: ${errorMessage}`,
      });
      throw error;
    }
  };

  const verify = async () => {
    try {
      await AsyncStorage.setItem('@isVerified', 'true');
      setIsVerified(true);
      await setAuthState(true);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Verification Error',
        text2: `Verification failed: ${errorMessage}`,
      });
      throw error;
    }
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
      const errorMessage = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: 'Logout Error',
        text2: `Logout failed: ${errorMessage}`,
      });
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
      const errorMessage = getErrorMessage(err);
      
      // Show different messages based on error type
      if (errorMessage.includes('No refresh token')) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Please log in again',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Session Error',
          text2: `Failed to refresh session: ${errorMessage}`,
        });
      }
      
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