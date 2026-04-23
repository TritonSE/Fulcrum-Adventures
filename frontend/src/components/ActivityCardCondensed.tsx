import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import BookmarkFilledIcon from "../../assets/icons/bookmark-filled.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import ClockIcon from "../../assets/icons/clock.svg";
import GraduationCapIcon from "../../assets/icons/graduation-cap.svg";
import PeopleIcon from "../../assets/icons/people.svg";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../constants/activityColors";
import { formatDuration, formatGradeLevel, formatGroupSize } from "../utils/textUtils";

import { styles } from "./ActivityCardCondensed.styles";

import type { Activity } from "../types/activity";

type ActivityCardCondensedProps = {
  activity: Activity;
  onPress?: () => void;
  onSaveToggle?: (id: string) => void;
};

export const ActivityCardCondensed: React.FC<ActivityCardCondensedProps> = ({
  activity,
  onPress,
  onSaveToggle,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.innerContainer}>
        <View style={styles.imageContainer}>
          {activity.imageUrl ? (
            <Image source={{ uri: activity.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {activity.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <View style={styles.iconWrapper}>
                <GraduationCapIcon />
              </View>
              <Text style={styles.metaText}>{formatGradeLevel(activity.gradeLevel)}</Text>
            </View>

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
          <View
            style={[
              styles.categoryTag,
              {
                backgroundColor: CATEGORY_COLORS[activity.category] || DEFAULT_CATEGORY_COLOR,
              },
            ]}
          >
            <Text style={styles.categoryText}>{activity.category}</Text>
          </View>

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
