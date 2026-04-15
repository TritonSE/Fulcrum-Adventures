import { router } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";

import { useActivities } from "../Context/ActivityContext";

import { ActivityCard } from "./ActivityCard";
import { ActivityCardCondensed } from "./ActivityCardCondensed";
import { styles } from "./ActivityList.styles";
import { DragList } from "./DragList";
import SwipeToDelete from "./SwipeToDelete";

import type { Activity } from "../types/activity";

type ActivityListProps = {
  header?: string;
  activities: Activity[];
  variant?: "card" | "condensed";
  onActivityPress?: (activity: Activity) => void;
  onSaveToggle?: (id: string) => void;
  horizontal?: boolean;
  height?: number;
  fill?: boolean;

  // reorder mode
  isEditing?: boolean;
  onReorder?: (newData: Activity[]) => void;

  // header visibility
  showHeader?: boolean;

  // swipe-to-delete
  enableSwipeDelete?: boolean;
  onDelete?: (activityId: string) => void;
};

export const ActivityList: React.FC<ActivityListProps> = ({
  header = "",
  activities,
  variant = "card",
  onActivityPress,
  onSaveToggle,
  horizontal = false,
  height,
  isEditing = false,
  onReorder,
  showHeader = true,
  enableSwipeDelete = false,
  onDelete,
}) => {
  useActivities(); // keep context subscription
  const handleSaveToggle =
    onSaveToggle ??
    ((id: string) => {
      router.push(`/saved/LibraryPopupModalScreen?activityId=${id}`);
    });
  const handlePress = (item: Activity) => {
    if (onActivityPress) {
      onActivityPress(item);
    } else {
      router.push(`/activity/${item.id}`);
    }
  };

  const CardComponent = variant === "condensed" ? ActivityCardCondensed : ActivityCard;

  const renderCard = (item: Activity) => {
    const card = (
      <View style={{ flex: 1 }}>
        <CardComponent
          activity={item}
          onPress={() => handlePress(item)}
          onSaveToggle={handleSaveToggle}
        />
      </View>
    );
    if (enableSwipeDelete && onDelete) {
      return (
        <SwipeToDelete key={item.id} onDelete={() => onDelete(item.id)}>
          {card}
        </SwipeToDelete>
      );
    }
    return card;
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{header}</Text>
        </View>
      )}

      {isEditing ? (
        <DragList
          data={activities}
          onReorder={(newData) => onReorder?.(newData)}
          renderItem={renderCard}
          contentContainerStyle={styles.verticalList}
        />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderCard(item)}
          horizontal={horizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={horizontal ? styles.horizontalList : styles.verticalList}
          style={horizontal && height ? { height, flexGrow: 0 } : { flex: 1 }}
        />
      )}
    </View>
  );
};
