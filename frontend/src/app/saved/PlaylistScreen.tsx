import { Text, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Playlist">;

export default function PlaylistScreen({ route, navigation }: Props) {
  const { playlistId } = route.params;

  const { playlists, activities } = useActivities();

  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) return <Text>Playlist not found</Text>;

  const playlistActivities = activities.filter((a) => playlist.activityIds.includes(a.id));

  return (
    <View style={{ flex: 1 }}>
      <ActivityList
        header={playlist.name}
        activities={playlistActivities}
        onActivityPress={(activity) =>
          navigation.navigate("ActivityDetail", { activityId: activity.id })
        }
      />
    </View>
  );
}
