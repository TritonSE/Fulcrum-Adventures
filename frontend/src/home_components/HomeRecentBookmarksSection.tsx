import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

import { ActivityCard } from "../components/ActivityCard";
import { mockActivities } from "../data/mockActivities";

import { SeeAll } from "./SeeAll";

import type { Activity } from "../types/activity";
import type { ViewabilityConfig, ViewToken } from "react-native";

type HomeRecentBookmarksSectionProps = {
  bookmarkedActivities?: Activity[];
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const LIST_HORIZONTAL_PADDING = 20;
const CARD_HORIZONTAL_SPACING = 12;
const CARD_ITEM_WIDTH = SCREEN_WIDTH - LIST_HORIZONTAL_PADDING * 2;

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 8,
  },
  headerContainer: {
    flexDirection: "row",
    width: 341,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",

    lineHeight: 27,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: LIST_HORIZONTAL_PADDING,
  },
  cardItemWrapper: {
    width: CARD_ITEM_WIDTH,
  },
  cardSeparator: {
    width: CARD_HORIZONTAL_SPACING,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
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
    width: 341,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#909090",
    paddingVertical: 24,
  },
});

export function HomeRecentBookmarksSection({
  bookmarkedActivities,
}: HomeRecentBookmarksSectionProps) {
  let activities = bookmarkedActivities;
  activities = mockActivities.slice(0, 6);

  const hasBookmarks = activities.length > 0;
  const indicatorCount = Math.min(6, activities.length);

  const [activeIndex, setActiveIndex] = useState(0);
  const snapOffsets = useMemo(
    () => activities.map((_, index) => index * (CARD_ITEM_WIDTH + CARD_HORIZONTAL_SPACING)),
    [activities],
  );

  // const viewabilityConfig = useRef<ViewabilityConfig>({
  //   itemVisiblePercentThreshold: 60,
  // }).current;
  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 60,
  };

  // const onViewableItemsChanged = useRef(
  //   ({ viewableItems }: { viewableItems: Array<ViewToken<Activity>> }) => {
  //     const firstVisible = viewableItems[0];

  //     if (firstVisible?.index != null) {
  //       setActiveIndex(firstVisible.index);
  //     }
  //   },
  // ).current;

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
        {hasBookmarks && <SeeAll screen="/bookmarks" />}
      </View>

      {hasBookmarks ? (
        <>
          <FlatList
            data={activities}
            renderItem={({ item }) => (
              <View style={styles.cardItemWrapper}>
                <ActivityCard activity={item} />
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
            decelerationRate="fast"
            snapToOffsets={snapOffsets}
            snapToAlignment="start"
            disableIntervalMomentum
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />

          {indicatorCount > 1 && (
            <View style={styles.dotsContainer}>
              {Array.from({ length: indicatorCount }).map((_, index) => (
                <View
                  key={`bookmark-dot-${index}`}
                  style={[styles.dot, index === activeIndex && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent bookmarks</Text>
        </View>
      )}
    </View>
  );
}
