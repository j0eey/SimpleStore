import React, { useState } from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { fonts, colors } from '../theme/Theme';
import { forgotPasswordApi } from '../api/auth.api';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getSuccessMessage } from '../utils/getSuccessMessage';
import { getFailureMessage } from '../utils/getFailureMessage';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Toast.show({
      type,
      text1: message,
      visibilityTime: type === 'success' ? 2500 : 3000,
    });
  };

  const onSubmit = async ({ email }: FormData) => {
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
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[
          styles.container,
          isDarkMode && { backgroundColor: colors.darkBackground }
        ]}>
          <Text style={[
            styles.title,
            isDarkMode && { color: colors.darkText }
          ]}>
            Forgot Password
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  isDarkMode && {
                    color: colors.darkText,
                    borderColor: colors.darkBorder,
                    backgroundColor: colors.darkInputBackground,
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={isDarkMode ? colors.darkPlaceholder : colors.textSecondary}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            )}
          />
          {errors.email && (
            <Text style={[
              styles.error,
              isDarkMode && { color: colors.darkError }
            ]}>
              {errors.email.message}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              loading && { opacity: 0.7 },
              isDarkMode && { backgroundColor: colors.darkPrimary }
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.lightHeader} />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <Text style={[
            styles.text,
            isDarkMode && { color: colors.darkText }
          ]}>
            Remembered your password?{' '}
            <Text
              style={[
                styles.link,
                isDarkMode && { color: colors.darkPrimary }
              ]}
              onPress={() => navigation.navigate('Login')}
            >
              Login
            </Text>
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    marginBottom: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: fonts.regular,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  text: {
    textAlign: 'center',
    color: colors.darkHeader,
    marginTop: 20,
    fontSize: 16,
    fontFamily: fonts.light,
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});

export default ForgotPasswordScreen;
