import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { HomeBrowseCategorySection } from "@/home_components/HomeBrowseCategorySection";
import { HomeHeaderSection } from "@/home_components/HomeHeaderSection";
import { HomeMailingListModal } from "@/home_components/HomeMailingListModal";
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
  // To be replaced with actual cards
  // const bookmarkedActivities = [];
  const [isMailingListVisible, setIsMailingListVisible] = useState(false);

  return (
    <>
      <ScrollView style={styles.container}>
        <HomeHeaderSection />
        <HomeBrowseCategorySection />
        <HomeRecentBookmarksSection bookmarkedActivities={[]} />
        <HomePopularSection />
        <HomeRecommendedSection />
        <HomeMailingListSection onStartSignup={() => setIsMailingListVisible(true)} />
      </ScrollView>

      <HomeMailingListModal
        visible={isMailingListVisible}
        onClose={() => setIsMailingListVisible(false)}
      />
    </>
  );
}
