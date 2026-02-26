import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type ToastProps = {
  text1?: string;
  props?: {
    onUndo?: () => void;
  };
};

export const ToastConfig = {
  successUndo: ({ text1, props }: ToastProps) => {
    return (
      <View
        style={{
          width: "92%",
          alignSelf: "center",
          marginTop: 12,
          backgroundColor: "#55B96A",
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",

          // shadow
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 }}>
          <Ionicons name="checkmark-circle" size={18} color="white" />
          <Text style={{ color: "white", fontWeight: "800", marginLeft: 8, fontSize: 14 }}>
            {text1 ?? "Success"}
          </Text>
        </View>

        {props?.onUndo && (
          <Pressable
            onPress={props.onUndo}
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.9)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "white", fontWeight: "800", fontSize: 13 }}>Undo</Text>
          </Pressable>
        )}
      </View>
    );
  },
} as const;
