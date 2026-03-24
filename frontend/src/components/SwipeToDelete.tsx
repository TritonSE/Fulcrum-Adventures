import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  containerStyle?: ViewStyle;
  /** Optional: close swipe after delete */
  closeOnDelete?: boolean;
};

export default function SwipeToDelete({
  children,
  onDelete,
  containerStyle,
  closeOnDelete = true,
}: Props) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    // dragX goes negative when swiping left
    const scale = dragX.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [1.0, 0.9, 0.7],
      extrapolate: "clamp",
    });

    const opacity = dragX.interpolate({
      inputRange: [-120, -30, 0],
      outputRange: [1, 0.6, 0],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={() => {
          if (closeOnDelete) swipeRef.current?.close();
          onDelete();
        }}
        style={({ pressed }) => [styles.rightAction, pressed && styles.rightActionPressed]}
      >
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <Ionicons name="trash" size={26} color="white" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
      friction={2}
      containerStyle={containerStyle}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightAction: {
    width: 84,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },
  rightActionPressed: {
    opacity: 0.85,
  },
});
