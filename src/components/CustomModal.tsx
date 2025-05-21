import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors, fonts } from '../theme/Theme';


type ButtonProps = {
  label: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'text';
};

type CustomModalProps = {
  isVisible: boolean;
  title: string;
  message: string;
  buttons?: ButtonProps[];
  onClose?: () => void;
  showConfirmButton?: boolean;
  confirmText?: string;
  
};

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
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalBox}>
          {title && <Text style={styles.modalTitle}>{title}</Text>}
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 12,
    width: '100%',
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

export default CustomModal;