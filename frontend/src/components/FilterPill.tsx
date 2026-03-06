import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: "default" | "category";
};

const PRIMARY_COLOR = "#153A7A";
const NATURAL_GRAPH_COLOR = "#EBEBEB";

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: NATURAL_GRAPH_COLOR,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedDefault: { borderColor: PRIMARY_COLOR, backgroundColor: PRIMARY_COLOR },
  selectedCategory: { borderColor: "transparent", backgroundColor: PRIMARY_COLOR },
  text: {
    color: PRIMARY_COLOR,
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  textSelectedDefault: { color: "#FFFFFF" },
  textSelectedCategory: { color: "#FFFFFF" },
});

export const FilterPill = ({ label, selected, onPress, variant = "default" }: Props) => {
  let selectedPillStyle = null;
  let selectedTextStyle = null;

  if (selected) {
    if (variant === "category") {
      selectedPillStyle = styles.selectedCategory;
      selectedTextStyle = styles.textSelectedCategory;
    } else {
      selectedPillStyle = styles.selectedDefault;
      selectedTextStyle = styles.textSelectedDefault;
    }
  }

  return (
    <Pressable onPress={onPress} style={[styles.pill, selectedPillStyle]}>
      <Text style={[styles.text, selectedTextStyle]}>{label}</Text>
    </Pressable>
  );
};
