import { StyleSheet, Text, View } from "react-native";

import { ActivityList } from "../components/ActivityList";
import { POPULAR_TITLES } from "../constants/homeSections";
import { useActivities } from "../Context/ActivityContext";
import { mockActivities } from "../data/mockActivities";
import { applyActivityState } from "../utils/activityState";

import { SeeAll } from "./SeeAll";

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 24,
    marginTop: 32,
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontFamily: "League Spartan",
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",
    lineHeight: 27,
    alignSelf: "flex-start",
  },
});

export function HomePopularSection() {
  const { activities } = useActivities();

  // Filter based on the "encoded" list and show only 4 for the preview
  const popularActivities = applyActivityState(
    mockActivities.filter((a) => POPULAR_TITLES.includes(a.title)).slice(0, 4),
    activities,
  );

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Popular</Text>
        <SeeAll screen="/popular" />
      </View>
      <ActivityList
        activities={popularActivities}
        variant="condensed"
        horizontal={true}
        showHeader={false}
        showApiStatus={false}
      />
    </View>
  );
}
