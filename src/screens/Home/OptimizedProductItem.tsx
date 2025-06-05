import React, { memo, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../contexts/ThemeContext';
import { Product } from '../../types/Product';
import { fonts, colors } from '../../theme/Theme';
import { getTimeAgo } from '../../utils/getTimeAgo';
import { LAYOUT, scaleFont } from './constants';
import DeepLinkingService from '../../services/UniversalLinkingService';

interface OptimizedProductItemProps {
  item: Product;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product, position: {x: number, y: number, width: number, height: number}) => void;
  isOwner: boolean;
}

export const OptimizedProductItem = memo<OptimizedProductItemProps>(({ item, onPress, onAddToCart, isOwner }) => {
  const { theme } = useTheme();
  const imageRef = useRef<View>(null);

  // SIMPLIFIED callbacks
  const handlePress = useCallback(() => {
    onPress(item);
  }, [onPress, item._id]); // Use item._id instead of entire item

  const handleAddToCart = useCallback(() => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      onAddToCart(item, {x, y, width, height});
    });
  }, [onAddToCart, item._id]); // Use item._id instead of entire item

  const handleSharePress = useCallback(async () => {
    try {
      const shareContent = DeepLinkingService.generateShareContent({
        id: item._id,
        title: item.title,
        price: `${item.price}`,
        image: item.images[0]?.fullUrl || '',
      });
      await Share.share({
        title: shareContent.title,
        message: shareContent.message,
        url: shareContent.url,
      });
    } catch (error) {
      // Handle error silently
    }
  }, [item._id, item.title, item.price, item.images]);

  // MEMOIZED data - calculate once
  const itemData = useMemo(() => ({
    imageUri: item.images[0]?.fullUrl,
    locationName: item.location?.name ?? 'Unknown Location',
    timeAgo: getTimeAgo(item.createdAt),
    formattedPrice: `$${item.price.toFixed(2)}`,
  }), [item.images, item.location?.name, item.createdAt, item.price]);

  // STATIC styles - don't recalculate
  const styles = useMemo(() => ({
    card: {
      width: LAYOUT.CARD_WIDTH,
      borderRadius: 12,
      overflow: 'hidden' as const,
      backgroundColor: theme === 'dark' ? colors.darkCard : colors.lightCard,
    },
    imageContainer: {
      flex: 1,
      height: LAYOUT.CARD_WIDTH * 0.9,
      position: 'relative' as const,
    },
    button: {
      position: 'absolute' as const,
      top: 8,
      backgroundColor: theme === 'dark' ? colors.cartIconBgDarkColor : colors.cartIconBgLightColor,
      borderRadius: 18,
      width: 36,
      height: 36,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    content: {
      padding: 10,
    },
    title: {
      fontSize: scaleFont(14),
      fontFamily: fonts.semiBold,
      marginBottom: 6,
      color: theme === 'dark' ? colors.lightHeader : colors.darkHeader,
    },
    price: {
      fontSize: scaleFont(15),
      fontFamily: fonts.Bold,
      color: theme === 'dark' ? colors.priceDark : colors.icon,
    },
    location: {
      fontSize: scaleFont(10),
      fontFamily: fonts.regular,
      color: theme === 'dark' ? colors.lightText : colors.darkBorder,
      marginTop: 2,
    },
    time: {
      fontSize: scaleFont(10),
      fontFamily: fonts.regular,
      opacity: 0.7,
      marginTop: 4,
      color: theme === 'dark' ? colors.lightText : colors.darkBorder,
    },
  }), [theme]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View ref={imageRef} style={styles.imageContainer}>
        {itemData.imageUri ? (
          <FastImage
            source={{
              uri: itemData.imageUri,
              priority: FastImage.priority.normal,
            }}
            style={{ flex: 1 }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? colors.darkHeader : colors.imageBackground,
          }}>
            <Ionicons
              name="image-outline"
              size={32}
              color={theme === 'dark' ? colors.lightText : colors.darkText}
            />
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { left: 8 }]} 
          onPress={handleSharePress}
          activeOpacity={0.9}
        >
          <Ionicons name="share-outline" size={20} color={theme === 'dark' ? colors.primaryLight : colors.primaryDark} />
        </TouchableOpacity>

        {!isOwner && (
          <TouchableOpacity
            style={[styles.button, { right: 8 }]}
            onPress={handleAddToCart}
            activeOpacity={0.9}
          >
            <Ionicons name="cart-outline" size={20} color={theme === 'dark' ? colors.primaryLight : colors.primaryDark} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.price}>
          {itemData.formattedPrice}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {itemData.locationName}
        </Text>
        <Text style={styles.time}>
          {itemData.timeAgo}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.isOwner === nextProps.isOwner
  );
});