import { ScrollView, StyleSheet } from "react-native";

import { HomeBrowseCategorySection } from "../home_components/HomeBrowseCategorySection";
import { HomeHeaderSection } from "../home_components/HomeHeaderSection";
import { HomePopularSection } from "../home_components/HomePopularSection";
import { HomeRecentBookmarksSection } from "../home_components/HomeRecentBookmarksSection";
import { HomeRecommendedSection } from "../home_components/HomeRecommendedSection";

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
      <HomeRecommendedSection />
    </ScrollView>
  );
}
