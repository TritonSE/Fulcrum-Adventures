import { StyleSheet, Text, View } from "react-native";

import { ActivityList } from "../components/ActivityList";
import { RECOMMENDED_TITLES } from "../constants/homeSections";
import { useActivities } from "../Context/useActivities";
import { mockActivities } from "../data/mockActivities";
import { applyActivityStateAndMediaByTitle } from "../utils/activityState";

import { SeeAll } from "./SeeAll";

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 24,
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
});

export function HomeRecommendedSection() {
  const { activities } = useActivities();

  // Filter based on admin-selected list and show only 4 for the preview
  const recommendedActivities = applyActivityStateAndMediaByTitle(
    mockActivities.filter((a) => RECOMMENDED_TITLES.includes(a.title)).slice(0, 4),
    activities,
  );

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Recommended</Text>
        <SeeAll screen="/recommended" />
      </View>
      <ActivityList
        activities={recommendedActivities}
        variant="condensed"
        horizontal={true}
        showHeader={false}
        showApiStatus={false}
      />
    </View>
  );
}
