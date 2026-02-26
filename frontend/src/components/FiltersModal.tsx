import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import EnergyIcon from "../../assets/icons/energy_bolt.svg";
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

// Helper function to convert grade level number to label
const gradeNumberToLabel = (num: number): string => {
  if (num === 0) return "K";
  return `${num}`;
};

// Helper function to generate display labels for ranges
const getRangeLabel = (range: Range, type: "duration" | "gradeLevel" | "groupSize"): string => {
  if (type === "duration") {
    return `${range.min}-${range.max} min`;
  } else if (type === "gradeLevel") {
    return `${gradeNumberToLabel(range.min)}-${gradeNumberToLabel(range.max)}`;
  } else if (type === "groupSize") {
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
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#1F2C5C" },
  close: { fontSize: 20, color: "#1F2C5C" },
  scrollContainer: { flex: 1 },
  content: { paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#1C1F2A" },
  row: { flexDirection: "row", flexWrap: "wrap" },
  energyRow: { flexDirection: "row", gap: 12, paddingHorizontal: 4 },
  energyIcon: { padding: 6 },
  energyText: { fontSize: 24, color: "#CBD0DD" },
  energyTextActive: { color: "#1F4ED6" },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderColor: "#E6E9F0",
    borderBottomWidth: 0,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F4ED6",
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1F4ED6",
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: { color: "#1F4ED6", fontWeight: "700" },
  applyText: { color: "#fff", fontWeight: "700" },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>✕</Text>
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
                    width={32}
                    height={32}
                    fill={isActive ? "#1F4ED6" : "transparent"}
                    stroke={isActive ? "#1F4ED6" : "#CBD0DD"}
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
