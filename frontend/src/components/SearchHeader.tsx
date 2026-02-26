import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import FilterIcon from "../../assets/icons/filter.svg";
import SearchIcon from "../../assets/icons/search-outline.svg";

import { Chip } from "./Chip";

import type { FilterState } from "./FiltersModal";

export type SearchHeaderProps = {
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
  recentSearches: string[];
  setRecentSearches: (recentSearches: string[]) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  isFiltersEmpty: (filters: FilterState) => boolean;
  convertFiltersToArray: (filters: FilterState) => string[];
  removeFilter: (filters: FilterState, filterToRemove: string) => FilterState;
  addToRecentSearches: (searchQuery: string, recentSearches: string[]) => string[];
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
          onBlur={() => {
            if (searchText.trim() !== "") {
              setRecentSearches(addToRecentSearches(searchText, recentSearches));
            }
          }}
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
      {isSearching && searchText === "" && recentSearches.length !== 0 && (
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

const styles = StyleSheet.create({
  searchBar: {
    display: "flex",
    flexDirection: "row",
    height: 43,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    // boxShadow: "0 0 4px 0 rgba(0, 0, 0, 0.20)", // React Native uses shadow styles, not boxShadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 8,
  },
  recentSearchesContainer: {
    display: "flex",
    alignSelf: "stretch",
  },
  recentSearchesTextContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recentSearchesChipsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  recentSearchesChipsContentContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    paddingEnd: 16,
    paddingVertical: 8,
  },
  smallText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 21,
    letterSpacing: 0.28,
  },
  clearAllText: {
    color: "#B4B4B4",
    fontSize: 14,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  filtersContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  filtersContentContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    paddingEnd: 16,
    paddingVertical: 8,
  },
});
