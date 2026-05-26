import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { useActivities } from "@/Context/ActivityContext";
import { HomeBrowseCategorySection } from "@/home_components/HomeBrowseCategorySection";
import { HomeHeaderSection } from "@/home_components/HomeHeaderSection";
import { HomeMailingListSection } from "@/home_components/HomeMailingListSection";
import { HomePopularSection } from "@/home_components/HomePopularSection";
import { HomeRecentBookmarksSection } from "@/home_components/HomeRecentBookmarksSection";
import { HomeRecommendedSection } from "@/home_components/HomeRecommendedSection";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    gap: 32,
  },
});

export default function HomeScreen() {
  const { isLoadingActivities, refreshActivities } = useActivities();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoadingActivities}
          onRefresh={() => {
            void refreshActivities();
          }}
        />
      }
    >
      <HomeHeaderSection />
      <HomeBrowseCategorySection />
      <HomeRecentBookmarksSection bookmarkedActivities={[]} />
      <HomePopularSection />
      <HomeRecommendedSection />
      <HomeMailingListSection />
    </ScrollView>
  );
}
