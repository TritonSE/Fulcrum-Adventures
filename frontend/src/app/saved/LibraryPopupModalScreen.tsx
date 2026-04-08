import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import BookmarkFilledIcon from "../../../assets/icons/bookmark-filled.svg";
import BookmarkIcon from "../../../assets/icons/bookmark.svg";
import CloseButton from "../../../assets/icons/CloseButton.svg";
import { useActivities } from "../../context/ActivityContext";
import { Typography } from "../../styles/typo";
import { showToast } from "../../utils/toast";

import type { RootStackParamList } from "../../types/navigation";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, "LibraryPopupModal">;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F9F9F9",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 134,
    maxHeight: "78%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  closeBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 23,
    borderWidth: 1,
    borderColor: "#E7EAF1",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 8,
  },
  iconCircle: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeaderRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  createNew: {
    color: "#3C47BD",
    fontFamily: "InstrumentSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E7EAF1",
    marginBottom: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorDotWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F2F3F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  colorDot: { width: 22, height: 22, borderRadius: 6 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#153A7A",
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleOutline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#153A7A",
    opacity: 0.25,
  },
});

export default function LibraryPopupModalScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();

  const activityId = route.params?.activityId;
  const createdPlaylistId = route.params?.playlistId;

  const { playlists, addToPlaylist, removeFromPlaylist, setSaved, activities } = useActivities();

  const activity = activityId ? activities.find((a) => a.id === activityId) : undefined;
  const currentlySaved = !!activity?.isSaved;

  const bookmarkedCount = useMemo(() => activities.filter((a) => a.isSaved).length, [activities]);

  const toggleBookmark = () => {
    if (!activityId) return;
    setSaved(activityId, !currentlySaved);
  };

  const togglePlaylist = (targetPlaylistId: string) => {
    if (!activityId) return;

    const playlist = playlists.find((p) => p.id === targetPlaylistId);
    if (!playlist) return;

    const alreadyIn = playlist.activityIds.includes(activityId);

    if (alreadyIn) {
      removeFromPlaylist(targetPlaylistId, activityId);
      showToast("Removed from playlist", {
        actionLabel: "Undo",
        bottomOffset: 30,
        onAction: () => addToPlaylist(targetPlaylistId, activityId),
      });
    } else {
      addToPlaylist(targetPlaylistId, activityId);
      setSaved(activityId, true);
      showToast(`Added to ${playlist.name}`, {
        actionLabel: "Undo",
        bottomOffset: 30,
        onAction: () => removeFromPlaylist(targetPlaylistId, activityId),
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />

      <View style={styles.sheet}>
        <View style={styles.headerRow}>
          <Text style={[Typography.displayMdBold, { color: "#153A7A" }]}>Library</Text>

          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={12}>
            <CloseButton width={40} height={40} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={[Typography.displayXSmBold, { color: "#153A7A" }]}>Bookmarked</Text>
            <Text style={[Typography.caption, { color: "#153A7A" }]}>
              {bookmarkedCount} activities
            </Text>
          </View>

          <Pressable
            onPress={toggleBookmark}
            style={[styles.iconCircle, !activityId && { opacity: 0.5 }]}
            hitSlop={10}
            disabled={!activityId}
          >
            {currentlySaved ? (
              <BookmarkFilledIcon width={32} height={32} />
            ) : (
              <BookmarkIcon width={32} height={32} />
            )}
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[Typography.displaySmBold, { color: "#153A7A" }]}>Save to Playlist</Text>

          <Pressable
            onPress={() => navigation.navigate("CreatePlaylistModal", { activityId })}
            hitSlop={10}
          >
            <Text style={[styles.createNew, { color: "#153A7A" }]}>Create New</Text>
          </Pressable>
        </View>

        {playlists.length === 0 ? (
          <View style={{ paddingVertical: 35, justifyContent: "center", alignItems: "center" }}>
            <Text style={[Typography.bodyMd, { color: "#909090" }]}>No playlists created yet.</Text>
          </View>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 10 }}
            renderItem={({ item }) => {
              const selected = activityId
                ? item.activityIds.includes(activityId)
                : item.id === createdPlaylistId;

              return (
                <Pressable
                  style={styles.playlistRow}
                  onPress={() => togglePlaylist(item.id)}
                  disabled={!activityId}
                >
                  <View style={styles.colorDotWrap}>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  </View>

                  <View style={{ flex: 1, gap: 8 }}>
                    <Text style={[Typography.displayXSmBold, { color: "#153A7A" }]}>
                      {item.name}
                    </Text>
                    <Text style={[Typography.caption, { color: "#153A7A" }]}>
                      {item.activityIds.length} activity
                    </Text>
                  </View>

                  {selected ? (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  ) : (
                    <View style={styles.checkCircleOutline} />
                  )}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
