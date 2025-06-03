import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Prediction } from '../types/types';
import Geocoder from 'react-native-geocoding';
import { useTheme } from '../contexts/ThemeContext';
import { GOOGLE_PLACES_API_BASE_URL, GOOGLE_MAPS_API_KEY } from '../api/apiClient';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MapsScreen'>;

Geocoder.init(GOOGLE_MAPS_API_KEY);

const MapsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'MapsScreen'>>();
  const { onLocationSelected } = route.params;

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 34.25035287879607,
    longitude: 35.665381111029156,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  // Fetch place predictions from Google Places Autocomplete API
  const fetchPredictions = async (input: string) => {
    if (!input) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }
    try {
      const url = `${GOOGLE_PLACES_API_BASE_URL}/autocomplete/json?key=${GOOGLE_MAPS_API_KEY}&input=${encodeURIComponent(
        input
      )}&types=geocode&language=en`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK') {
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
  };

  // Handle user typing in search bar
  const onChangeSearch = (text: string) => {
    setSearchText(text);
    fetchPredictions(text);
  };

  // Handle selecting a place prediction
  const onSelectPrediction = async (placeId: string, description: string) => {
    Keyboard.dismiss();
    setSearchText(description);
    setShowPredictions(false);

    try {
      const url = `${GOOGLE_PLACES_API_BASE_URL}/details/json?key=${GOOGLE_MAPS_API_KEY}&place_id=${placeId}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK') {
        const location = json.result.geometry.location;
        setSelectedLocation({
          name: description,
          latitude: location.lat,
          longitude: location.lng,
        });
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
    }
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const response = await Geocoder.from({ latitude, longitude });
      let address = response.results[0]?.formatted_address || 'Unknown Location';

      // Clean address
      address = address.replace(/^[A-Z0-9+]+ /, '');
      address = address.replace(/, , /g, ', ');
      address = address.replace(/, $/, '');

      setSelectedLocation({
        name: address,
        latitude,
        longitude,
      });
      setSearchText(address);
    } catch (error) {
      setSelectedLocation({
        name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        latitude,
        longitude,
      });
      setSearchText(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    }
    setShowPredictions(false);
  };

  const handleApply = () => {
    if (selectedLocation && onLocationSelected) {
      onLocationSelected(selectedLocation);
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkHeader : colors.background }]}>
      {/* Header with back and title */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.darkHeader : colors.background, borderBottomColor: isDark ? colors.darkSearchbar : '#eee' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDark ? colors.lightHeader : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.lightHeader : '#000' }]}>Select Location</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.darkSearchbar : colors.lightSearchbar }]}>
        <Icon
          name="search"
          size={20}
          color={isDark ? colors.darkSearch : colors.lightSearch}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: isDark ? colors.lightHeader : colors.darkHeader }]}
          placeholder="Search for location..."
          placeholderTextColor={isDark ? colors.darkSearch : colors.lightSearch}
          value={searchText}
          onChangeText={onChangeSearch}
          autoCorrect={false}
          autoCapitalize="none"
          onFocus={() => setShowPredictions(true)}
        />
        {searchText ? (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              setPredictions([]);
              setShowPredictions(false);
            }}
          >
            <Icon
              name="close"
              size={20}
              color={isDark ? colors.darkSearch : colors.lightSearch}
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Predictions List */}
      {showPredictions && predictions.length > 0 && (
        <View style={[styles.predictionsContainer, { backgroundColor: isDark ? colors.darkSearchbar : colors.background }]}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.predictionItem, { borderBottomColor: isDark ? colors.darkSearch : '#ccc' }]}
                onPress={() => onSelectPrediction(item.place_id, item.description)}
              >
                <Text style={{ color: isDark ? colors.lightHeader : colors.darkHeader }}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Map */}
      <MapView
        style={styles.map}
        provider="google"
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      {/* Apply button */}
      <TouchableOpacity
        style={[
          styles.applyButton,
          { backgroundColor: isDark ? colors.primaryDark : colors.primaryDark },
          !selectedLocation && styles.disabledButton,
        ]}
        onPress={handleApply}
        disabled={!selectedLocation}
      >
        <Text style={[styles.applyButtonText, { color: colors.background }]}>Apply Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const darkMapStyle = [
  // same dark style as before...
  { elementType: 'geometry', stylers: [{ color: colors.geometry }] },
  { elementType: 'labels.text.fill', stylers: [{ color: colors.labelstextfill }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: colors.labelstextstroke }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: colors.administrativelocality }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: colors.administrativelocality }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: colors.poipark }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: colors.road }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: colors.roadstroke }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: colors.roadtextfill }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: colors.transit }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: colors.water }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
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
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    height: 45,
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
    top: 120,
    left: 20,
    right: 20,
    maxHeight: 200,
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
    bottom: 30,
    left: 20,
    right: 20,
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



export default MapsScreen;