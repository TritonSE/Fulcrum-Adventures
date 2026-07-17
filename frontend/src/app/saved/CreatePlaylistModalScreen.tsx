import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CloseButton from "../../../assets/icons/CloseButton.svg";
import { useActivities } from "../../Context/useActivities";
import { Typography } from "../../styles/typo";
import { showToast } from "../../utils/toast";

const COLORS = ["#1322C6", "#4272D1", "#72CF1A", "#FF6B6B", "#ECD528", "#00BC7B"];
const DEFAULT_PLAYLIST_COLOR = COLORS[0];
const PRIMARY_BLUE = "#153A7A";
const DRAWER_OFFSET = 500;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  sheet: {
    backgroundColor: "#F9F9F9",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    width: "100%",
    height: 400,

    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  h1: {
    color: "#153A7A",
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 30,
    lineHeight: 31.2,
  },

  closeBtn: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    backgroundColor: "white",
  },

  label: {
    color: PRIMARY_BLUE,
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F2F3F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#153A7A",
    fontFamily: "InstrumentSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },

  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  colorSwatch: {
    width: 54,
    height: 54,
    borderRadius: 11,
    padding: 3,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: PRIMARY_BLUE,
  },
  colorSwatchFill: {
    flex: 1,
    borderRadius: 7,
  },

  bottomBar: {
    marginTop: 10,
    marginHorizontal: -24,
    backgroundColor: "#F9F9F9",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingBottom: 24,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: "#EBEBEB",
  },
  bottomButtons: {
    paddingTop: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    gap: 12,
  },

  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#EBEBEB",
    alignItems: "center",
    justifyContent: "center",
  },

  createBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#153A7A",
    borderWidth: 1,
  },
  createBtnDisabled: {
    opacity: 0.9,
  },

  bottomBtnText: {
    ...Typography.bodyMd,
    color: "#153A7A",
  },
  createBtnText: {
    ...Typography.bodyMd,
    color: "#153A7A",
  },
});

export default function CreatePlaylistModalScreen() {
  const { activityId } = useLocalSearchParams<{ activityId?: string }>();
  const { createPlaylist, deletePlaylist, addToPlaylist, setSaved } = useActivities();

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_PLAYLIST_COLOR);

  const canCreate = name.trim().length > 0;

  const [lift] = useState(() => new Animated.Value(0));
  const [sheetY] = useState(() => new Animated.Value(DRAWER_OFFSET));

  useEffect(() => {
    Animated.timing(sheetY, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      const h = e.endCoordinates?.height ?? 0;
      Animated.timing(lift, {
        toValue: -Math.min(520, Math.max(0, h - 10)),
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(lift, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [lift, sheetY]);

  const closeDrawer = () => {
    Keyboard.dismiss();
    Animated.timing(sheetY, {
      toValue: DRAWER_OFFSET,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => router.back());
  };

  const resetAll = () => {
    setName("");
    setColor(DEFAULT_PLAYLIST_COLOR);
  };

  const onCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newPlaylistId = createPlaylist(trimmed, color);

    if (activityId) {
      addToPlaylist(newPlaylistId, activityId);
      setSaved(activityId, true);
    }

    showToast("Playlist created!", {
      actionLabel: "Undo",
      onAction: () => deletePlaylist(newPlaylistId),
      bottomOffset: 30,
    });

    router.replace(`/saved/LibraryPopupModalScreen?playlistId=${newPlaylistId}`);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={closeDrawer} />

      {/* Bottom sheet (animated up on keyboard) */}
      <Animated.View
        style={[styles.sheetWrap, { transform: [{ translateY: Animated.add(sheetY, lift) }] }]}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[Typography.displayMdBold, { color: "#153A7A" }]}>Create Playlist</Text>

            <Pressable onPress={closeDrawer} style={styles.closeBtn} hitSlop={10}>
              <CloseButton width={40} height={40} />
            </Pressable>
          </View>

          {/* Playlist Name */}
          <Text
            style={{
              color: PRIMARY_BLUE,
              marginBottom: 7,
              fontFamily: "LeagueSpartan_700Bold",
              fontSize: 20,
              lineHeight: 24,
            }}
          >
            Playlist Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
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
            returnKeyType="done"
          />

          {/* Choose Color */}
          <Text
            style={{
              color: PRIMARY_BLUE,
              paddingTop: 24,
              marginBottom: 10,
              fontFamily: "LeagueSpartan_700Bold",
              fontSize: 20,
              lineHeight: 24,
            }}
          >
            Choose Color
          </Text>

          <View style={styles.colorRow}>
            {COLORS.map((c) => {
              const selected = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorSwatch, selected && styles.colorSwatchSelected]}
                >
                  <View style={[styles.colorSwatchFill, { backgroundColor: c }]} />
                </Pressable>
              );
            })}
          </View>

          {/* Bottom button bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomDivider} />

            <View style={styles.bottomButtons}>
              <Pressable onPress={resetAll} style={styles.resetBtn}>
                <Text style={styles.bottomBtnText}>Reset All</Text>
              </Pressable>

              <Pressable
                onPress={onCreate}
                disabled={!canCreate}
                style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
              >
                <Text style={styles.createBtnText}>Create Playlist</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
