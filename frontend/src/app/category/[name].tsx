import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line, Path } from "react-native-svg";

import BackArrowIcon from "../../../assets/BackArrowIcon.svg";
import ActiveGraphic from "../../../assets/category-headers/ActiveGraphic.svg";
import ConnectionGraphic from "../../../assets/category-headers/ConnectionGraphic.svg";
import DebriefGraphic from "../../../assets/category-headers/DebriefGraphic.svg";
import IcebreakerGraphic from "../../../assets/category-headers/IcebreakerGraphic.svg";
import OpenerGraphic from "../../../assets/category-headers/OpenerGraphic.svg";
import TeamChallengeGraphic from "../../../assets/category-headers/TeamChallengeGraphic.svg";
import { ActivityCard } from "../../components/ActivityCard";
import { FiltersModal } from "../../components/FiltersModal";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../../constants/activityColors";
import { useActivities } from "../../Context/ActivityContext";
import { mockActivities } from "../../data/mockActivities";

import type { FilterState } from "../../components/FiltersModal";
import type { Activity, Category } from "../../types/activity";
import type { SvgProps } from "react-native-svg";

const CATEGORY_GRAPHICS: Record<Category, React.FC<SvgProps>> = {
  Opener: OpenerGraphic,
  Icebreaker: IcebreakerGraphic,
  Active: ActiveGraphic,
  Connection: ConnectionGraphic,
  Debrief: DebriefGraphic,
  "Team Challenge": TeamChallengeGraphic,
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  Opener:
    "A short activity used at the beginning of a session or program to capture attention, create energy, and get the group ready to participate.",
  Icebreaker:
    "A lighter activity designed to help participants learn names, ease social tension, and begin interacting comfortably with one another.",
  Active: "A high-energy activity that gets participants moving, laughing, and physically engaged.",
  Connection:
    "An activity focused on helping participants share, listen, and build stronger relationships with one another.",
  Debrief:
    "A guided reflection activity that helps participants process an experience, share insights, and connect.",
  "Team Challenge":
    "A collaborative problem-solving activity where participants work together to accomplish a shared goal.",
};

const FilterIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="6" x2="13" y2="6" stroke="#153A7A" strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="17" y1="6" x2="20" y2="6" stroke="#153A7A" strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="4" y1="12" x2="7" y2="12" stroke="#153A7A" strokeWidth="1.5" strokeLinecap="round" />
    <Line
      x1="11"
      y1="12"
      x2="20"
      y2="12"
      stroke="#153A7A"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Line x1="4" y1="18" x2="13" y2="18" stroke="#153A7A" strokeWidth="1.5" strokeLinecap="round" />
    <Line
      x1="17"
      y1="18"
      x2="20"
      y2="18"
      stroke="#153A7A"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M15 4.5C15.8284 4.5 16.5 5.17157 16.5 6C16.5 6.82843 15.8284 7.5 15 7.5C14.1716 7.5 13.5 6.82843 13.5 6C13.5 5.17157 14.1716 4.5 15 4.5Z"
      stroke="#153A7A"
      strokeWidth="1.5"
    />
    <Path
      d="M9 10.5C9.82843 10.5 10.5 11.1716 10.5 12C10.5 12.8284 9.82843 13.5 9 13.5C8.17157 13.5 7.5 12.8284 7.5 12C7.5 11.1716 8.17157 10.5 9 10.5Z"
      stroke="#153A7A"
      strokeWidth="1.5"
    />
    <Path
      d="M15 16.5C15.8284 16.5 16.5 17.1716 16.5 18C16.5 18.8284 15.8284 19.5 15 19.5C14.1716 19.5 13.5 18.8284 13.5 18C13.5 17.1716 14.1716 16.5 15 16.5Z"
      stroke="#153A7A"
      strokeWidth="1.5"
    />
  </Svg>
);

function getArticle(name: string): string {
  return name.startsWith("A") || name.startsWith("I") || name.startsWith("O") ? "an" : "a";
}

