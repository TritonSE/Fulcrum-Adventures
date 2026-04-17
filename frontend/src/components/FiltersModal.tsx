import { LeagueSpartan_400Regular, useFonts } from "@expo-google-fonts/league-spartan";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import EnergyIcon from "../../assets/icons/energy_bolt.svg";
import FilterIcon from "../../assets/icons/filter.svg";
import XIcon from "../../assets/icons/x.svg";
import { FILTER_OPTIONS as options } from "../constants/filterOptions";

import { FilterPill } from "./FilterPill";

import type { Category, EnergyLevel, Environment, Range } from "../types/activity";

export type FilterState = {
  category?: Category | null;
  setupProps?: string | null; /* maybe change to boolean later */
  duration?: Range[];
  gradeLevel?: Range[];
  groupSize?: Range[];
  energyLevel?: EnergyLevel | null;
  environment?: Environment[];
};

type Props = {
  visible: boolean;
  initial: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
};

const energyLevelToNumber: Record<EnergyLevel | "None", number> = {
  None: 0,
  Low: 1,
  Medium: 2,
  High: 3,
};
const numberToEnergyLevel: Record<number, EnergyLevel> = { 1: "Low", 2: "Medium", 3: "High" };

const PRIMARY_COLOR = "#153A7A";
const NATURAL_GRAPH_COLOR = "#EBEBEB";
const MODAL_BACKGROUND = "#F9F9F9";

// Helper function to convert grade level number to label
const gradeNumberToLabel = (num: number): string => {
  if (num === 0) return "K";
  return `${num}`;
};

// Helper function to generate display labels for ranges
const getRangeLabel = (range: Range, type: "duration" | "gradeLevel" | "groupSize"): string => {
  if (type === "duration") {
    if (range.min >= 30) {
      return `${range.min}+ min`;
    }
    return `${range.min}-${range.max} min`;
  } else if (type === "gradeLevel") {
    return `${gradeNumberToLabel(range.min)}-${gradeNumberToLabel(range.max)}`;
  } else if (type === "groupSize") {
    if (range.min === 3 && range.max === 15) return "Small (3-15)";
    if (range.min === 15 && range.max === 30) return "Medium (15-30)";
    if (range.min >= 30) return "Large (30+)";
    return `${range.min}-${range.max}`;
  }
  return "";
};

