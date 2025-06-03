import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { signupApi } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getSuccessMessage } from '../../utils/getSuccessMessage';
import { getFailureMessage } from '../../utils/getFailureMessage';
import { signupSchema,  SignupFormData,  FORM_DEFAULTS,  FORM_CONFIG } from './constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

// Hook for form state management
export const useSignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: FORM_DEFAULTS,
    mode: FORM_CONFIG.validationMode,
  });

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSignupSuccess(false);
      return () => {};
    }, [])
  );

  return {
    form,
    loading,
    setLoading,
    signupSuccess,
    setSignupSuccess,
    showPassword,
    handleTogglePassword,
    userEmail,
    setUserEmail,
  };
};

// Main signup hook with navigation and auth integration
export const useSignup = (navigation: NavigationProp) => {
  const { signup, setEmail } = useAuth();
  const { theme } = useTheme();
  
  const {
    form,
    loading,
    setLoading,
    signupSuccess,
    setSignupSuccess,
    showPassword,
    handleTogglePassword,
    userEmail,
    setUserEmail,
  } = useSignupForm();

  // Handle successful signup flow
  useEffect(() => {
    if (signupSuccess) {
      const delayAndNavigate = async () => {
        await setEmail(userEmail);
        await signup(userEmail);

        setTimeout(() => {
          setSignupSuccess(false);
          navigation.navigate('Verification', { email: userEmail });
          form.reset();
        }, FORM_CONFIG.successDelayMs);
      };

      delayAndNavigate();
    }
  }, [signupSuccess, navigation, signup, setEmail, userEmail, form]);

  const onSubmit = useCallback(async (data: SignupFormData) => {
    setLoading(true);
    try {
      const response = await signupApi(
        data.firstName,
        data.lastName,
        data.email,
        data.password
      );

      if (response.success) {
        setUserEmail(data.email);
        Toast.show({
          type: 'success',
          text1: getSuccessMessage(response),
        });
        setSignupSuccess(true);
      } else {
        Toast.show({
          type: 'error',
          text1: getFailureMessage(response),
        });
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error as AxiosError);
      Toast.show({
        type: 'error',
        text1: message,
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUserEmail, setSignupSuccess]);

  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return {
    form,
    loading,
    signupSuccess,
    showPassword,
    theme,
    handleTogglePassword,
    onSubmit,
    handleNavigateToLogin,
  };
};