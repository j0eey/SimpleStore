import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/Theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type SelectLocationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SelectLocation'>;


const SelectLocationScreen = () => {
  const navigation = useNavigation<SelectLocationScreenNavigationProp>();

  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView>(null);

  // Default region (you can customize it)
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const onMapPress = (event: any) => {
    const coord: LatLng = event.nativeEvent.coordinate;
    setSelectedLocation({
      name: `Lat: ${coord.latitude.toFixed(5)}, Lng: ${coord.longitude.toFixed(5)}`,
      latitude: coord.latitude,
      longitude: coord.longitude,
    });
  };

  const onPlaceSelected = (data: any, details: any = null) => {
    if (!details?.geometry) return;
    const { location } = details.geometry;
    setSelectedLocation({
      name: data.description,
      latitude: location.lat,
      longitude: location.lng,
    });

    mapRef.current?.animateToRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      alert('Please select a location first');
      return;
    }
    navigation.navigate('AddNewProduct', { selectedLocation });
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search for places"
        fetchDetails
        onPress={onPlaceSelected}
        query={{
          key: 'AIzaSyCgmFqtBZFWykJ0QsVpswIsgoBNOrOpKD4', // <-- Put your Google API key here
          language: 'en',
        }}
        styles={{
          container: { flex: 0, position: 'absolute', width: '100%', zIndex: 1, top: 10, paddingHorizontal: 10 },
          textInputContainer: { backgroundColor: 'white', borderRadius: 8 },
          textInput: { height: 44, color: '#5d5d5d', fontSize: 16 },
          predefinedPlacesDescription: { color: '#1faadb' },
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={onMapPress}
      >
        {selectedLocation && (
          <Marker
            coordinate={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
            title={selectedLocation.name}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Ionicons name="checkmark" size={24} color="white" />
        <Text style={styles.confirmText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectLocationScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  confirmButton: {
    position: 'absolute',
    bottom: 30,
    left: '10%',
    right: '10%',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '600',
  },
});
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

