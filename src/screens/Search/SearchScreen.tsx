import React from 'react';
import { useSearch } from './useSearch';
import { MainContainer, SearchBar, SearchContent } from './SearchComponents';

const SearchScreen: React.FC = () => {
  const {
    searchState,
    theme,
    handleSearch,
    handleTextChange,
    handleClearSearch,
    handleProductPress,
  } = useSearch();

  return (
    <MainContainer theme={theme}>
      <SearchBar
        query={searchState.query}
        onTextChange={handleTextChange}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        theme={theme}
      />
      
      <SearchContent
        searchState={searchState}
        onProductPress={handleProductPress}
        theme={theme}
      />
    </MainContainer>
  );
};

export default SearchScreen;