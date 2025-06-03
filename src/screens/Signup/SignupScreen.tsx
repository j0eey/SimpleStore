import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/types';
import { useSignup } from './useSignup';
import {
  MainContainer,
  SignupTitle,
  SignupForm,
} from './SignupComponents';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const {
    form,
    loading,
    signupSuccess,
    showPassword,
    theme,
    handleTogglePassword,
    onSubmit,
    handleNavigateToLogin,
  } = useSignup(navigation);

  return (
    <MainContainer theme={theme}>
      <SignupTitle theme={theme} />
      
      <SignupForm
        control={form.control}
        errors={form.formState.errors}
        loading={loading}
        signupSuccess={signupSuccess}
        showPassword={showPassword}
        onTogglePassword={handleTogglePassword}
        onSubmit={form.handleSubmit(onSubmit)}
        onNavigateToLogin={handleNavigateToLogin}
        theme={theme}
      />
    </MainContainer>
  );
};

export default SignupScreen;