import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackButton from "../../../assets/icons/back_button.svg";
import { ActivityCard } from "../../components/ActivityCard";
import { DragList } from "../../components/DragList";
import SwipeToDelete from "../../components/SwipeToDelete";
import { useActivities } from "../../Context/ActivityContext";

export default function BookmarksScreen() {
  const { bookmarkedActivities, reorderBookmarks, setSaved, markViewed } = useActivities();
  const [isEditing, setIsEditing] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePress = (id: string) => {
    markViewed?.(id);
    router.push(`/activity/${id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          backgroundColor: "#153A7A",
          paddingHorizontal: 16,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 24,
          gap: 4,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <BackButton width={40} height={40} />
        </Pressable>

        <Text
          style={{
            marginLeft: 12,
            marginBottom: 5,
            fontFamily: "LeagueSpartan_700Bold",
            fontSize: 28,
            color: "#FFF",
          }}
        >
          Bookmarks
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
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
        {isEditing ? (
          <DragList
            data={bookmarkedActivities}
            onReorder={reorderBookmarks}
            renderItem={(activity) => (
              <ActivityCard
                activity={activity}
                onPress={() => handlePress(activity.id)}
                onSaveToggle={() =>
                  router.push(`/saved/LibraryPopupModalScreen?activityId=${activity.id}`)
                }
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}
          />
        ) : (
          <FlatList
            data={bookmarkedActivities}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}
            renderItem={({ item }) => (
              <SwipeToDelete onDelete={() => setSaved(item.id, false)}>
                <ActivityCard
                  activity={item}
                  onPress={() => handlePress(item.id)}
                  onSaveToggle={() =>
                    router.push(`/saved/LibraryPopupModalScreen?activityId=${item.id}`)
                  }
                />
              </SwipeToDelete>
            )}
          />
        )}
      </View>
    </View>
  );
}
