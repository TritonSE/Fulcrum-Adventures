import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useActivities } from "@/Context/useActivities";
import { HomeBrowseCategorySection } from "@/home_components/HomeBrowseCategorySection";
import { HomeHeaderSection } from "@/home_components/HomeHeaderSection";
import { HomeMailingListSection } from "@/home_components/HomeMailingListSection";
import { HomePopularSection } from "@/home_components/HomePopularSection";
import { HomeRecentBookmarksSection } from "@/home_components/HomeRecentBookmarksSection";
import { HomeRecommendedSection } from "@/home_components/HomeRecommendedSection";

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    gap: 32,
  },
  contentContainer: {
    paddingBottom: 40,
  },
});

export default function HomeScreen() {
  const { isLoadingActivities, refreshActivities } = useActivities();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
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
    </KeyboardAvoidingView>
  );
}
