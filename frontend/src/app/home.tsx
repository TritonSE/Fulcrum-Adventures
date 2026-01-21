import { Text, View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { styles } from "./home.styles";
import Header from "../../assets/Header.svg";
import Active from "../../assets/Active.svg";
import Connection from "../../assets/Connection.svg";
import Debrief from "../../assets/Debrief.svg";
import Icebreaker from "../../assets/Icebreaker.svg";
import Opener from "../../assets/Opener.svg";
import TeamChallenge from "../../assets/TeamChallenge.svg";

const categories = [
  { name: "Opener", icon: Opener },
  { name: "Icebreaker", icon: Icebreaker },
  { name: "Connection", icon: Connection },
  { name: "Active", icon: Active },
  { name: "Debrief", icon: Debrief },
  { name: "Team Challenge", icon: TeamChallenge },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header width={390} height={115} />
      </View>
      <Text style={styles.browseText}>Browse by Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <View key={category.name} style={styles.categoryItem}>
              <IconComponent width={123} height={123} />
            </View>
          );
        })}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}