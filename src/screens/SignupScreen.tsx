import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { fonts, colors } from '../theme/Theme';
import { AxiosError } from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { signupApi } from '../api/auth.api';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getSuccessMessage } from '../utils/getSuccessMessage';
import { getFailureMessage } from '../utils/getFailureMessage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import Feather from 'react-native-vector-icons/Feather';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const { signup, setEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { theme } = useTheme();

  const isDarkMode = theme === 'dark';

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues,
    mode: 'onChange',
  });

  useFocusEffect(
    React.useCallback(() => {
      setSignupSuccess(false);
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (signupSuccess) {
      const delayAndNavigate = async () => {
        await setEmail(userEmail);
        await signup(userEmail);

        setTimeout(() => {
          setSignupSuccess(false);
          navigation.navigate('Verification', { email: userEmail });
          reset();
        }, 3000);
      };

      delayAndNavigate();
    }
  }, [signupSuccess, navigation, signup, setEmail, userEmail, reset]);

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
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
  };

  const renderInputField = (
    name: keyof z.infer<typeof signupSchema>,
    placeholder: string,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: 'email-address' | 'default';
      toggleSecureEntry?: () => void;
      showToggle?: boolean;
    }
  ) => (
    <>
      <View style={[
        options?.showToggle ? styles.passwordContainer : undefined,
        isDarkMode && options?.showToggle ? {
          borderColor: colors.darkBorder,
          backgroundColor: colors.darkInputBackground
        } : undefined,
      ]}>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder={placeholder}
              placeholderTextColor={isDarkMode ? colors.darkPlaceholder : colors.textSecondary}
              value={value}
              onChangeText={onChange}
              style={[
                options?.showToggle ? styles.passwordInput : styles.input,
                isDarkMode && {
                  color: colors.darkText,
                  borderColor: colors.darkBorder,
                  backgroundColor: colors.darkInputBackground,
                }
              ]}
              secureTextEntry={options?.secureTextEntry}
              keyboardType={options?.keyboardType || 'default'}
              autoCapitalize="none"
              accessibilityLabel={placeholder}
            />
          )}
        />
        {options?.showToggle && (
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
        )}
      </View>
      {errors[name] && (
        <Text style={[styles.error, isDarkMode && { color: colors.darkError }]}>
          {errors[name]?.message}
        </Text>
      )}
    </>
  );

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: colors.darkBackground }
    ]}>
      <Text style={[
        styles.title,
        isDarkMode && { color: colors.darkText }
      ]}>
        Create Account
      </Text>
      <View style={styles.form}>
        {renderInputField('firstName', 'First Name')}
        {renderInputField('lastName', 'Last Name')}
        {renderInputField('email', 'Email', { keyboardType: 'email-address' })}
        {renderInputField('password', 'Password', {
          secureTextEntry: !showPassword,
          toggleSecureEntry: () => setShowPassword((prev) => !prev),
          showToggle: true,
        })}

        {!signupSuccess && (
          <TouchableOpacity
            style={[
              styles.button,
              isDarkMode && { backgroundColor: colors.darkPrimary }
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={colors.lightHeader} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        )}

        <Text style={[
          styles.text,
          isDarkMode && { color: colors.darkText }
        ]}>
          Already have an account?{' '}
          <Text
            style={[
              styles.link,
              isDarkMode && { color: colors.darkPrimary }
            ]}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="link"
          >
            Login
          </Text>
        </Text>
      </View>
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
  form: { width: '100%' },
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
  eyeButton: { padding: 10 },
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
    marginTop: 12,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  text: {
    textAlign: 'center',
    color: colors.darkHeader,
    marginTop: 20,
    fontSize: 16,
    fontFamily: fonts.light,
  },
});

export default SignupScreen;