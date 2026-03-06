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
import type { Activity, Environment, Range } from "../types/activity";

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

function rangesOverlap(activityRange: Range, selectedRanges: Range[] | undefined): boolean {
  if (!selectedRanges || selectedRanges.length === 0) {
    return true;
  }

  return selectedRanges.some(
    (range) => !(activityRange.max < range.min || activityRange.min > range.max),
  );
}

function matchesSetupPropsFilter(
  activity: Activity,
  setupProps: FilterState["setupProps"],
): boolean {
  if (!setupProps) {
    return true;
  }

  if (setupProps === "Props") {
    return activity.materials.length > 0;
  }

  if (setupProps === "No Props") {
    return activity.materials.length === 0;
  }

  return true;
}

function mapActivityEnvironmentToSelections(activityEnvironment: Environment): Environment[] {
  if (activityEnvironment === "Outdoor") {
    return ["Blacktop", "Field"];
  }
  if (activityEnvironment === "Indoor") {
    return ["Classroom", "Gym/MPR"];
  }
  return [activityEnvironment];
}

function matchesEnvironmentFilter(
  activityEnvironment: Environment,
  selectedEnvironments: Environment[] | undefined,
): boolean {
  if (!selectedEnvironments || selectedEnvironments.length === 0) {
    return true;
  }

  const mappedSelections = mapActivityEnvironmentToSelections(activityEnvironment);
  return selectedEnvironments.some((environment) => mappedSelections.includes(environment));
}

function parseNumericRange(value: string): Range | null {
  const match = /(\d+)-(\d+)/.exec(value);
  if (!match) {
    return null;
  }

  return {
    min: Number.parseInt(match[1]),
    max: Number.parseInt(match[2]),
  };
}

function parseGradeRange(value: string): Range | null {
  const match = /Grade\s+([K\d]+)-([K\d]+)/.exec(value);
  if (!match) {
    return null;
  }

  return {
    min: match[1] === "K" ? 0 : Number.parseInt(match[1]),
    max: match[2] === "K" ? 0 : Number.parseInt(match[2]),
  };
}

function removeRangeSelection(selected: Range[] | undefined, target: Range | null): Range[] {
  if (!target) {
    return selected ?? [];
  }

  return (selected ?? []).filter((item) => !(item.min === target.min && item.max === target.max));
}

function matchesActivityFilter(
  activity: Activity,
  filters: FilterState,
  searchText: string,
): boolean {
  const matchesCategory = !filters.category || activity.category === filters.category;
  const matchesSetup = matchesSetupPropsFilter(activity, filters.setupProps);
  const matchesDuration = rangesOverlap(activity.duration, filters.duration);
  const matchesGradeLevel = rangesOverlap(activity.gradeLevel, filters.gradeLevel);
  const matchesGroupSize = rangesOverlap(activity.groupSize, filters.groupSize);
  const matchesEnvironment = matchesEnvironmentFilter(activity.environment, filters.environment);
  const matchesEnergyLevel = !filters.energyLevel || activity.energyLevel === filters.energyLevel;
  const matchesSearchText = activity.title.toLowerCase().includes(searchText.toLowerCase());

  return (
    matchesCategory &&
    matchesSetup &&
    matchesDuration &&
    matchesGradeLevel &&
    matchesGroupSize &&
    matchesEnvironment &&
    matchesEnergyLevel &&
    matchesSearchText
  );
}

function removeFilter(filters: FilterState, filterToRemove: string): FilterState {
  if (filters.category === filterToRemove) {
    return { ...filters, category: undefined };
  }

  if (filters.setupProps === filterToRemove) {
    return { ...filters, setupProps: undefined };
  }

  if (filterToRemove.includes(" min")) {
    const durationToRemove = parseNumericRange(filterToRemove);
    return {
      ...filters,
      duration: removeRangeSelection(filters.duration, durationToRemove),
    };
  }

  if (filterToRemove.includes("Grade")) {
    const gradeToRemove = parseGradeRange(filterToRemove);
    return {
      ...filters,
      gradeLevel: removeRangeSelection(filters.gradeLevel, gradeToRemove),
    };
  }

  if (filterToRemove.includes("people")) {
    const groupSizeToRemove = parseNumericRange(filterToRemove);
    return {
      ...filters,
      groupSize: removeRangeSelection(filters.groupSize, groupSizeToRemove),
    };
  }

  if ((filters.environment ?? []).includes(filterToRemove as Environment)) {
    return {
      ...filters,
      environment: (filters.environment ?? []).filter(
        (environment) => environment !== filterToRemove,
      ),
    };
  }

  if (filterToRemove.startsWith("Energy Level: ")) {
    return {
      ...filters,
      energyLevel: null,
    };
  }

  return filters;
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
