import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import BookmarkFilledIcon from "../../assets/icons/bookmark-filled.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import ClockIcon from "../../assets/icons/clock.svg";
import PeopleIcon from "../../assets/icons/people.svg";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../constants/activityColors";
import {
  formatDuration,
  formatGradeLevel,
  formatGroupSize,
  getSortedCategories,
} from "../utils/textUtils";

import { styles } from "./ActivityCard.styles";

import type { Activity } from "../types/activity";

type ActivityCardProps = {
  activity: Activity;
  onPress?: () => void;
  onSaveToggle?: (id: string) => void;
  contextCategory?: string;
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  onSaveToggle,
  contextCategory,
}) => {
  const displayCategories = getSortedCategories(
    activity.categories || activity.category,
    contextCategory,
  );
  const primaryCategory = displayCategories[0];
  const extraCount = displayCategories.length - 1;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {activity.imageUrl ? (
          <Image source={{ uri: activity.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {activity.title}
          </Text>

          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{formatGradeLevel(activity.gradeLevel)}</Text>
            <Text style={styles.metaDivider}>•</Text>

            <View style={styles.metaItem}>
              <View style={styles.iconWrapper}>
                <PeopleIcon />
              </View>
              <Text style={styles.metaText}>{formatGroupSize(activity.groupSize)}</Text>
            </View>

            <Text style={styles.metaDivider}>•</Text>

            <View style={styles.metaItem}>
              <View style={styles.iconWrapper}>
                <ClockIcon />
              </View>
              <Text style={styles.metaText}>{formatDuration(activity.duration)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {/* THE TAGS CONTAINER */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {/* Tag 1: The Primary Category */}
            {primaryCategory && (
              <View
                style={[
                  styles.categoryTag,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[primaryCategory as keyof typeof CATEGORY_COLORS] ||
                      DEFAULT_CATEGORY_COLOR,
                  },
                ]}
              >
                <Text style={styles.categoryText}>{primaryCategory}</Text>
              </View>
            )}

            {/* Tag 2: The +1 / +2 Grey Bubble */}
            {extraCount > 0 && (
              <View style={styles.extraTag}>
                <Text style={styles.extraTagText}>+{extraCount}</Text>
              </View>
            )}
          </View>

          {/* BOOKMARK BUTTON */}
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={(e) => {
              e.stopPropagation();
              onSaveToggle?.(activity.id);
            }}
          >
            {activity.isSaved ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
