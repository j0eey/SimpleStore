import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Feather from 'react-native-vector-icons/Feather';
import { fonts, colors } from '../../theme/Theme';
import { SignupFormData, UI_MEASUREMENTS, TEXT_CONFIG, ICONS, MESSAGES, ACCESSIBILITY } from './constants';

// Main container with theme support
export const MainContainer = ({ 
  children, 
  theme 
}: { 
  children: React.ReactNode; 
  theme: string; 
}) => (
  <View style={[
    styles.container,
    { backgroundColor: theme === 'dark' ? colors.darkBackground : colors.lightHeader }
  ]}>
    {children}
  </View>
);

// Page title component
export const SignupTitle = ({ theme }: { theme: string }) => (
  <Text style={[
    styles.title,
    { color: theme === 'dark' ? colors.darkText : colors.darkHeader }
  ]}>
    {MESSAGES.title}
  </Text>
);

// Reusable input field component
export const InputField = ({
  name,
  placeholder,
  control,
  errors,
  theme,
  keyboardType = 'default',
}: {
  name: keyof SignupFormData;
  placeholder: string;
  control: Control<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  theme: string;
  keyboardType?: 'email-address' | 'default';
}) => {
  const isDark = theme === 'dark';
  
  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={isDark ? colors.darkPlaceholder : colors.textSecondary}
            value={value}
            onChangeText={onChange}
            style={[
              styles.input,
              isDark && {
                color: colors.darkText,
                borderColor: colors.darkBorder,
                backgroundColor: colors.darkInputBackground,
              }
            ]}
            keyboardType={keyboardType}
            autoCapitalize="none"
            accessibilityLabel={placeholder}
          />
        )}
      />
      {errors[name] && (
        <Text style={[
          styles.error, 
          { color: isDark ? colors.darkError : colors.error }
        ]}>
          {errors[name]?.message}
        </Text>
      )}
    </>
  );
};

// Password field with visibility toggle
export const PasswordField = ({
  control,
  errors,
  theme,
  showPassword,
  onTogglePassword,
}: {
  control: Control<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  theme: string;
  showPassword: boolean;
  onTogglePassword: () => void;
}) => {
  const isDark = theme === 'dark';
  
  return (
    <>
      <View style={[
        styles.passwordContainer,
        isDark && {
          borderColor: colors.darkBorder,
          backgroundColor: colors.darkInputBackground
        }
      ]}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder={MESSAGES.passwordPlaceholder}
              placeholderTextColor={isDark ? colors.darkPlaceholder : colors.textSecondary}
              value={value}
              onChangeText={onChange}
              style={[
                styles.passwordInput,
                isDark && { color: colors.darkText }
              ]}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              accessibilityLabel={MESSAGES.passwordPlaceholder}
            />
          )}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onTogglePassword}
          accessibilityLabel={ACCESSIBILITY.passwordToggle}
        >
          <Feather
            name={showPassword ? ICONS.eyeClosed : ICONS.eyeOpen}
            size={ICONS.size}
            color={isDark ? colors.darkIcon : colors.icon}
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={[
          styles.error,
          { color: isDark ? colors.darkError : colors.error }
        ]}>
          {errors.password?.message}
        </Text>
      )}
    </>
  );
};

// Submit button with loading state
export const SubmitButton = ({
  onPress,
  loading,
  signupSuccess,
  theme,
}: {
  onPress: () => void;
  loading: boolean;
  signupSuccess: boolean;
  theme: string;
}) => {
  if (signupSuccess) return null;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme === 'dark' ? colors.darkPrimary : colors.primary }
      ]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole={ACCESSIBILITY.submitButton}
    >
      {loading ? (
        <ActivityIndicator color={colors.lightHeader} />
      ) : (
        <Text style={styles.buttonText}>{MESSAGES.submitButton}</Text>
      )}
    </TouchableOpacity>
  );
};

