import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BookmarkLibraryIcon from "../../../assets/icons/bookmark_icon.svg";
import CloseButton from "../../../assets/icons/CloseButton.svg";
import DownloadLibraryIcon from "../../../assets/icons/download-library.svg";
import HistoryLibraryIcon from "../../../assets/icons/history-library.svg";
import Plus from "../../../assets/icons/lucide_plus.svg";
import Pencil from "../../../assets/icons/PencilIcon.svg";
import TrashIcon from "../../../assets/icons/TrashIcon.svg";
import { Navbar } from "../../components/Navbar";
import { useActivities } from "../../context_temp/ActivityContext";
import { Typography } from "../../styles/typo";
import { showToast } from "../../utils/toast";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Library">;

const COLORS = ["#153A7A", "#4272D1", "#72CF1A", "#FF6B6B", "#ECD528", "#00BC7B"];
const CLOSE_ICON_SIZE = 20;

export default function LibraryScreen({ navigation }: Props) {
  const { playlists, editPlaylist, deletePlaylist, restorePlaylist } = useActivities();

  const insets = useSafeAreaInsets();

  const [manageVisible, setManageVisible] = useState(false);
  const [managingId, setManagingId] = useState<string | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

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
    const playlist = playlists.find((item) => item.id === managingId);
    if (!playlist) return;

    setManageVisible(false);
    setEditingId(playlist.id);
    setNameDraft(playlist.name);
    setColorDraft(playlist.color);
    setEditVisible(true);
  };

  const resetAll = () => {
    if (!editingId) return;
    const playlist = playlists.find((item) => item.id === editingId);
    if (!playlist) return;
    setNameDraft(playlist.name);
    setColorDraft(playlist.color);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = nameDraft.trim();
    if (!trimmed) return;

    const previous = playlists.find((playlist) => playlist.id === editingId);
    if (!previous) return;

    editPlaylist(editingId, trimmed, colorDraft);
    setEditVisible(false);

    const editedId = editingId;
    setEditingId(null);

    setTimeout(() => {
      showToast("Playlist edited!", {
        actionLabel: "Undo",
        onAction: () => editPlaylist(editedId, previous.name, previous.color),
      });
    }, 0);
  };

  const deleteFromManage = () => {
    if (!managingId) return;
    closeManage();
    setPlaylistToDelete(managingId);
    setConfirmDeleteVisible(true);
  };

  const confirmDeletePlaylist = () => {
    if (!playlistToDelete) return;

    const index = playlists.findIndex((playlist) => playlist.id === playlistToDelete);
    const deleted = playlists[index];
    if (!deleted) {
      setConfirmDeleteVisible(false);
      setPlaylistToDelete(null);
      return;
    }

    deletePlaylist(deleted.id);
    setConfirmDeleteVisible(false);
    setPlaylistToDelete(null);

    setTimeout(() => {
      showToast("Playlist deleted!", {
        actionLabel: "Undo",
        onAction: () => restorePlaylist(deleted, index),
      });
    }, 0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F3F5" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 73 - insets.top,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Typography.displayMdBold, { marginBottom: 16, color: "#153A7A" }]}>
          Library
        </Text>

        <Pressable
          onPress={() => navigation.navigate("Bookmarks")}
          style={{
            backgroundColor: "#153A7A",
            padding: 12,
            height: 123,
            borderRadius: 16,
            marginBottom: 12,
            display: "flex",
            alignSelf: "stretch",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <View>
            <BookmarkLibraryIcon width={34} height={34} />
          </View>
          <View>
            <Text style={[Typography.displayXSmBold, { color: "white" }]}>Bookmarks</Text>
            <Text style={[Typography.caption, { color: "#D0D5E8", marginTop: 2 }]}>
              Save for later
            </Text>
          </View>
        </Pressable>

        <View style={{ flexDirection: "row" }}>
          <Pressable
            onPress={() => navigation.navigate("Downloads")}
            style={{
              flex: 1,
              marginRight: 12,
              backgroundColor: "#153A7A",
              padding: 12,
              borderRadius: 16,
              height: 123,
              justifyContent: "space-between",
            }}
          >
            <View>
              <DownloadLibraryIcon width={34} height={34} />
            </View>
            <View>
              <Text style={[Typography.displayXSmBold, { color: "white" }]}>Downloads</Text>
              <Text style={[Typography.caption, { color: "#D0D5E8", marginTop: 2 }]}>
                Available offline
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("History")}
            style={{
              flex: 1,
              backgroundColor: "#153A7A",
              padding: 12,
              borderRadius: 16,
              height: 123,
              justifyContent: "space-between",
            }}
          >
            <View>
              <HistoryLibraryIcon width={34} height={34} />
            </View>
            <View>
              <Text style={[Typography.displayXSmBold, { color: "white" }]}>History</Text>
              <Text style={[Typography.caption, { color: "#D0D5E8", marginTop: 2 }]}>
                Recently viewed
              </Text>
            </View>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 40,
            marginBottom: 16,
          }}
        >
          <Text style={[Typography.displaySmBold, { color: "#153A7A" }]}>Your Playlists</Text>

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
            <Plus width={38} height={38} color="white" />
          </Pressable>
        </View>
        {playlists.length === 0 ? (
          <Text style={{ color: "#EBEBEB" }}></Text>
        ) : (
          playlists.map((playlist) => (
            <Pressable
              key={playlist.id}
              onPress={() => navigation.navigate("Playlist", { playlistId: playlist.id })}
              style={{
                backgroundColor: playlist.color,
                height: 102,
                paddingHorizontal: 16,
                paddingVertical: 18,
                borderRadius: 16,
                marginBottom: 12,
                justifyContent: "center",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[Typography.displayXSmBold, { color: "white", lineHeight: 22 }]}>
                    {playlist.name}
                  </Text>
                  <Text style={[Typography.caption, { color: "#EBEBEB", marginTop: 8 }]}>
                    {playlist.activityIds.length} activities
                  </Text>
                </View>

                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    openManage(playlist.id);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.14)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="white" />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 8, backgroundColor: "#F2F3F5" }}>
        <Navbar
          currentTab="Library"
          onSwitchTab={(tab) => {
            if (tab === "Library") navigation.navigate("Library");
          }}
        />
      </View>

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
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 16,
              }}
            >
              <Text style={[Typography.displayMdBold, { color: "#153A7A" }]}>Manage Playlist</Text>

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
                <View>
                  <CloseButton width={34} height={34} />
                </View>
              </Pressable>
            </View>

            <Pressable
              onPress={startEditFromManage}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingBottom: 8,
                gap: 10,
              }}
            >
              <Pencil width={17} height={17} />
              <Text style={[Typography.bodyMd, { color: "#153A7A" }]}>Edit Playlist</Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: "#EBEBEB" }} />

            <Pressable
              onPress={deleteFromManage}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 10 }}
            >
              <TrashIcon width={17} height={17} />
              <Text style={[Typography.bodyMd, { color: "#EF4444" }]}>Delete Playlist</Text>
            </Pressable>

            <View style={{ height: 6 }} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.1)",
            justifyContent: "flex-end",
          }}
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
                  { color: "#153A7A", fontSize: 30, lineHeight: 30 },
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
                hitSlop={10}
              >
                <Ionicons name="close-outline" size={CLOSE_ICON_SIZE} color="#153A7A" />
              </Pressable>
            </View>

            <Text
              style={{
                color: "#153A7A",
                paddingTop: 24,
                marginBottom: 8,
                ...Typography.displayXSmBold,
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
                color: "#153A7A",
                fontFamily: "InstrumentSans_400Regular",
                fontSize: 14,
                lineHeight: 21,
              }}
            />

            <Text
              style={{
                color: "#153A7A",
                paddingTop: 24,
                marginBottom: 10,
                ...Typography.displayXSmBold,
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
                      borderColor: selected ? "#153A7A" : "transparent",
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
                  <Text style={[Typography.bodyMd, { color: "#153A7A" }]}>Reset All</Text>
                </Pressable>

                <Pressable
                  onPress={saveEdit}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: "#153A7A",
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
      </Modal>

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
              maxWidth: 294,
              height: 112,
              backgroundColor: "white",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}>
              <Text style={[Typography.bodyMdBold, { color: "#153A7A", textAlign: "center" }]}>
                Delete Playlist?
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: "#D9D9D9" }} />

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

              <View style={{ width: 1, backgroundColor: "#D9D9D9" }} />

              <Pressable
                onPress={confirmDeletePlaylist}
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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
