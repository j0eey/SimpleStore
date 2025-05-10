import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Modal from 'react-native-modal';
import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';

type ButtonConfig = {
  label: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
};

type CustomModalProps = {
  isVisible: boolean;
  title?: string;
  message?: string | React.ReactNode;
  buttons: ButtonConfig[];
  onBackdropPress?: () => void;
  customContent?: React.ReactNode;
  swipeDirection?: 'up' | 'down' | 'left' | 'right' | undefined;
  animationType?: 'fade' | 'slide' | 'none';
  avoidKeyboard?: boolean;
  hideCloseButton?: boolean;
};

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  title,
  message,
  buttons,
  onBackdropPress,
  customContent,
  swipeDirection,
  animationType = 'fade',
  avoidKeyboard = true,
  hideCloseButton = false,
}) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 6,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue]);

  useEffect(() => {
    if (isVisible) {
      animateIn();
    } else {
      animateOut();
    }
  }, [isVisible, animateIn, animateOut]);

  const getButtonStyle = (button: ButtonConfig) => {
    switch (button.type) {
      case 'primary':
        return [styles.button, styles.primaryButton, button.disabled && styles.disabledButton];
      case 'secondary':
        return [styles.button, styles.secondaryButton, button.disabled && styles.disabledButton];
      case 'destructive':
        return [styles.button, styles.destructiveButton, button.disabled && styles.disabledButton];
      default:
        return [styles.button, styles.defaultButton, button.disabled && styles.disabledButton];
    }
  };

  const getButtonTextStyle = (button: ButtonConfig) => {
    switch (button.type) {
      case 'secondary':
        return [styles.secondaryButtonText, { color: theme === 'dark' ? colors.lightHeader : colors.text }];
      default:
        return styles.buttonText;
    }
  };

  const handleBackdropPress = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else if (buttons.length > 0) {
      buttons[0].onPress();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleBackdropPress}
      backdropOpacity={0.6}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      animationIn={animationType === 'slide' ? 'slideInUp' : 'fadeIn'}
      animationOut={animationType === 'slide' ? 'slideOutDown' : 'fadeOut'}
      animationInTiming={300}
      animationOutTiming={300}
      useNativeDriver
      swipeDirection={swipeDirection}
      onSwipeComplete={handleBackdropPress}
      avoidKeyboard={avoidKeyboard}
      style={styles.modal}
    >
      <Animated.View
        style={[
          styles.modalContent,
          {
            backgroundColor: theme === 'dark' ? colors.darkSearchbar : 'white',
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          },
        ]}
      >
        {!hideCloseButton && (
          <TouchableOpacity style={styles.closeButton} onPress={handleBackdropPress}>
            <Text style={[styles.closeButtonText, { color: theme === 'dark' ? colors.lightHeader : colors.text }]}>
              ×
            </Text>
          </TouchableOpacity>
        )}

        {title && (
          <Text style={[styles.modalTitle, { color: theme === 'dark' ? colors.lightHeader : colors.text }]}>
            {title}
          </Text>
        )}

        {message && (
          <Text style={[styles.modalMessage, { color: theme === 'dark' ? colors.lightHeader : colors.text }]}>
            {message}
          </Text>
        )}

        {customContent}

        <View style={[styles.buttonRow, buttons.length === 1 && { justifyContent: 'center' }]}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={getButtonStyle(button)}
              onPress={button.onPress}
              disabled={button.disabled}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle(button)}>{button.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: colors.lightHeader,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.darkHeader,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: fonts.Bold,
    color: colors.text,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: fonts.light,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.info,
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  defaultButton: {
    backgroundColor: colors.info,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});