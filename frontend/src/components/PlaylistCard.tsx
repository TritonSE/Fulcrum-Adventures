import { Pressable, Text, View } from "react-native";

type PlaylistCardProps = {
  title: string;
  count: number | string;
  color: string;
  onPress?: () => void;
};

export function PlaylistCard({ title, count, color }: PlaylistCardProps) {
  return (
    <Pressable
      style={{
        flex: 1,
        height: 140,
        borderRadius: 16,
        padding: 16,
        backgroundColor: color,
        justifyContent: "flex-end",
      }}
    >
      <Text style={{ fontWeight: "600" }}>{title}</Text>
      <Text>{count} items</Text>
    </Pressable>
  );
}
