import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import FilterIcon from "../../assets/icons/filter.svg";
import SearchIcon from "../../assets/icons/search.svg";
import { ActivityList } from "../components/ActivityList";
import { Chip } from "../components/Chip";
import { TempNavBar } from "../components/TempNavBar";
import { mockActivities } from "../data/mockActivities";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    display: "flex",
    paddingTop: 64,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 52,
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

export function SearchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(["test1", "test2", "test3"]);
  const [filters, setFilters] = useState<string[]>(["filter1", "filter2", "filter3"]);

  const filteredActivities = mockActivities.filter((activity) =>
    activity.title.toLowerCase().includes(searchText.toLowerCase()),
  );

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
          <FilterIcon width={24} height={24} color="#153A7A" />
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
        {filters.length !== 0 && (
          <View style={styles.filtersContainer}>
            <Text style={styles.smallText}>Filters: </Text>
            {filters.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                backgroundColor="#153A7A"
                textColor="#FFFFFF"
                onClose={() => {
                  setFilters(filters.filter((f) => f !== filter));
                }}
              />
            ))}
          </View>
        )}

        {/* Activity or Category cards depending on search state */}
        {isSearching || searchText !== "" || filters.length !== 0 ? (
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
              <View style={styles.categoryCard}>
                <Text style={styles.categoryCardText}>Category Card</Text>
              </View>
              <View style={styles.categoryCard}>
                <Text style={styles.categoryCardText}>Category Card</Text>
              </View>
              <View style={styles.categoryCard}>
                <Text style={styles.categoryCardText}>Category Card</Text>
              </View>
              <View style={styles.categoryCard}>
                <Text style={styles.categoryCardText}>Category Card</Text>
              </View>
              <View style={styles.categoryCard}>
                <Text style={styles.categoryCardText}>Category Card</Text>
              </View>
              <View style={styles.categoryCard}>
                <Text style={styles.categoryCardText}>Category Card</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      <TempNavBar />
    </View>
  );
}
