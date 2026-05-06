import { StyleSheet, Text, View } from "react-native";

import { ActivityList } from "../components/ActivityList";
import { useActivities } from "../Context/ActivityContext";

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
  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Popular</Text>
        <SeeAll screen="/popular" />
      </View>
      <ActivityList
        activities={activities}
        variant="condensed"
        horizontal={true}
        showHeader={false}
      />
    </View>
  );
}
