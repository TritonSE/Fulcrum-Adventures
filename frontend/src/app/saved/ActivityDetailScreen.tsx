import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text } from "react-native";

import { useActivities } from "../../context/ActivityContext";
import { formatDuration, formatGroupSize } from "../../utils/textUtils";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "ActivityDetail">;

export default function ActivityDetailScreen({ route, navigation }: Props) {
  const { activities } = useActivities();

  const activityId = route.params.activityId;
  const activity = activities.find((a) => a.id === activityId);

  if (!activity) return null;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>{activity.title}</Text>

      <Text style={{ marginTop: 8 }}>
        {formatDuration(activity.duration)} • {formatGroupSize(activity.groupSize)} people
      </Text>

      <Text style={{ marginTop: 16 }}>{activity.description}</Text>

      <Text style={{ marginTop: 20, fontWeight: "700" }}>Materials</Text>

      {activity.materials.map((m, i) => (
        <Text key={i}>• {m}</Text>
      ))}

      {/* Bookmark button opens the Library bottom sheet */}
      <Pressable
        onPress={() => navigation.navigate("LibraryPopupModal", { activityId })}
        style={{ marginTop: 18 }}
      >
        <Ionicons name="bookmark-outline" size={24} color="#1E2A5A" />
      </Pressable>
    </ScrollView>
  );
}
