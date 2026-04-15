import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import ActivityDetail from "../../components/ActivityDetail";
import { mockActivities } from "../../data/mockActivities";

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const activity = mockActivities.find((a) => a.id === id);

  if (!activity) {
    return <View style={{ flex: 1, backgroundColor: "#F9F9F9" }} />;
  }

  return <ActivityDetail activity={activity} onBack={() => router.back()} />;
}
