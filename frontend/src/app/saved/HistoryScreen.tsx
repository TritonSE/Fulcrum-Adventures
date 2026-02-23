import { Pressable, Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function HistoryScreen({ navigation }: Props) {
  const { activities, toggleSaved } = useActivities();

  const history = activities.filter((a) => a.isHistory);

  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </Pressable>

      <ActivityList
        header="History"
        activities={history}
        onSaveToggle={toggleSaved}
        onActivityPress={(a) =>
          navigation.navigate("ActivityDetail", {
            activityId: a.id,
          })
        }
      />
    </View>
  );
}
