import Ionicons from "@expo/vector-icons/Ionicons";
import { useLayoutEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";
import { showToast } from "../../utils/toast";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Playlist">;

const COLORS = ["#1F2A8A", "#4F6BD9", "#8BC34A", "#EF6C6C", "#E6D34E", "#55B97A"];

export default function PlaylistScreen({ route, navigation }: Props) {
  const { playlistId } = route.params;
  const { markViewed } = useActivities();

  const { playlists, activities, reorderPlaylistActivities, editPlaylist, deletePlaylist } =
    useActivities();

  const playlist = playlists.find((p) => p.id === playlistId);

  const [menuVisible, setMenuVisible] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState(COLORS[0]);

  // Keep playlist activities in playlist order
  const playlistActivities = useMemo(() => {
    if (!playlist) return [];
    const byId = new Map(activities.map((a) => [a.id, a]));
    return playlist.activityIds.map((id) => byId.get(id)).filter(Boolean) as typeof activities;
  }, [playlist, activities]);

  useLayoutEffect(() => {
    if (!playlist) return;

    navigation.setOptions({
      headerStyle: { backgroundColor: playlist.color },
      headerTintColor: "white",
      headerTitle: playlist.name,
      headerRight: () => (
        <Pressable onPress={() => setMenuVisible(true)} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="ellipsis-vertical" size={18} color="white" />
        </Pressable>
      ),
    });
  }, [navigation, playlist]);

  if (!playlist) return null;

  const openEdit = () => {
    setMenuVisible(false);
    setNameDraft(playlist.name);
    setColorDraft(playlist.color);
    setEditVisible(true);
  };

  const saveEdit = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    editPlaylist(playlist.id, trimmed, colorDraft);
    showToast("Playlist updated", trimmed);

    setEditVisible(false);
  };

  const confirmDelete = () => {
    setMenuVisible(false);
    setConfirmDeleteVisible(true);
  };

  const doDelete = () => {
    deletePlaylist(playlist.id);
    setConfirmDeleteVisible(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <ActivityList
        header="" // header is in the navigation bar
        activities={playlistActivities}
        isEditing={isReordering}
        onReorder={(newOrder) =>
          reorderPlaylistActivities(
            playlist.id,
            newOrder.map((a) => a.id),
          )
        }
        onActivityPress={(a) => {
          markViewed(a.id);
          navigation.navigate("ActivityDetail", { activityId: a.id });
        }}
      />

      {/* ⋯ Menu */}
      {/* ⋯ Styled Menu */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.25)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={{
              width: 220,
              backgroundColor: "white",
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            {/* Rearrange */}
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                setIsReordering(true);
              }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: 16, color: "#1E2A5A" }}>
                {isReordering ? "Done Rearranging" : "Rearrange"}
              </Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: "#E6E6E6" }} />

            {/* Edit */}
            <Pressable
              onPress={openEdit}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: 16, color: "#1E2A5A" }}>Edit Name</Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: "#E6E6E6" }} />

            {/* Delete */}
            <Pressable
              onPress={confirmDelete}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: 16, color: "#D64545", fontWeight: "600" }}>
                Delete Playlist
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Playlist Modal */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "white", borderRadius: 16, padding: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 12 }}>Edit Playlist</Text>

            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Name</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Playlist name"
              style={{
                backgroundColor: "#F2F3F5",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />

            <Text style={{ fontWeight: "700", marginTop: 14, marginBottom: 10 }}>Color</Text>
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

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable onPress={() => setEditVisible(false)} style={{ padding: 10 }}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveEdit} style={{ padding: 10 }}>
                <Text style={{ color: "#2F3E75", fontWeight: "800" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirm */}
      {/* iOS-style Delete Confirmation */}
      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: 18,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            {/* Title */}
            <View style={{ paddingVertical: 20, paddingHorizontal: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  textAlign: "center",
                  color: "#1E2A5A",
                }}
              >
                Remove Playlist?
              </Text>
            </View>

            {/* Horizontal divider */}
            <View style={{ height: 1, backgroundColor: "#E6E6E6" }} />

            {/* Buttons row */}
            <View style={{ flexDirection: "row", height: 48 }}>
              {/* Cancel */}
              <Pressable
                onPress={() => setConfirmDeleteVisible(false)}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16, color: "#6B6F80" }}>Cancel</Text>
              </Pressable>

              {/* Vertical divider */}
              <View style={{ width: 1, backgroundColor: "#E6E6E6" }} />

              {/* Remove */}
              <Pressable
                onPress={doDelete}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#D64545",
                    fontWeight: "700",
                  }}
                >
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Done button while reordering (optional but nice) */}
      {isReordering && (
        <Pressable
          onPress={() => setIsReordering(false)}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            backgroundColor: "#2F3E75",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}
