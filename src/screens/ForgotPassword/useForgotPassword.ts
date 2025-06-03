import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { forgotPasswordApi } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getSuccessMessage } from '../../utils/getSuccessMessage';
import { getFailureMessage } from '../../utils/getFailureMessage';
import { FORGOT_PASSWORD_CONSTANTS } from './constants';

// Form schema
const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export const useForgotPassword = (navigation: any) => {
  const [loading, setLoading] = useState(false);

  // Form setup
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Toast.show({
      type,
      text1: message,
      visibilityTime: type === 'success' 
        ? FORGOT_PASSWORD_CONSTANTS.TOAST_SUCCESS_DURATION 
        : FORGOT_PASSWORD_CONSTANTS.TOAST_ERROR_DURATION,
    });
  }, []);

  // Form submission
  const onSubmit = useCallback(async ({ email }: FormData) => {
    setLoading(true);
    try {
      const response = await forgotPasswordApi(email);
      if (response?.success) {
        showToast(getSuccessMessage(response), 'success');
        // Optionally navigate or inform user to check email
      } else {
        showToast(getFailureMessage(response), 'error');
      }
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Navigation handlers
  const handleLoginPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return {
    // Form state
    control,
    errors,
    loading,
    
    // Handlers
    onSubmit: handleSubmit(onSubmit),
    handleLoginPress,
  };
};