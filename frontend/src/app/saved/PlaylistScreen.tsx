import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context_temp/ActivityContext";
import { showToast } from "../../utils/toast";

import type { Activity } from "../../types/activity";
import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Playlist">;

const COLORS = ["#1F2A8A", "#4F6BD9", "#8BC34A", "#EF6C6C", "#E6D34E", "#55B97A"];

type Anchor = { x: number; y: number; width: number; height: number } | null;

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

  //Menu header anchor
  const menuAnchorRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>(null);
  const MENU_WIDTH = 220;

  const openMenu = () => {
    menuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMenuVisible(true);
    });
  };

  //reoder and modals
  const [isReordering, setIsReordering] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState(COLORS[0]);

  const playlistActivities = useMemo<Activity[]>(() => {
    if (!playlist) return [];
    const byId = new Map(activities.map((a) => [a.id, a]));
    return playlist.activityIds.map((id) => byId.get(id)).filter(Boolean) as Activity[];
  }, [playlist, activities]);

  useLayoutEffect(() => {
    if (!playlist) return;

    navigation.setOptions({
      headerStyle: { backgroundColor: playlist.color },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "800" },
      headerTitle: playlist.name,
      headerRight: () => (
        <View ref={menuAnchorRef} collapsable={false}>
          <Pressable onPress={openMenu} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="ellipsis-vertical" size={18} color="white" />
          </Pressable>
        </View>
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

  //Actions
  const openEdit = () => {
    setMenuVisible(false);
    setNameDraft(playlist.name);
    setColorDraft(playlist.color);
    setEditVisible(true);
  };

  const saveEdit = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;

    const prevName = playlist.name;
    const prevColor = playlist.color;
    const nextName = trimmed;
    const nextColor = colorDraft;

    editPlaylist(playlist.id, nextName, nextColor);
    setEditVisible(false);

    // Undo edit toast
    showToast("Playlist updated", {
      actionLabel: "Undo",
      onAction: () => editPlaylist(playlist.id, prevName, prevColor),
    });
  };

  const confirmDelete = () => {
    setMenuVisible(false);
    setConfirmDeleteVisible(true);
  };

  const doDelete = () => {
    // Snapshot for undo
    const index = playlists.findIndex((p) => p.id === playlist.id);
    const snapshot = {
      id: playlist.id,
      name: playlist.name,
      color: playlist.color,
      activityIds: [...playlist.activityIds],
    };

    deletePlaylist(playlist.id);
    setConfirmDeleteVisible(false);
    navigation.goBack();

    //Undo delete toast
    showToast("Playlist deleted", {
      actionLabel: "Undo",
      onAction: () => restorePlaylist(snapshot, index),
    });
  };

  //Anchored menu positioning (slightly left of ⋯)
  const menuLeft = anchor ? anchor.x + anchor.width - MENU_WIDTH - 6 : 0; // -6 for a tiny offset
  const menuTop = anchor ? anchor.y + anchor.height + 8 : 0;

  return (
    <View style={{ flex: 1, marginTop: 12 }}>
      <ActivityList
        header=""
        activities={playlistActivities}
        fill
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

      {/*Menu (anchored near header dots, slightly left) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.15)" }}
          onPress={() => setMenuVisible(false)}
        >
          {!!anchor && (
            <View
              style={{
                position: "absolute",
                top: menuTop,
                left: Math.max(8, menuLeft), // clamp left edge
                width: MENU_WIDTH,
                backgroundColor: "white",
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
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

              <View style={{ height: 1, backgroundColor: "#EBEBEB" }} />

              <Pressable onPress={openEdit} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 16, color: "#1E2A5A" }}>Edit Playlist</Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: "#EBEBEB" }} />

              <Pressable
                onPress={confirmDelete}
                style={{ paddingVertical: 14, paddingHorizontal: 16 }}
              >
                <Text style={{ fontSize: 16, color: "#D64545", fontWeight: "600" }}>
                  Delete Playlist
                </Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>

      {/* Edit modal (slides up from bottom) */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
          onPress={() => setEditVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E2A5A" }}>
                Edit Playlist
              </Text>

              <Pressable
                onPress={() => setEditVisible(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#EBEBEB",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                }}
                hitSlop={12}
              >
                <Ionicons name="close" size={18} color="#1E2A5A" />
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#1E2A5A",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
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
                fontSize: 14,
                fontWeight: "500",
              }}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#1E2A5A",
                marginTop: 18,
                marginBottom: 10,
              }}
            >
              Choose Color
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
                      borderWidth: selected ? 3 : 0,
                      borderColor: selected ? "#111" : "transparent",
                    }}
                  />
                );
              })}
            </View>

            <View
              style={{
                marginTop: 18,
                marginHorizontal: -24,
                backgroundColor: "#F9F9F9",
                borderBottomLeftRadius: 22,
                borderBottomRightRadius: 22,
                paddingBottom: 24,
              }}
            >
              <View style={{ height: 1, backgroundColor: "#EBEBEB" }} />

              <View
                style={{ paddingTop: 16, paddingHorizontal: 24, flexDirection: "row", gap: 12 }}
              >
                <Pressable
                  onPress={() => {
                    setNameDraft(playlist.name);
                    setColorDraft(playlist.color);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 22,
                    backgroundColor: "#EEF0F4",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#1E2A5A", fontSize: 16, fontWeight: "600" }}>
                    Reset All
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveEdit}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 22,
                    borderWidth: 2,
                    borderColor: "#2F3E75",
                    backgroundColor: "white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#1E2A5A", fontSize: 16, fontWeight: "600" }}>Save</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete confirm (center) */}
      <Modal
        visible={confirmDeleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
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
                style={{ fontSize: 18, fontWeight: "800", textAlign: "center", color: "#1E2A5A" }}
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
