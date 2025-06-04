// Note: Modern @testing-library/react-native has built-in matchers, no separate import needed

// Mock Dimensions globally - this must be here for components that use Dimensions at module level
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
}));

// Mock PixelRatio - needed for StyleSheet
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  roundToNearestPixel: jest.fn((value) => Math.round(value)),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((value) => value * 2),
}));

// Mock react-native module with all necessary components and modules
jest.mock('react-native', () => {
  // Mock StyleSheet to avoid PixelRatio issues
  const MockStyleSheet = {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    compose: jest.fn((style1, style2) => [style1, style2]),
    hairlineWidth: 1,
    absoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  };

  // Return complete mock without spreading actual RN to avoid conflicts
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((options) => options.ios),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    StyleSheet: MockStyleSheet,
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    Image: 'Image',
    TextInput: 'TextInput',
    Alert: {
      alert: jest.fn(),
    },
    Animated: {
      View: 'Animated.View',
      Text: 'Animated.Text',
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => 'mocked-interpolation'),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(),
      })),
      delay: jest.fn(() => ({
        start: jest.fn(),
      })),
    },
    Linking: {
      getInitialURL: jest.fn(() => Promise.resolve(null)),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      openURL: jest.fn(() => Promise.resolve()),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: 'Swipeable',
  DrawerLayout: 'DrawerLayout',
  State: {},
  ScrollView: 'ScrollView',
  Slider: 'Slider',
  Switch: 'Switch',
  TextInput: 'TextInput',
  ToolbarAndroid: 'ToolbarAndroid',
  ViewPagerAndroid: 'ViewPagerAndroid',
  DrawerLayoutAndroid: 'DrawerLayoutAndroid',
  WebView: 'WebView',
  NativeViewGestureHandler: 'NativeViewGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  FlingGestureHandler: 'FlingGestureHandler',
  ForceTouchGestureHandler: 'ForceTouchGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  PanGestureHandler: 'PanGestureHandler',
  PinchGestureHandler: 'PinchGestureHandler',
  RotationGestureHandler: 'RotationGestureHandler',
  RawButton: 'RawButton',
  BaseButton: 'BaseButton',
  RectButton: 'RectButton',
  BorderlessButton: 'BorderlessButton',
  FlatList: 'FlatList',
  gestureHandlerRootHOC: jest.fn(),
  Directions: {},
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  return (props) => {
    return React.createElement('Icon', {
      ...props,
      testID: 'vector-icon',
    });
  };
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useIsFocused: () => true,
}));

// Mock axios
jest.mock('axios');

// Mock react-native-config with all required keys
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'https://test-api.simplestore.com',
  ONESIGNAL_APP_ID: 'test-app-id-12345',
  ONESIGNAL_REST_API_KEY: 'test-rest-api-key-12345',
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => {
  const React = require('react');
  
  const MockBaseToast = (props) => {
    return React.createElement('View', { testID: 'mock-base-toast' }, [
      props.text1 ? React.createElement('Text', { key: 'text1' }, props.text1) : null,
      props.text2 ? React.createElement('Text', { key: 'text2' }, props.text2) : null,
    ]);
  };
  
  const MockErrorToast = (props) => {
    return React.createElement('View', { testID: 'mock-error-toast' }, [
      props.text1 ? React.createElement('Text', { key: 'text1' }, props.text1) : null,
      props.text2 ? React.createElement('Text', { key: 'text2' }, props.text2) : null,
    ]);
  };
  
  return {
    show: jest.fn(),
    hide: jest.fn(),
    BaseToast: MockBaseToast,
    ErrorToast: MockErrorToast,
  };
});

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  
  const MockFastImage = (props) => {
    return React.createElement('Image', {
      ...props,
      testID: 'fast-image',
    });
  };
  
  MockFastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  
  return {
    __esModule: true,
    default: MockFastImage,
    resizeMode: MockFastImage.resizeMode,
  };
});

// Mock lottie-react-native
jest.mock('lottie-react-native', () => {
  const React = require('react');
  return (props) => {
    return React.createElement('LottieView', {
      ...props,
      testID: 'lottie-animation',
    });
  };
});

// Mock other common React Native modules that might be used
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
  show: jest.fn(),
  getVisibilityStatus: jest.fn(() => Promise.resolve('hidden')),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
}));

// Mock react-native-onesignal if used
jest.mock('react-native-onesignal', () => ({
  setAppId: jest.fn(),
  promptForPushNotificationsWithUserResponse: jest.fn(),
  addTrigger: jest.fn(),
  removeTrigger: jest.fn(),
  getTriggers: jest.fn(),
  setExternalUserId: jest.fn(),
  removeExternalUserId: jest.fn(),
}));

// Mock global fetch for API tests
const mockFetch = jest.fn();
(globalThis).fetch = mockFetch;