export const fonts = {
    regular: 'Poppins-Regular',
    semiBold: 'Poppins-SemiBold',
    Bold: 'Poppins-Bold',
    light: 'Poppins-Light',
    blackItalic: 'Poppins-BlackItalic',
    black: 'Poppins-Black',
    italic: 'Poppins-Italic',
    thin: 'Poppins-Thin',
    thinItalic: 'Poppins-ThinItalic',
    extraBold: 'Poppins-ExtraBold',
    extraLight: 'Poppins-ExtraLight',
    extraLightItalic: 'Poppins-ExtraLightItalic',
    extraBoldItalic: 'Poppins-ExtraBoldItalic',
    medium: 'Poppins-Medium',

};

export const colors = {
    primary: '#007BFF',
    success: '#34C759',
    background: '#ffffff',
    textPrimary: '#000000',
    textSecondary: '#555555',
    text: '#555',
    border: '#ccc',
    inputBackground: '#f9f9f9',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#007AFF',
    light: '#f0f0f0',
    darkHeader: '#000000',
    lightHeader: '#ffffff',
    darkCard: '#0a0a0a',
    lightCard: '#f9f9f9',
    nameCardDark: '#eee',
    nameCardLight: '#333333',
    priceDark: '#FFD700',   
    darkSearchbar: '#222',
    lightSearchbar: '#f0f0f0',
    darkSearch: '#999',
    lightSearch: '#666',
    notFoundDark: '#888',
    notFoundLight: '#999',
    priceDarkDetails: '#0af',
    lineDark: '#444',
    imageBackground: '#f8f8f8',
    avatarContainerBackground: '#e1e1e1',
    gray: '#808080',
    disabled: '#d3d3d3',
    icon: '#000000',
    SuccessToast: '#4CAF50',
    ErrorToast: '#F44336',

    darkBackground: '#121212',
    darkText: '#ffffff',
    darkTextSecondary: '#aaaaaa',
    darkBorder: '#333333',
    darkInputBackground: '#1e1e1e',
    darkIcon: '#ffffff',
    darkPlaceholder: '#666666',
    darkError: '#ff4444',
    darkPrimary: '#0a84ff',
    darkSuccess: '#2e7d32',
    darkWarning: '#ff8f00',
    darkInfo: '#1565c0',
    danger: '#FF3B30',           
    primaryDark: '#005BB5',
    lightText: '#E0E0E0',
    primaryLight: '#66B2FF',
    semitransparentwhite: '#ffffffcc',
    geometry: '#242f3e',
    labelstextfill:'#746855',
    labelstextstroke: '#242f3e',
    administrativelocality: '#d59563',
    poipark:'#263c3f',
    road: '#38414e',
    roadstroke: '#212a37',
    roadtextfill: '#9ca5b3',
    transit: '#2f3948',
    water: '#17263c',

    lightPlaceholder: '#999999',
    darkHighlight: '#1a1a1a',
    darkHeaderText: '#ffffff',
    lightHighlight: '#f0f0f0',

    placeholderBackground: '#e0e0e0',
    cartIconBgDarkColor: '#00000066',
    cartIconBgLightColor: '#ffffffb3',
    accent: '#FF4081',

    



};

export type Theme = {
    colors: {
        background: string;
        text: string;
        textSecondary: string;
        primary: string;
        border: string;
        inputBackground: string;
        error: string;
        success: string;
        warning: string;
        info: string;
        icon: string;
        placeholder: string;
        header: string;
        card: string;
    };
    fonts: typeof fonts;
};

export const lightTheme: Theme = {
    colors: {
        background: colors.background,
        text: colors.textPrimary,
        textSecondary: colors.textSecondary,
        primary: colors.primary,
        border: colors.border,
        inputBackground: colors.inputBackground,
        error: colors.error,
        success: colors.success,
        warning: colors.warning,
        info: colors.info,
        icon: colors.icon,
        placeholder: colors.textSecondary,
        header: colors.lightHeader,
        card: colors.lightCard,
    },
    fonts,
};

export const darkTheme: Theme = {
    colors: {
        background: colors.darkBackground,
        text: colors.darkText,
        textSecondary: colors.darkTextSecondary,
        primary: colors.darkPrimary,
        border: colors.darkBorder,
        inputBackground: colors.darkInputBackground,
        error: colors.darkError,
        success: colors.darkSuccess,
        warning: colors.darkWarning,
        info: colors.darkInfo,
        icon: colors.darkIcon,
        placeholder: colors.darkPlaceholder,
        header: colors.darkHeader,
        card: colors.darkCard,
    },
    fonts,
};