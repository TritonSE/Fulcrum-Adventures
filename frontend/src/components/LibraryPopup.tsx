import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useActivities } from "../context_temp/ActivityContext";

import type { RootStackParamList } from "../types/navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  visible: boolean;
  onClose: () => void;
  activityId: string;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const LibraryPopup: React.FC<Props> = ({ visible, onClose, activityId }) => {
  const { playlists, addToPlaylist, toggleSaved } = useActivities();
  const navigation = useNavigation<Nav>();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleDone = () => {
    selectedIds.forEach((playlistId) => addToPlaylist(playlistId, activityId));

    // ensure it becomes bookmarked too
    toggleSaved(activityId);

    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Save to Library</Text>

          {playlists.length === 0 && (
            <Text style={{ color: "#777", marginBottom: 10 }}>
              No playlists yet. Create one below.
            </Text>
          )}

          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const selected = selectedIds.includes(item.id);

              return (
                <Pressable style={styles.playlistRow} onPress={() => toggleSelect(item.id)}>
                  <View>
                    <Text style={styles.playlistName}>{item.name}</Text>
                    <Text style={styles.count}>{item.activityIds.length} activities</Text>
                  </View>

                  {selected && <Ionicons name="checkmark-circle" size={22} color="#2F3E75" />}
                </Pressable>
              );
            }}
          />

          <Pressable
            onPress={() => {
              onClose();
              navigation.navigate("CreatePlaylistModal", { activityId }); // optional: pass activityId
            }}
          >
            <Text style={styles.createText}>+ Create Playlist</Text>
          </Pressable>

          <Pressable style={styles.saveButton} onPress={handleDone}>
            <Text style={styles.saveText}>Done</Text>
          </Pressable>

          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "75%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  playlistRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "500",
  },
  count: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  createText: {
    marginTop: 12,
    color: "#2F3E75",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#2F3E75",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },
  cancel: {
    marginTop: 14,
    textAlign: "center",
    color: "#777",
  },
});
