import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFlyingCart } from '../contexts/FlyingCartContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FlyingCartAnimation: React.FC = () => {
  const { flyingAnimationData } = useFlyingCart();
  const animatedX = useRef(new Animated.Value(0)).current;
  const animatedY = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (flyingAnimationData.isVisible && flyingAnimationData.startPosition) {
      const startX = flyingAnimationData.startPosition.x + flyingAnimationData.startPosition.width / 2;
      const startY = flyingAnimationData.startPosition.y + flyingAnimationData.startPosition.height / 2;
      
      // Reset animation values to start position
      animatedX.setValue(0);
      animatedY.setValue(0); 
      animatedScale.setValue(1);
      animatedOpacity.setValue(1);
      animatedRotation.setValue(0);

      // Calculate end position (cart tab position)
      const tabBarHeight = 60;
      const cartTabX = screenWidth * 0.75 - 15; 
      const cartTabY = screenHeight - tabBarHeight + 15; 

      // Calculate the distance to move from start to end position
      const deltaX = cartTabX - startX;
      const deltaY = cartTabY - startY;

      // Create curved path animation
      const duration = 1000;
      
      Animated.parallel([
        // X movement with easing - using translateX instead of left
        Animated.timing(animatedX, {
          toValue: deltaX,
          duration,
          useNativeDriver: true,
        }),
        // Y movement with curve (parabolic path) - using translateY instead of top
        Animated.sequence([
          Animated.timing(animatedY, {
            toValue: -100,
            duration: duration * 0.4,
            useNativeDriver: true,
          }),
          Animated.timing(animatedY, {
            toValue: deltaY,
            duration: duration * 0.6,
            useNativeDriver: true,
          }),
        ]),
        // Scale down as it flies
        Animated.timing(animatedScale, {
          toValue: 0.3,
          duration,
          useNativeDriver: true,
        }),
        // Add rotation for more dynamic effect
        Animated.timing(animatedRotation, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        // Fade out at the end
        Animated.sequence([
          Animated.delay(duration * 0.7),
          Animated.timing(animatedOpacity, {
            toValue: 0,
            duration: duration * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [flyingAnimationData.isVisible, flyingAnimationData.startPosition]);

  if (!flyingAnimationData.isVisible || !flyingAnimationData.startPosition) {
    return null;
  }

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate static start position
  const startX = flyingAnimationData.startPosition.x + flyingAnimationData.startPosition.width / 2;
  const startY = flyingAnimationData.startPosition.y + flyingAnimationData.startPosition.height / 2;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View
        style={[
          styles.flyingProduct,
          {
            // Static positioning - these don't get animated
            left: startX,
            top: startY,
            // All animations happen through transform
            transform: [
              { translateX: animatedX }, 
              { translateY: animatedY }, 
              { scale: animatedScale },
              { rotate: rotateInterpolate },
              { translateX: -25 }, 
              { translateY: -25 },
            ],
            opacity: animatedOpacity,
          },
        ]}
      >
        <FastImage
          source={{ uri: flyingAnimationData.productImage }}
          style={styles.productImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  flyingProduct: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
});

export default FlyingCartAnimation;