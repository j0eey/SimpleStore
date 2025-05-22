import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { RouteProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useRoute } from '@react-navigation/native';
import  Geocoder  from 'react-native-geocoding';

// Define the navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MapsScreen'>;

// Initialize Geocoder (replace with your actual API key)
Geocoder.init("AIzaSyCgmFqtBZFWykJ0QsVpswIsgoBNOrOpKD4");

const MapsScreen = () => {
    // Use the properly defined NavigationProp
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<RootStackParamList, 'MapsScreen'>>();
    const { onLocationSelected } = route.params;

    const [selectedLocation, setSelectedLocation] = useState<{
        name: string;
        latitude: number;
        longitude: number;
    } | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);

    const handleMapPress = async (event: MapPressEvent) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        
        setIsLoading(true);
        try {
            const response = await Geocoder.from({ latitude, longitude });
            let address = response.results[0]?.formatted_address || 'Unknown Location';
            
            // Clean up the address
            address = address.replace(/^[A-Z0-9+]+ /, ''); // Remove plus code
            address = address.replace(/, , /g, ', '); // Clean double commas
            address = address.replace(/, $/, ''); // Remove trailing comma
            
            setSelectedLocation({
                name: address,
                latitude,
                longitude,
            });
        } catch (error) {
            console.error('Geocoding error:', error);
            setSelectedLocation({
                name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                latitude,
                longitude,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (selectedLocation && onLocationSelected) {
            onLocationSelected(selectedLocation);
            navigation.goBack();
        }
    };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
      </View>

      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: 34.25035287879607,
          longitude: 35.665381111029156,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}>
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      <TouchableOpacity
        style={[
          styles.applyButton,
          !selectedLocation && styles.disabledButton,
        ]}
        onPress={handleApply}
        disabled={!selectedLocation}>
        <Text style={styles.applyButtonText}>Apply Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    elevation: 4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  applyButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: colors.primaryDark,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapsScreen;