import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useEditProfile } from './useEditProfile';
import { MainContainer, LoadingSkeleton, ProfileSection, ProfileImage, EditForm, ImagePickerModal } from './EditProfileComponents';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  // Custom hook for all edit profile logic
  const {
    editedProfile,
    loading,
    updating,
    
    // Image picker state
    showImagePicker,
    
    // Handlers
    setEditedProfile,
    handleSave,
    handleCancel,
    openImagePicker,
    closeImagePicker,
    selectFromLibrary,
    selectFromCamera,
    getDisplayImage,
  } = useEditProfile(navigation);

  // Show loading skeleton while fetching profile
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <MainContainer>
      <ProfileSection>
        <ProfileImage
          imageUrl={getDisplayImage()}
          onPress={openImagePicker}
        />

        <EditForm
          editedProfile={editedProfile}
          onProfileChange={setEditedProfile}
          onSave={handleSave}
          onCancel={handleCancel}
          updating={updating}
        />
      </ProfileSection>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={closeImagePicker}
        onSelectFromCamera={selectFromCamera}
        onSelectFromLibrary={selectFromLibrary}
      />
    </MainContainer>
  );
};

export default EditProfileScreen;