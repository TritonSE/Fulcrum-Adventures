import { Pressable, Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function HistoryScreen({ navigation }: Props) {
  const { activities, toggleSaved, markViewed } = useActivities();

  const history = activities
    .filter((a) => typeof a.lastViewedAt === "number")
    .sort((a, b) => (b.lastViewedAt ?? 0) - (a.lastViewedAt ?? 0))
    .slice(0, 50);

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
        onSaveToggle={toggleSaved}
        onActivityPress={(a) => {
          markViewed(a.id);
          navigation.navigate("ActivityDetail", { activityId: a.id });
        }}
      />
    </View>
  );
}
