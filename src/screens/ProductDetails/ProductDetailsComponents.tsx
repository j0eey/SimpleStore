import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Alert, Linking } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fonts, colors } from '../../theme/Theme';
import { Product } from '../../types/Product';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Swiper from 'react-native-swiper';
import MapView, { Marker } from 'react-native-maps';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { productInquiryTemplate } from '../../utils/emailTemplates';
import { getProductErrorMessage } from '../../utils/getErrorMessage';
import { SCREEN_WIDTH, PRODUCT_DETAILS_CONSTANTS } from './constants';

// Types
interface ProductDetailsSkeletonProps {
  theme: string;
}

interface ProductImagesProps {
  product: Product;
}

interface ProductInfoProps {
  product: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isOwner: boolean;
  onMenuPress: () => void;
}

interface SellerInfoProps {
  product: Product;
  isOwner: boolean;
}

interface LocationMapProps {
  product: Product;
}

interface OwnerMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface ErrorDisplayProps {
  isNotFound?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onGoBack?: () => void;
}

interface ActionButtonProps {
  product: Product;
  quantity: number;
  onAddToCart: () => void;
  isOwner: boolean;
}

// Skeleton Component
export const ProductDetailsSkeleton = memo<ProductDetailsSkeletonProps>(({ theme }) => {
  const isDark = theme === 'dark';
  const skeletonConfig = useMemo(() => ({
    borderRadius: 4,
    backgroundColor: isDark ? colors.darkPlaceholder : colors.lightPlaceholder,
    highlightColor: isDark ? colors.darkHighlight : colors.lightHighlight,
  }), [isDark]);

  const containerStyle = useMemo(() => [
    styles.scrollContainer, 
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={containerStyle}
      showsVerticalScrollIndicator={false}
    >
      <SkeletonPlaceholder {...skeletonConfig}>
        <SkeletonPlaceholder.Item
          width={SCREEN_WIDTH - 40}
          height={PRODUCT_DETAILS_CONSTANTS.IMAGE_HEIGHT}
          borderRadius={8}
          marginBottom={20}
        />
        <SkeletonPlaceholder.Item
          width={SCREEN_WIDTH * 0.7}
          height={30}
          marginBottom={16}
        />
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={16}
        >
          <SkeletonPlaceholder.Item width={100} height={20} />
          <SkeletonPlaceholder.Item width={120} height={20} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={16}
        >
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={30} height={30} marginRight={10} />
            <SkeletonPlaceholder.Item width={20} height={20} marginHorizontal={10} />
            <SkeletonPlaceholder.Item width={30} height={30} marginLeft={10} />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={80} height={25} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item width="100%" height={1} marginVertical={12} />
        <SkeletonPlaceholder.Item width={120} height={20} marginBottom={10} />
        <SkeletonPlaceholder.Item width="100%" height={60} marginBottom={20} />
        <SkeletonPlaceholder.Item width="100%" height={1} marginVertical={12} />
        <SkeletonPlaceholder.Item width={150} height={20} marginBottom={10} />
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
          marginBottom={16}
        >
          <SkeletonPlaceholder.Item width={24} height={24} borderRadius={12} />
          <SkeletonPlaceholder.Item width={150} height={20} marginLeft={8} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item width="100%" height={50} borderRadius={8} marginBottom={16} />
        <SkeletonPlaceholder.Item width="100%" height={1} marginVertical={12} />
        <SkeletonPlaceholder.Item width={100} height={20} marginBottom={10} />
        <SkeletonPlaceholder.Item
          width="100%"
          height={PRODUCT_DETAILS_CONSTANTS.MAP_HEIGHT}
          borderRadius={8}
          marginBottom={20}
        />
        <SkeletonPlaceholder.Item width="100%" height={50} borderRadius={10} marginTop={20} />
      </SkeletonPlaceholder>
    </ScrollView>
  );
});

// Product Images Component
export const ProductImages = memo<ProductImagesProps>(({ product }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hasImages = product.images && product.images.length > 0;

  const imagePlaceholderStyle = useMemo(() => [
    styles.imagePlaceholder,
    { backgroundColor: isDark ? colors.darkCard : colors.light }
  ], [isDark]);

  if (!hasImages) {
    return (
      <View style={imagePlaceholderStyle}>
        <Text style={{ color: isDark ? colors.lightHeader : colors.darkHeader }}>
          No Image Available
        </Text>
      </View>
    );
  }

  return (
    <Swiper
      style={styles.swiper}
      showsButtons={false}
      showsPagination={true}
      dotColor={isDark ? colors.border : colors.light}
      activeDotColor={isDark ? colors.primary : colors.primaryDark}
      paginationStyle={{ bottom: 10 }}
      loop={false}
    >
      {product.images.map((image, index) => (
        <View key={index} style={styles.slide}>
          <Image
            source={{ uri: image.fullUrl }}
            style={styles.swiperImage}
            resizeMode="contain"
          />
        </View>
      ))}
    </Swiper>
  );
});

// Product Info Component
export const ProductInfo = memo<ProductInfoProps>(({ 
  product, 
  quantity, 
  onIncrease, 
  onDecrease, 
  isOwner, 
  onMenuPress 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const totalPrice = (product.price * quantity).toFixed(2);

  const styles_themed = useMemo(() => ({
    title: [styles.title, { color: isDark ? colors.lightHeader : colors.darkHeader }],
    detailText: [styles.detailText, { color: isDark ? colors.border : colors.text }],
    quantityButton: [styles.quantityButton, { backgroundColor: isDark ? colors.nameCardLight : colors.light }],
    quantityButtonText: [styles.quantityButtonText, { color: isDark ? colors.lightHeader : colors.darkHeader }],
    quantityText: [styles.quantityText, { color: isDark ? colors.lightHeader : colors.darkHeader }],
    price: [styles.price, { color: isDark ? colors.priceDarkDetails : colors.info }],
    separator: [styles.separator, { backgroundColor: isDark ? colors.lineDark : colors.nameCardDark }],
    sectionTitle: [styles.sectionTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }],
    description: [styles.description, { color: isDark ? colors.border : colors.text }],
  }), [isDark]);

  return (
    <>
      <View style={styles.titleContainer}>
        <Text style={styles_themed.title}>
          {product.title}
        </Text>
        {isOwner && (
          <TouchableOpacity onPress={onMenuPress}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={isDark ? colors.border : colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailRow}>
        <Text style={styles_themed.detailText}>
          ${product.price.toFixed(2)}
        </Text>
        <Text style={styles_themed.detailText}>
          {product.location.name}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles_themed.quantityButton}
            onPress={onDecrease}
          >
            <Text style={styles_themed.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles_themed.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles_themed.quantityButton}
            onPress={onIncrease}
          >
            <Text style={styles_themed.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles_themed.price}>
          ${totalPrice}
        </Text>
      </View>

      <View style={styles_themed.separator} />

      <Text style={styles_themed.sectionTitle}>
        Description
      </Text>
      <Text style={styles_themed.description}>
        {product.description}
      </Text>

      <View style={styles_themed.separator} />
    </>
  );
});

// Seller Info Component
export const SellerInfo = memo<SellerInfoProps>(({ product, isOwner }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleEmailPress = () => {
    if (product?.user?.email) {
      const { subject, body } = productInquiryTemplate(product.title);
      Linking.openURL(`mailto:${product.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
        .catch(() => Alert.alert('Error', 'Unable to open email client'));
    }
  };

  const styles_themed = useMemo(() => ({
    sectionTitle: [styles.sectionTitle, { color: isDark ? colors.lightHeader : colors.darkHeader }],
    sellerText: [styles.sellerText, { color: isDark ? colors.border : colors.text }],
    emailButton: [styles.emailButton, { backgroundColor: isDark ? colors.primary : colors.primaryDark }],
    separator: [styles.separator, { backgroundColor: isDark ? colors.lineDark : colors.nameCardDark }],
  }), [isDark]);

  return (
    <>
      <Text style={styles_themed.sectionTitle}>
        Seller Information
      </Text>

      <View style={styles.sellerContainer}>
        <View style={styles.sellerInfo}>
          <MaterialCommunityIcons
            name="account-circle"
            size={24}
            color={isDark ? colors.border : colors.text}
          />
          <Text style={styles_themed.sellerText}>
            {product.user.email}
          </Text>
        </View>

        {!isOwner && (
          <TouchableOpacity
            style={styles_themed.emailButton}
            onPress={handleEmailPress}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={colors.lightHeader}
            />
            <Text style={styles.emailButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles_themed.separator} />
    </>
  );
});

// Location Map Component
export const LocationMap = memo<LocationMapProps>(({ product }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle, 
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  return (
    <>
      <Text style={sectionTitleStyle}>
        Location
      </Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: product.location.latitude,
            longitude: product.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: product.location.latitude,
              longitude: product.location.longitude,
            }}
            title={product.title}
            description={product.location.name}
          />
        </MapView>
      </View>
    </>
  );
});

// Owner Menu Component
export const OwnerMenu = memo<OwnerMenuProps>(({ visible, onClose, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const menuStyles = useMemo(() => ({
    menuContainer: [
      styles.menuContainer,
      {
        backgroundColor: isDark ? colors.darkCard : colors.light,
        shadowColor: isDark ? colors.lightHeader : colors.darkHeader
      }
    ],
    menuItemText: [styles.menuItemText, { color: isDark ? colors.border : colors.text }],
    menuSeparator: [styles.menuSeparator, { backgroundColor: isDark ? colors.lineDark : colors.nameCardDark }],
  }), [isDark]);

  const handleDelete = () => {
    onClose();
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={menuStyles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onEdit}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color={isDark ? colors.border : colors.text}
            />
            <Text style={menuStyles.menuItemText}>
              Edit
            </Text>
          </TouchableOpacity>
          <View style={menuStyles.menuSeparator} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={colors.error}
            />
            <Text style={[menuStyles.menuItemText, { color: colors.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

// Error Display Component
export const ErrorDisplay = memo<ErrorDisplayProps>(({ 
  isNotFound, 
  errorMessage, 
  onRetry, 
  onGoBack 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.emptyContainer, 
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  const textStyle = useMemo(() => [
    styles.emptyText,
    { color: isDark ? colors.notFoundDark : colors.notFoundLight }
  ], [isDark]);

  const buttonStyle = useMemo(() => [
    styles.retryButton,
    { backgroundColor: isDark ? colors.primary : colors.primaryDark }
  ], [isDark]);

  if (isNotFound) {
    return (
      <View style={containerStyle}>
        <MaterialCommunityIcons
          name="package-variant-closed-remove"
          size={80}
          color={isDark ? colors.notFoundDark : colors.notFoundLight}
        />
        <Text style={textStyle}>
          {getProductErrorMessage('Product not found')}
        </Text>
        <TouchableOpacity
          style={buttonStyle}
          onPress={onGoBack}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={containerStyle}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={60}
          color={isDark ? colors.notFoundDark : colors.notFoundLight}
        />
        <Text style={textStyle}>
          {errorMessage}
        </Text>
        <TouchableOpacity
          style={buttonStyle}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <MaterialCommunityIcons
        name="emoticon-sad-outline"
        size={60}
        color={isDark ? colors.notFoundDark : colors.notFoundLight}
      />
      <Text style={textStyle}>
        Product not found
      </Text>
    </View>
  );
});

// Action Button Component
export const ActionButton = memo<ActionButtonProps>(({ 
  onAddToCart, 
  isOwner 
}) => {
  if (isOwner) return null;

  return (
    <TouchableOpacity
      style={[styles.addButton, { backgroundColor: colors.success }]}
      onPress={onAddToCart}
    >
      <Text style={styles.addButtonText}>Add to Cart</Text>
    </TouchableOpacity>
  );
});

// Styles
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: PRODUCT_DETAILS_CONSTANTS.CONTENT_PADDING,
    paddingBottom: PRODUCT_DETAILS_CONSTANTS.BOTTOM_PADDING,
  },
  swiper: {
    flex: 0,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiperImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 25,
    flex: 1,
    textAlign: 'left',
    fontFamily: fonts.Bold,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: fonts.semiBold,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
  sellerContainer: {
    marginBottom: 16,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerText: {
    fontSize: 16,
    marginLeft: 8,
    fontFamily: fonts.regular,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  emailButtonText: {
    color: colors.lightHeader,
    fontSize: 16,
    marginLeft: 8,
    fontFamily: fonts.semiBold,
  },
  mapContainer: {
    height: PRODUCT_DETAILS_CONSTANTS.MAP_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addButton: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightHeader,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.lightHeader,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: 150,
    borderRadius: 8,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: fonts.regular,
  },
  menuSeparator: {
    height: 1,
    marginVertical: 4,
  },
});