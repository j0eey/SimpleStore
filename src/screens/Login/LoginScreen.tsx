import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { useLogin } from './useLogin';
import { MainContainer, FormHeader, EmailInput, PasswordInput, LoginButton, AuthLinks } from './LoginComponents';
import { LOGIN_MESSAGES } from './constants';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // Custom hook for all login logic
  const {
    control,
    errors,
    loading,
    showPassword,
    
    // Handlers
    onSubmit,
    togglePasswordVisibility,
    handleSignupPress,
    handleForgotPasswordPress,
  } = useLogin(navigation);

  return (
    <MainContainer>
      <FormHeader title={LOGIN_MESSAGES.TITLE} />
      
      <EmailInput 
        control={control} 
        errors={errors} 
      />
      
      <PasswordInput
        control={control}
        errors={errors}
        showPassword={showPassword}
        onTogglePassword={togglePasswordVisibility}
      />
      
      <LoginButton 
        onPress={onSubmit} 
        loading={loading} 
      />
      
      <AuthLinks
        onSignupPress={handleSignupPress}
        onForgotPasswordPress={handleForgotPasswordPress}
      />
    </MainContainer>
  );
};

export default LoginScreen;