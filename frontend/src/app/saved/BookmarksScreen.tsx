import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../Context/ActivityContext";

import type { Activity } from "../../types/activity";
import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Bookmarks">;

export default function BookmarksScreen({ navigation }: Props) {
  const { activities, toggleSaved } = useActivities();

  const bookmarkedActivities = activities.filter((a) => a.isSaved);

  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </Pressable>

      <ActivityList
        header="Bookmarks"
        activities={bookmarkedActivities}
        onSaveToggle={toggleSaved}
      />
    </View>
  );
}
