import { useState } from "react";
import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";

import { ActivityList } from "../components/ActivityList";
import { CategoryCardBig } from "../components/CategoryCardBig";
import { FiltersModal } from "../components/FiltersModal";
import { Navbar } from "../components/Navbar";
import { SearchHeader } from "../components/SearchHeader";
import { CATEGORIES as categories } from "../constants/filterOptions";
import { mockActivities } from "../data/mockActivities";

import { styles } from "./Search.styles";

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

function matchesActivityFilter(
  activity: Activity,
  filters: FilterState,
  searchText: string,
): boolean {
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

  const filteredActivities = activities.filter((activity) =>
    matchesActivityFilter(activity, filters, searchText),
  );

  const handleSaveToggle = (id: string) => {
    setActivities((prevList) =>
      prevList.map((activity) =>
        activity.id === id ? { ...activity, isSaved: !activity.isSaved } : activity,
      ),
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setIsSearching(false);
      }}
      accessible={false}
    >
      <View style={styles.page}>
        <View style={styles.content}>
          <SearchHeader
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            searchText={searchText}
            setSearchText={setSearchText}
            setShowFilterModal={setShowFilterModal}
            recentSearches={recentSearches}
            setRecentSearches={setRecentSearches}
            filters={filters}
            setFilters={setFilters}
            isFiltersEmpty={isFiltersEmpty}
            convertFiltersToArray={convertFiltersToArray}
            removeFilter={removeFilter}
            addToRecentSearches={addToRecentSearches}
          />

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
                  <View key={category} style={{ width: "48%" }}>
                    <CategoryCardBig
                      category={category}
                      onPress={() => {
                        setFilters({ ...filters, category });
                        setRecentSearches(addToRecentSearches(category, recentSearches));
                      }}
                    />
                  </View>
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

        <Navbar
          currentTab="Search"
          onSwitchTab={(tab) => {
            if (tab === "Search") {
              setSearchText("");
              setFilters(defaultFilters);
              setIsSearching(false);
              Keyboard.dismiss();
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
