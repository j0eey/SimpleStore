import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as Keychain from 'react-native-keychain';
import { AuthContextType, Tokens } from '../types/AuthContextType';
import { refreshTokenApi } from '../api/auth.api';
import { fetchUserProfile } from '../api/user.api';
import { AuthProviderProps } from '../types/user';

// Keychain service name for your app
const KEYCHAIN_SERVICE = 'com.simplestore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmailState] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to store items in Keychain
  const setKeychainItem = async (key: string, value: string) => {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      console.error('Error storing in Keychain:', error);
      throw error;
    }
  };

  // Helper function to get items from Keychain
  const getKeychainItem = async (key: string): Promise<string | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
      if (credentials && credentials.username === key) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error reading from Keychain:', error);
      return null;
    }
  };

  // Helper function to remove items from Keychain
  const removeKeychainItem = async (key: string) => {
    try {
      // Keychain doesn't support removing individual items directly, 
      // so we'll reset all credentials on logout
    } catch (error) {
      console.error('Error removing from Keychain:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [
          savedAuth,
          savedEmail,
          savedVerified,
          savedUserId,
        ] = await Promise.all([
          getKeychainItem('@auth'),
          getKeychainItem('@userEmail'),
          getKeychainItem('@isVerified'),
          getKeychainItem('@userId'),
        ]);

        // Load tokens separately since they're sensitive
        const savedAccessToken = await getKeychainItem('@accessToken');
        const savedRefreshToken = await getKeychainItem('@refreshToken');

        if (savedAuth !== null) {
          setIsAuthenticated(savedAuth === 'true');
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
              await setKeychainItem('@userId', userProfile.data.user.id);
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
    await setKeychainItem('@auth', authenticated.toString());
  };

  const setEmail = async (newEmail: string) => {
    setEmailState(newEmail);
    await setKeychainItem('@userEmail', newEmail);
  };

  const setTokens = async (tokens: Tokens) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    await Promise.all([
      setKeychainItem('@accessToken', tokens.accessToken),
      setKeychainItem('@refreshToken', tokens.refreshToken),
    ]);
  };

  const setUserIdAsync = async (id: string) => {
    setUserId(id);
    await setKeychainItem('@userId', id);
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
    await setKeychainItem('@isVerified', 'false');
    setIsVerified(false);
  };

  const verify = async () => {
    await setKeychainItem('@isVerified', 'true');
    setIsVerified(true);
    await setAuthState(true);
  };

  const logout = async () => {
    try {
      // Reset all Keychain credentials for our service
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
      
      // Reset state
      setIsAuthenticated(false);
      setEmailState('');
      setAccessToken('');
      setRefreshToken('');
      setIsVerified(false);
      setUserId('');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
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