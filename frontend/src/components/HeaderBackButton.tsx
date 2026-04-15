import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable } from "react-native";

type Props = {
  onPress: () => void;
};

export function HeaderBackButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 40,
        height: 40,
        borderRadius: 22,
        backgroundColor: "#E9EDF3",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        marginRight: 20,
      }}
    >
      <Ionicons name="chevron-back" size={22} color="#153A7A" />
    </Pressable>
  );
}
