import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { fonts, colors } from '../../theme/Theme';
import { VerificationFormData, UI_MEASUREMENTS, TEXT_CONFIG, FORM_CONFIG, MESSAGES } from './constants';

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
export const VerificationTitle = ({ theme }: { theme: string }) => (
  <Text style={[
    styles.title,
    { color: theme === 'dark' ? colors.darkText : colors.darkHeader }
  ]}>
    {MESSAGES.title}
  </Text>
);

// 6-digit code input component
export const CodeInput = ({
  control,
  errors,
  theme,
}: {
  control: Control<VerificationFormData>;
  errors: FieldErrors<VerificationFormData>;
  theme: string;
}) => {
  const isDark = theme === 'dark';
  
  return (
    <>
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder={MESSAGES.codePlaceholder}
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
            keyboardType={FORM_CONFIG.keyboardType}
            maxLength={TEXT_CONFIG.codeMaxLength}
            autoFocus={FORM_CONFIG.autoFocus}
          />
        )}
      />
      {errors.code && (
        <Text style={[
          styles.error,
          { color: isDark ? colors.darkError : colors.error }
        ]}>
          {errors.code.message}
        </Text>
      )}
    </>
  );
};

// Verify button with loading state
export const VerifyButton = ({
  onPress,
  isSubmitting,
  theme,
}: {
  onPress: () => void;
  isSubmitting: boolean;
  theme: string;
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: theme === 'dark' ? colors.darkPrimary : colors.primary }
    ]}
    onPress={onPress}
    disabled={isSubmitting}
  >
    {isSubmitting ? (
      <ActivityIndicator color={colors.lightHeader} />
    ) : (
      <Text style={styles.buttonText}>{MESSAGES.verifyButton}</Text>
    )}
  </TouchableOpacity>
);

// Resend button with cooldown
export const ResendButton = ({
  onPress,
  cooldown,
  theme,
}: {
  onPress: () => void;
  cooldown: number;
  theme: string;
}) => {
  const isDark = theme === 'dark';
  const isDisabled = cooldown > 0;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={styles.resendButton}
    >
      <Text style={[
        styles.resendText,
        { color: isDark ? colors.darkText : colors.darkHeader },
        isDisabled && { color: colors.gray }
      ]}>
        {isDisabled ? MESSAGES.resendCooldown(cooldown) : MESSAGES.resendButton}
      </Text>
    </TouchableOpacity>
  );
};

// Complete verification form
export const VerificationForm = ({
  control,
  errors,
  isSubmitting,
  cooldown,
  onSubmit,
  onResend,
  theme,
}: {
  control: Control<VerificationFormData>;
  errors: FieldErrors<VerificationFormData>;
  isSubmitting: boolean;
  cooldown: number;
  onSubmit: () => void;
  onResend: () => void;
  theme: string;
}) => (
  <>
    <CodeInput
      control={control}
      errors={errors}
      theme={theme}
    />

    <VerifyButton
      onPress={onSubmit}
      isSubmitting={isSubmitting}
      theme={theme}
    />

    <ResendButton
      onPress={onResend}
      cooldown={cooldown}
      theme={theme}
    />
  </>
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
  error: {
    marginBottom: UI_MEASUREMENTS.errorMarginBottom,
    marginLeft: UI_MEASUREMENTS.errorMarginLeft,
    fontSize: TEXT_CONFIG.errorFontSize,
    fontFamily: fonts.regular,
  },
  button: {
    paddingVertical: UI_MEASUREMENTS.buttonVerticalPadding,
    borderRadius: UI_MEASUREMENTS.borderRadius,
    alignItems: 'center',
    marginTop: UI_MEASUREMENTS.buttonMarginTop,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: TEXT_CONFIG.buttonFontSize,
    fontFamily: fonts.semiBold,
  },
  resendButton: {
    marginTop: UI_MEASUREMENTS.resendMarginTop,
    alignSelf: 'center',
  },
  resendText: {
    fontSize: TEXT_CONFIG.resendFontSize,
    fontFamily: fonts.semiBold,
  },
});