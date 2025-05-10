import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { colors, fonts } from '../theme/Theme';
import { CustomModalProps } from './CustomModalTypes';

const CustomModal: React.FC<CustomModalProps> = ({ 
  isVisible, 
  title, 
  message, 
  buttons = [], 
  onClose 
}) => {
  // If no buttons are provided, use a default dismiss button
  const modalButtons = buttons.length > 0 ? buttons : [
    { label: 'Dismiss', onPress: onClose || (() => {}), type: 'primary' as const }
  ];

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      backdropTransitionInTiming={200}
      backdropTransitionOutTiming={200}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={200}
      animationOutTiming={200}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        
        <View style={styles.buttonsContainer}>
          {modalButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                button.type === 'secondary' ? styles.secondaryButton : 
                button.type === 'text' ? styles.textButton : 
                styles.primaryButton
              ]}
              onPress={button.onPress}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.buttonText,
                button.type === 'secondary' ? styles.secondaryButtonText : 
                button.type === 'text' ? styles.textButtonText : 
                styles.primaryButtonText
              ]}>
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: fonts.Bold,
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  primaryButtonText: {
    color: colors.lightHeader,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
  },
  textButtonText: {
    color: colors.primary,
  },
});