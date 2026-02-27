// src/components/LibraryPopup.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useActivities } from "../context_temp/ActivityContext";
import { showToast } from "../utils/toast";

import type { RootStackParamList } from "../types/navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  visible: boolean;
  onClose: () => void;
  activityId: string;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const LibraryPopup: React.FC<Props> = ({ visible, onClose, activityId }) => {
  const {
    activities,
    bookmarkedActivities,
    playlists,
    addToPlaylist,
    removeFromPlaylist,
    setSaved,
  } = useActivities();
  const navigation = useNavigation<Nav>();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedState, setSavedState] = useState<boolean>(false);

  // Global saved state (used only to initialize when popup opens)
  const currentlySaved = useMemo(() => {
    return activities.find((a) => a.id === activityId)?.isSaved ?? false;
  }, [activities, activityId]);

  const bookmarksCount = bookmarkedActivities.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleToggleBookmark = () => {
    const next = !savedState;
    setSavedState(next);
    setSaved(activityId, next);
    showToast(next ? "Saved to Bookmarks" : "Removed from Bookmarks");
  };

  const handleDone = () => {
    if (selectedIds.length > 0) {
      // Keep track of what we added
      const addedPlaylistIds = [...selectedIds];

      addedPlaylistIds.forEach((playlistId) => addToPlaylist(playlistId, activityId));

      setSaved(activityId, savedState);

      showToast("Added to playlist!", {
        actionLabel: "Undo",
        onAction: () => {
          addedPlaylistIds.forEach((playlistId) => removeFromPlaylist(playlistId, activityId));
          setSaved(activityId, currentlySaved);
        },
      });
    } else {
      setSaved(activityId, savedState);
      showToast(savedState ? "Saved to Bookmarks" : "Removed from Bookmarks");
    }

    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onShow={() => {
        setSavedState(currentlySaved);
        setSelectedIds([]);
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* grab handle */}
          <View style={styles.handle} />

          {/* header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Library</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={18} color="#111827" />
            </Pressable>
          </View>

          {/* Bookmarked boxed card */}
          <View style={styles.cardBox}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Bookmarked</Text>
                <Text style={styles.cardSub}>{bookmarksCount} activities</Text>
              </View>

              <Pressable
                onPress={handleToggleBookmark}
                style={({ pressed }) => [styles.iconPill, pressed && { opacity: 0.85 }]}
                hitSlop={10}
              >
                <Ionicons
                  name={savedState ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color="#1F2A44"
                />
              </Pressable>
            </View>
          </View>

          {/* Playlists boxed section */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Save to Playlist</Text>

              <Pressable
                onPress={() => {
                  onClose();
                  navigation.navigate("CreatePlaylistModal", { activityId });
                }}
              >
                <Text style={styles.createNew}>Create New</Text>
              </Pressable>
            </View>

            {playlists.length === 0 ? (
              <Text style={styles.emptyText}>No playlists yet. Create one above.</Text>
            ) : (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 320 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => {
                  const selected = selectedIds.includes(item.id);

                  return (
                    <Pressable style={styles.playlistCard} onPress={() => toggleSelect(item.id)}>
                      <View
                        style={[styles.colorSquare, { backgroundColor: item.color || "#D1D5DB" }]}
                      />

                      <View style={{ flex: 1 }}>
                        <Text style={styles.playlistName}>{item.name}</Text>
                        <Text style={styles.playlistSub}>{item.activityIds.length} activity</Text>
                      </View>

                      <View style={[styles.checkCircle, selected && styles.checkCircleOn]}>
                        {selected && <Ionicons name="checkmark" size={16} color="white" />}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          {/* Done */}
          <Pressable style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // bottom sheet
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 22,
    maxHeight: "85%",
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2A44",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // boxed sections
  cardBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    marginBottom: 14,
  },
  sectionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A44",
  },
  cardSub: {
    marginTop: 4,
    fontSize: 12,
    color: "#3B4A6B",
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2A44",
  },
  createNew: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2F3E75",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
  },

  playlistCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  colorSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A44",
  },
  playlistSub: {
    marginTop: 4,
    fontSize: 12,
    color: "#3B4A6B",
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleOn: {
    backgroundColor: "#2F3E75",
  },

  doneBtn: {
    marginTop: 16,
    backgroundColor: "#2F3E75",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  doneText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
});
