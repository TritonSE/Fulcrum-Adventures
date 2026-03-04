import Ionicons from "@expo/vector-icons/Ionicons";
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

import { useActivities } from "../../context_temp/ActivityContext";
import { showToast } from "../../utils/toast";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "CreatePlaylistModal">;

const COLORS = ["#153A7A", "#4272D1", "#72CF1A", "#FF6B6B", "#ECD528", "#00BC7B"];

export default function CreatePlaylistModalScreen({ navigation, route }: Props) {
  const { createPlaylist, deletePlaylist, addToPlaylist, setSaved } = useActivities();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[2]);

  const activityId = route.params?.activityId;
  const canCreate = name.trim().length > 0;

  const [lift] = useState(() => new Animated.Value(0));

  useEffect(() => {
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
  }, [lift]);

  const resetAll = () => {
    setName("");
    setColor(COLORS[2]);
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
    });

    resetAll();
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />

      {/* Bottom sheet (animated up on keyboard) */}
      <Animated.View style={[styles.sheetWrap, { transform: [{ translateY: lift }] }]}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.h1}>Create Playlist</Text>

            <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={18} color="#2F3E75" />
            </Pressable>
          </View>

          {/* Playlist Name */}
          <Text style={styles.label}>Playlist Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter Playlist Name"
            placeholderTextColor="#8A8FA3"
            style={styles.input}
            returnKeyType="done"
          />

          {/* Choose Color */}
          <Text style={[styles.label, { marginTop: 18 }]}>Choose Color</Text>

          <View style={styles.colorRow}>
            {COLORS.map((c) => {
              const selected = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    selected && styles.colorSwatchSelected,
                  ]}
                />
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
                style={[styles.createBtn, !canCreate && { opacity: 0.5 }]}
              >
                <Text style={styles.bottomBtnText}>Create Playlist</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 1,
  },

  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    width: "100%",
    maxWidth: 390,
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
    fontSize: 30,
    fontWeight: "700",
    color: "#153A7A",
    lineHeight: 31.2,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#153A7A",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F2F3F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "500",
  },

  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: "#153A7A",
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
    backgroundColor: "#EEF0F4",
    alignItems: "center",
    justifyContent: "center",
  },

  createBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#153A7A",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomBtnText: {
    color: "#153A7A",
    fontSize: 16,
    fontWeight: "600",
  },
});
