import React, { memo, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, colors } from '../../theme/Theme';
import { LOGIN_CONSTANTS, LOGIN_MESSAGES } from './constants';
import { FormHeaderProps, EmailInputProps, PasswordInputProps, LoginButtonProps, AuthLinksProps, MainContainerProps } from './type';


// Form Header Component
export const FormHeader = memo<FormHeaderProps>(({ title }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const titleStyle = useMemo(() => [
    styles.title,
    isDarkMode && { color: colors.darkText }
  ], [isDarkMode]);

  return (
    <Text style={titleStyle}>
      {title}
    </Text>
  );
});

// Email Input Component
export const EmailInput = memo<EmailInputProps>(({ control, errors }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const inputStyle = useMemo(() => [
    styles.input,
    isDarkMode && {
      color: colors.darkText,
      borderColor: colors.darkBorder,
      backgroundColor: colors.darkInputBackground
    }
  ], [isDarkMode]);

  const errorStyle = useMemo(() => [
    styles.error,
    isDarkMode && { color: colors.darkError }
  ], [isDarkMode]);

  const placeholderColor = isDarkMode ? colors.darkPlaceholder : colors.textSecondary;

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={inputStyle}
            placeholder={LOGIN_MESSAGES.EMAIL_PLACEHOLDER}
            placeholderTextColor={placeholderColor}
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
        <Text style={errorStyle}>
          {errors.email.message}
        </Text>
      )}
    </>
  );
});

// Password Input Component
export const PasswordInput = memo<PasswordInputProps>(({ 
  control, 
  errors, 
  showPassword, 
  onTogglePassword 
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.passwordContainer,
    isDarkMode && {
      borderColor: colors.darkBorder,
      backgroundColor: colors.darkInputBackground
    }
  ], [isDarkMode]);

  const inputStyle = useMemo(() => [
    styles.passwordInput,
    isDarkMode && { color: colors.darkText }
  ], [isDarkMode]);

  const errorStyle = useMemo(() => [
    styles.error,
    isDarkMode && { color: colors.darkError }
  ], [isDarkMode]);

  const placeholderColor = isDarkMode ? colors.darkPlaceholder : colors.textSecondary;
  const iconColor = isDarkMode ? colors.darkIcon : colors.icon;

  return (
    <>
      <View style={containerStyle}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={inputStyle}
              placeholder={LOGIN_MESSAGES.PASSWORD_PLACEHOLDER}
              placeholderTextColor={placeholderColor}
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
          onPress={onTogglePassword}
          accessibilityLabel={LOGIN_MESSAGES.TOGGLE_PASSWORD_VISIBILITY}
        >
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={LOGIN_CONSTANTS.EYE_ICON_SIZE}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={errorStyle}>
          {errors.password.message}
        </Text>
      )}
    </>
  );
});

// Login Button Component
export const LoginButton = memo<LoginButtonProps>(({ onPress, loading }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const buttonStyle = useMemo(() => [
    styles.loginButton,
    loading && { opacity: 0.7 },
    isDarkMode && { backgroundColor: colors.darkPrimary }
  ], [isDarkMode, loading]);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={colors.lightHeader} />
      ) : (
        <Text style={styles.loginButtonText}>
          {LOGIN_MESSAGES.LOGIN_BUTTON}
        </Text>
      )}
    </TouchableOpacity>
  );
});

// Auth Links Component
export const AuthLinks = memo<AuthLinksProps>(({ onSignupPress, onForgotPasswordPress }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const textStyle = useMemo(() => [
    styles.text,
    isDarkMode && { color: colors.darkText }
  ], [isDarkMode]);

  const linkStyle = useMemo(() => [
    styles.link,
    isDarkMode && { color: colors.darkPrimary }
  ], [isDarkMode]);

  const forgotPasswordStyle = useMemo(() => [
    styles.link,
    { textAlign: 'center' as const },
    isDarkMode && { color: colors.darkPrimary }
  ], [isDarkMode]);

  return (
    <>
      <Text style={textStyle}>
        {LOGIN_MESSAGES.NO_ACCOUNT}{' '}
        <Text style={linkStyle} onPress={onSignupPress}>
          {LOGIN_MESSAGES.SIGNUP_LINK}
        </Text>
      </Text>

      <TouchableOpacity
        onPress={onForgotPasswordPress}
        style={{ marginTop: LOGIN_CONSTANTS.FORGOT_PASSWORD_MARGIN_TOP }}
      >
        <Text style={forgotPasswordStyle}>
          {LOGIN_MESSAGES.FORGOT_PASSWORD}
        </Text>
      </TouchableOpacity>
    </>
  );
});

// Main Container Component
export const MainContainer = memo<MainContainerProps>(({ children }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.container,
    isDarkMode && { backgroundColor: colors.darkBackground }
  ], [isDarkMode]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={containerStyle}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightHeader,
    paddingHorizontal: LOGIN_CONSTANTS.CONTAINER_PADDING,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: LOGIN_CONSTANTS.TITLE_MARGIN_BOTTOM,
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
    marginBottom: LOGIN_CONSTANTS.INPUT_MARGIN_BOTTOM,
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
    marginBottom: LOGIN_CONSTANTS.INPUT_MARGIN_BOTTOM,
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
    marginBottom: LOGIN_CONSTANTS.ERROR_MARGIN_BOTTOM,
    marginLeft: 4,
    fontFamily: fonts.regular,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: LOGIN_CONSTANTS.BUTTON_MARGIN_TOP,
  },
  loginButtonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  text: {
    textAlign: 'center',
    color: colors.darkHeader,
    marginTop: LOGIN_CONSTANTS.TEXT_MARGIN_TOP,
    fontSize: 16,
    fontFamily: fonts.light,
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});