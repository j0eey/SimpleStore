import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { colors, fonts } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';

type ButtonConfig = {
  label: string;
  onPress: () => void;
  type?: 'primary' | 'secondary';
};

type CustomModalProps = {
  isVisible: boolean;
  title: string;
  message: string;
  buttons: ButtonConfig[];
};

const CustomModal: React.FC<CustomModalProps> = ({ isVisible, title, message, buttons }) => {
  const { theme } = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={buttons[0]?.onPress}
      backdropOpacity={0.5}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      useNativeDriver
    >
      <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? colors.darkSearchbar : 'white' }]}>
        <Text style={[styles.modalTitle, { color: theme === 'dark' ? colors.lightHeader : colors.text }]}>{title}</Text>
        <Text style={[styles.modalMessage, { color: theme === 'dark' ? colors.lightHeader : colors.text }]}>{message}</Text>

        <View style={[styles.buttonRow, buttons.length === 1 && { justifyContent: 'center' }]}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                button.type === 'secondary' ? styles.cancelButton : styles.confirmButton,
                buttons.length === 1 && { flex: 0.6 },
              ]}
              onPress={button.onPress}
            >
              <Text style={styles.buttonText}>{button.label}</Text>
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
    backgroundColor: colors.lightHeader,
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: fonts.Bold,
    color: colors.text,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: fonts.light,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.info,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontWeight: '600',
  },
});