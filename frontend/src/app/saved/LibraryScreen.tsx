import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import BookmarkLibraryIcon from "../../../assets/icons/bookmark_icon.svg";
import DownloadLibraryIcon from "../../../assets/icons/download-library.svg";
import HistoryLibraryIcon from "../../../assets/icons/history-library.svg";
import { useActivities } from "../../context_temp/ActivityContext";
import { Typography } from "../../styles/typo";
import { showToast } from "../../utils/toast";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Library">;

const COLORS = ["#153A7A", "#4272D1", "#72CF1A", "#FF6B6B", "#ECD528", "#00BC7B"];

export default function LibraryScreen({ navigation }: Props) {
  const {
    activities,
    bookmarkedActivities,
    playlists,
    editPlaylist,
    deletePlaylist,
    restorePlaylist,
  } = useActivities();

  const downloadsCount = activities.filter((a) => a.isDownloaded).length;
  const historyCount = activities.filter((a) => typeof a.lastViewedAt === "number").length;

  // Manage sheet state
  const [manageVisible, setManageVisible] = useState(false);
  const [managingId, setManagingId] = useState<string | null>(null);

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState(COLORS[2]);

  const openManage = (playlistId: string) => {
    setManagingId(playlistId);
    setManageVisible(true);
  };

  const closeManage = () => {
    setManageVisible(false);
    setManagingId(null);
  };

  const startEditFromManage = () => {
    if (!managingId) return;
    const p = playlists.find((x) => x.id === managingId);
    if (!p) return;

    setManageVisible(false);

    setEditingId(p.id);
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

  // Edit with undo toast
  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = nameDraft.trim();
    if (!trimmed) return;

    const prev = playlists.find((p) => p.id === editingId);
    if (!prev) return;

    editPlaylist(editingId, trimmed, colorDraft);

    setEditVisible(false);
    const id = editingId;
    setEditingId(null);

    setTimeout(() => {
      showToast("Playlist edited!", {
        actionLabel: "Undo",
        onAction: () => editPlaylist(id, prev.name, prev.color),
      });
    }, 0);
  };

  // Delete with undo toast (from manage sheet)
  const deleteFromManage = () => {
    if (!managingId) return;

    // close manage sheet first
    closeManage();

    // open confirmation popup
    setPlaylistToDelete(managingId);
    setConfirmDeleteVisible(true);
  };

  const confirmDeletePlaylist = () => {
    if (!playlistToDelete) return;

    const index = playlists.findIndex((p) => p.id === playlistToDelete);
    const deleted = playlists[index];
    if (!deleted) {
      setConfirmDeleteVisible(false);
      setPlaylistToDelete(null);
      return;
    }

    deletePlaylist(deleted.id);

    setConfirmDeleteVisible(false);
    setPlaylistToDelete(null);

    // toast undo
    setTimeout(() => {
      showToast("Playlist deleted!", {
        actionLabel: "Undo",
        onAction: () => restorePlaylist(deleted, index),
      });
    }, 0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F3F5" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
        {/* Title */}
        <Text style={[Typography.displayLg, { marginBottom: 24, color: "#153A7A" }]}>
          Your Library
        </Text>

        {/* Bookmarks */}
        <Pressable
          onPress={() => navigation.navigate("Bookmarks")}
          style={{
            backgroundColor: "#153A7A",
            padding: 18,
            height: 123,
            borderRadius: 14,
            marginBottom: 12,
          }}
        >
          <View style={{ padding: 6, paddingLeft: 0 }}>
            <BookmarkLibraryIcon width={34} height={34} />
          </View>
          <Text style={[Typography.displayMd, { color: "white" }]}>Bookmarks</Text>
          <Text style={[Typography.caption, { color: "#D0D5E8", marginTop: 4 }]}>
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
              backgroundColor: "#153A7A",
              padding: 18,
              borderRadius: 14,
              height: 123,
            }}
          >
            <View style={{ padding: 6, paddingLeft: 0 }}>
              <DownloadLibraryIcon width={34} height={34} />
            </View>
            <Text style={[Typography.displayMd, { color: "white" }]}>Downloads</Text>
            <Text style={[Typography.caption, { color: "#D0D5E8", marginTop: 4 }]}>
              {downloadsCount} activities
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("History")}
            style={{
              flex: 1,
              backgroundColor: "#153A7A",
              padding: 18,
              borderRadius: 14,
              height: 123,
            }}
          >
            <View style={{ padding: 6, paddingLeft: 0 }}>
              <HistoryLibraryIcon width={34} height={34} />
            </View>
            <Text style={[Typography.displayMd, { color: "white" }]}>History</Text>
            <Text style={[Typography.caption, { color: "#D0D5E8", marginTop: 4 }]}>
              {historyCount} activities
            </Text>
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
          <Text style={[Typography.displayLg, { color: "#153A7A", marginBottom: 16 }]}>
            Your Playlists
          </Text>

          <Pressable
            onPress={() => navigation.navigate("CreatePlaylistModal")}
            style={{
              backgroundColor: "#153A7A",
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
          <Text style={{ color: "#EBEBEB" }}></Text>
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
                  <Text style={{ color: "#EBEBEB", marginTop: 4 }}>
                    {p.activityIds.length} activities
                  </Text>
                </View>

                {/* ⋯ button opens MANAGE */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    openManage(p.id);
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

      {/* Manage Playlist Bottom Sheet */}
      <Modal visible={manageVisible} transparent animationType="slide">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.1)",
            justifyContent: "flex-end",
          }}
          onPress={closeManage}
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
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: "800", color: "#153A7A" }}>
                Manage Playlist
              </Text>

              <Pressable
                onPress={closeManage}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#EBEBEB",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={10}
              >
                <Ionicons name="close" size={18} color="#153A7A" />
              </Pressable>
            </View>

            {/* Rows */}
            <Pressable
              onPress={startEditFromManage}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 18, gap: 12 }}
            >
              <Ionicons name="pencil" size={20} color="#153A7A" />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#153A7A" }}>
                Edit Playlist
              </Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: "#EBEBEB" }} />

            <Pressable
              onPress={deleteFromManage}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 18, gap: 12 }}
            >
              <Ionicons name="trash-outline" size={20} color="#D64545" />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#D64545" }}>
                Delete Playlist
              </Text>
            </Pressable>

            <View style={{ height: 6 }} />
          </Pressable>
        </Pressable>
      </Modal>
      {/* Edit modal (name + color) - slide up bottom sheet */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        {/* Backdrop */}
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.1)",
            justifyContent: "flex-end",
          }}
          onPress={() => setEditVisible(false)}
        >
          {/* Sheet (stop propagation) */}
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: 24,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "LeagueSpartan_700Bold",
                  fontSize: 30,
                  fontWeight: "700",
                  color: "#153A7A",
                }}
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
                hitSlop={10}
              >
                <Ionicons name="close" size={18} color="#153A7A" />
              </Pressable>
            </View>

            {/* Name */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#153A7A",
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
                color: "#153A7A",
                fontSize: 14,
                fontWeight: "500",
              }}
            />

            {/* Color */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: "#153A7A",
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
                      borderColor: selected ? "#153A7A" : "transparent",
                    }}
                  />
                );
              })}
            </View>

            {/* Bottom bar */}
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
                  onPress={resetAll}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 22,
                    backgroundColor: "#EEF0F4",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#153A7A", fontSize: 16, fontWeight: "600" }}>
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
                    borderColor: "#153A7A",
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
      {/* Delete confirmation popup (iOS style) */}
      <Modal
        visible={confirmDeleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
          onPress={() => setConfirmDeleteVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              width: "100%",
              maxWidth: 360,
              backgroundColor: "white",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            <View style={{ paddingVertical: 18, paddingHorizontal: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#153A7A",
                  textAlign: "center",
                }}
              >
                Delete Playlist?
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: "#D9D9D9" }} />

            <View style={{ flexDirection: "row", height: 48 }}>
              <Pressable
                onPress={() => setConfirmDeleteVisible(false)}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 16, color: "#6B6F80", fontWeight: "500" }}>Cancel</Text>
              </Pressable>

              <View style={{ width: 1, backgroundColor: "#D9D9D9" }} />

              <Pressable
                onPress={confirmDeletePlaylist}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 16, color: "#D64545", fontWeight: "600" }}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
