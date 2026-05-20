import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import Active from "../../assets/Active.svg";
import Connection from "../../assets/Connection.svg";
import Debrief from "../../assets/Debrief.svg";
import Icebreaker from "../../assets/Icebreaker.svg";
import Opener from "../../assets/Opener.svg";
import TeamChallenge from "../../assets/TeamChallenge.svg";

const styles = StyleSheet.create({
  browseText: {
    fontFamily: "League Spartan",
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",
    marginTop: 20,
    lineHeight: 27,
    alignSelf: "flex-start",
    marginLeft: 24,
  },
  scrollContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 24,
    flexGrow: 0,
    height: 150,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 7,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
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
            <Pressable
              key={category.name}
              style={styles.categoryItem}
              onPress={() => router.push(`/category/${encodeURIComponent(category.name)}`)}
            >
              <IconComponent width={123} height={123} />
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
};
