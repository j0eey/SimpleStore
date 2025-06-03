import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { loginApi } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getSuccessMessage } from '../../utils/getSuccessMessage';
import { getFailureMessage } from '../../utils/getFailureMessage';
import { LOGIN_CONSTANTS, LOGIN_MESSAGES, HTTP_STATUS } from './constants';

// Form schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(LOGIN_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${LOGIN_CONSTANTS.PASSWORD_MIN_LENGTH} characters`),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const useLogin = (navigation: any) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form setup
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Toast.show({
      type,
      text1: message,
      visibilityTime: type === 'success' 
        ? LOGIN_CONSTANTS.TOAST_SUCCESS_DURATION 
        : LOGIN_CONSTANTS.TOAST_ERROR_DURATION,
    });
  }, []);

  // Password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Handle different error scenarios
  const handleLoginError = useCallback((error: any) => {
    if (error?.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      showToast(LOGIN_MESSAGES.INVALID_CREDENTIALS, 'error');
    } else if (error?.response?.status === HTTP_STATUS.FORBIDDEN) {
      showToast(LOGIN_MESSAGES.EMAIL_VERIFICATION_REQUIRED, 'error');
    } else {
      showToast(getErrorMessage(error), 'error');
    }
  }, [showToast]);

  // Form submission
  const onSubmit = useCallback(async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await loginApi(data.email, data.password);

      if (response?.success && response?.data) {
        const { accessToken, refreshToken } = response.data;
        showToast(getSuccessMessage(response), 'success');
        setTimeout(() => login({ accessToken, refreshToken }), LOGIN_CONSTANTS.LOGIN_DELAY);
      } else {
        showToast(getFailureMessage(response), 'error');
      }
    } catch (error: any) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  }, [showToast, login, handleLoginError]);

  // Navigation handlers
  const handleSignupPress = useCallback(() => {
    navigation.navigate('Signup');
  }, [navigation]);

  const handleForgotPasswordPress = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return {
    // Form state
    control,
    errors,
    loading,
    showPassword,
    
    // Handlers
    onSubmit: handleSubmit(onSubmit),
    togglePasswordVisibility,
    handleSignupPress,
    handleForgotPasswordPress,
  };
};