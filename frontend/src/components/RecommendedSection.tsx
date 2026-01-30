import { StyleSheet, Text, View } from "react-native";

import { mockActivities } from "../data/mockActivities";

// === test new ===
import { ActivityList } from "./ActivityList";
import { SeeAll } from "./SeeAll";
// === end test ===

export function RecommendedSection() {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}> Recommended </Text>
        <SeeAll screen="/RecommendedScreen" />
      </View>
      <ActivityList header="" activities={mockActivities} variant="condensed" horizontal={true} />;
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
    color: "#153F7A",
    fontFamily: "League Spartan",
    fontSize: 26,
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: 27.04,
  },
  sectionContainer: {
    gap: 8,
  },
});
