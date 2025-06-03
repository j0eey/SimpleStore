import React from 'react';
import { useMaps } from './useMaps';
import { MainContainer, Header, SearchBar, PredictionsList, MapContainer, ApplyButton } from './MapsComponents';

const MapsScreen = () => {
  // Custom hook for all maps logic
  const {
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
  } = useMaps();

  return (
    <MainContainer>
      <Header onGoBack={handleGoBack} />
      
      <SearchBar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        onSearchFocus={handleSearchFocus}
      />
      
      <PredictionsList
        predictions={predictions}
        showPredictions={showPredictions}
        onPredictionSelect={handlePredictionSelect}
      />
      
      <MapContainer
        region={region}
        selectedLocation={selectedLocation}
        onRegionChange={setRegion}
        onMapPress={handleMapPress}
      />
      
      <ApplyButton
        selectedLocation={selectedLocation}
        onApply={handleApply}
      />
    </MainContainer>
  );
};

export default MapsScreen;