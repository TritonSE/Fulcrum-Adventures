import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import EnergyIcon from "../../assets/icons/energy_bolt.svg";
import { FILTER_OPTIONS as options, type RangeOption } from "../constants/filterOptions";

import { FilterPill } from "./FilterPill";

import type { Category, EnergyLevel, Environment, Range } from "../types/activity";

export type FilterState = {
  category?: Category | null;
  setupProps?: string | null;
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

// --- STYLES (Moved to Top) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#153A7A",
    fontFamily: "League Spartan",
    lineHeight: 28,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: { flex: 1 },
  content: { paddingHorizontal: 24 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#153A7A",
    fontFamily: "League Spartan",
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  energyRow: { flexDirection: "row", gap: 8 },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
    borderTopWidth: 1,
    borderColor: "#F3F3F3",
    backgroundColor: "#FFFFFF",
    paddingBottom: 36,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: { color: "#153A7A", fontWeight: "500", fontSize: 16, fontFamily: "Instrument Sans" },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#153A7A",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: { color: "#153A7A", fontWeight: "500", fontSize: 16, fontFamily: "Instrument Sans" },
});

// --- ICONS ---
const SlidersIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3"
      stroke="#153A7A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 14H7M9 8H15M17 16H23"
      stroke="#153A7A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#153A7A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// --- HELPERS ---
const energyLevelToNumber: Record<EnergyLevel | "None", number> = {
  None: 0,
  Low: 1,
  Medium: 2,
  High: 3,
};
const numberToEnergyLevel: Record<number, EnergyLevel> = { 1: "Low", 2: "Medium", 3: "High" };

const isRangeSelected = (selected: Range[] | undefined, range: Range): boolean => {
  if (!selected || selected.length === 0) return false;
  return selected.some((r) => r.min === range.min && r.max === range.max);
};

const FiltersModalContent = ({ initial, onClose, onApply }: Omit<Props, "visible">) => {
  const [filters, setFilters] = useState<FilterState>(initial);

  const toggleSingleFilter = (key: "category" | "setupProps", value: string | null) => {
    // If user clicks the same category, we clear it (set to null/undefined)
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : (value as unknown as Category),
    }));
  };

  const toggleRangeFilter = (key: "duration" | "gradeLevel" | "groupSize", range: RangeOption) =>
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const isSelected = current.some((r) => r.min === range.min && r.max === range.max);
      return {
        ...prev,
        [key]: isSelected
          ? current.filter((r) => !(r.min === range.min && r.max === range.max))
          : [...current, { min: range.min, max: range.max }],
      };
    });

  const toggleMultiFilter = (key: "environment", value: string) =>
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const isSelected = current.includes(value as Environment);
      return {
        ...prev,
        [key]: isSelected
          ? current.filter((item) => item !== value)
          : [...current, value as Environment],
      };
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <SlidersIcon />
          <Text style={styles.title}>Filters</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <CloseIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.row}>
            {options.category.map((option) => (
              <FilterPill
                key={option}
                label={option}
                // If category is null/undefined, 'All' is selected
                selected={option === "All" ? !filters.category : filters.category === option}
                onPress={() => toggleSingleFilter("category", option === "All" ? null : option)}
              />
            ))}
          </View>
        </View>

        {/* Duration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.row}>
            {options.duration.map((range) => (
              <FilterPill
                key={range.label}
                label={range.label}
                selected={isRangeSelected(filters.duration, range)}
                onPress={() => toggleRangeFilter("duration", range)}
              />
            ))}
          </View>
        </View>

        {/* Grade Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grade Level</Text>
          <View style={styles.row}>
            {options.gradeLevel.map((range) => (
              <FilterPill
                key={range.label}
                label={range.label}
                selected={isRangeSelected(filters.gradeLevel, range)}
                onPress={() => toggleRangeFilter("gradeLevel", range)}
              />
            ))}
          </View>
        </View>

        {/* Energy Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Level</Text>
          <View style={styles.energyRow}>
            {[1, 2, 3].map((level) => {
              const isActive = energyLevelToNumber[filters.energyLevel ?? "None"] >= level;
              return (
                <Pressable
                  key={level}
                  onPress={() => toggleEnergyLevel(numberToEnergyLevel[level])}
                  hitSlop={8}
                >
                  <EnergyIcon
                    width={24}
                    height={32}
                    fill={isActive ? "#ECD528" : "transparent"}
                    stroke={isActive ? "#ECD528" : "#D9D9D9"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Environment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment</Text>
          <View style={styles.row}>
            {options.environment.map((option) => (
              <FilterPill
                key={option}
                label={option}
                selected={filters.environment?.includes(option)}
                onPress={() => toggleMultiFilter("environment", option)}
              />
            ))}
          </View>
        </View>

        {/* Set Up Section */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Set Up</Text>
          <View style={styles.row}>
            {options.setupProps.map((option) => (
              <FilterPill
                key={option}
                label={option}
                selected={filters.setupProps === option}
                onPress={() => toggleSingleFilter("setupProps", option)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
          <Text style={styles.resetText}>Reset All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => {
            onApply(filters);
            onClose();
          }}
        >
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const FiltersModal = ({ visible, initial, onClose, onApply }: Props) => {
  const initialKey = useMemo(() => JSON.stringify(initial), [initial]);
  const contentKey = visible ? `open-${initialKey}` : "closed";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <FiltersModalContent key={contentKey} initial={initial} onClose={onClose} onApply={onApply} />
    </Modal>
  );
};
