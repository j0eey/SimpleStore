import { UserProfile } from "../../types/types";

export interface LoadingSkeletonProps {}

export interface ProfileImageProps {
  imageUrl?: string;
}

export interface ProfileInfoProps {
  profile: UserProfile;
}

export interface LogoutButtonProps {
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}

export interface ProfileSectionProps {
  children: React.ReactNode;
}

export interface MainContainerProps {
  children: React.ReactNode;
}