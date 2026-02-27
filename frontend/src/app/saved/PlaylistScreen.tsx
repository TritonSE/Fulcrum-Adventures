import Ionicons from "@expo/vector-icons/Ionicons";
import { useLayoutEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";
import { showToast } from "../../utils/toast";

import type { Activity } from "../../types/activity";
import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Playlist">;

const COLORS = ["#1F2A8A", "#4F6BD9", "#8BC34A", "#EF6C6C", "#E6D34E", "#55B97A"];

export default function PlaylistScreen({ route, navigation }: Props) {
  const { playlistId } = route.params;

  const {
    playlists,
    activities,
    reorderPlaylistActivities,
    editPlaylist,
    deletePlaylist,
    restorePlaylist,
    removeFromPlaylist,
  } = useActivities();

  const playlist = playlists.find((p) => p.id === playlistId);

  const [menuVisible, setMenuVisible] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  // ✅ safe initial values (don’t touch playlist.* here)
  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState(COLORS[0]);

  // ✅ when playlist becomes available (or changes), sync drafts
  // useLayoutEffect(() => {
  //   if (!playlist) return;
  //   setNameDraft(playlist.name);
  //   setColorDraft(playlist.color);
  // }, [playlist?.id]);

  // ✅ Hook must be called every render (even if playlist is missing)
  const playlistActivities = useMemo<Activity[]>(() => {
    if (!playlist) return [];
    const byId = new Map(activities.map((a) => [a.id, a]));
    return playlist.activityIds.map((id) => byId.get(id)).filter(Boolean) as Activity[];
  }, [playlist, activities]);

  // ✅ header styling (also must run every render)
  useLayoutEffect(() => {
    if (!playlist) return;

    navigation.setOptions({
      headerStyle: { backgroundColor: playlist.color },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "800" },
      headerTitle: playlist.name,
      headerRight: () => (
        <Pressable onPress={() => setMenuVisible(true)} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="ellipsis-vertical" size={18} color="white" />
        </Pressable>
      ),
    });
  }, [navigation, playlist?.color, playlist?.name]);

  if (!playlist) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Playlist not found</Text>
      </View>
    );
  }

  const openEdit = () => {
    setMenuVisible(false);
    setNameDraft(playlist.name);
    setColorDraft(playlist.color);
    setEditVisible(true);
  };

  const saveEdit = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;

    // capture previous values for undo
    const prev = { name: playlist.name, color: playlist.color };

    editPlaylist(playlist.id, trimmed, colorDraft);

    // close modal first so toast isn't hidden behind it
    setEditVisible(false);

    // show toast next tick
    setTimeout(() => {
      showToast("Playlist edited!", {
        actionLabel: "Undo",
        onAction: () => editPlaylist(playlist.id, prev.name, prev.color),
      });
    }, 0);
  };

  const confirmDelete = () => {
    setMenuVisible(false);
    setConfirmDeleteVisible(true);
  };

  const doDelete = () => {
    // capture playlist + index for undo restore
    const index = playlists.findIndex((p) => p.id === playlist.id);
    const deleted = playlist; // playlist object we already have

    deletePlaylist(playlist.id);
    setConfirmDeleteVisible(false);

    // navigate back first (so toast appears on previous screen and isn't covered)
    navigation.goBack();

    // toast next tick
    setTimeout(() => {
      showToast("Playlist deleted!", {
        actionLabel: "Undo",
        onAction: () => restorePlaylist(deleted, index),
      });
    }, 0);
  };

  return (
    <View style={{ flex: 1 }}>
      <ActivityList
        header=""
        showHeader={false}
        activities={playlistActivities}
        isEditing={isReordering}
        onReorder={(newOrder) =>
          reorderPlaylistActivities(
            playlist.id,
            newOrder.map((a) => a.id),
          )
        }
        enableSwipeDelete={!isReordering}
        onDelete={(activityId) => removeFromPlaylist(playlist.id, activityId)}
        onActivityPress={(a) => navigation.navigate("ActivityDetail", { activityId: a.id })}
      />

      {/* ⋯ Menu (rounded with red delete) */}
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
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                setIsReordering((prev) => !prev);
              }}
              style={{ paddingVertical: 14, paddingHorizontal: 16 }}
            >
              <Text style={{ fontSize: 16, color: "#1E2A5A" }}>
                {isReordering ? "Done Rearranging" : "Rearrange"}
              </Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: "#E6E6E6" }} />

            <Pressable onPress={openEdit} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, color: "#1E2A5A" }}>Edit Name</Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: "#E6E6E6" }} />

            <Pressable
              onPress={confirmDelete}
              style={{ paddingVertical: 14, paddingHorizontal: 16 }}
            >
              <Text style={{ fontSize: 16, color: "#D64545", fontWeight: "600" }}>
                Delete Playlist
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Edit modal (name + color) */}
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
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#1E2A5A", marginBottom: 12 }}>
              Edit Playlist
            </Text>

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

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable onPress={() => setEditVisible(false)} style={{ padding: 10 }}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveEdit} style={{ padding: 10 }}>
                <Text style={{ color: "#2F3E75", fontWeight: "900" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirm (iOS style) */}
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

            <View style={{ height: 1, backgroundColor: "#E6E6E6" }} />

            <View style={{ flexDirection: "row", height: 48 }}>
              <Pressable
                onPress={() => setConfirmDeleteVisible(false)}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 16, color: "#6B6F80" }}>Cancel</Text>
              </Pressable>

              <View style={{ width: 1, backgroundColor: "#E6E6E6" }} />

              <Pressable
                onPress={doDelete}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 16, color: "#D64545", fontWeight: "700" }}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
