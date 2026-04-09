import React from "react";
import { StyleSheet, View } from "react-native";

import { ActivityOverviewField } from "./sub_components/ActivityOverviewField";
import { ActivityTitleField } from "./sub_components/ActivityTitleField";
// import { CategorySection } from "./sub_components/CategorySection";
import { ThumbnailSection } from "./sub_components/ThumbnailSection";

export const OverviewSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <ThumbnailSection />
      <ActivityTitleField />
      <ActivityOverviewField />
      {/* <CategorySection /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
