import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useActivities } from "../../context_temp/ActivityContext";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Library">;

const COLORS = ["#1F2A8A", "#4F6BD9", "#8BC34A", "#EF6C6C", "#E6D34E", "#55B97A"];

export default function LibraryScreen({ navigation }: Props) {
  const { activities, bookmarkedActivities, playlists, editPlaylist } = useActivities();

  const downloadsCount = activities.filter((a) => a.isDownloaded).length;
  const historyCount = activities.filter((a) => typeof a.lastViewedAt === "number").length;

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState(COLORS[2]);

  const openEdit = (playlistId: string) => {
    const p = playlists.find((x) => x.id === playlistId);
    if (!p) return;

    setEditingId(playlistId);
    setNameDraft(p.name);
    setColorDraft(p.color);
    setEditVisible(true);
  };

  const resetAll = () => {
    if (!editingId) return;
    const p = playlists.find((x) => x.id === editingId);
    if (!p) return;
    setNameDraft(p.name);
    setColorDraft(p.color);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = nameDraft.trim();
    if (!trimmed) return;

    editPlaylist(editingId, trimmed, colorDraft);
    setEditVisible(false);
    setEditingId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F3F5" }}>
      <View style={{ padding: 20 }}>
        {/* Title */}
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>Your Library</Text>

        {/* Bookmarks */}
        <Pressable
          onPress={() => navigation.navigate("Bookmarks")}
          style={{
            backgroundColor: "#2F3E75",
            padding: 18,
            borderRadius: 14,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Bookmarks</Text>
          <Text style={{ color: "#D0D5E8", marginTop: 4 }}>
            {bookmarkedActivities.length} activities
          </Text>
        </Pressable>

        {/* Downloads + History */}
        <View style={{ flexDirection: "row" }}>
          <Pressable
            onPress={() => navigation.navigate("Downloads")}
            style={{
              flex: 1,
              marginRight: 12,
              backgroundColor: "#2F3E75",
              padding: 18,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Downloads</Text>
            <Text style={{ color: "#D0D5E8", marginTop: 4 }}>{downloadsCount} activities</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("History")}
            style={{
              flex: 1,
              backgroundColor: "#2F3E75",
              padding: 18,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>History</Text>
            <Text style={{ color: "#D0D5E8", marginTop: 4 }}>{historyCount} activities</Text>
          </Pressable>
        </View>

        {/* Playlists header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Playlists</Text>

          <Pressable
            onPress={() => navigation.navigate("CreatePlaylistModal")}
            style={{
              backgroundColor: "#2F3E75",
              width: 32,
              height: 32,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 20 }}>+</Text>
          </Pressable>
        </View>

        {/* Playlist list */}
        {playlists.length === 0 ? (
          <Text style={{ color: "#777" }}>No playlists yet. Tap + to create one.</Text>
        ) : (
          playlists.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => navigation.navigate("Playlist", { playlistId: p.id })}
              style={{
                backgroundColor: p.color,
                padding: 16,
                borderRadius: 14,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "white" }}>{p.name}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
                    {p.activityIds.length} activities
                  </Text>
                </View>

                {/* ⋯ button opens EDIT ONLY */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation(); // don't open playlist screen
                    openEdit(p.id);
                  }}
                  style={{ paddingLeft: 10, paddingVertical: 4 }}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="white" />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Edit Playlist Modal (only edit, no delete) */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "white", borderRadius: 18, padding: 18 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#1E2A5A" }}>
                Edit Playlist
              </Text>

              <Pressable
                onPress={() => setEditVisible(false)}
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

            {/* Name */}
            <Text style={{ fontWeight: "800", color: "#1E2A5A", marginBottom: 6 }}>
              Playlist Name
            </Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
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

            {/* Color */}
            <Text style={{ fontWeight: "800", color: "#1E2A5A", marginTop: 16, marginBottom: 10 }}>
              Choose Color
            </Text>
            <View style={{ flexDirection: "row" }}>
              {COLORS.map((c) => {
                const selected = c === colorDraft;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColorDraft(c)}
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
                <Text style={{ color: "#1E2A5A", fontWeight: "800" }}>Reset All</Text>
              </Pressable>

              <Pressable
                onPress={saveEdit}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: "#2F3E75",
                  alignItems: "center",
                  backgroundColor: "white",
                }}
              >
                <Text style={{ color: "#2F3E75", fontWeight: "900" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
