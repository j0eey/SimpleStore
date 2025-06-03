import { MapPressEvent, Region } from "react-native-maps";
import { Prediction } from "../../types/types";

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

export interface HeaderProps {
  onGoBack: () => void;
}

export interface SearchBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  onSearchClear: () => void;
  onSearchFocus: () => void;
}

export interface PredictionsListProps {
  predictions: Prediction[];
  showPredictions: boolean;
  onPredictionSelect: (placeId: string, description: string) => void;
}

export interface MapContainerProps {
  region: Region;
  selectedLocation: LocationData | null;
  onRegionChange: (region: Region) => void;
  onMapPress: (event: MapPressEvent) => void;
}

export interface ApplyButtonProps {
  selectedLocation: LocationData | null;
  onApply: () => void;
}

export interface MainContainerProps {
  children: React.ReactNode;
}