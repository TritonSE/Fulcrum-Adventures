import { useLayoutEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Bookmarks">;

export default function BookmarksScreen({ navigation }: Props) {
  const { bookmarkedActivities, reorderBookmarks, setSaved, markViewed } = useActivities();
  const [isEditing, setIsEditing] = useState(false);

  // Blue header styling
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
      {/* Edit button ABOVE the cards (not in header) */}
      <Text
        style={{
          paddingHorizontal: 20,
          paddingTop: 6,
          color: "#8A8FA3",
          fontSize: 13,
          fontWeight: "500",
        }}
      ></Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 5,
          paddingBottom: 6,
        }}
      >
        {/* Bookmark count (left side) */}
        <Text
          style={{
            color: "#B4B4B4",
            fontSize: 13,
            fontWeight: "500",
          }}
        >
          {`${bookmarkedActivities.length} Bookmarks`}
        </Text>

        {/* Edit button (right side) */}
        <Pressable onPress={() => setIsEditing((prev) => !prev)} hitSlop={10}>
          <Text style={{ color: "#153A7A", fontWeight: "700", fontSize: 16 }}>
            {isEditing ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>

      <ActivityList
        header={`(${bookmarkedActivities.length} bookmarks)`}
        activities={bookmarkedActivities}
        showHeader={false} // removes “## Bookmarks”
        isEditing={isEditing}
        onReorder={reorderBookmarks}
        enableSwipeDelete={!isEditing} // disable swipe while reordering
        onDelete={(id) => setSaved(id, false)} // trash removes bookmark
        onActivityPress={(a) => {
          markViewed?.(a.id);
          navigation.navigate("ActivityDetail", { activityId: a.id });
        }}
      />
    </View>
  );
}
