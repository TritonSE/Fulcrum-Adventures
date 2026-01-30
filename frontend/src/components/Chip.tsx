import { Pressable, StyleSheet, Text, View } from "react-native";

import XIcon from "../../assets/icons/x.svg";

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#EBEBEB",
    gap: 8,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Instrument Sans",
  },
  xButtonPressable: {
    height: 24,
    width: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});

type ChipProps = {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  onClose?: () => void;
};

export function Chip({ label, backgroundColor, textColor, onClose, onPress }: ChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: backgroundColor || "#ffffff" }]}>
      <Text style={[styles.chipText, { color: textColor || "#153A7A" }]} onPress={onPress}>
        {label}
      </Text>
      <Pressable style={styles.xButtonPressable} onPress={onClose}>
        <XIcon width={6} height={6} fill={textColor || "#153A7A"} stroke={textColor || "#153A7A"} />
      </Pressable>
    </View>
  );
}
