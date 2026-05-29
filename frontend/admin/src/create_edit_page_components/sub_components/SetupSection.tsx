import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FieldError } from "./FieldError";

import type { SetupOption } from "../OverviewSection";

const OPTIONS: NonNullable<SetupOption>[] = ["Props", "No Props"];

type SetupSectionProps = {
  value: SetupOption;
  onChange: (value: SetupOption) => void;
  error?: string | null;
};

export const SetupSection: React.FC<SetupSectionProps> = ({ value, onChange, error }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Up</Text>

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
    gap: 12,
    flexWrap: "wrap",
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
    borderColor: "#153A7A",
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
