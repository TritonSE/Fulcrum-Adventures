import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FieldError } from "./FieldError";

const OPTIONS = ["Blacktop", "Field", "Classroom", "Gym/MPR"];

type EnvironmentSectionProps = {
  selected: string[];
  anyEnvironment: boolean;
  onChangeSelected: (selected: string[]) => void;
  onChangeAnyEnvironment: (value: boolean) => void;
  error?: string | null;
};

export const EnvironmentSection: React.FC<EnvironmentSectionProps> = ({
  selected,
  anyEnvironment,
  onChangeSelected,
  onChangeAnyEnvironment,
  error,
}) => {
  const toggleEnvironment = (option: string) => {
    if (anyEnvironment) return;

    if (selected.includes(option)) {
      onChangeSelected(selected.filter((item) => item !== option));
      return;
    }

    onChangeSelected([...selected, option]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Environment</Text>

      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <Pressable
              key={option}
              onPress={() => toggleEnvironment(option)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                anyEnvironment && styles.chipDisabled,
                error && styles.chipError,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                  anyEnvironment && styles.chipTextDisabled,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.checkboxRow} onPress={() => onChangeAnyEnvironment(!anyEnvironment)}>
        <View style={[styles.checkbox, anyEnvironment && styles.checkboxChecked]}>
          {anyEnvironment && <Text style={styles.checkboxCheck}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Any Environment</Text>
      </Pressable>
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
    borderColor: "#153A7A",

    backgroundColor: "#EAF0FF",
  },
  chipDisabled: {
    opacity: 0.45,
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
  chipTextDisabled: {
    color: "#8E99B2",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
  checkboxRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 4,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: "#153A7A",
    backgroundColor: "#EAF0FF",
  },
  checkboxCheck: {
    color: "#153A7A",
    fontSize: 12,
    fontWeight: "700",
  },
  checkboxLabel: {
    color: "#153A7A",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Instrument Sans",
  },
});
