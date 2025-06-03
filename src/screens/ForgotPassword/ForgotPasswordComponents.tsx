import React, { memo, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, colors } from '../../theme/Theme';
import { FORGOT_PASSWORD_CONSTANTS, FORGOT_PASSWORD_MESSAGES } from './constants';
import { FormHeaderProps, EmailInputProps, SubmitButtonProps, LoginLinkProps, MainContainerProps} from './types'


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
      backgroundColor: colors.darkInputBackground,
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
            placeholder={FORGOT_PASSWORD_MESSAGES.EMAIL_PLACEHOLDER}
            placeholderTextColor={placeholderColor}
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
        <Text style={errorStyle}>
          {errors.email.message}
        </Text>
      )}
    </>
  );
});

// Submit Button Component
export const SubmitButton = memo<SubmitButtonProps>(({ onPress, loading }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const buttonStyle = useMemo(() => [
    styles.button,
    loading && { opacity: 0.7 },
    isDarkMode && { backgroundColor: colors.darkPrimary }
  ], [isDarkMode, loading]);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.lightHeader} />
      ) : (
        <Text style={styles.buttonText}>
          {FORGOT_PASSWORD_MESSAGES.BUTTON_TEXT}
        </Text>
      )}
    </TouchableOpacity>
  );
});

// Login Link Component
export const LoginLink = memo<LoginLinkProps>(({ onPress }) => {
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

  return (
    <Text style={textStyle}>
      {FORGOT_PASSWORD_MESSAGES.LOGIN_PROMPT}{' '}
      <Text style={linkStyle} onPress={onPress}>
        {FORGOT_PASSWORD_MESSAGES.LOGIN_LINK}
      </Text>
    </Text>
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
    paddingHorizontal: FORGOT_PASSWORD_CONSTANTS.CONTAINER_PADDING,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: FORGOT_PASSWORD_CONSTANTS.TITLE_MARGIN_BOTTOM,
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
    marginBottom: FORGOT_PASSWORD_CONSTANTS.INPUT_MARGIN_BOTTOM,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: FORGOT_PASSWORD_CONSTANTS.ERROR_MARGIN_BOTTOM,
    marginLeft: 4,
    fontFamily: fonts.regular,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: FORGOT_PASSWORD_CONSTANTS.BUTTON_MARGIN_TOP,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  text: {
    textAlign: 'center',
    color: colors.darkHeader,
    marginTop: FORGOT_PASSWORD_CONSTANTS.TEXT_MARGIN_TOP,
    fontSize: 16,
    fontFamily: fonts.light,
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});