import React, { useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

import { ActivityCard } from "../components/ActivityCard";
import { mockActivities } from "../data/mockActivities";

import { SeeAll } from "./SeeAll";

import type { Activity } from "../types/activity";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

type HomeRecentBookmarksSectionProps = {
  bookmarkedActivities?: Activity[];
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const CARD_SPACING = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

export function HomeRecentBookmarksSection({
  bookmarkedActivities,
}: HomeRecentBookmarksSectionProps) {
  const activities = mockActivities;

  const hasBookmarks = activities.length > 0;
  const indicatorCount = Math.min(4, activities.length);

  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    setActiveIndex(index);
  };

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
            renderItem={({ item }) => <ActivityCard activity={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
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
    paddingHorizontal: 20,
    gap: 12,
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
