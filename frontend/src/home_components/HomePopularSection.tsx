import { StyleSheet, Text, View } from "react-native";

// === test new ===
import { ActivityList } from "../components/ActivityList";
import { mockActivities } from "../data/mockActivities";

import { SeeAll } from "./SeeAll";
// === end test ===

export function HomePopularSection() {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}> Popular </Text>
        <SeeAll screen="/popular" />
      </View>
      <ActivityList header="" activities={mockActivities} variant="condensed" horizontal={true} />
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
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",
    marginTop: 20,
    lineHeight: 27,
    alignSelf: "flex-start",
    marginLeft: 15,
  },
  sectionContainer: {
    gap: 8,
  },
});