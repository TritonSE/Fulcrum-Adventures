import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../Context/ActivityContext";
import { Typography } from "../../styles/typo";
import { showToast } from "../../utils/toast";

import type { Activity } from "../../types/activity";

const COLORS = ["#1F2A8A", "#4F6BD9", "#8BC34A", "#EF6C6C", "#E6D34E", "#55B97A"];
const CLOSE_ICON_SIZE = 20;
type Anchor = { x: number; y: number; width: number; height: number } | null;

export default function PlaylistScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const {
    playlists,
    activities,
    reorderPlaylistActivities,
    editPlaylist,
    deletePlaylist,
    restorePlaylist,
    removeFromPlaylist,
  } = useActivities();
  const insets = useSafeAreaInsets();

  const playlist = playlists.find((item) => item.id === playlistId);

  const menuAnchorRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState(COLORS[0]);
  const menuWidth = 220;

  const openMenu = () => {
    menuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMenuVisible(true);
    });
  };

  const playlistActivities = useMemo<Activity[]>(() => {
    if (!playlist) return [];
    const byId = new Map(activities.map((activity) => [activity.id, activity]));
    return playlist.activityIds.map((id) => byId.get(id)).filter(Boolean) as Activity[];
  }, [playlist, activities]);

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

    const previousName = playlist.name;
    const previousColor = playlist.color;
    editPlaylist(playlist.id, trimmed, colorDraft);
    setEditVisible(false);

    showToast("Playlist updated", {
      actionLabel: "Undo",
      onAction: () => editPlaylist(playlist.id, previousName, previousColor),
    });
  };

  const confirmDelete = () => {
    setMenuVisible(false);
    setConfirmDeleteVisible(true);
  };

  const doDelete = () => {
    const index = playlists.findIndex((item) => item.id === playlist.id);
    const snapshot = {
      id: playlist.id,
      name: playlist.name,
      color: playlist.color,
      activityIds: [...playlist.activityIds],
    };

    deletePlaylist(playlist.id);
    setConfirmDeleteVisible(false);
    router.back();

    showToast("Playlist deleted", {
      actionLabel: "Undo",
      onAction: () => restorePlaylist(snapshot, index),
    });
  };

  const menuLeft = anchor ? anchor.x + anchor.width - menuWidth - 6 : 0;
  const menuTop = anchor ? anchor.y + anchor.height + 8 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 24,
          paddingBottom: 16,
          backgroundColor: playlist.color,
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => router.back()} hitSlop={20}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
            <Text style={[Typography.displayLgBold, { color: "white" }]}>{playlist.name}</Text>
          </View>
          <View ref={menuAnchorRef}>
            <Pressable onPress={openMenu} hitSlop={10}>
              <Ionicons name="ellipsis-vertical" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      {playlistActivities.length > 0 ? (
        <ActivityList
          header=""
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
          onActivityPress={(activity) => router.push(`/activity/${activity.id}`)}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={[Typography.bodySm, { color: "#B4B4B4" }]}>No activities yet</Text>
        </View>
      )}

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
                left: Math.max(8, menuLeft),
                width: menuWidth,
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
                  setIsReordering((previous) => !previous);
                }}
                style={{ paddingVertical: 14, paddingHorizontal: 16 }}
              >
                <Text style={[Typography.bodyMd, { color: "#1E2A5A" }]}>
                  {isReordering ? "Done Rearranging" : "Rearrange"}
                </Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: "#EBEBEB" }} />

              <Pressable onPress={openEdit} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
                <Text style={[Typography.bodyMd, { color: "#1E2A5A" }]}>Edit Playlist</Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: "#EBEBEB" }} />

              <Pressable
                onPress={confirmDelete}
                style={{ paddingVertical: 14, paddingHorizontal: 16 }}
              >
                <Text style={[Typography.bodyMd, { color: "#EF4444" }]}>Delete Playlist</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                paddingHorizontal: 24,
                paddingTop: 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={[
                    Typography.displayMdBold,
                    { color: "#1E2A5A", fontSize: 30, lineHeight: 30 },
                  ]}
                >
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
                  <Ionicons name="close-outline" size={CLOSE_ICON_SIZE} color="#1E2A5A" />
                </Pressable>
              </View>

              <Text
                style={{
                  color: "#1E2A5A",
                  marginTop: 16,
                  marginBottom: 8,
                  fontFamily: "LeagueSpartan_700Bold",
                  fontSize: 14,
                  lineHeight: 18,
                }}
              >
                Playlist Name
              </Text>

              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                placeholder="Enter Playlist Name"
                placeholderTextColor="#153A7A"
                style={{
                  backgroundColor: "#F2F3F5",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: "#1E2A5A",
                  fontFamily: "InstrumentSans_400Regular",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              />

              <Text
                style={{
                  color: "#1E2A5A",
                  marginTop: 18,
                  marginBottom: 10,
                  fontFamily: "LeagueSpartan_700Bold",
                  fontSize: 14,
                  lineHeight: 18,
                }}
              >
                Choose Color
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {COLORS.map((color) => {
                  const selected = color === colorDraft;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => setColorDraft(color)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 7,
                        backgroundColor: color,
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
                    <Text style={[Typography.bodyMd, { color: "#1E2A5A" }]}>Reset All</Text>
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
                    <Text style={[Typography.bodyMd, { color: "#1E2A5A" }]}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

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
              maxWidth: 294,
              height: 112,
              backgroundColor: "white",
              borderRadius: 12,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}>
              <Text style={[Typography.bodyMdBold, { textAlign: "center", color: "#153A7A" }]}>
                Delete Playlist?
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: "#E6E6E6" }} />

            <View style={{ flexDirection: "row", height: 48 }}>
              <Pressable
                onPress={() => setConfirmDeleteVisible(false)}
                style={{
                  paddingBottom: 10,
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={[Typography.bodySm, { color: "#6B6F80" }]}>Cancel</Text>
              </Pressable>

              <View style={{ width: 1, backgroundColor: "#E6E6E6" }} />

              <Pressable
                onPress={doDelete}
                style={{
                  paddingBottom: 10,
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={[Typography.bodySm, { color: "#EF4444" }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
