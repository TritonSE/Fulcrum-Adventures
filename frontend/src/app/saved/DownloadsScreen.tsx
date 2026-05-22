import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackButton from "../../../assets/icons/back_button.svg";
import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../Context/ActivityContext";

export default function DownloadsScreen() {
  const { activities, toggleSaved, markViewed } = useActivities();

  const downloaded = activities.filter((a) => a.isDownloaded);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Count row (same as Bookmarks) */}
      <View
        style={{
          paddingTop: insets.top + 8,
          backgroundColor: "#153A7A",
          paddingHorizontal: 16,
          paddingBottom: 12,
          paddingLeft: 24,
          flexDirection: "row",
          alignItems: "center",
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
          Downloads
        </Text>
      </View>

      <ActivityList
        header=""
        activities={downloaded}
        fill
        showHeader={false}
        onSaveToggle={toggleSaved}
        onActivityPress={(a) => {
          markViewed?.(a.id);
          router.push(`/activity/${a.id}`);
        }}
      />
    </View>
  );
}