// Login navigation link
export const LoginLink = ({
  onPress,
  theme,
}: {
  onPress: () => void;
  theme: string;
}) => (
  <Text style={[
    styles.text,
    { color: theme === 'dark' ? colors.darkText : colors.darkHeader }
  ]}>
    {MESSAGES.loginPrompt}
    <Text
      style={[
        styles.link,
        { color: theme === 'dark' ? colors.darkPrimary : colors.primary }
      ]}
      onPress={onPress}
      accessibilityRole={ACCESSIBILITY.loginLink}
    >
      {MESSAGES.loginLink}
    </Text>
  </Text>
);

// Complete signup form
export const SignupForm = ({
  control,
  errors,
  loading,
  signupSuccess,
  showPassword,
  onTogglePassword,
  onSubmit,
  onNavigateToLogin,
  theme,
}: {
  control: Control<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  loading: boolean;
  signupSuccess: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onNavigateToLogin: () => void;
  theme: string;
}) => (
  <View style={styles.form}>
    <InputField
      name="firstName"
      placeholder={MESSAGES.firstNamePlaceholder}
      control={control}
      errors={errors}
      theme={theme}
    />
    
    <InputField
      name="lastName"
      placeholder={MESSAGES.lastNamePlaceholder}
      control={control}
      errors={errors}
      theme={theme}
    />
    
    <InputField
      name="email"
      placeholder={MESSAGES.emailPlaceholder}
      control={control}
      errors={errors}
      theme={theme}
      keyboardType="email-address"
    />
    
    <PasswordField
      control={control}
      errors={errors}
      theme={theme}
      showPassword={showPassword}
      onTogglePassword={onTogglePassword}
    />

    <SubmitButton
      onPress={onSubmit}
      loading={loading}
      signupSuccess={signupSuccess}
      theme={theme}
    />

    <LoginLink
      onPress={onNavigateToLogin}
      theme={theme}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: UI_MEASUREMENTS.containerPadding,
    justifyContent: 'center',
  },
  title: {
    fontSize: TEXT_CONFIG.titleFontSize,
    textAlign: 'center',
    marginBottom: UI_MEASUREMENTS.titleMarginBottom,
    fontFamily: fonts.Bold,
  },
  form: { 
    width: '100%' 
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: UI_MEASUREMENTS.inputPadding,
    paddingVertical: UI_MEASUREMENTS.inputVerticalPadding,
    borderRadius: UI_MEASUREMENTS.borderRadius,
    marginBottom: UI_MEASUREMENTS.inputMarginBottom,
    fontSize: TEXT_CONFIG.inputFontSize,
    fontFamily: fonts.regular,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: UI_MEASUREMENTS.borderRadius,
    marginBottom: UI_MEASUREMENTS.inputMarginBottom,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: UI_MEASUREMENTS.inputPadding,
    paddingVertical: UI_MEASUREMENTS.inputVerticalPadding,
    fontSize: TEXT_CONFIG.inputFontSize,
    fontFamily: fonts.regular,
  },
  eyeButton: { 
    padding: UI_MEASUREMENTS.eyeButtonPadding 
  },
  error: {
    marginBottom: UI_MEASUREMENTS.errorMarginBottom,
    marginLeft: UI_MEASUREMENTS.errorMarginLeft,
    fontSize: TEXT_CONFIG.errorFontSize,
    fontFamily: fonts.regular,
  },
  button: {
    paddingVertical: 14,
    borderRadius: UI_MEASUREMENTS.borderRadius,
    alignItems: 'center',
    marginTop: UI_MEASUREMENTS.buttonMarginTop,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: TEXT_CONFIG.buttonFontSize,
    fontFamily: fonts.semiBold,
  },
  link: {
    fontFamily: fonts.semiBold,
  },
  text: {
    textAlign: 'center',
    marginTop: UI_MEASUREMENTS.linkMarginTop,
    fontSize: TEXT_CONFIG.linkFontSize,
    fontFamily: fonts.light,
  },
});