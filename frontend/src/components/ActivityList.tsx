// src/components/ActivityList.tsx
import React from "react";
import { FlatList, Text, View } from "react-native";

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
};

export const ActivityList: React.FC<ActivityListProps> = ({
  header,
  activities,
  variant = "card",
  onActivityPress,
  onSaveToggle,
  horizontal = false,
}) => {
  const renderActivity = ({ item }: { item: Activity }) => {
    if (variant === "condensed") {
      return (
        <ActivityCardCondensed
          activity={item}
          onPress={() => onActivityPress?.(item)}
          onSaveToggle={onSaveToggle}
        />
      );
    }

    return (
      <ActivityCard
        activity={item}
        onPress={() => onActivityPress?.(item)}
        onSaveToggle={onSaveToggle}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{header}</Text>
      </View>

      {/* Activity List */}
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={horizontal ? styles.horizontalList : styles.verticalList}
      />
    </View>
  );
};
