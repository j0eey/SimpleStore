import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { fonts, colors } from '../theme/Theme';
import { RootStackParamList } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { verifyOtpApi, resendVerificationOtpApi } from '../api/auth.api';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getSuccessMessage } from '../utils/getSuccessMessage';
import { getFailureMessage } from '../utils/getFailureMessage';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';

const RESEND_COOLDOWN_SECONDS = 60;

const verificationSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

type VerificationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Verification'>;
};

const VerificationScreen = ({ navigation }: VerificationScreenProps) => {
  const { email, verify } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) {
      showToast('info', `You can request a new code in ${cooldown} seconds.`);
      return;
    }

    try {
      const response = await resendVerificationOtpApi(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      showToast('success', getSuccessMessage(response));
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const onSubmit = async (data: VerificationFormData) => {
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
        await AsyncStorage.setItem('@isVerified', 'true'); // Optional: persist verified flag
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 1000);
      }else {
        showToast('error', getFailureMessage(response));
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: colors.darkBackground }
    ]}>
      <Text style={[
        styles.title,
        isDarkMode && { color: colors.darkText }
      ]}>
        Enter Verification Code
      </Text>

      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="6-digit code"
            placeholderTextColor={isDarkMode ? colors.darkPlaceholder : colors.textSecondary}
            value={value}
            onChangeText={onChange}
            style={[
              styles.input,
              isDarkMode && {
                color: colors.darkText,
                borderColor: colors.darkBorder,
                backgroundColor: colors.darkInputBackground
              }
            ]}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
        )}
      />
      {errors.code && (
        <Text style={[
          styles.error,
          isDarkMode && { color: colors.darkError }
        ]}>
          {errors.code.message}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          isDarkMode && { backgroundColor: colors.darkPrimary }
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.lightHeader} />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResendOTP}
        disabled={cooldown > 0}
        style={styles.resendButton}
      >
        <Text style={[
          styles.resendText,
          isDarkMode && { color: colors.darkText },
          cooldown > 0 && styles.resendDisabled
        ]}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightHeader,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: fonts.Bold,
    color: colors.darkHeader,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 6,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  error: {
    color: colors.error,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  resendButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  resendText: {
    color: colors.darkHeader,
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  resendDisabled: {
    color: colors.gray,
  },
});

export default VerificationScreen;