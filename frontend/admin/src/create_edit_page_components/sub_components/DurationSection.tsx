import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FieldError } from "./FieldError";

import type { DurationOption } from "../OverviewSection";

const OPTIONS: NonNullable<DurationOption>[] = ["5-15 min", "15-30 min", "30+ min"];

type DurationSectionProps = {
  value: DurationOption;
  onChange: (value: DurationOption) => void;
  error?: string | null;
};

export const DurationSection: React.FC<DurationSectionProps> = ({ value, onChange, error }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Duration</Text>

      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const isSelected = value === option;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(isSelected ? null : option)}
              style={[styles.chip, isSelected && styles.chipSelected, error && styles.chipError]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {error && <FieldError message={error} />}
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
    color: "#153A7A",
    marginBottom: 12,
    fontFamily: "Instrument Sans Bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7DDE8",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    borderColor: "#1F3B82",
    backgroundColor: "#EAF0FF",
  },
  chipError: {
    borderColor: "#EF4444",
  },
  chipText: {
    color: "#5B6B8B",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
  chipTextSelected: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
});
