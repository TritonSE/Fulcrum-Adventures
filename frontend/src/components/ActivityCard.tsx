import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

// SVG Imports
import BookmarkFilledIcon from "../../assets/icons/bookmark-filled.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import ClockIcon from "../../assets/icons/clock.svg";
import PeopleIcon from "../../assets/icons/people.svg";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../constants/activityColors";

import { styles } from "./ActivityCard.styles";

import type { Activity } from "../types/activity";

type ActivityCardProps = {
  activity: Activity;
  onPress?: () => void;
  onSaveToggle?: (id: string) => void;
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress, onSaveToggle }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Left Side: Image */}
      <View style={styles.imageContainer}>
        {activity.imageUrl ? (
          <Image source={{ uri: activity.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>

      {/* Right Side: Content */}
      <View style={styles.content}>
        {/* Title + Meta Wrapper (Gap 4px) */}
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={2}>
            {activity.title}
          </Text>

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

        {/* Footer: Category Tag & Bookmark */}
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

          {/* Bookmark Button */}
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
