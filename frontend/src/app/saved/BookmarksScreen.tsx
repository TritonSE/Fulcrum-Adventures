import Ionicons from "@expo/vector-icons/Ionicons";
import { useLayoutEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityList } from "../../components/ActivityList";
import { Navbar } from "../../components/Navbar";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Bookmarks">;

export default function BookmarksScreen({ navigation }: Props) {
  const { bookmarkedActivities, reorderBookmarks, setSaved, markViewed } = useActivities();
  const [isEditing, setIsEditing] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          backgroundColor: "#153A7A",
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>

        <Text
          style={{
            marginLeft: 12,
            fontFamily: "LeagueSpartan_700Bold",
            fontSize: 28,
            color: "#FFF",
          }}
        >
          Bookmarks
        </Text>
      </View>
      <Text
        style={{
          paddingHorizontal: 20,
          paddingTop: 0,
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
        }}
      >
        {/* Bookmark count (left side) */}
        <Text
          style={{
            color: "#B4B4B4",
            fontFamily: "InstrumentSans_500Medium",
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          {`${bookmarkedActivities.length} Bookmarks`}
        </Text>

        {/* Edit button (right side) */}
        <Pressable onPress={() => setIsEditing((prev) => !prev)} hitSlop={10}>
          <Text
            style={{
              color: "#153A7A",
              fontFamily: "InstrumentSans_500Medium",
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            {isEditing ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, transform: [{ translateY: -6 }] }}>
        <ActivityList
          header={`(${bookmarkedActivities.length} bookmarks)`}
          activities={bookmarkedActivities}
          fill
          showHeader={false}
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
      <View style={{ paddingBottom: insets.bottom + 8, backgroundColor: "#F2F3F5" }}>
        <Navbar
          currentTab="Library"
          onSwitchTab={(tab) => {
            if (tab === "Library") navigation.navigate("Library");
          }}
        />
      </View>
    </View>
  );
}
