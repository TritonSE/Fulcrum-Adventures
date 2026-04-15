import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackButton from "../../../assets/icons/back_button.svg";
import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../Context/ActivityContext";

export default function HistoryScreen() {
  const { activities, toggleSaved, markViewed } = useActivities();
  const insets = useSafeAreaInsets();
  const history = activities
    .filter((a) => typeof a.lastViewedAt === "number")
    .sort((a, b) => (b.lastViewedAt ?? 0) - (a.lastViewedAt ?? 0))
    .slice(0, 50);

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
          History
        </Text>

        <View />
      </View>
      <ActivityList
        header=""
        showHeader={false}
        activities={history}
        fill
        onSaveToggle={toggleSaved}
        onActivityPress={(a) => {
          markViewed(a.id);
          router.push(`/activity/${a.id}`);
        }}
      />
    </View>
  );
}
