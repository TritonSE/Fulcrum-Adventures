import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import HomeScreen from "./src/app/home";
//import { SeeAll } from "./src/components/SeeAll";
// === test new ===
import { ActivityList } from "./src/components/ActivityList";
import { HomePopularSection } from "./src/components/HomePopularSection";
import { RecommendedSection } from "./src/components/RecommendedSection";
import { mockActivities } from "./src/data/mockActivities";
// === end test ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function App() {
  return (
    <>
      <HomeScreen />
    </>
  );
}
