import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FieldError } from "./FieldError";

const CATEGORY_OPTIONS = [
  "Opener",
  "Icebreaker",
  "Active",
  "Debrief",
  "Connection",
  "Team Challenge",
];

type CategorySectionProps = {
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string | null;
};

export const CategorySection: React.FC<CategorySectionProps> = ({
  selected,
  onChange,
  error,
}) => {
  const canSelectMore = selected.length < 3;

  const toggleCategory = (category: string) => {
    const isSelected = selected.includes(category);

    if (isSelected) {
      onChange(selected.filter((item) => item !== category));
      return;
    }

    if (!canSelectMore) return;

    onChange([...selected, category]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Category <Text style={styles.lightText}>(Select up to three)</Text>
      </Text>

      <View style={styles.chipContainer}>
        {CATEGORY_OPTIONS.map((category) => {
          const isSelected = selected.includes(category);
          const isDisabled = !isSelected && !canSelectMore;

          return (
            <Pressable
              key={category}
              onPress={() => toggleCategory(category)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                isDisabled && styles.chipDisabled,
                error && styles.chipError,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                  isDisabled && styles.chipTextDisabled,
                ]}
              >
                {category}
              </Text>
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
  lightText: {
    fontWeight: "400",
  },
  chipContainer: {
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
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 14,
    fontWeight: "500",
    color: "#5B6B8B",
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
});
