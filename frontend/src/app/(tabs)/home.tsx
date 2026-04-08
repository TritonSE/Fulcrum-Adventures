import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

import { HomeBrowseCategorySection } from "@/home_components/HomeBrowseCategorySection";
import { HomeHeaderSection } from "@/home_components/HomeHeaderSection";
import { HomeMailingListSection } from "@/home_components/HomeMailingListSection";
import { HomePopularSection } from "@/home_components/HomePopularSection";
import { HomeRecentBookmarksSection } from "@/home_components/HomeRecentBookmarksSection";
import { HomeRecommendedSection } from "@/home_components/HomeRecommendedSection";
import { CreateActivity } from "../../../admin/src/pages/CreateActivity";

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F9F9F9",
//     gap: 32,
//   },
// });

export default function HomeScreen() {
  return <CreateActivity />;
  // return (
  //   <KeyboardAvoidingView
  //     style={{ flex: 1 }}
  //     behavior={Platform.OS === "ios" ? "padding" : "height"}
  //     keyboardVerticalOffset={0}
  //   >
  //     <ScrollView style={styles.container}>
  //       <HomeHeaderSection />
  //       <HomeBrowseCategorySection />
  //       <HomeRecentBookmarksSection bookmarkedActivities={[]} />
  //       <HomePopularSection />
  //       <HomeRecommendedSection />
  //       <HomeMailingListSection />
  //     </ScrollView>
  //   </KeyboardAvoidingView>
  // );
}
