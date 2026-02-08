import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ActivityList } from "../components/ActivityList"
import { mockActivities } from "../data/mockActivities";

import { SeeAll } from "./SeeAll";

import type { Activity } from "../types/activity";

type HomeRecentBookmarksSectionProps = {
  bookmarkedActivities?: Activity[];
}

export function HomeRecentBookmarksSection({ bookmarkedActivities = [] }: HomeRecentBookmarksSectionProps) {
  const hasBookmarks = bookmarkedActivities.length > 0;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPosition = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!hasBookmarks) return;

    const interval = setInterval(() => {
      scrollPosition.current += 1;
      scrollViewRef.current?.scrollTo({
        x: scrollPosition.current,
        animated: true,
      });

      const cardWidth = 280;
      const newIndex = Math.round(scrollPosition.current / cardWidth) % bookmarkedActivities.length;
      setCurrentIndex(newIndex);

      if (scrollPosition.current > bookmarkedActivities.length * 300) {
        scrollPosition.current = 0;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [hasBookmarks, bookmarkedActivities.length]);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Recent Bookmarks</Text>
        {hasBookmarks && <SeeAll screen="/bookmarks" />}
      </View>
      {hasBookmarks ? (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            scrollEventThrottle={16}
          >
            {bookmarkedActivities.map((activity) => (
              <View>
                 <ActivityList header="" activities={mockActivities} variant="card" horizontal={true} />
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsContainer}>
            {bookmarkedActivities.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.activeDot]}
              />
            ))}
          </View>
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
  headerContainer: {
    flexDirection: "row",
    width: 341,
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",
    marginTop: 20,
    lineHeight: 27,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  sectionContainer: {
    gap: 8,
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cardWrapper: {
    marginRight: 12,
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
    fontStyle: "normal",
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
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
});
