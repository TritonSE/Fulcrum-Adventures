import { StyleSheet, Text, View } from "react-native";

import { ActivityList } from "../components/ActivityList";
import { mockActivities } from "../data/mockActivities";

import { SeeAll } from "./SeeAll";

export function HomeRecommendedSection() {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Recommended</Text>
        <SeeAll screen="/recommended" />
      </View>
      <ActivityList
        activities={mockActivities}
        variant="condensed"
        horizontal={true}
        height={252}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
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