// Helper function to check if a range is selected in an array
const isRangeSelected = (selected: Range[] | undefined, range: Range): boolean => {
  if (!selected || selected.length === 0) return false;
  return selected.some((r) => r.min === range.min && r.max === range.max);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODAL_BACKGROUND,
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 32,
    fontFamily: "LeagueSpartan_700Bold",
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: NATURAL_GRAPH_COLOR,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollContainer: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 8,
    color: PRIMARY_COLOR,
    fontFamily: "LeagueSpartan_700Bold",
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
  energyRow: { flexDirection: "row", gap: 6 },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 12,
    borderTopWidth: 1,
    borderColor: NATURAL_GRAPH_COLOR,
    borderBottomWidth: 0,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#E8EBF3",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  resetText: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 16,
    lineHeight: 24,
  },
  applyText: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 16,
    lineHeight: 24,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const FiltersModalContent = ({ initial, onClose, onApply }: Omit<Props, "visible">) => {
  const [filters, setFilters] = useState<FilterState>(initial);

  const toggleSingleFilter = (key: "category" | "setupProps", value: string | null) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));

  const toggleRangeFilter = (key: "duration" | "gradeLevel" | "groupSize", range: Range) =>
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const isSelected = current.some((r) => r.min === range.min && r.max === range.max);
      return {
        ...prev,
        [key]: isSelected
          ? current.filter((r) => !(r.min === range.min && r.max === range.max))
          : [...current, range],
      };
    });

  const toggleMultiFilter = (key: "environment", value: string) =>
    setFilters((prev) => {
      const existing = new Set(prev[key] ?? []);
      if (existing.has(value as Environment)) {
        existing.delete(value as Environment);
      } else {
        existing.add(value as Environment);
      }
      return { ...prev, [key]: Array.from(existing) };
    });

  const toggleEnergyLevel = (level: EnergyLevel) =>
    setFilters((prev) => ({ ...prev, energyLevel: prev.energyLevel === level ? null : level }));

  const resetFilters = () =>
    setFilters({
      category: null,
      setupProps: null,
      duration: [],
      gradeLevel: [],
      groupSize: [],
      energyLevel: null,
      environment: [],
    });

  const isFilterSelected = (values: string[] | undefined, option: string) =>
    !!values?.includes(option);

  const energyLevel = filters.energyLevel;

  let [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
  });

  if (!fontsLoaded) {
    return <View></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FilterIcon width={15} height={19} />
          <Text style={styles.title}>Filters</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <XIcon width={13} height={13} stroke={PRIMARY_COLOR} fill={PRIMARY_COLOR} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
      >
        <Section title="Category">
          {options.category.map((option) => (
            <FilterPill
              key={option}
              label={option}
              variant="category"
              selected={filters.category === option || (option === "All" && !filters.category)}
              onPress={() => toggleSingleFilter("category", option === "All" ? null : option)}
            />
          ))}
        </Section>

        <Section title="Duration">
          {options.duration.map((range) => (
            <FilterPill
              key={`${range.min}-${range.max}`}
              label={getRangeLabel(range, "duration")}
              selected={isRangeSelected(filters.duration, range)}
              onPress={() => toggleRangeFilter("duration", range)}
            />
          ))}
        </Section>

        <Section title="Grade Level">
          {options.gradeLevel.map((range) => (
            <FilterPill
              key={`${range.min}-${range.max}`}
              label={getRangeLabel(range, "gradeLevel")}
              selected={isRangeSelected(filters.gradeLevel, range)}
              onPress={() => toggleRangeFilter("gradeLevel", range)}
            />
          ))}
        </Section>

        <Section title="Group Size">
          {options.groupSize.map((range) => (
            <FilterPill
              key={`${range.min}-${range.max}`}
              label={getRangeLabel(range, "groupSize")}
              selected={isRangeSelected(filters.groupSize, range)}
              onPress={() => toggleRangeFilter("groupSize", range)}
            />
          ))}
        </Section>

        <Section title="Energy Level">
          <View style={styles.energyRow}>
            {[1, 2, 3].map((level) => {
              const isActive = energyLevelToNumber[energyLevel ?? "None"] >= level;
              return (
                <Pressable
                  key={level}
                  onPress={() => toggleEnergyLevel(numberToEnergyLevel[level])}
                  hitSlop={8}
                  style={styles.iconWrapper}
                >
                  <EnergyIcon
                    width={22}
                    height={22}
                    fill={isActive ? "#ECD528" : "transparent"}
                    stroke={isActive ? "#ECD528" : NATURAL_GRAPH_COLOR}
                  />
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Environment">
          {options.environment.map((option) => (
            <FilterPill
              key={option}
              label={option}
              selected={isFilterSelected(filters.environment, option)}
              onPress={() => toggleMultiFilter("environment", option)}
            />
          ))}
        </Section>

        <Section title="Set Up">
          {options.setupProps.map((option) => (
            <FilterPill
              key={option}
              label={option}
              selected={filters.setupProps === option}
              onPress={() => toggleSingleFilter("setupProps", option)}
            />
          ))}
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.resetBtn} onPress={resetFilters}>
          <Text style={styles.resetText}>Reset All</Text>
        </Pressable>
        <Pressable
          style={styles.applyBtn}
          onPress={() => {
            onApply(filters);
            onClose();
          }}
        >
          <Text style={styles.applyText}>Apply Filters</Text>
        </Pressable>
      </View>
    </View>
  );
};

export const FiltersModal = ({ visible, initial, onClose, onApply }: Props) => {
  // Changing this key forces a remount of the content, resetting local state without setState in an effect
  const initialKey = useMemo(() => JSON.stringify(initial), [initial]);
  const contentKey = visible ? `open-${initialKey}` : "closed";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <FiltersModalContent key={contentKey} initial={initial} onClose={onClose} onApply={onApply} />
    </Modal>
  );
};
