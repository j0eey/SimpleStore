import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? colors.darkHeader : colors.background }]}>
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: theme === 'dark' ? colors.lightHeader : colors.darkHeader }]}>
          Theme Mode
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
          <Ionicons 
            name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} 
            size={24} 
            color={theme === 'dark' ? colors.priceDark : colors.darkHeader} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  toggleButton: {
    padding: 8,
  },
});

export default SettingsScreen;