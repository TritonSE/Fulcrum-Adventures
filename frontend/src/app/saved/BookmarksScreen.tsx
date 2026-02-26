import { useLayoutEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Bookmarks">;

export default function BookmarksScreen({ navigation }: Props) {
  const { bookmarkedActivities, reorderBookmarks, markViewed } = useActivities();
  const [isEditing, setIsEditing] = useState(false);

  // Keep the blue nav header like your screenshot
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Bookmarks",
      headerStyle: { backgroundColor: "#153A7A" },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "800", fontSize: 26 },
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* This is the white row below the blue header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 6,
        }}
      >
        <Pressable onPress={() => setIsEditing((prev) => !prev)} hitSlop={10}>
          <Text style={{ color: "#153A7A", fontWeight: "700", fontSize: 16 }}>
            {isEditing ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>

      {/* Cards start immediately under that row */}
      <ActivityList
        header="Bookmarks"
        showHeader={false} // ✅ removes “## Bookmarks”
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
