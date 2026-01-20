import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

// SVG Imports (Make sure these paths match where your assets folder actually is!)
// If assets is in 'src/assets', use "../assets..."
// If assets is in the project root, use "../../assets..."
import BookmarkFilledIcon from "../../assets/icons/bookmark-filled.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import ClockIcon from "../../assets/icons/clock.svg";
import PeopleIcon from "../../assets/icons/people.svg";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../constants/activityColors";

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
        {/* Top Section: Image */}
        <View style={styles.imageContainer}>
          {activity.imageUrl ? (
            <Image source={{ uri: activity.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title - 1 Line Max */}
          <Text style={styles.title} numberOfLines={1}>
            {activity.title}
          </Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{activity.gradeLevel}</Text>

            <Text style={styles.metaDivider}>•</Text>

            <View style={styles.metaItem}>
              <View style={styles.iconWrapper}>
                <PeopleIcon />
              </View>
              <Text style={styles.metaText}>{activity.groupSize}</Text>
            </View>

            <Text style={styles.metaDivider}>•</Text>

            <View style={styles.metaItem}>
              <View style={styles.iconWrapper}>
                <ClockIcon />
              </View>
              <Text style={styles.metaText}>{activity.duration}</Text>
            </View>
          </View>
        </View>

        {/* Footer: Category & Bookmark */}
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
