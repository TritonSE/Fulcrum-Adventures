import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import EnergyIcon from "../../assets/icons/energy_bolt.svg";
import FilterIcon from "../../assets/icons/filter.svg";
import XIcon from "../../assets/icons/x.svg";
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

const DRAWER_OFFSET = 720;
const DRAWER_BACKDROP_COLOR = "rgba(0,0,0,0.25)";
const PRIMARY_COLOR = "#153A7A";
const NATURAL_GRAPH_COLOR = "#EBEBEB";
const NEUTRAL_GRAY_1 = "#EBEBEB";
const MODAL_BACKGROUND = "#F9F9F9";
const SHEET_CORNER_RADIUS = 16;
const ENERGY_ACTIVE_COLOR = "#ECD528";
const ENERGY_INACTIVE_COLOR = "#FFFFFF";

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DRAWER_BACKDROP_COLOR,
  },
  sheet: {
    height: "88%",
    backgroundColor: MODAL_BACKGROUND,
    borderTopLeftRadius: SHEET_CORNER_RADIUS,
    borderTopRightRadius: SHEET_CORNER_RADIUS,
    overflow: "hidden",
  },
  container: {
    flex: 1,
    backgroundColor: MODAL_BACKGROUND,
    borderTopLeftRadius: SHEET_CORNER_RADIUS,
    borderTopRightRadius: SHEET_CORNER_RADIUS,
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
    justifyContent: "center",
    alignItems: "center",
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
    lineHeight: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: PRIMARY_COLOR,
    fontFamily: "LeagueSpartan_700Bold",
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
  energyRow: { flexDirection: "row", gap: 6 },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 12,
    borderTopWidth: 1,
    borderColor: NATURAL_GRAPH_COLOR,
    backgroundColor: MODAL_BACKGROUND,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: NEUTRAL_GRAY_1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  resetText: {
    color: PRIMARY_COLOR,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "InstrumentSans_500Medium",
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: MODAL_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  applyText: {
    color: PRIMARY_COLOR,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "InstrumentSans_500Medium",
  },
});

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

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const FiltersModalContent = ({ initial, onClose, onApply }: Omit<Props, "visible">) => {
  const [filters, setFilters] = useState<FilterState>(initial);

  const toggleCategoryFilter = (value: Category | null) =>
    setFilters((prev) => ({ ...prev, category: prev.category === value ? null : value }));

  const toggleSetupFilter = (value: string) =>
    setFilters((prev) => ({ ...prev, setupProps: prev.setupProps === value ? null : value }));

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
        <View style={styles.titleRow}>
          <FilterIcon width={15} height={19} />
          <Text style={styles.title}>Filters</Text>
        </View>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <XIcon width={20} height={20} stroke={PRIMARY_COLOR} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
        persistentScrollbar
      >
        <Section title="Category">
          {options.category.map((option) => (
            <FilterPill
              key={option}
              label={option}
              variant="category"
              selected={option === "All" ? !filters.category : filters.category === option}
              onPress={() => toggleCategoryFilter(option === "All" ? null : (option as Category))}
            />
          ))}
        </Section>

        <Section title="Duration">
          {options.duration.map((range) => (
            <FilterPill
              key={range.label}
              label={range.label}
              selected={isRangeSelected(filters.duration, range)}
              onPress={() => toggleRangeFilter("duration", range)}
            />
          ))}
        </Section>

        <Section title="Grade Level">
          {options.gradeLevel.map((range) => (
            <FilterPill
              key={range.label}
              label={range.label}
              selected={isRangeSelected(filters.gradeLevel, range)}
              onPress={() => toggleRangeFilter("gradeLevel", range)}
            />
          ))}
        </Section>

        <Section title="Group Size">
          {options.groupSize.map((range) => (
            <FilterPill
              key={range.label}
              label={range.label}
              selected={isRangeSelected(filters.groupSize, range)}
              onPress={() => toggleRangeFilter("groupSize", range)}
            />
          ))}
        </Section>

        <Section title="Energy Level">
          <View style={styles.energyRow}>
            {[1, 2, 3].map((level) => {
              const isActive = energyLevelToNumber[filters.energyLevel ?? "None"] >= level;
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
                    fill={isActive ? ENERGY_ACTIVE_COLOR : "transparent"}
                    stroke={isActive ? ENERGY_ACTIVE_COLOR : ENERGY_INACTIVE_COLOR}
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
              selected={!!filters.environment?.includes(option)}
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
              onPress={() => toggleSetupFilter(option)}
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
          <Text style={styles.applyText}>Apply</Text>
        </Pressable>
      </View>
    </View>
  );
};

export const FiltersModal = ({ visible, initial, onClose, onApply }: Props) => {
  const initialKey = useMemo(() => JSON.stringify(initial), [initial]);
  const contentKey = visible ? `open-${initialKey}` : "closed";
  const [sheetY] = useState(() => new Animated.Value(DRAWER_OFFSET));

  useEffect(() => {
    if (!visible) return;
    sheetY.setValue(DRAWER_OFFSET);
    Animated.timing(sheetY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sheetY, visible]);

  const closeWithAnimation = () => {
    Animated.timing(sheetY, {
      toValue: DRAWER_OFFSET,
      duration: 180,
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeWithAnimation}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={closeWithAnimation} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
          <FiltersModalContent
            key={contentKey}
            initial={initial}
            onClose={closeWithAnimation}
            onApply={onApply}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};
