import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

import { useActivities } from "../Context/useActivities";

import { ActivityCard } from "./ActivityCard";
import { ActivityCardCondensed } from "./ActivityCardCondensed";
import { styles } from "./ActivityList.styles";
import { DragList } from "./DragList";
import SwipeToDelete from "./SwipeToDelete";

import type { Activity } from "../types/activity";
import type { StyleProp, ViewStyle } from "react-native";

type ActivityListProps = {
  header?: string;
  activities: Activity[];
  variant?: "card" | "condensed";
  onActivityPress?: (activity: Activity) => void;
  onSaveToggle?: (id: string) => void;
  horizontal?: boolean;
  height?: number;
  fill?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;

  // reorder mode
  isEditing?: boolean;
  onReorder?: (newData: Activity[]) => void;

  // header visibility
  showHeader?: boolean;

  // swipe-to-delete
  enableSwipeDelete?: boolean;
  onDelete?: (activityId: string) => void;
  emptyMessage?: string;
  showApiStatus?: boolean;
};

export const ActivityList: React.FC<ActivityListProps> = ({
  header = "",
  activities,
  variant = "card",
  onActivityPress,
  onSaveToggle,
  horizontal = false,
  height,
  contentContainerStyle,
  isEditing = false,
  onReorder,
  showHeader = true,
  enableSwipeDelete = false,
  onDelete,
  emptyMessage = "No activities found.",
  showApiStatus = true,
}) => {
  const { activitiesError, isLoadingActivities, isUsingCachedActivities, refreshActivities } =
    useActivities();
  const canPullToRefresh = !horizontal && !isEditing;
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
      <CardComponent
        activity={item}
        onPress={() => handlePress(item)}
        onSaveToggle={handleSaveToggle}
      />
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

  const renderEmptyState = () => {
    if (showApiStatus && isLoadingActivities) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator color="#153F7A" />
          <Text style={styles.statusText}>Loading activities...</Text>
        </View>
      );
    }

    if (showApiStatus && activitiesError) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Unable to load activities.</Text>
          <TouchableOpacity onPress={() => void refreshActivities()} hitSlop={10}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{emptyMessage}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{header}</Text>
        </View>
      )}

      {showApiStatus && activities.length > 0 && activitiesError && isUsingCachedActivities && (
        <View style={styles.inlineStatusContainer}>
          <Text style={styles.inlineStatusText}>Showing saved results.</Text>
          <TouchableOpacity onPress={() => void refreshActivities()} hitSlop={10}>
            <Text style={styles.inlineRetryText}>Retry</Text>
          </TouchableOpacity>
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
          refreshing={canPullToRefresh && isLoadingActivities}
          onRefresh={
            canPullToRefresh
              ? () => {
                  void refreshActivities();
                }
              : undefined
          }
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            horizontal ? styles.horizontalList : styles.verticalList,
            activities.length === 0 ? styles.emptyList : null,
            contentContainerStyle,
          ]}
          style={[
            horizontal ? { flexGrow: 0 } : { flex: 0 },
            horizontal && height ? { height } : null,
          ]}
        />
      )}
    </View>
  );
};
