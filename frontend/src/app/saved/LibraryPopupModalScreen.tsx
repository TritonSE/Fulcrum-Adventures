import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import BookmarkFilledIcon from "../../../assets/icons/bookmark-filled.svg";
import BookmarkIcon from "../../../assets/icons/bookmark.svg";
import CloseButton from "../../../assets/icons/CloseButton.svg";
import { useActivities } from "../../Context/ActivityContext";
import { Typography } from "../../styles/typo";

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
  toast: {
    backgroundColor: "#22C55E",
    width: 310,
    height: 38,
    borderRadius: 16,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toastLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  toastIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  toastMessage: {
    color: "white",
    fontFamily: "InstrumentSans_700Bold",
    fontSize: 14,
    flexShrink: 1,
  },
  toastUndo: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
  toastUndoText: {
    color: "white",
    fontSize: 12,
    fontFamily: "InstrumentSans_700Bold",
  },
});

export default function LibraryPopupModalScreen() {
  const { activityId, playlistId: createdPlaylistId } = useLocalSearchParams<{
    activityId?: string;
    playlistId?: string;
  }>();

  const { playlists, addToPlaylist, removeFromPlaylist, setSaved, activities } = useActivities();

  const activity = activityId ? activities.find((a) => a.id === activityId) : undefined;
  const currentlySaved = !!activity?.isSaved;

  const bookmarkedCount = useMemo(() => activities.filter((a) => a.isSaved).length, [activities]);

  const [popupToast, setPopupToast] = useState<{
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);
  const [toastAnim] = useState(() => new Animated.Value(0));
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showInlineToast = (toast: {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setPopupToast(toast);
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    toastTimerRef.current = setTimeout(() => hideInlineToast(), 3500);
  };

  const hideInlineToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    Animated.timing(toastAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
      setPopupToast(null),
    );
  };

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
      showInlineToast({
        message: "Removed from playlist",
        actionLabel: "Undo",
        onAction: () => {
          addToPlaylist(targetPlaylistId, activityId);
          hideInlineToast();
        },
      });
    } else {
      addToPlaylist(targetPlaylistId, activityId);
      setSaved(activityId, true);
      showInlineToast({
        message: `Added to ${playlist.name}`,
        actionLabel: "Undo",
        onAction: () => {
          removeFromPlaylist(targetPlaylistId, activityId);
          hideInlineToast();
        },
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      <View style={styles.sheet}>
        <View style={styles.headerRow}>
          <Text style={[Typography.displayMdBold, { color: "#153A7A" }]}>Library</Text>

          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
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
            onPress={() =>
              router.push(
                activityId
                  ? `/saved/CreatePlaylistModalScreen?activityId=${activityId}`
                  : "/saved/CreatePlaylistModalScreen",
              )
            }
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

      {popupToast && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 999,
            opacity: toastAnim,
            transform: [
              { translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          }}
        >
          <View style={styles.toast}>
            <View style={styles.toastLeft}>
              <View style={styles.toastIcon}>
                <Ionicons name="checkmark" size={16} color="#1F2A44" />
              </View>
              <Text style={styles.toastMessage} numberOfLines={1}>
                {popupToast.message}
              </Text>
            </View>
            {popupToast.actionLabel && (
              <Pressable onPress={() => popupToast.onAction?.()} style={styles.toastUndo}>
                <Text style={styles.toastUndoText}>{popupToast.actionLabel}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}
