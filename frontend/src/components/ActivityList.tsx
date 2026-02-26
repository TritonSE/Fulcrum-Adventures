import Ionicons from "@expo/vector-icons/Ionicons";
// src/components/ActivityList.tsx
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

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
  isEditing?: boolean; // ✅ NEW
  onReorder?: (newData: Activity[]) => void; // optional future use
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
}) => {
  const renderCard = (item: Activity, drag?: () => void, isActive?: boolean) => {
    const CardComponent = variant === "condensed" ? ActivityCardCondensed : ActivityCard;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          opacity: isActive ? 0.9 : 1,
        }}
      >
        {isEditing && (
          <Pressable onPressIn={drag} style={{ paddingHorizontal: 6 }}>
            <Ionicons name="reorder-three-outline" size={22} color="#888" />
          </Pressable>
        )}

        {/* THIS IS THE IMPORTANT FIX */}
        <View style={{ flex: 1 }}>
          <CardComponent
            activity={item}
            onPress={() => onActivityPress?.(item)}
            onSaveToggle={onSaveToggle}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{header}</Text>
      </View>

      {/* Normal Mode */}
      {!isEditing ? (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderCard(item)}
          horizontal={horizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={horizontal ? styles.horizontalList : styles.verticalList}
        />
      ) : (
        // Edit Mode
        <DraggableFlatList
          data={activities}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => onReorder?.(data)}
          activationDistance={0}
          renderItem={({ item, drag, isActive }) => renderCard(item, drag, isActive)}
          contentContainerStyle={horizontal ? styles.horizontalList : styles.verticalList}
        />
      )}
    </View>
  );
};
// // src/components/ActivityList.tsx
// import React from "react";
// import { FlatList, Text, View } from "react-native";

// import { ActivityCard } from "./ActivityCard";
// import { ActivityCardCondensed } from "./ActivityCardCondensed";
// import { styles } from "./ActivityList.styles";

// import type { Activity } from "../types/activity";

// type ActivityListProps = {
//   header: string;
//   activities: Activity[];
//   variant?: "card" | "condensed";
//   onActivityPress?: (activity: Activity) => void;
//   onSaveToggle?: (id: string) => void;
//   horizontal?: boolean;
// };

// export const ActivityList: React.FC<ActivityListProps> = ({
//   header,
//   activities,
//   variant = "card",
//   onActivityPress,
//   onSaveToggle,
//   horizontal = false,
// }) => {
//   const renderActivity = ({ item }: { item: Activity }) => {
//     if (variant === "condensed") {
//       return (
//         <ActivityCardCondensed
//           activity={item}
//           onPress={() => onActivityPress?.(item)}
//           onSaveToggle={onSaveToggle}
//         />
//       );
//     }

//     return (
//       <ActivityCard
//         activity={item}
//         onPress={() => onActivityPress?.(item)}
//         onSaveToggle={onSaveToggle}
//       />
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.headerContainer}>
//         <Text style={styles.headerText}>{header}</Text>
//       </View>

//       {/* Activity List */}
//       <FlatList
//         data={activities}
//         renderItem={renderActivity}
//         keyExtractor={(item) => item.id}
//         horizontal={horizontal}
//         showsHorizontalScrollIndicator={false}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={horizontal ? styles.horizontalList : styles.verticalList}
//       />
//     </View>
//   );
// };
