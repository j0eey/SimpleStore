import React, { useState } from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { loginApi } from '../api/auth.api';
import { fonts, colors } from '../theme/Theme';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getSuccessMessage } from '../utils/getSuccessMessage';
import { getFailureMessage } from '../utils/getFailureMessage';
import { useTheme } from '../contexts/ThemeContext';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Toast.show({
      type,
      text1: message,
      visibilityTime: type === 'success' ? 2500 : 3000,
    });
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await loginApi(data.email, data.password);

      if (response?.success && response?.data) {
        const { accessToken, refreshToken } = response.data;
        showToast(getSuccessMessage(response), 'success');
        setTimeout(() => login({ accessToken, refreshToken }), 1000);
      } else {
        showToast(getFailureMessage(response), 'error');
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        showToast('Invalid email or password', 'error');
      } else if (error?.response?.status === 403) {
        showToast('Please verify your email before logging in', 'error');
      } else {
        showToast(getErrorMessage(error), 'error');
      }
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
            Login
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
                    backgroundColor: colors.darkInputBackground
                  }
                ]}
                placeholder="Email"
                placeholderTextColor={isDarkMode ? colors.darkPlaceholder : colors.textSecondary}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                importantForAutofill="yes"
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

          <View style={[
            styles.passwordContainer,
            isDarkMode && {
              borderColor: colors.darkBorder,
              backgroundColor: colors.darkInputBackground
            }
          ]}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.passwordInput,
                    isDarkMode && { color: colors.darkText }
                  ]}
                  placeholder="Password"
                  placeholderTextColor={isDarkMode ? colors.darkPlaceholder : colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  importantForAutofill="yes"
                />
              )}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel="Toggle password visibility"
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color={isDarkMode ? colors.darkIcon : colors.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={[
              styles.error,
              isDarkMode && { color: colors.darkError }
            ]}>
              {errors.password.message}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && { opacity: 0.7 },
              isDarkMode && { backgroundColor: colors.darkPrimary }
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={colors.lightHeader} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={[
            styles.text,
            isDarkMode && { color: colors.darkText }
          ]}>
            Don't have an account?{' '}
            <Text 
              style={[
                styles.link,
                isDarkMode && { color: colors.darkPrimary }
              ]} 
              onPress={() => navigation.navigate('Signup')}
            >
              Sign up here
            </Text>
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ marginTop: 16 }}
          >
            <Text style={[
              styles.link,
              { textAlign: 'center' },
              isDarkMode && { color: colors.darkPrimary }
            ]}>
              Forgot password?
            </Text>
          </TouchableOpacity>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  eyeButton: {
    padding: 10,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: fonts.regular,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
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

export default LoginScreen;