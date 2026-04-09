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
