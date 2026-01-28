import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import EnergyIcon from "../../assets/icons/energy_bolt.svg";

import { FilterPill } from "./FilterPill";

type FiltersState = {
  category?: string; /* Only one category can be selected at a time */
  setup_props?: string; /* maybe change to boolean later */
  duration?: string[];
  grade_level?: string[];
  group_size?: string[];
  energy_level?: number;
  environment?: string[];
};

type Props = {
  visible: boolean;
  initial: FiltersState;
  onClose: () => void;
  onApply: (filters: FiltersState) => void;
};

const options = {
  category: ["All", "Opener", "Icebreaker", "Active", "Connection", "Debrief", "Team Challenge"],
  setup_props: ["Props", "No Props"],
  duration: ["5-15 min", "15-30 min", "30+ min"],
  grade_level: ["K-2", "3-5", "6-8", "9-12"],
  group_size: ["Small (3-15)", "Medium (15-30)", "Large (30+)"],
  environment: ["Indoor", "Outdoor", "Classroom", "Field"],
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
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#1C1F2A" },
  row: { flexDirection: "row", flexWrap: "wrap" },
  energyRow: { flexDirection: "row", gap: 12, paddingHorizontal: 4 },
  energyIcon: { padding: 6 },
  energyText: { fontSize: 24, color: "#CBD0DD" },
  energyTextActive: { color: "#1F4ED6" },
  footer: { flexDirection: "row", padding: 16, gap: 12, borderTopWidth: 1, borderColor: "#E6E9F0" },
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
  const [filters, setFilters] = useState<FiltersState>(initial);

  const toggleSingleFilter = (key: "category" | "setup_props", value: string) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));

  const toggleMultiFilter = (
    key: "duration" | "grade_level" | "group_size" | "environment",
    value: string,
  ) =>
    setFilters((prev) => {
      const existing = new Set(prev[key]);
      if (existing.has(value)) {
        existing.delete(value);
      } else {
        existing.add(value);
      }
      return { ...prev, [key]: Array.from(existing) };
    });

  const toggleEnergyLevel = (level: number) =>
    setFilters((prev) => ({ ...prev, energy_level: prev.energy_level === level ? 0 : level }));

  const resetFilters = () =>
    setFilters({
      category: undefined,
      setup_props: undefined,
      duration: [],
      grade_level: [],
      group_size: [],
      energy_level: 0,
      environment: [],
    });

  const isFilterSelected = (values: string[] | undefined, option: string) =>
    !!values?.includes(option);

  const energyLevel = filters.energy_level ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Category">
          {options.category.map((option) => (
            <FilterPill
              key={option}
              label={option}
              selected={filters.category === option}
              onPress={() => toggleSingleFilter("category", option)}
            />
          ))}
        </Section>

        <Section title="Duration">
          {options.duration.map((option) => (
            <FilterPill
              key={option}
              label={option}
              selected={isFilterSelected(filters.duration, option)}
              onPress={() => toggleMultiFilter("duration", option)}
            />
          ))}
        </Section>

        <Section title="Grade Level">
          {options.grade_level.map((option) => (
            <FilterPill
              key={option}
              label={option}
              selected={isFilterSelected(filters.grade_level, option)}
              onPress={() => toggleMultiFilter("grade_level", option)}
            />
          ))}
        </Section>

        <Section title="Group Size">
          {options.group_size.map((option) => (
            <FilterPill
              key={option}
              label={option}
              selected={isFilterSelected(filters.group_size, option)}
              onPress={() => toggleMultiFilter("group_size", option)}
            />
          ))}
        </Section>

        <Section title="Energy Level">
          <View style={styles.energyRow}>
            {[1, 2, 3].map((level) => {
              const isActive = energyLevel >= level;
              return (
                <Pressable
                  key={level}
                  onPress={() => toggleEnergyLevel(level)}
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
          {options.setup_props.map((option) => (
            <FilterPill
              key={option}
              label={option}
              selected={filters.setup_props === option}
              onPress={() => toggleSingleFilter("setup_props", option)}
            />
          ))}
        </Section>

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
      </ScrollView>
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
