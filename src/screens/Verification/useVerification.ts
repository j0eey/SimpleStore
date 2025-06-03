import { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { verifyOtpApi, resendVerificationOtpApi } from '../../api/auth.api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getSuccessMessage } from '../../utils/getSuccessMessage';
import { getFailureMessage } from '../../utils/getFailureMessage';
import { verificationSchema, VerificationFormData, TIMING, TOAST_CONFIG, MESSAGES, STORAGE_KEYS, NAVIGATION_CONFIG } from './constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Verification'>;

// Hook for form state management
export const useVerificationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return {
    form,
    isSubmitting,
    setIsSubmitting,
    cooldown,
    setCooldown,
  };
};

// Toast notification helper
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  Toast.show({
    type,
    text1: message,
    ...TOAST_CONFIG,
  });
};

// Main verification hook with navigation and auth integration
export const useVerification = (navigation: NavigationProp) => {
  const { email, verify } = useAuth();
  const { theme } = useTheme();
  
  const {
    form,
    isSubmitting,
    setIsSubmitting,
    cooldown,
    setCooldown,
  } = useVerificationForm();

  const handleResendOTP = useCallback(async () => {
    if (cooldown > 0) {
      showToast('info', MESSAGES.resendInfoMessage(cooldown));
      return;
    }

    if (!email) {
      showToast('error', MESSAGES.noEmailError);
      return;
    }

    try {
      const response = await resendVerificationOtpApi(email);
      setCooldown(TIMING.resendCooldownSeconds);
      showToast('success', getSuccessMessage(response));
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  }, [cooldown, email, setCooldown]);

  const onSubmit = useCallback(async (data: VerificationFormData) => {
    Keyboard.dismiss();
    
    if (!email) {
      showToast('error', getFailureMessage(null));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyOtpApi(email, data.code);
      
      if (response.success && response.data?.isEmailVerified) {
        showToast('success', getSuccessMessage(response));
        
        // Persist verification flag
        await AsyncStorage.setItem(STORAGE_KEYS.isVerified, 'true');
        
        // Delayed navigation for user feedback
        setTimeout(() => {
          navigation.reset({
            index: NAVIGATION_CONFIG.resetIndex,
            routes: [{ name: NAVIGATION_CONFIG.loginRouteName }],
          });
        }, TIMING.successDelayMs);
      } else {
        showToast('error', getFailureMessage(response));
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, navigation, setIsSubmitting]);

  return {
    form,
    isSubmitting,
    cooldown,
    theme,
    handleResendOTP,
    onSubmit,
  };
};