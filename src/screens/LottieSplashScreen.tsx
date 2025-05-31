import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieSplashScreenProps {
  onAnimationFinish: () => void;
}

const LottieSplashScreen: React.FC<LottieSplashScreenProps> = ({ onAnimationFinish }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/splash_animation.json')}
        style={styles.animation}
        autoPlay
        loop={false}
        onAnimationFinish={onAnimationFinish}
        resizeMode="cover"
      />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Match your native splash background
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: width,
    height: height,
  },
});

export default LottieSplashScreen;