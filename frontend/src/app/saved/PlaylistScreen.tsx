import { useState } from "react";
import { Text, View } from "react-native";

import { useActivities } from "../../context_temp/ActivityContext";
import { usePlaylists } from "../../context_temp/PlaylistContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Playlist">;

export default function PlaylistScreen({ route }: Props) {
  const { playlistId } = route.params;

  const { playlists } = usePlaylists();
  const { activities } = useActivities();

  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return <Text>Playlist not found</Text>;
  }

  const playlistActivities = activities.filter((a) => playlist.activityIds.includes(a.id));

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>{playlist.name}</Text>

      {playlistActivities.map((a) => (
        <Text key={a.id} style={{ marginTop: 12 }}>
          {a.title}
        </Text>
      ))}
    </View>
  );
}
