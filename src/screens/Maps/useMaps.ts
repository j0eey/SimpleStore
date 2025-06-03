import { useState, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Region, MapPressEvent } from 'react-native-maps';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geocoder from 'react-native-geocoding';
import { RootStackParamList, Prediction } from '../../types/types';
import { LocationData } from './types';
import { GOOGLE_PLACES_API_BASE_URL, GOOGLE_MAPS_API_KEY } from '../../api/apiClient';
import { MAPS_CONSTANTS, MAPS_MESSAGES, GOOGLE_PLACES_ENDPOINTS, GOOGLE_PLACES_PARAMS } from './constants';

// Types
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MapsScreen'>;


// Initialize Geocoder
Geocoder.init(GOOGLE_MAPS_API_KEY);

export const useMaps = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'MapsScreen'>>();
  const { onLocationSelected } = route.params;

  // State
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [region, setRegion] = useState<Region>(MAPS_CONSTANTS.DEFAULT_REGION);
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  // Google Places API functions
  const fetchPredictions = useCallback(async (input: string) => {
    if (!input) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      const url = `${GOOGLE_PLACES_API_BASE_URL}${GOOGLE_PLACES_ENDPOINTS.AUTOCOMPLETE}?key=${GOOGLE_MAPS_API_KEY}&input=${encodeURIComponent(
        input
      )}&types=${GOOGLE_PLACES_PARAMS.TYPES}&language=${GOOGLE_PLACES_PARAMS.LANGUAGE}`;
      
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === GOOGLE_PLACES_PARAMS.STATUS_OK) {
        setPredictions(json.predictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      setPredictions([]);
      setShowPredictions(false);
    }
  }, []);

  const fetchPlaceDetails = useCallback(async (placeId: string) => {
    try {
      const url = `${GOOGLE_PLACES_API_BASE_URL}${GOOGLE_PLACES_ENDPOINTS.DETAILS}?key=${GOOGLE_MAPS_API_KEY}&place_id=${placeId}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === GOOGLE_PLACES_PARAMS.STATUS_OK) {
        const location = json.result.geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  // Address cleaning utility
  const cleanAddress = useCallback((address: string): string => {
    let cleanedAddress = address;
    // Remove leading alphanumeric codes
    cleanedAddress = cleanedAddress.replace(/^[A-Z0-9+]+ /, '');
    // Remove double commas with spaces
    cleanedAddress = cleanedAddress.replace(/, , /g, ', ');
    // Remove trailing comma
    cleanedAddress = cleanedAddress.replace(/, $/, '');
    return cleanedAddress;
  }, []);

  // Reverse geocoding
  const reverseGeocode = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await Geocoder.from({ latitude, longitude });
      let address = response.results[0]?.formatted_address || MAPS_MESSAGES.UNKNOWN_LOCATION;
      return cleanAddress(address);
    } catch (error) {
      return `${MAPS_MESSAGES.LOCATION_PREFIX} (${latitude.toFixed(MAPS_CONSTANTS.COORDINATE_DECIMAL_PLACES)}, ${longitude.toFixed(MAPS_CONSTANTS.COORDINATE_DECIMAL_PLACES)})`;
    }
  }, [cleanAddress]);

  // Event handlers
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    fetchPredictions(text);
  }, [fetchPredictions]);

  const handlePredictionSelect = useCallback(async (placeId: string, description: string) => {
    Keyboard.dismiss();
    setSearchText(description);
    setShowPredictions(false);

    const coordinates = await fetchPlaceDetails(placeId);
    if (coordinates) {
      setSelectedLocation({
        name: description,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      setRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: MAPS_CONSTANTS.SEARCH_REGION.latitudeDelta,
        longitudeDelta: MAPS_CONSTANTS.SEARCH_REGION.longitudeDelta,
      });
    }
  }, [fetchPlaceDetails]);

  const handleMapPress = useCallback(async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    const address = await reverseGeocode(latitude, longitude);
    
    setSelectedLocation({
      name: address,
      latitude,
      longitude,
    });
    setSearchText(address);
    setShowPredictions(false);
  }, [reverseGeocode]);

  const handleSearchClear = useCallback(() => {
    setSearchText('');
    setPredictions([]);
    setShowPredictions(false);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setShowPredictions(true);
  }, []);

  const handleApply = useCallback(() => {
    if (selectedLocation && onLocationSelected) {
      onLocationSelected(selectedLocation);
      navigation.goBack();
    }
  }, [selectedLocation, onLocationSelected, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    // State
    selectedLocation,
    region,
    searchText,
    predictions,
    showPredictions,
    
    // Handlers
    setRegion,
    handleSearchChange,
    handlePredictionSelect,
    handleMapPress,
    handleSearchClear,
    handleSearchFocus,
    handleApply,
    handleGoBack,
  };
};