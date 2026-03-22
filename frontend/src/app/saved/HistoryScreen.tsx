import { useLayoutEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityList } from "../../components/ActivityList";
import { Navbar } from "../../components/Navbar";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function HistoryScreen({ navigation }: Props) {
  const { activities, toggleSaved, markViewed } = useActivities();
  const insets = useSafeAreaInsets();
  const history = activities
    .filter((a) => typeof a.lastViewedAt === "number")
    .sort((a, b) => (b.lastViewedAt ?? 0) - (a.lastViewedAt ?? 0))
    .slice(0, 50);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "History",
      headerStyle: { backgroundColor: "#153A7A" },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "800", fontSize: 26 },
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
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
        <Text style={{ color: "#8A8FA3", fontSize: 13, fontWeight: "500" }}>
          {`${history.length} History Items`}
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
          navigation.navigate("ActivityDetail", { activityId: a.id });
        }}
      />
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
