import { Pressable, StyleSheet, Text } from "react-native";

type Props = { label: string; selected: boolean; onPress: () => void };

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D5D9E2",
    backgroundColor: "#fff",
    margin: 4,
  },
  selected: {
    borderColor: "#153A7A",
    backgroundColor: "#153A7A",
    fontWeight: "500",
  },
  text: { color: "#153A7A", fontWeight: "400" },
  textSelected: { color: "#fff" },
});

export const FilterPill = ({ label, selected, onPress }: Props) => {
  return (
    <Pressable onPress={onPress} style={[styles.pill, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
};
