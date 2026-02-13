import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type LibraryRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

export function LibraryRow({ icon, label, onPress }: LibraryRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#F1F2F6",
        marginBottom: 12,
      }}
    >
      <Ionicons name={icon} size={22} style={{ marginRight: 12 }} />
      <Text style={{ fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}
