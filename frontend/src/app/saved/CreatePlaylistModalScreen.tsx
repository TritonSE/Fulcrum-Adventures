import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "CreatePlaylistModal">;

const COLORS = ["#1F2A8A", "#4F6BD9", "#8BC34A", "#EF6C6C", "#E6D34E", "#55B97A"];

export default function CreatePlaylistModalScreen({ navigation, route }: Props) {
  const { createPlaylist, addToPlaylist, toggleSaved } = useActivities();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[2]); // default green like your mock

  const activityId = route.params?.activityId;

  const canCreate = name.trim().length > 0;

  const resetAll = () => {
    setName("");
    setColor(COLORS[2]);
  };

  const onCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newPlaylistId = createPlaylist(trimmed, color);

    // If opened from LibraryPopup, auto-add + ensure bookmarked
    if (activityId) {
      addToPlaylist(newPlaylistId, activityId);
      toggleSaved(activityId);
    }

    resetAll();
    navigation.goBack();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 18,
          padding: 18,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E2A5A" }}>Create Playlist</Text>

          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#E6E6E6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="close" size={18} color="#2F3E75" />
          </Pressable>
        </View>

        {/* Playlist Name */}
        <Text style={{ fontWeight: "700", color: "#1E2A5A", marginBottom: 6 }}>Playlist Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter Playlist Name"
          placeholderTextColor="#8A8FA3"
          style={{
            backgroundColor: "#F2F3F5",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: "#1E2A5A",
          }}
        />

        {/* Choose Color */}
        <Text style={{ fontWeight: "700", color: "#1E2A5A", marginTop: 16, marginBottom: 10 }}>
          Choose Color
        </Text>

        <View style={{ flexDirection: "row" }}>
          {COLORS.map((c) => {
            const selected = c === color;
            return (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: c,
                  marginRight: 10,
                  borderWidth: selected ? 3 : 0,
                  borderColor: selected ? "#111" : "transparent",
                }}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 18 }}>
          <Pressable
            onPress={resetAll}
            style={{
              flex: 1,
              marginRight: 10,
              paddingVertical: 12,
              borderRadius: 22,
              backgroundColor: "#EEF0F4",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#1E2A5A", fontWeight: "700" }}>Reset All</Text>
          </Pressable>

          <Pressable
            onPress={onCreate}
            disabled={!canCreate}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: "#2F3E75",
              alignItems: "center",
              opacity: canCreate ? 1 : 0.5,
              backgroundColor: "white",
            }}
          >
            <Text style={{ color: "#2F3E75", fontWeight: "800" }}>Create Playlist</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
