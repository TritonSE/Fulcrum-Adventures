import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Animated, FlatList, Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";

import { ActivityCard } from "./ActivityCard";
import { ActivityCardCondensed } from "./ActivityCardCondensed";
import { styles } from "./ActivityList.styles";

import type { Activity } from "../types/activity";

type ActivityListProps = {
  header: string;
  activities: Activity[];
  variant?: "card" | "condensed";
  onActivityPress?: (activity: Activity) => void;
  onSaveToggle?: (id: string) => void;
  horizontal?: boolean;

  // reorder mode (bookmarks, playlist reorder)
  isEditing?: boolean;
  onReorder?: (newData: Activity[]) => void;

  // hide the "## Header" inside the list
  showHeader?: boolean;

  // swipe-to-delete
  enableSwipeDelete?: boolean;
  onDelete?: (activityId: string) => void;
};

export const ActivityList: React.FC<ActivityListProps> = ({
  header,
  activities,
  variant = "card",
  onActivityPress,
  onSaveToggle,
  horizontal = false,

  isEditing = false,
  onReorder,

  showHeader = true,

  enableSwipeDelete = false,
  onDelete,
}) => {
  const CardComponent = variant === "condensed" ? ActivityCardCondensed : ActivityCard;

  const renderRow = (item: Activity, drag?: () => void, isActive?: boolean) => {
    const content = (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          opacity: isActive ? 0.9 : 1,
        }}
      >
        {/* Drag handle only in edit mode */}
        {isEditing && (
          <Pressable onPressIn={drag} style={{ paddingHorizontal: 6 }}>
            <Ionicons name="reorder-three-outline" size={22} color="#888" />
          </Pressable>
        )}

        {/* Important: make card take full width */}
        <View style={{ flex: 1 }}>
          <CardComponent
            activity={item}
            onPress={() => onActivityPress?.(item)}
            onSaveToggle={onSaveToggle}
          />
        </View>
      </View>
    );

    // Swipe delete only in normal mode, and only if provided
    // Swipe delete only in normal mode, and only if provided
    if (!enableSwipeDelete || !onDelete || isEditing) return content;

    const ACTION_WIDTH = 96; // controls how much red shows
    const RADIUS = 18; // match your card radius

    const renderRightActions = (_progress: any, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-ACTION_WIDTH, -30, 0],
        outputRange: [1, 0.9, 0.8],
        extrapolate: "clamp",
      });

      return (
        <Pressable
          onPress={() => onDelete(item.id)}
          style={{
            width: ACTION_WIDTH,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={26} color="white" />
          </Animated.View>
        </Pressable>
      );
    };

    return (
      <View
        style={{
          backgroundColor: "#D64545",
          borderRadius: RADIUS,
          overflow: "hidden",
          marginHorizontal: 16,
          marginVertical: 8,
        }}
      >
        <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
          <View
            style={{
              borderRadius: RADIUS,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E5E5E5",
              backgroundColor: "white",
            }}
          >
            <CardComponent
              activity={item}
              onPress={() => onActivityPress?.(item)}
              onSaveToggle={onSaveToggle}
              inSwipeRow
            />
          </View>
        </Swipeable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Optional header inside list */}
      {showHeader && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{header}</Text>
        </View>
      )}

      {/* Normal mode */}
      {!isEditing ? (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderRow(item)}
          horizontal={horizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={horizontal ? styles.horizontalList : styles.verticalList}
        />
      ) : (
        // Reorder mode
        <DraggableFlatList
          data={activities}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => onReorder?.(data)}
          renderItem={({ item, drag, isActive }) => renderRow(item, drag, isActive)}
          activationDistance={0}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={horizontal ? styles.horizontalList : styles.verticalList}
        />
      )}
    </View>
  );
};
