import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, colors } from '../theme/Theme';
import { fetchUserProfile } from '../api/user.api';
import { getErrorMessage } from '../utils/getErrorMessage';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<{ name: string; email: string; photoUrl?: string }>({
    name: '',
    email: '',
    photoUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetchUserProfile();
        const user = response.data.user;

        setProfile({
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          photoUrl: user.profileImage || '',
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: getErrorMessage(error),
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background },
      ]}
    >
      {/* Back button same as ViewAllScreen.tsx */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButtonContainer}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
        />
        <Text style={[styles.backButtonText, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
          Profile
        </Text>
      </TouchableOpacity>

      {/* Profile content */}
      <View
        style={[
          styles.profileSection,
          { backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard },
        ]}
      >
        {profile.photoUrl ? (
          <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} />
        ) : (
          <Ionicons
            name="person"
            size={100}
            color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
          />
        )}

        <Text
          style={[styles.userName, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}
        >
          {profile.name || 'No Name'}
        </Text>

        <Text
          style={[styles.userEmail, { color: theme === 'dark' ? colors.darkSearch : colors.lightSearch }]}
        >
          {profile.email}
        </Text>
      </View>

      {isAuthenticated && (
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme === 'dark' ? colors.primaryDark : colors.primaryDark,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
            },
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <ActivityIndicator size="small" color={colors.lightHeader} />
              <Text style={styles.logoutButtonText}>Logging Out...</Text>
            </>
          ) : (
            <Text style={styles.logoutButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    marginBottom: 15,
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
