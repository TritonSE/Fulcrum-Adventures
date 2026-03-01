import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import ActivityDetail from "./src/components/ActivityDetail";
import NotesScreen from "./src/components/NotesScreen";
import { getActivityById } from "./src/data/mockActivities";
import { formatDuration, formatGradeLevel, formatGroupSize } from "./src/utils/textUtils";

import type { CustomTab, Activity as DataActivity } from "./src/types/activity";

import {
  LeagueSpartan_400Regular,
  LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_700Bold,
} from "@expo-google-fonts/instrument-sans";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

function mapToActivityDetailShape(activity: DataActivity) {
  const energyToDifficulty: Record<string, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
  };
  const prepMaterials = activity.facilitate?.prep?.materials ?? activity.materials ?? [];
  const playSteps = activity.facilitate?.play?.steps ?? [];
  const knownKeys = new Set(["prep", "play", "debrief"]);
  const customTabs = Object.entries(activity.facilitate ?? {})
    .filter(([key]) => !knownKeys.has(key))
    .map(([key, value]) => {
      const tab = value as CustomTab;
      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        sections: (tab?.sections ?? []).map((s) => ({
          heading: s.header,
          text: s.content,
        })),
      };
    });

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    category: activity.category,
    gradeLevel: formatGradeLevel(activity.gradeLevel),
    participants: formatGroupSize(activity.groupSize),
    duration: formatDuration(activity.duration),
    difficulty: energyToDifficulty[activity.energyLevel] ?? 2,
    tags: activity.environment ? [activity.environment] : [],
    objective: activity.objective ?? "",
    facilitate: {
      prep: {
        setup: activity.facilitate?.prep?.setup ?? [],
        materials: prepMaterials,
      },
      play: playSteps.map((s) => s.content),
      debrief: activity.facilitate?.debrief?.questions ?? [],
      customTabs,
    },
    selOpportunities: activity.selTags ?? [],
    mediaUrl: activity.imageUrl,
  };
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "League Spartan": LeagueSpartan_700Bold,
    "Instrument Sans": InstrumentSans_400Regular,
    "Instrument Sans Medium": InstrumentSans_500Medium,
    "Instrument Sans Bold": InstrumentSans_700Bold,
  });

  const activityId = "1";
  const [showNotes, setShowNotes] = useState(false);
  const activity = getActivityById(activityId);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!activity) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
      </View>
    );
  }

  const detailActivity = mapToActivityDetailShape(activity);

  return (
    <View style={styles.container}>
      <ActivityDetail activity={detailActivity} onOpenNotes={() => setShowNotes(true)} />
      {showNotes && (
        <NotesScreen activityId={activityId} onClose={() => setShowNotes(false)} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
