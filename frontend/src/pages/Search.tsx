import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import FilterIcon from "../../assets/icons/filter.svg";
import SearchIcon from "../../assets/icons/search.svg";
import { ActivityList } from "../components/ActivityList";
import { Chip } from "../components/Chip";
import { FiltersModal } from "../components/FiltersModal";
import { TempNavBar } from "../components/TempNavBar";
import { mockActivities } from "../data/mockActivities";

import type { FiltersState } from "../components/FiltersModal";
import type { Category } from "../types/activity";

const categories: Category[] = [
  "Opener",
  "Icebreaker",
  "Active",
  "Connection",
  "Debrief",
  "Team Challenge",
];

const defaultFilters: FiltersState = {
  category: undefined,
  setupProps: undefined,
  duration: [],
  gradeLevel: [],
  groupSize: [],
  energyLevel: null,
  environment: [],
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    display: "flex",
    paddingTop: 64,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  content: {
    flex: 1,
    display: "flex",
    width: 342,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
    paddingBottom: 150,
  },
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
    boxShadow: "0 0 4px 0 rgba(0, 0, 0, 0.20)",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 8,
  },
  recentSearchesContainer: {
    display: "flex",
    alignSelf: "stretch",
    gap: 10,
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
  smallText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: 21,
    letterSpacing: 0.28,
  },
  clearAllText: {
    color: "#B4B4B4",
    fontSize: 14,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  activityNumberText: {
    color: "#B4B4B4",
    fontSize: 14,
  },
  filtersContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  activityListContainer: {
    display: "flex",
    alignSelf: "stretch",
  },
  categoryCardsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignSelf: "stretch",
  },
  categoryCard: {
    width: 167,
    height: 173,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryCardText: {
    color: "#000",
    fontSize: 14,
  },
});

function isFiltersEmpty(filters: FiltersState): boolean {
  return (
    !filters.category &&
    !filters.setupProps &&
    (filters.duration ?? []).length === 0 &&
    (filters.gradeLevel ?? []).length === 0 &&
    (filters.groupSize ?? []).length === 0 &&
    !filters.energyLevel &&
    (filters.environment ?? []).length === 0
  );
}

function convertFiltersToArray(filters: FiltersState): string[] {
  const result: string[] = [];
  if (filters.category) result.push(filters.category);
  if (filters.setupProps) result.push(filters.setupProps);
  if (filters.duration) result.push(...filters.duration);
  if (filters.gradeLevel) result.push(...filters.gradeLevel);
  if (filters.groupSize) result.push(...filters.groupSize);
  if (filters.environment) result.push(...filters.environment);
  if (filters.energyLevel && filters.energyLevel !== null)
    result.push(`Energy Level: ${filters.energyLevel}`);
  return result;
}

function removeFilter(filters: FiltersState, filterToRemove: string): FiltersState {
  const newFilters: FiltersState = { ...filters };
  if (filters.category === filterToRemove) {
    newFilters.category = undefined;
  } else if (filters.setupProps === filterToRemove) {
    newFilters.setupProps = undefined;
  } else if (filters.duration?.includes(filterToRemove)) {
    newFilters.duration = filters.duration.filter((d) => d !== filterToRemove);
  } else if (filters.gradeLevel?.includes(filterToRemove)) {
    newFilters.gradeLevel = filters.gradeLevel.filter((g) => g !== filterToRemove);
  } else if (filters.groupSize?.includes(filterToRemove)) {
    newFilters.groupSize = filters.groupSize.filter((g) => g !== filterToRemove);
  } else if (["Indoor", "Outdoor", "Both"].includes(filterToRemove)) {
    newFilters.environment = (filters.environment ?? []).filter((e) => e !== filterToRemove);
  } else if (filterToRemove.startsWith("Energy Level: ")) {
    newFilters.energyLevel = null;
  }
  return newFilters;
}

export function SearchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(["test1", "test2", "test3"]);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  const filteredActivities = mockActivities.filter((activity) => {
    if (filters.category && activity.category !== filters.category) {
      return false;
    }

    if (filters.setupProps) {
      if (filters.setupProps === "Props" && activity.materials.length === 0) {
        return false;
      }
      if (filters.setupProps === "No Props" && activity.materials.length > 0) {
        return false;
      }
    }

    if (
      filters.duration &&
      filters.duration.length > 0 &&
      !filters.duration.includes(activity.duration)
    ) {
      return false;
    }

    if (
      filters.gradeLevel &&
      filters.gradeLevel.length > 0 &&
      !filters.gradeLevel.includes(activity.gradeLevel)
    ) {
      return false;
    }

    if (
      filters.groupSize &&
      filters.groupSize.length > 0 &&
      !filters.groupSize.includes(activity.groupSize)
    ) {
      return false;
    }

    if (
      filters.environment &&
      filters.environment.length > 0 &&
      !filters.environment.includes(activity.environment)
    ) {
      return false;
    }

    if (filters.energyLevel && activity.energyLevel !== filters.energyLevel) {
      return false;
    }

    return activity.title.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <View style={styles.page}>
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          {!isSearching && <SearchIcon width={24} height={24} color="#153A7A" />}
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            placeholder="Search activities"
            onFocus={() => setIsSearching(true)}
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
        {isSearching &&
          searchText === "" &&
          recentSearches.length !== 0 &&
          isFiltersEmpty(filters) && (
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
              <View style={styles.recentSearchesChipsContainer}>
                {recentSearches.map((search) => (
                  <Chip
                    key={search}
                    label={search}
                    onPress={() => {
                      setSearchText(search);
                    }}
                    onClose={() => {
                      setRecentSearches(recentSearches.filter((s) => s !== search));
                    }}
                  />
                ))}
              </View>
            </View>
          )}

        {/* Filters */}
        {!isFiltersEmpty(filters) && (
          <View style={styles.filtersContainer}>
            <Text style={styles.smallText}>Filters: </Text>
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
          </View>
        )}

        {/* Activity or Category cards depending on search state */}
        {isSearching || searchText !== "" || !isFiltersEmpty(filters) ? (
          <View style={styles.activityListContainer}>
            <Text style={styles.activityNumberText}>
              {filteredActivities.length} activit{filteredActivities.length === 1 ? "y" : "ies"}{" "}
              found
            </Text>
            <ActivityList activities={filteredActivities} variant="card" />
          </View>
        ) : (
          <View>
            <Text style={styles.smallText}>Browse by category:</Text>
            <View style={styles.categoryCardsGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryCard}
                  onPress={() => setFilters({ ...filters, category })}
                >
                  <Text style={styles.categoryCardText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <FiltersModal
        visible={showFilterModal}
        initial={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onClose={() => setShowFilterModal(false)}
      />

      {/* TODO: replace with actual NavBar */}
      <TempNavBar />
    </View>
  );
}
