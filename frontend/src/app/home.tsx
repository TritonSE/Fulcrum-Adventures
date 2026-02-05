import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { useState } from "react";

import Active from "../../assets/Active.svg";
import Connection from "../../assets/Connection.svg";
import Debrief from "../../assets/Debrief.svg";
import Header from "../../assets/Header.svg";
import Icebreaker from "../../assets/Icebreaker.svg";
import Opener from "../../assets/Opener.svg";
import TeamChallenge from "../../assets/TeamChallenge.svg";

import { styles } from "./home.styles";
import { ActivityCard } from "../components/ActivityCard";
import { mockActivities } from "../data/mockActivities";

import type { Activity } from "../types/activity";

const categories = [
  { name: "Opener", icon: Opener },
  { name: "Icebreaker", icon: Icebreaker },
  { name: "Connection", icon: Connection },
  { name: "Active", icon: Active },
  { name: "Debrief", icon: Debrief },
  { name: "Team Challenge", icon: TeamChallenge },
];

export default function HomeScreen() {
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);

  const handleSaveToggle = (id: string) => {
    const activity = mockActivities.find((a) => a.id === id);
    if (!activity) return;

    setSavedActivities((prev) => {
      const isAlreadySaved = prev.find((a) => a.id === id);
      if (isAlreadySaved) {
        return prev.filter((a) => a.id !== id);
      } else {
        return [...prev, activity];
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header width={390} height={115} />
      </View>
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
      <Text style={styles.browseText}>Recently Bookmarks</Text>
      {savedActivities.length === 0 ? (
        <Text style={styles.emptyText}>No recent bookmarks.</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {savedActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
