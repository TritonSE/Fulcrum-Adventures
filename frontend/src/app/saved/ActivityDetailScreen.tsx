import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { LibraryPopup } from "../../components/LibraryPopup";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "ActivityDetail">;

export default function ActivityDetailScreen({ route }: Props) {
  const { activities } = useActivities();

  const activity = activities.find((a) => a.id === route.params.activityId);

  const [popupVisible, setPopupVisible] = useState(false);

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

      <Pressable onPress={() => setPopupVisible(true)}>
        <Ionicons name="bookmark-outline" size={24} />
      </Pressable>
      <LibraryPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        activityId={route.params.activityId}
      />
    </ScrollView>
  );
}
