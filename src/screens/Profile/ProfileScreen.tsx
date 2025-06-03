import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { useProfile } from './useProfile';
import { MainContainer, LoadingSkeleton, ProfileSection, ProfileImage, ProfileInfo, LogoutButton } from './ProfileComponents';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Custom hook for all profile logic
  const {
    // State
    profile,
    loading,
    isLoggingOut,
    isAuthenticated,
    
    // Handlers
    handleLogout,
    handleGoBack,
    handleEditProfile,
  } = useProfile(navigation);

  // Show loading skeleton while fetching profile
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <MainContainer>
      <ProfileSection>
        <ProfileImage imageUrl={profile.photoUrl} />
        <ProfileInfo profile={profile} />
      </ProfileSection>

      <LogoutButton
        isAuthenticated={isAuthenticated}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />
    </MainContainer>
  );
};

export default ProfileScreen;