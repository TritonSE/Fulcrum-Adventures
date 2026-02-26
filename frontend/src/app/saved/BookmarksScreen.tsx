import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Bookmarks">;

export default function BookmarksScreen({ navigation }: Props) {
  //const { activities, toggleSaved } = useActivities();
  const [isEditing, setIsEditing] = useState(false);
  const { bookmarkedActivities, reorderBookmarks } = useActivities();
  const { markViewed } = useActivities();

  return (
    <View style={{ flex: 1 }}>
      {/* Top Blue Header Area Should Stay Wherever You Have It */}

      {/* Back */}
      <Pressable onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </Pressable>

      {/* Title + Edit */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          marginTop: 10,
        }}
      >
        {/* <Text style={{ fontSize: 22, fontWeight: "bold" }}>Bookmarks</Text> */}

        <Pressable onPress={() => setIsEditing((prev) => !prev)}>
          <Text style={{ color: "#2F3E75", fontWeight: "600" }}>{isEditing ? "Done" : "Edit"}</Text>
        </Pressable>
      </View>

      <ActivityList
        header=""
        activities={bookmarkedActivities}
        isEditing={isEditing}
        onReorder={reorderBookmarks}
        onActivityPress={(a) => {
          markViewed(a.id);
          navigation.navigate("ActivityDetail", { activityId: a.id });
        }}
      />
    </View>
  );
}
