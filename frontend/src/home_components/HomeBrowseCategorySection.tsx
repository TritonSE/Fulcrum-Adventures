import { ScrollView, StyleSheet, Text, View } from "react-native";

import Active from "../../assets/Active.svg";
import Connection from "../../assets/Connection.svg";
import Debrief from "../../assets/Debrief.svg";
import Icebreaker from "../../assets/Icebreaker.svg";
import Opener from "../../assets/Opener.svg";
import TeamChallenge from "../../assets/TeamChallenge.svg";

const styles = StyleSheet.create({
  browseText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",
    marginTop: 20,
    lineHeight: 27,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  scrollContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
    flexGrow: 0,
    height: 150,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
});

const categories = [
  { name: "Opener", icon: Opener },
  { name: "Icebreaker", icon: Icebreaker },
  { name: "Connection", icon: Connection },
  { name: "Active", icon: Active },
  { name: "Debrief", icon: Debrief },
  { name: "Team Challenge", icon: TeamChallenge },
];

export const HomeBrowseCategorySection = () => {
  return (
    <>
      <Text style={styles.browseText}>Browse by Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <View key={category.name} style={styles.categoryItem}>
              <IconComponent width={123} height={123} />
            </View>
          );
        })}
      </ScrollView>
    </>
  );
};
