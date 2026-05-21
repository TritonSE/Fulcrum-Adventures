import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import YellowEnergyStarIcon from "../../../../assets/icons/yellowenergystar.svg";

import type { EnergyLevelOption } from "../OverviewSection";

const OPTIONS: NonNullable<EnergyLevelOption>[] = ["Low", "Medium", "High"];

const getStarCount = (value: NonNullable<EnergyLevelOption>) => {
  if (value === "Low") return 1;
  if (value === "Medium") return 2;
  return 3;
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
              <View style={styles.starsRow}>
                {Array.from({ length: getStarCount(option) }).map((_, index) => {
                  return <YellowEnergyStarIcon key={`${option}-star-${index}`} width={16} height={16} />;
                })}
              </View>
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
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
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
