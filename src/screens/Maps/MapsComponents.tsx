import React, { memo, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../theme/Theme';
import { Prediction } from '../../types/types';
import { HeaderProps, SearchBarProps, PredictionsListProps, MapContainerProps, ApplyButtonProps, MainContainerProps } from './types';
import { MAPS_CONSTANTS, MAPS_MESSAGES, DARK_MAP_STYLE } from './constants';

// Header Component
export const Header = memo<HeaderProps>(({ onGoBack }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const headerStyle = useMemo(() => [
    styles.header,
    {
      backgroundColor: isDark ? colors.darkHeader : colors.background,
      borderBottomColor: isDark ? colors.darkSearchbar : '#eee'
    }
  ], [isDark]);

  const titleStyle = useMemo(() => [
    styles.title,
    { color: isDark ? colors.lightHeader : '#000' }
  ], [isDark]);

  const iconColor = isDark ? colors.lightHeader : '#000';

  return (
    <View style={headerStyle}>
      <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color={iconColor} />
      </TouchableOpacity>
      <Text style={titleStyle}>{MAPS_MESSAGES.TITLE}</Text>
    </View>
  );
});

// Search Bar Component
export const SearchBar = memo<SearchBarProps>(({
  searchText,
  onSearchChange,
  onSearchClear,
  onSearchFocus,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.searchContainer,
    { backgroundColor: isDark ? colors.darkSearchbar : colors.lightSearchbar }
  ], [isDark]);

  const inputStyle = useMemo(() => [
    styles.searchInput,
    { color: isDark ? colors.lightHeader : colors.darkHeader }
  ], [isDark]);

  const iconColor = isDark ? colors.darkSearch : colors.lightSearch;
  const placeholderColor = isDark ? colors.darkSearch : colors.lightSearch;

  return (
    <View style={containerStyle}>
      <Icon
        name="search"
        size={20}
        color={iconColor}
        style={styles.searchIcon}
      />
      <TextInput
        style={inputStyle}
        placeholder={MAPS_MESSAGES.SEARCH_PLACEHOLDER}
        placeholderTextColor={placeholderColor}
        value={searchText || ''}
        onChangeText={onSearchChange}
        onFocus={onSearchFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        blurOnSubmit={false}
        keyboardType="default"
        textContentType="none"
        importantForAutofill="no"
      />
      {searchText ? (
        <TouchableOpacity onPress={onSearchClear} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon
            name="close"
            size={20}
            color={iconColor}
            style={styles.clearIcon}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

// Simple Prediction Item Component - NO HOOKS
const PredictionItem = ({ item, isDark, onPress }: { 
  item: Prediction; 
  isDark: boolean; 
  onPress: () => void; 
}) => {
  const itemStyle = [
    styles.predictionItem,
    { borderBottomColor: isDark ? colors.darkSearch : '#ccc' }
  ];
  const textColor = isDark ? colors.lightHeader : colors.darkHeader;

  return (
    <TouchableOpacity style={itemStyle} onPress={onPress}>
      <Text style={{ color: textColor }}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};

// Predictions List Component - Fixed
export const PredictionsList = memo<PredictionsListProps>(({
  predictions,
  showPredictions,
  onPredictionSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.predictionsContainer,
    { backgroundColor: isDark ? colors.darkSearchbar : colors.background }
  ], [isDark]);

  const renderPrediction = useCallback(({ item }: { item: Prediction }) => {
    return (
      <PredictionItem
        item={item}
        isDark={isDark}
        onPress={() => onPredictionSelect(item.place_id, item.description)}
      />
    );
  }, [isDark, onPredictionSelect]);

  if (!showPredictions || predictions.length === 0) {
    return null;
  }

  return (
    <View style={containerStyle}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={predictions}
        keyExtractor={(item) => item.place_id}
        renderItem={renderPrediction}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

// Map Container Component
export const MapContainer = memo<MapContainerProps>(({
  region,
  selectedLocation,
  onRegionChange,
  onMapPress,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapStyle = isDark ? DARK_MAP_STYLE : [];

  return (
    <MapView
      style={styles.map}
      provider="google"
      region={region}
      onRegionChangeComplete={onRegionChange}
      onPress={onMapPress}
      customMapStyle={mapStyle}
    >
      {selectedLocation && <Marker coordinate={selectedLocation} />}
    </MapView>
  );
});

// Apply Button Component
export const ApplyButton = memo<ApplyButtonProps>(({ selectedLocation, onApply }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const buttonStyle = useMemo(() => [
    styles.applyButton,
    {
      backgroundColor: isDark ? colors.primaryDark : colors.primaryDark,
    },
    !selectedLocation && styles.disabledButton,
  ], [isDark, selectedLocation]);

  const textStyle = useMemo(() => [
    styles.applyButtonText,
    { color: colors.background }
  ], []);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onApply}
      disabled={!selectedLocation}
    >
      <Text style={textStyle}>{MAPS_MESSAGES.APPLY_BUTTON}</Text>
    </TouchableOpacity>
  );
});

// Main Container Component
export const MainContainer = memo<MainContainerProps>(({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: isDark ? colors.darkHeader : colors.background }
  ], [isDark]);

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: MAPS_CONSTANTS.HEADER_PADDING,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: MAPS_CONSTANTS.SEARCH_MARGIN,
    marginTop: 10,
    marginBottom: 10,
    height: MAPS_CONSTANTS.SEARCH_HEIGHT,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  predictionsContainer: {
    position: 'absolute',
    top: MAPS_CONSTANTS.PREDICTIONS_TOP,
    left: MAPS_CONSTANTS.SEARCH_MARGIN,
    right: MAPS_CONSTANTS.SEARCH_MARGIN,
    maxHeight: MAPS_CONSTANTS.PREDICTIONS_MAX_HEIGHT,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 1000,
  },
  predictionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  map: {
    flex: 1,
  },
  applyButton: {
    position: 'absolute',
    bottom: MAPS_CONSTANTS.APPLY_BUTTON_BOTTOM,
    left: MAPS_CONSTANTS.SEARCH_MARGIN,
    right: MAPS_CONSTANTS.SEARCH_MARGIN,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});