import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import ActivityDetail from "./src/components/ActivityDetail";
import NotesScreen from "./src/components/NotesScreen";
import { getActivityById } from "./src/data/mockActivities";
import { formatDuration, formatGradeLevel, formatGroupSize } from "./src/utils/textUtils";

import type { Activity as DataActivity } from "./src/types/activity";

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
      safety: [],
      variations: [],
    },
    selOpportunities: activity.selTags ?? [],
    mediaUrl: activity.imageUrl,
  };
}

export default function App() {
  const activityId = "1";
  const [showNotes, setShowNotes] = useState(false);
  const activity = getActivityById(activityId);

  if (!activity) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
      </View>
    );
  }

  const detailActivity = mapToActivityDetailShape(activity);

  if (showNotes) {
    return (
      <View style={styles.container}>
        <NotesScreen activityId={activityId} onClose={() => setShowNotes(false)} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityDetail activity={detailActivity} onOpenNotes={() => setShowNotes(true)} />
      <StatusBar style="auto" />
    </View>
  );
}
