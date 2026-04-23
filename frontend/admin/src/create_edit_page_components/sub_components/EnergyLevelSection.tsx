import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EnergyLevelOption } from "../OverviewSection";

const OPTIONS: NonNullable<EnergyLevelOption>[] = ["Low", "Medium", "High"];

const getIcon = (value: NonNullable<EnergyLevelOption>) => {
  if (value === "Low") return "⚡";
  if (value === "Medium") return "⚡⚡";
  return "⚡⚡⚡";
};

type EnergyLevelSectionProps = {
  value: EnergyLevelOption;
  onChange: (value: EnergyLevelOption) => void;
};

export const EnergyLevelSection: React.FC<EnergyLevelSectionProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Energy Level</Text>

      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const isSelected = value === option;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(isSelected ? null : option)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={styles.iconText}>{getIcon(option)}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F3B82",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7DDE8",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  chipSelected: {
    borderColor: "#1F3B82",
    backgroundColor: "#EAF0FF",
  },
  iconText: {
    fontSize: 14,
  },
  chipText: {
    color: "#5B6B8B",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#1F3B82",
  },
});
