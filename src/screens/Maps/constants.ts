import { colors } from '../../theme/Theme';

export const MAPS_CONSTANTS = {
  DEFAULT_REGION: {
    latitude: 34.25035287879607,
    longitude: 35.665381111029156,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  SEARCH_REGION: {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  HEADER_PADDING: 15,
  SEARCH_MARGIN: 20,
  SEARCH_HEIGHT: 45,
  PREDICTIONS_TOP: 120,
  PREDICTIONS_MAX_HEIGHT: 200,
  APPLY_BUTTON_BOTTOM: 30,
  COORDINATE_DECIMAL_PLACES: 4,
} as const;

export const MAPS_MESSAGES = {
  TITLE: 'Select Location',
  SEARCH_PLACEHOLDER: 'Search for location...',
  APPLY_BUTTON: 'Apply Location',
  UNKNOWN_LOCATION: 'Unknown Location',
  LOCATION_PREFIX: 'Location',
} as const;

export const GOOGLE_PLACES_ENDPOINTS = {
  AUTOCOMPLETE: '/autocomplete/json',
  DETAILS: '/details/json',
} as const;

export const GOOGLE_PLACES_PARAMS = {
  TYPES: 'geocode',
  LANGUAGE: 'en',
  STATUS_OK: 'OK',
} as const;

export const DARK_MAP_STYLE = [
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