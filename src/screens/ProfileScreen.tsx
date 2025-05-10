import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, colors } from '../theme/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Simulate a 2-second logout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }]}>
      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.avatarContainerBackground, borderRadius: 50 }]}>
          <Ionicons 
            name="person" 
            size={35} 
            color={theme === 'dark' ? colors.lightHeader : colors.darkHeader} 
          />
        </View>
        <Text style={[styles.userName, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
          {isAuthenticated ? 'Welcome User' : 'Guest User'}
        </Text>
        <Text style={[styles.userEmail, { color: theme === 'dark' ? colors.darkSearch : colors.lightSearch }]}>
          {isAuthenticated ? 'eurisko@gmail.com' : 'eurisko@gmail.com'}
        </Text>
      </View>

      {/* Logout Button - Only shown when authenticated */}
      {isAuthenticated && (
        <TouchableOpacity
          style={[
            styles.logoutButton, 
            { 
              backgroundColor: theme === 'dark' ? colors.priceDark : colors.info,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
            }
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <ActivityIndicator 
                size="small" 
                color={colors.lightHeader} 
              />
              <Text style={styles.logoutButtonText}>Logging Out...</Text>
            </>
          ) : (
            <Text style={styles.logoutButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.imageBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 22,
    fontFamily: fonts.Bold,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
});

export default ProfileScreen;