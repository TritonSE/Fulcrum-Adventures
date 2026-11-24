import { router } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { ActivityCard } from "../components/ActivityCard";
import { useActivities } from "../Context/useActivities";

import { SeeAll } from "./SeeAll";

import type { Activity } from "../types/activity";
import type { ViewabilityConfig, ViewToken } from "react-native";

type HomeRecentBookmarksSectionProps = {
  bookmarkedActivities?: Activity[];
};

const LIST_HORIZONTAL_PADDING = 24;
const CARD_HORIZONTAL_SPACING = 24;

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 8,
  },
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: LIST_HORIZONTAL_PADDING,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    fontFamily: "League Spartan",
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",

    lineHeight: 27,
    alignSelf: "flex-start",
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: LIST_HORIZONTAL_PADDING,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
  },
  activeDot: {
    backgroundColor: "#153F7A",
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#B4B4B4",
    paddingVertical: 24,
    fontFamily: "Instrument Sans",
  },
});

export function HomeRecentBookmarksSection({
  bookmarkedActivities,
}: HomeRecentBookmarksSectionProps) {
  const { width } = useWindowDimensions();
  const cardItemWidth = Math.max(0, width - LIST_HORIZONTAL_PADDING * 2);
  const { toggleSaved, bookmarkedActivities: contextBookmarks } = useActivities();
  const activities =
    bookmarkedActivities && bookmarkedActivities.length > 0
      ? bookmarkedActivities.slice(0, 4)
      : contextBookmarks.slice(0, 4);

  const hasBookmarks = activities.length > 0;
  const indicatorCount = Math.min(6, activities.length);

  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 60,
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems[0];
      const idx = firstVisible?.index;
      if (idx != null) setActiveIndex(idx);
    },
    [],
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Recent Bookmarks</Text>
        {hasBookmarks && <SeeAll screen="/saved/BookmarksScreen" />}
      </View>

      {hasBookmarks ? (
        <>
          <FlatList
            data={activities}
            renderItem={({ item }) => (
              <View style={{ width: cardItemWidth }}>
                <ActivityCard
                  activity={item}
                  onPress={() => router.push(`/activity/${item.id}`)}
                  onSaveToggle={toggleSaved}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            ItemSeparatorComponent={() => <View style={{ width: CARD_HORIZONTAL_SPACING }} />}
            decelerationRate="fast"
            snapToInterval={cardItemWidth + CARD_HORIZONTAL_SPACING}
            snapToAlignment="start"
            disableIntervalMomentum={true}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />

          {indicatorCount > 1 && (
            <View style={styles.dotsContainer}>
              {activities.slice(0, indicatorCount).map((activity, index) => (
                <View
                  key={`bookmark-dot-${activity.id}`}
                  style={[styles.dot, index === activeIndex && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={[styles.emptyContainer, { width: cardItemWidth }]}>
          <Text style={styles.emptyText}>No recent bookmarks.</Text>
        </View>
      )}
    </View>
  );
}
