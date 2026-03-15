import { Pressable, StyleSheet, Text, View } from "react-native";

import XIcon from "../../assets/icons/x.svg";

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 40,
    borderColor: "#EBEBEB",
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
  borderWidth?: number;
  onPress?: () => void;
  onClose?: () => void;
};

export function Chip({
  label,
  backgroundColor,
  textColor,
  borderWidth,
  onClose,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      style={[
        styles.chip,
        { backgroundColor: backgroundColor || "#ffffff", borderWidth: borderWidth || 0 },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: textColor || "#153A7A" }]}> {label} </Text>
      <Pressable style={styles.xButtonPressable} onPress={onClose}>
        <XIcon
          width={10}
          height={10}
          fill={textColor || "#153A7A"}
          stroke={textColor || "#153A7A"}
        />
      </Pressable>
    </Pressable>
  );
}
