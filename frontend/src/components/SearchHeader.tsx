import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import FilterIcon from "../../assets/icons/filter.svg";
import SearchIcon from "../../assets/icons/search-outline.svg";

import { Chip } from "./Chip";
import { styles } from "./SearchHeader.styles";

import type { FilterState } from "./FiltersModal";

export type SearchHeaderProps = {
  readonly isSearching: boolean;
  readonly setIsSearching: (isSearching: boolean) => void;
  readonly searchText: string;
  readonly setSearchText: (text: string) => void;
  readonly setShowFilterModal: (show: boolean) => void;
  readonly recentSearches: string[];
  readonly setRecentSearches: (recentSearches: string[]) => void;
  readonly filters: FilterState;
  readonly setFilters: (filters: FilterState) => void;
  readonly isFiltersEmpty: (filters: FilterState) => boolean;
  readonly convertFiltersToArray: (filters: FilterState) => string[];
  readonly removeFilter: (filters: FilterState, filterToRemove: string) => FilterState;
  readonly addToRecentSearches: (searchQuery: string, recentSearches: string[]) => string[];
};

export function SearchHeader({
  isSearching,
  setIsSearching,
  searchText,
  setSearchText,
  setShowFilterModal,
  recentSearches,
  setRecentSearches,
  filters,
  setFilters,
  isFiltersEmpty,
  convertFiltersToArray,
  removeFilter,
  addToRecentSearches,
}: SearchHeaderProps) {
  const handleSearchFinalize = () => {
    if (searchText.trim() !== "") {
      setRecentSearches(addToRecentSearches(searchText, recentSearches));
    }
    setIsSearching(false);
  };

  return (
    <>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        {!isSearching && <SearchIcon width={24} height={24} color="#153A7A" />}
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          placeholder="Search activities"
          onFocus={() => setIsSearching(true)}
          onBlur={handleSearchFinalize}
          onSubmitEditing={handleSearchFinalize}
        />
        <FilterIcon
          width={24}
          height={24}
          color="#153A7A"
          onPress={() => {
            setShowFilterModal(true);
          }}
        />
      </View>
      {/* Recent Searches */}
      {isSearching && recentSearches.length !== 0 && (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentSearchesTextContainer}>
            <Text style={styles.smallText}>Recent Searches</Text>
            <TouchableOpacity
              onPress={() => {
                setRecentSearches([]);
              }}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.recentSearchesChipsContainer}
            contentContainerStyle={styles.recentSearchesChipsContentContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {recentSearches.map((search) => (
              <Chip
                key={search}
                label={search}
                onPress={() => {
                  setSearchText(search);
                  setRecentSearches(addToRecentSearches(search, recentSearches));
                }}
                onClose={() => {
                  setRecentSearches(recentSearches.filter((s) => s !== search));
                }}
              />
            ))}
          </ScrollView>
        </View>
      )}
      {/* Filters */}
      {!isFiltersEmpty(filters) && (
        <View style={styles.filtersContainer}>
          <Text style={styles.smallText}>Filters: </Text>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.filtersContentContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {convertFiltersToArray(filters).map((filter) => (
              <Chip
                key={filter}
                label={filter}
                backgroundColor="#153A7A"
                textColor="#FFFFFF"
                onClose={() => {
                  setFilters(removeFilter(filters, filter));
                }}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
}
