import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { mockActivities } from "../data/mockActivities";
import { HomeBrowseCategorySection } from "../home_components/HomeBrowseCategorySection";
import { HomeHeaderSection } from "../home_components/HomeHeaderSection";
import { HomePopularSection } from "../home_components/HomePopularSection";
import { HomeRecentBookmarksSection } from "../home_components/HomeRecentBookmarksSection";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default function HomeScreen() {
  // To be replaced with actual cards
  const bookmarkedActivities = [];
  
  return (
    <ScrollView style={styles.container}>
      <HomeHeaderSection />
      <HomeBrowseCategorySection />
      <HomeRecentBookmarksSection bookmarkedActivities={[]} />
      <HomePopularSection />
    </ScrollView>
  );
}