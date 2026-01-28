import { StyleSheet, Text, View } from "react-native";

import { SeeAll } from "./SeeAll";

function ActivityList() {
  return <></>;
}

export function HomePopularSection() {
  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.text}> Popular </Text>
        <SeeAll screen="/PopularScreen" />
      </View>
      <ActivityList />
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
});
