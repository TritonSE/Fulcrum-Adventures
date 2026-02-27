// src/components/SaveToLibraryModal.tsx
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Activity = {
  id: string;
  title: string;
};

type Playlist = {
  id: string;
  name: string;
  activityIds: string[];
};

type Props = {
  visible: boolean;
  activity: Activity;
  playlists: Playlist[];

  // Bookmark state + action
  isBookmarked: boolean;
  toggleBookmark: (activityId: string) => Promise<void> | void;

  // Playlist actions
  addToPlaylist: (playlistId: string, activityId: string) => Promise<void> | void;
  removeFromPlaylist: (playlistId: string, activityId: string) => Promise<void> | void;
  createPlaylist: (name: string) => Promise<void> | void;

  onClose: () => void;
};

export default function SaveToLibraryModal({
  visible,
  activity,
  playlists,
  isBookmarked,
  toggleBookmark,
  addToPlaylist,
  removeFromPlaylist,
  createPlaylist,
  onClose,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const playlistRows = useMemo(() => {
    return playlists.map((p) => {
      const included = p.activityIds.includes(activity.id);
      return { ...p, included };
    });
  }, [playlists, activity.id]);

  const handleToggleBookmark = async () => {
    try {
      setBusy(true);
      await toggleBookmark(activity.id);
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePlaylist = async (playlistId: string, included: boolean) => {
    try {
      setBusy(true);
      if (included) {
        await removeFromPlaylist(playlistId, activity.id);
      } else {
        await addToPlaylist(playlistId, activity.id);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      setBusy(true);
      await createPlaylist(name);
      setNewName("");
      setCreating(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Save to Library</Text>

          {/* Activity title */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
          </View>

          <View style={styles.divider} />

          {/* NEW: Bookmarks status row + unbookmark option */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {isBookmarked ? "Saved to Bookmarks" : "Not in Bookmarks"}
              </Text>
              <Text style={styles.rowSub}>
                {isBookmarked
                  ? "This activity is bookmarked."
                  : "Bookmark it to find it quickly later."}
              </Text>
            </View>

            <Pressable
              disabled={busy}
              onPress={() => void handleToggleBookmark}
              style={({ pressed }) => [
                styles.pillButton,
                isBookmarked ? styles.pillDanger : styles.pillPrimary,
                pressed && { opacity: 0.85 },
                busy && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.pillText}>{isBookmarked ? "Unbookmark" : "Bookmark"}</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Create playlist */}
          {!creating ? (
            <Pressable
              disabled={busy}
              onPress={() => setCreating(true)}
              style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.linkText}>+ Create Playlist</Text>
            </Pressable>
          ) : (
            <View style={styles.createRow}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Playlist name"
                style={styles.input}
                editable={!busy}
              />
              <Pressable
                disabled={busy}
                onPress={() => void handleCreate()}
                style={styles.smallBtn}
              >
                <Text style={styles.smallBtnText}>Create</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                onPress={() => {
                  setCreating(false);
                  setNewName("");
                }}
                style={[styles.smallBtn, styles.smallBtnGhost]}
              >
                <Text style={[styles.smallBtnText, { color: "#1F2937" }]}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* Playlists list */}
          <FlatList
            data={playlistRows}
            keyExtractor={(p) => p.id}
            style={{ marginTop: 8, maxHeight: 240 }}
            renderItem={({ item }) => (
              <Pressable
                disabled={busy}
                onPress={() => void handleTogglePlaylist(item.id, item.included)}
                style={({ pressed }) => [
                  styles.playlistRow,
                  pressed && { opacity: 0.85 },
                  busy && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={[styles.check, item.included && styles.checkOn]}>
                  {item.included ? "✓" : ""}
                </Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
          />

          {/* Done / Cancel */}
          <Pressable
            disabled={busy}
            onPress={onClose}
            style={({ pressed }) => [styles.done, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={onClose}
            style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  title: { fontSize: 20, fontWeight: "700" },
  activityTitle: { fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  rowSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillPrimary: { backgroundColor: "#1F3A8A" },
  pillDanger: { backgroundColor: "#B91C1C" },
  pillText: { color: "white", fontWeight: "700", fontSize: 12 },

  linkRow: { paddingVertical: 8 },
  linkText: { color: "#1F3A8A", fontWeight: "700", fontSize: 14 },

  createRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  smallBtn: {
    backgroundColor: "#1F3A8A",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallBtnGhost: { backgroundColor: "#E5E7EB" },
  smallBtnText: { color: "white", fontWeight: "700", fontSize: 12 },

  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  playlistName: { fontSize: 14, color: "#111827" },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#1F3A8A",
    fontWeight: "900",
  },
  checkOn: { borderColor: "#1F3A8A" },
  sep: { height: 1, backgroundColor: "#F3F4F6" },

  done: {
    backgroundColor: "#1F3A8A",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 14,
    alignItems: "center",
  },
  doneText: { color: "white", fontWeight: "800" },
  cancel: { paddingVertical: 12, alignItems: "center" },
  cancelText: { color: "#6B7280", fontWeight: "700" },
});
