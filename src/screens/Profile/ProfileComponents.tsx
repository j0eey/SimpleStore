import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, colors } from '../../theme/Theme';
import { CONSTANTS } from '../../types/types';
import { PROFILE_CONSTANTS, PROFILE_MESSAGES } from './constants';
import { LoadingSkeletonProps, ProfileImageProps, ProfileInfoProps, LogoutButtonProps, ProfileSectionProps, MainContainerProps  } from './types';


// Loading Skeleton Component
export const LoadingSkeleton = memo<LoadingSkeletonProps>(() => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const skeletonConfig = useMemo(() => ({
    borderRadius: 4,
    backgroundColor: isDark ? colors.darkPlaceholder : colors.lightPlaceholder,
    highlightColor: isDark ? colors.darkHighlight : colors.lightHighlight,
  }), [isDark]);

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  const profileSectionStyle = useMemo(() => ({
    alignItems: 'center' as const,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    backgroundColor: isDark ? colors.darkCard : colors.lightCard,
  }), [isDark]);

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      <SkeletonPlaceholder {...skeletonConfig}>
        {/* Profile Section Skeleton */}
        <SkeletonPlaceholder.Item {...profileSectionStyle}>
          {/* Avatar Skeleton */}
          <SkeletonPlaceholder.Item
            width={CONSTANTS.AVATAR_SIZE}
            height={CONSTANTS.AVATAR_SIZE}
            borderRadius={CONSTANTS.AVATAR_SIZE / 2}
            marginBottom={20}
          />

          {/* Name Skeleton */}
          <SkeletonPlaceholder.Item
            width={200}
            height={22}
            marginBottom={5}
          />

          {/* Email Skeleton */}
          <SkeletonPlaceholder.Item
            width={250}
            height={16}
          />
        </SkeletonPlaceholder.Item>

        {/* Logout Button Skeleton */}
        <SkeletonPlaceholder.Item
          width="100%"
          height={52}
          borderRadius={12}
        />
      </SkeletonPlaceholder>
    </ScrollView>
  );
});

// Profile Image Component
export const ProfileImage = memo<ProfileImageProps>(({ imageUrl }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const placeholderStyle = useMemo(() => [
    styles.avatarPlaceholder,
    { backgroundColor: isDark ? colors.darkHeader : colors.lightSearch }
  ], [isDark]);

  const iconColor = isDark ? colors.lightHeader : colors.darkHeader;

  return (
    <View style={styles.imageContainer}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={placeholderStyle}>
          <Ionicons
            name="person"
            size={60}
            color={iconColor}
          />
        </View>
      )}
    </View>
  );
});

// Profile Info Component
export const ProfileInfo = memo<ProfileInfoProps>(({ profile }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const nameStyle = useMemo(() => [
    styles.userName,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  const emailStyle = useMemo(() => [
    styles.userEmail,
    { color: isDark ? colors.darkSearch : colors.lightSearch }
  ], [isDark]);

  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || PROFILE_MESSAGES.NO_NAME_FALLBACK;

  return (
    <View style={styles.displayInfo}>
      <Text style={nameStyle}>
        {displayName}
      </Text>
      <Text style={emailStyle}>
        {profile.email}
      </Text>
    </View>
  );
});

// Logout Button Component
export const LogoutButton = memo<LogoutButtonProps>(({
  isAuthenticated,
  isLoggingOut,
  onLogout,
}) => {
  const buttonStyle = useMemo(() => [
    styles.logoutButton,
    { backgroundColor: colors.primaryDark }
  ], []);

  const accessibilityLabel = isLoggingOut 
    ? PROFILE_MESSAGES.LOGOUT_ACCESSIBILITY_ACTIVE 
    : PROFILE_MESSAGES.LOGOUT_ACCESSIBILITY_IDLE;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onLogout}
      disabled={isLoggingOut}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID="logout-button"
    >
      {isLoggingOut ? (
        <View style={styles.logoutButtonContent}>
          <ActivityIndicator size="small" color={colors.lightHeader} />
          <Text style={styles.logoutButtonText}>
            {PROFILE_MESSAGES.LOGGING_OUT}
          </Text>
        </View>
      ) : (
        <Text style={styles.logoutButtonText}>
          {PROFILE_MESSAGES.LOGOUT_BUTTON}
        </Text>
      )}
    </TouchableOpacity>
  );
});

// Profile Section Container
export const ProfileSection = memo<ProfileSectionProps>(({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sectionStyle = useMemo(() => [
    styles.profileSection,
    { backgroundColor: isDark ? colors.darkCard : colors.lightCard }
  ], [isDark]);

  return <View style={sectionStyle}>{children}</View>;
});

// Main Container Component
export const MainContainer = memo<MainContainerProps>(({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PROFILE_CONSTANTS.CONTAINER_PADDING,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderRadius: PROFILE_CONSTANTS.BUTTON_BORDER_RADIUS,
    marginBottom: PROFILE_CONSTANTS.PROFILE_SECTION_MARGIN,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: PROFILE_CONSTANTS.IMAGE_MARGIN_BOTTOM,
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
    marginBottom: PROFILE_CONSTANTS.NAME_MARGIN_BOTTOM,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  logoutButton: {
    padding: PROFILE_CONSTANTS.BUTTON_PADDING,
    borderRadius: PROFILE_CONSTANTS.BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PROFILE_CONSTANTS.LOADING_GAP,
  },
  logoutButtonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
});