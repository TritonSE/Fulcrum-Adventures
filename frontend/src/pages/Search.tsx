import { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import FilterIcon from "../../assets/icons/filter.svg";
import SearchIcon from "../../assets/icons/search.svg";
import { ActivityList } from "../components/ActivityList";
import { Chip } from "../components/Chip";
import { FiltersModal } from "../components/FiltersModal";
import { TempNavBar } from "../components/TempNavBar";
import { CATEGORIES as categories } from "../constants/filterOptions";
import { mockActivities } from "../data/mockActivities";

import type { FilterState } from "../components/FiltersModal";
import type { Activity } from "../types/activity";

const defaultFilters: FilterState = {
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
    paddingLeft: 2,
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
  activityListContainer: {
    display: "flex",
    alignSelf: "stretch",
    flex: 1,
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

function isFiltersEmpty(filters: FilterState): boolean {
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

function convertFiltersToArray(filters: FilterState): string[] {
  const result: string[] = [];
  if (filters.category) result.push(filters.category);
  if (filters.setupProps) result.push(filters.setupProps);
  if (filters.duration && filters.duration.length > 0) {
    filters.duration.forEach((range) => {
      result.push(`${range.min}-${range.max} min`);
    });
  }
  if (filters.gradeLevel && filters.gradeLevel.length > 0) {
    filters.gradeLevel.forEach((range) => {
      const gradeStart = range.min === 0 ? "K" : range.min.toString();
      const gradeEnd = range.max === 0 ? "K" : range.max.toString();
      result.push(`Grade ${gradeStart}-${gradeEnd}`);
    });
  }
  if (filters.groupSize && filters.groupSize.length > 0) {
    filters.groupSize.forEach((range) => {
      result.push(`${range.min}-${range.max} people`);
    });
  }
  if (filters.environment) result.push(...filters.environment);
  if (filters.energyLevel && filters.energyLevel !== null)
    result.push(`Energy Level: ${filters.energyLevel}`);
  return result;
}

function removeFilter(filters: FilterState, filterToRemove: string): FilterState {
  const newFilters: FilterState = { ...filters };
  if (filters.category === filterToRemove) {
    newFilters.category = undefined;
  } else if (filters.setupProps === filterToRemove) {
    newFilters.setupProps = undefined;
  } else if (filterToRemove.includes(" min")) {
    // Duration filter (e.g., "5-15 min")
    const match = /(\d+)-(\d+)/.exec(filterToRemove);
    if (match) {
      newFilters.duration = (filters.duration ?? []).filter(
        (d) => !(d.min === Number.parseInt(match[1]) && d.max === Number.parseInt(match[2])),
      );
    }
  } else if (filterToRemove.includes("Grade")) {
    // Grade level filter (e.g., "Grade K-2")
    // Extract grade range pattern
    const match = /Grade\s+([K\d]+)-([K\d]+)/.exec(filterToRemove);
    if (match) {
      const minGrade = match[1] === "K" ? 0 : Number.parseInt(match[1]);
      const maxGrade = match[2] === "K" ? 0 : Number.parseInt(match[2]);
      newFilters.gradeLevel = (filters.gradeLevel ?? []).filter(
        (g) => !(g.min === minGrade && g.max === maxGrade),
      );
    }
  } else if (filterToRemove.includes("people")) {
    // Group size filter (e.g., "3-15 people")
    const match = /(\d+)-(\d+)/.exec(filterToRemove);
    if (match) {
      newFilters.groupSize = (filters.groupSize ?? []).filter(
        (g) => !(g.min === Number.parseInt(match[1]) && g.max === Number.parseInt(match[2])),
      );
    }
  } else if (["Indoor", "Outdoor", "Both"].includes(filterToRemove)) {
    newFilters.environment = (filters.environment ?? []).filter((e) => e !== filterToRemove);
  } else if (filterToRemove.startsWith("Energy Level: ")) {
    newFilters.energyLevel = null;
  }
  return newFilters;
}

function addToRecentSearches(searchQuery: string, recentSearches: string[]): string[] {
  if (searchQuery.trim() === "") {
    return recentSearches;
  }

  // Remove the search if it already exists to avoid duplicates
  const filtered = recentSearches.filter((s) => s !== searchQuery);

  // Add to the beginning and limit to 10 recent searches
  return [searchQuery, ...filtered].slice(0, 3);
}

export function SearchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  const filteredActivities = activities.filter((activity) => {
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
      !filters.duration.some(
        (range) => !(activity.duration.max < range.min || activity.duration.min > range.max),
      )
    ) {
      return false;
    }

    if (
      filters.gradeLevel &&
      filters.gradeLevel.length > 0 &&
      !filters.gradeLevel.some(
        (range) => !(activity.gradeLevel.max < range.min || activity.gradeLevel.min > range.max),
      )
    ) {
      return false;
    }

    if (
      filters.groupSize &&
      filters.groupSize.length > 0 &&
      !filters.groupSize.some(
        (range) => !(activity.groupSize.max < range.min || activity.groupSize.min > range.max),
      )
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

  const handleSaveToggle = (id: string) => {
    setActivities((prevList) =>
      prevList.map((activity) =>
        activity.id === id ? { ...activity, isSaved: !activity.isSaved } : activity,
      ),
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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

          {/* Activity or Category cards depending on search state */}
          {isSearching || searchText !== "" || !isFiltersEmpty(filters) ? (
            <View style={styles.activityListContainer}>
              <Text style={styles.activityNumberText}>
                {filteredActivities.length} activit
                {filteredActivities.length === 1 ? "y" : "ies"} found
              </Text>
              <ActivityList
                activities={filteredActivities}
                variant="card"
                onSaveToggle={handleSaveToggle}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.smallText}>Browse by category:</Text>
              <View style={styles.categoryCardsGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryCard}
                    onPress={() => {
                      setFilters({ ...filters, category });
                      setRecentSearches(addToRecentSearches(category, recentSearches));
                    }}
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
    </TouchableWithoutFeedback>
  );
}
