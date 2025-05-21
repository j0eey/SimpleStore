import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { fonts, colors } from '../theme/Theme';
import { useTheme } from '../contexts/ThemeContext';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
    const navigation = useNavigation<SplashScreenNavigationProp>();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    
    return (
      <View style={[
        styles.container,
        isDarkMode && { backgroundColor: colors.darkBackground }
      ]}>
        <Text style={[
          styles.text,
          isDarkMode && { color: colors.darkText }
        ]}>
          Simple Store
        </Text>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 24,
    fontFamily: fonts.Bold,  
    color: colors.textPrimary,
  },
});

export default SplashScreen;