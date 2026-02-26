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
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </Pressable>

      <ActivityList
        header=""
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