const defaultFilters: FilterState = {
  category: undefined,
  setupProps: undefined,
  duration: [],
  gradeLevel: [],
  groupSize: [],
  energyLevel: null,
  environment: [],
};

function matchesFilters(activity: Activity, filters: FilterState): boolean {
  if (filters.setupProps) {
    if (filters.setupProps === "Props" && activity.materials.length === 0) return false;
    if (filters.setupProps === "No Props" && activity.materials.length > 0) return false;
  }
  if (
    filters.duration &&
    filters.duration.length > 0 &&
    !filters.duration.some((r) => !(activity.duration.max < r.min || activity.duration.min > r.max))
  )
    return false;
  if (
    filters.gradeLevel &&
    filters.gradeLevel.length > 0 &&
    !filters.gradeLevel.some(
      (r) => !(activity.gradeLevel.max < r.min || activity.gradeLevel.min > r.max),
    )
  )
    return false;
  if (
    filters.groupSize &&
    filters.groupSize.length > 0 &&
    !filters.groupSize.some(
      (r) => !(activity.groupSize.max < r.min || activity.groupSize.min > r.max),
    )
  )
    return false;
  if (
    filters.environment &&
    filters.environment.length > 0 &&
    !filters.environment.includes(activity.environment)
  )
    return false;
  if (filters.energyLevel && activity.energyLevel !== filters.energyLevel) return false;
  return true;
}

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const categoryName = decodeURIComponent(name ?? "") as Category;
  const color = CATEGORY_COLORS[categoryName] ?? DEFAULT_CATEGORY_COLOR;
  const description = CATEGORY_DESCRIPTIONS[categoryName] ?? "";
  const categoryActivities = mockActivities.filter((a) => a.category === categoryName);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { toggleSaved } = useActivities();
  const activities = categoryActivities.filter((a) => matchesFilters(a, filters));
  const Graphic = CATEGORY_GRAPHICS[categoryName];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color, paddingTop: insets.top + 16 }]}>
        {Graphic && (
          <View style={[styles.graphicContainer, categoryName === "Icebreaker" && { bottom: -25 }]}>
            <Graphic width={100} height={100} />
          </View>
        )}
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} hitSlop={20} style={styles.backButton}>
            <BackArrowIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{categoryName}</Text>
        </View>
      </View>

      <FlatList
        data={activities}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onPress={() => router.push(`/activity/${item.id}`)}
            onSaveToggle={toggleSaved}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>
                What's {getArticle(categoryName)} {categoryName}?
              </Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Activity Count + Filter */}
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {activities.length} {activities.length === 1 ? "activity" : "activities"}
              </Text>
              <Pressable onPress={() => setFiltersVisible(true)} hitSlop={10}>
                <FilterIcon />
              </Pressable>
            </View>
          </View>
        }
      />

      <FiltersModal
        visible={filtersVisible}
        initial={filters}
        onClose={() => setFiltersVisible(false)}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    paddingBottom: 16,
    paddingLeft: 24,
    gap: 16,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    overflow: "hidden",
  },
  graphicContainer: {
    position: "absolute",
    right: 0,
    bottom: -20,
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "League Spartan",
    lineHeight: 33.28,
  },
  descriptionContainer: {
    paddingTop: 24,
    gap: 8,
  },
  descriptionTitle: {
    fontFamily: "Instrument Sans Medium",
    fontSize: 16,
    fontWeight: "500",
    color: "#153A7A",
    lineHeight: 24,
  },
  descriptionText: {
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontWeight: "400",
    color: "#153A7A",
    lineHeight: 21,
    letterSpacing: 0.28,
  },
  divider: {
    height: 1,
    backgroundColor: "#EBEBEB",
    marginTop: 24,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 14,
  },
  countText: {
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontWeight: "400",
    color: "#B4B4B4",
    lineHeight: 21,
    letterSpacing: 0.28,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
