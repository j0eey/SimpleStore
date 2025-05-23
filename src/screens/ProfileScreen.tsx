import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, colors } from '../theme/Theme';
import { fetchUserProfile } from '../api/user.api';
import { getErrorMessage } from '../utils/getErrorMessage';
import { UserProfile } from '../navigation/types';

// Constants
const CONSTANTS = {
  AVATAR_SIZE: 100,
} as const;

// Custom Hooks
const useProfileData = () => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    photoUrl: '',
  });
  const [loading, setLoading] = useState(true);

  const getImageUrl = useCallback((imageData: any): string => {
    if (!imageData) return '';
    if (typeof imageData === 'string') return imageData;
    if (imageData.uri) return imageData.uri;
    if (imageData.url) return imageData.url;
    return '';
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchUserProfile();
      const user = response.data.user;

      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        photoUrl: getImageUrl(user.profileImage),
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [getImageUrl]);

  return {
    profile,
    loading,
    loadProfile,
  };
};

// Components
const ProfileImage: React.FC<{
  imageUrl?: string;
  theme: string;
}> = ({ imageUrl, theme }) => (
  <View style={styles.imageContainer}>
    {imageUrl ? (
      <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
    ) : (
      <View style={[
        styles.avatarPlaceholder,
        { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.lightSearch }
      ]}>
        <Ionicons
          name="person"
          size={60}
          color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
        />
      </View>
    )}
  </View>
);

// Main Component
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  
  const { profile, loading, loadProfile } = useProfileData();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleLogout = useCallback(async () => {
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
  }, [logout]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          testID="back-button"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
        ]}>
          Profile
        </Text>

        <TouchableOpacity
          onPress={handleEditProfile}
          style={styles.editButton}
          accessibilityLabel="Edit profile"
          accessibilityRole="button"
          testID="edit-button"
        >
          <Ionicons
            name="create-outline"
            size={24}
            color={theme === 'dark' ? colors.lightHeader : colors.darkHeader}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Content */}
      <View style={[
        styles.profileSection,
        { backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard },
      ]}>
        <ProfileImage
          imageUrl={profile.photoUrl}
          theme={theme}
        />

        <View style={styles.displayInfo}>
          <Text style={[
            styles.userName,
            { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }
          ]}>
            {`${profile.firstName} ${profile.lastName}`.trim() || 'No Name'}
          </Text>

          <Text style={[
            styles.userEmail,
            { color: theme === 'dark' ? colors.darkSearch : colors.lightSearch }
          ]}>
            {profile.email}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      {isAuthenticated && (
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primaryDark }]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          accessibilityLabel={isLoggingOut ? "Logging out" : "Log out"}
          accessibilityRole="button"
          testID="logout-button"
        >
          {isLoggingOut ? (
            <View style={styles.logoutButtonContent}>
              <ActivityIndicator size="small" color={colors.lightHeader} />
              <Text style={styles.logoutButtonText}>Logging Out...</Text>
            </View>
          ) : (
            <Text style={styles.logoutButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    flex: 1,
    textAlign: 'center',
    marginLeft: -29,
  },
  editButton: {
    padding: 5,
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
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarImage: {
    width: CONSTANTS.AVATAR_SIZE,
    height: CONSTANTS.AVATAR_SIZE,
    borderRadius: CONSTANTS.AVATAR_SIZE / 2,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: CONSTANTS.AVATAR_SIZE,
    height: CONSTANTS.AVATAR_SIZE,
    borderRadius: CONSTANTS.AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayInfo: {
    alignItems: 'center',
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
    justifyContent: 'center',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutButtonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
});

export default ProfileScreen;