import { Pressable, ScrollView, Text, View } from "react-native";

import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "ActivityDetail">;

export default function ActivityDetailScreen({ route }: Props) {
  const { activities, toggleSaved } = useActivities();

  const activity = activities.find((a) => a.id === route.params.activityId);

  if (!activity) return null;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>{activity.title}</Text>

      <Text style={{ marginTop: 8 }}>
        {activity.duration} • {activity.groupSize} people
      </Text>

      <Text style={{ marginTop: 16 }}>{activity.description}</Text>

      <Text style={{ marginTop: 20, fontWeight: "700" }}>Materials</Text>

      {activity.materials.map((m, i) => (
        <Text key={i}>• {m.name}</Text>
      ))}

      <Pressable
        onPress={() => toggleSaved(activity.id)}
        style={{
          marginTop: 24,
          padding: 14,
          backgroundColor: "#2F3E75",
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>
          {activity.isSaved ? "Remove Bookmark" : "Save Activity"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
