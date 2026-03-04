import { useLayoutEffect } from "react";
import { Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Downloads">;

export default function DownloadsScreen({ navigation }: Props) {
  const { activities, toggleSaved, markViewed } = useActivities();

  const downloaded = activities.filter((a) => a.isDownloaded);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Downloads",
      headerStyle: { backgroundColor: "#153A7A" },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "800", fontSize: 26 },
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Count row (same as Bookmarks) */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 10,
        }}
      >
        <Text style={{ color: "#B4B4B4", fontSize: 13, fontWeight: "500" }}>
          {`${downloaded.length} Downloads`}
        </Text>

        {/* keep right side empty to match spacing */}
        <View />
      </View>

      <ActivityList
        header=""
        activities={downloaded}
        fill
        showHeader={false}
        onSaveToggle={toggleSaved}
        onActivityPress={(a) => {
          markViewed?.(a.id);
          navigation.navigate("ActivityDetail", { activityId: a.id });
        }}
      />
    </View>
  );
}
